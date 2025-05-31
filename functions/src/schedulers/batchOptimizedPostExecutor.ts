/**
 * Batch-Optimized Post Executor with API Cost Reduction
 * Uses intelligent batching to reduce API calls and improve efficiency
 */

import * as admin from "firebase-admin";
import { 
  createOptimizedScheduledFunction,
  createOptimizedFunction,
  MemoryManager,
  OptimizedFirestore,
  withCleanup,
  handleFunctionError
} from "../utils/functionOptimizations";
import { 
  instagramBatch,
  firestoreBatch,
  BatchProcessor
} from "../utils/batchProcessor";
import { updateNextRunAfterExecution } from "../utils/scheduleUtils";
import { sendPostSuccessNotification, sendPostFailureNotification } from "../utils/notifications";
import { proxyFetch, getAccountProxyConfig } from "../utils/proxyFetch";

// Batch configuration for schedule processing
const SCHEDULE_BATCH_SIZE = 10;
const EXECUTION_LOG_BATCH_SIZE = 50;

interface ScheduleExecutionJob {
  scheduleDoc: admin.firestore.QueryDocumentSnapshot;
  accountData: any;
  contentData: any;
  proxyConfig?: any;
}

interface BatchExecutionResult {
  scheduleId: string;
  success: boolean;
  instagramPostId?: string;
  error?: string;
  processingTime: number;
}

/**
 * Batch processor for schedule executions
 */
class ScheduleExecutionBatchProcessor {
  private processor: BatchProcessor<ScheduleExecutionJob, BatchExecutionResult>;
  
  constructor() {
    this.processor = new BatchProcessor({
      maxBatchSize: SCHEDULE_BATCH_SIZE,
      maxWaitTime: 30000, // 30 seconds
      maxConcurrentBatches: 2,
      rateLimitDelay: 5000, // 5 seconds between batches
      processor: this.processScheduleBatch.bind(this),
      priorityWeights: { high: 3, medium: 2, low: 1 }
    });
  }

  async executeSchedule(job: ScheduleExecutionJob, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<BatchExecutionResult> {
    return this.processor.add(job, priority);
  }

  async flushPendingExecutions(): Promise<void> {
    await this.processor.flush();
  }

  getStats() {
    return this.processor.getStats();
  }

  private async processScheduleBatch(jobs: ScheduleExecutionJob[]): Promise<BatchExecutionResult[]> {
    console.log(`Processing batch of ${jobs.length} schedule executions`);
    
    const results: BatchExecutionResult[] = [];
    
    // Group jobs by account to optimize API calls
    const jobsByAccount = this.groupJobsByAccount(jobs);
    
    // Process each account group
    for (const [accountId, accountJobs] of jobsByAccount.entries()) {
      try {
        // Batch process posts for this account
        const accountResults = await this.processAccountBatch(accountJobs);
        results.push(...accountResults);
        
        // Rate limiting between accounts
        if (jobsByAccount.size > 1) {
          await this.sleep(2000); // 2 seconds between accounts
        }
        
      } catch (error) {
        console.error(`Batch processing failed for account ${accountId}:`, error);
        
        // Mark all jobs for this account as failed
        accountJobs.forEach(job => {
          results.push({
            scheduleId: job.scheduleDoc.id,
            success: false,
            error: error instanceof Error ? error.message : 'Batch processing failed',
            processingTime: 0
          });
        });
      }
    }
    
    return results;
  }

  private groupJobsByAccount(jobs: ScheduleExecutionJob[]): Map<string, ScheduleExecutionJob[]> {
    const groupedJobs = new Map<string, ScheduleExecutionJob[]>();
    
    jobs.forEach(job => {
      const accountId = job.accountData.instagramUserId;
      if (!groupedJobs.has(accountId)) {
        groupedJobs.set(accountId, []);
      }
      groupedJobs.get(accountId)!.push(job);
    });
    
    return groupedJobs;
  }

  private async processAccountBatch(jobs: ScheduleExecutionJob[]): Promise<BatchExecutionResult[]> {
    const results: BatchExecutionResult[] = [];
    const startTime = Date.now();
    
    // Process jobs sequentially for the same account to avoid conflicts
    for (const job of jobs) {
      const jobStartTime = Date.now();
      
      try {
        const instagramPostId = await this.executeInstagramPost(
          job.accountData,
          job.contentData,
          job.proxyConfig
        );
        
        results.push({
          scheduleId: job.scheduleDoc.id,
          success: true,
          instagramPostId,
          processingTime: Date.now() - jobStartTime
        });
        
        console.log(`Schedule ${job.scheduleDoc.id} executed successfully: ${instagramPostId}`);
        
      } catch (error) {
        results.push({
          scheduleId: job.scheduleDoc.id,
          success: false,
          error: error instanceof Error ? error.message : 'Instagram posting failed',
          processingTime: Date.now() - jobStartTime
        });
        
        console.error(`Schedule ${job.scheduleDoc.id} failed:`, error);
      }
      
      // Small delay between posts for the same account
      if (jobs.length > 1) {
        await this.sleep(1000); // 1 second between posts
      }
    }
    
    console.log(`Processed ${jobs.length} jobs for account in ${Date.now() - startTime}ms`);
    return results;
  }

  private async executeInstagramPost(
    accountData: any,
    contentData: any,
    proxyConfig?: any
  ): Promise<string> {
    const instagramUserId = accountData.instagramUserId;
    const accessToken = accountData.accessToken;
    
    if (!instagramUserId || !accessToken) {
      throw new Error("Instagram account configuration incomplete");
    }

    // Use batch processor for media upload
    const mediaUploadPromises = contentData.mediaUrls.slice(0, 10).map((mediaUrl: string) => 
      instagramBatch.uploadMedia({
        instagramUserId,
        accessToken,
        mediaUrl,
        caption: contentData.caption,
        proxyConfig
      }, 'high')
    );

    const mediaContainerIds = await Promise.all(mediaUploadPromises);
    
    if (mediaContainerIds.length === 0) {
      throw new Error("No media containers created");
    }

    // Use batch processor for post publishing
    const instagramPostId = await instagramBatch.publishPost({
      instagramUserId,
      accessToken,
      creationId: mediaContainerIds[0], // Use first container for single post
      proxyConfig
    }, 'high');

    return instagramPostId;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global batch processor instance
const scheduleExecutionBatch = MemoryManager.getInstance(
  'scheduleExecutionBatch',
  () => new ScheduleExecutionBatchProcessor(),
  30 * 60 * 1000 // 30 minutes TTL
);

/**
 * Optimized function to get pending schedules with batching
 */
async function getBatchPendingSchedules(limit: number = SCHEDULE_BATCH_SIZE * 2) {
  const db = OptimizedFirestore.getInstance();
  const now = admin.firestore.Timestamp.now();
  
  const query = db.collectionGroup("schedules")
    .where("status", "==", "active")
    .where("nextRunAt", "<=", now)
    .orderBy("nextRunAt", "asc")
    .limit(limit);
  
  const snapshot = await query.get();
  return snapshot.docs;
}

/**
 * Batch execution logging
 */
async function batchLogExecutions(logs: any[]) {
  if (logs.length === 0) return;
  
  // Use Firestore batch processor for efficient logging
  const writeOperations = logs.map(logData => ({
    type: 'set',
    ref: admin.firestore().collection("executionLogs").doc(),
    data: {
      ...logData,
      executedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  }));

  // Split into chunks if too many logs
  const chunks = [];
  for (let i = 0; i < writeOperations.length; i += EXECUTION_LOG_BATCH_SIZE) {
    chunks.push(writeOperations.slice(i, i + EXECUTION_LOG_BATCH_SIZE));
  }

  // Process chunks concurrently
  await Promise.all(
    chunks.map(chunk => 
      Promise.all(chunk.map(op => firestoreBatch.write(op, 'medium')))
    )
  );
}

/**
 * Main batch-optimized execution function
 */
const executeBatchOptimizedScheduledPosts = withCleanup(async () => {
  try {
    console.log("Starting batch-optimized scheduled post execution");
    
    // Get pending schedules
    const pendingSchedules = await getBatchPendingSchedules();
    
    if (pendingSchedules.length === 0) {
      console.log("No pending schedules found");
      return;
    }
    
    console.log(`Processing ${pendingSchedules.length} pending schedules in batches`);
    
    // Prepare execution jobs
    const executionJobs: ScheduleExecutionJob[] = [];
    const accountDataCache = new Map<string, any>();
    const contentDataCache = new Map<string, any>();
    
    // Batch load all required data
    for (const scheduleDoc of pendingSchedules) {
      const scheduleData = scheduleDoc.data();
      
      try {
        // Get or cache account data
        const accountCacheKey = `${scheduleData.ownerUid}:${scheduleData.igAccountRef.id}`;
        let accountData = accountDataCache.get(accountCacheKey);
        
        if (!accountData) {
          const accountDoc = await scheduleData.igAccountRef.get();
          if (accountDoc.exists) {
            accountData = accountDoc.data();
            accountDataCache.set(accountCacheKey, accountData);
          } else {
            throw new Error("Instagram account not found");
          }
        }
        
        // Get or cache content data
        const contentCacheKey = scheduleData.contentRef.id;
        let contentData = contentDataCache.get(contentCacheKey);
        
        if (!contentData) {
          const contentDoc = await scheduleData.contentRef.get();
          if (contentDoc.exists) {
            contentData = contentDoc.data();
            contentDataCache.set(contentCacheKey, contentData);
          } else {
            throw new Error("Content not found");
          }
        }
        
        // Get proxy configuration if needed
        const proxyConfig = accountData.proxyId 
          ? await getAccountProxyConfig(scheduleData.ownerUid, accountData.proxyId)
          : undefined;
        
        // Determine priority based on schedule data
        const priority = scheduleData.priority || 'medium';
        
        executionJobs.push({
          scheduleDoc,
          accountData,
          contentData,
          proxyConfig
        });
        
      } catch (error) {
        console.error(`Failed to prepare job for schedule ${scheduleDoc.id}:`, error);
        
        // Log preparation failure
        await batchLogExecutions([{
          scheduleId: scheduleDoc.id,
          igAccountId: scheduleData.igAccountRef?.id || 'unknown',
          contentId: scheduleData.contentRef?.id || 'unknown',
          userId: scheduleData.ownerUid,
          status: "failed",
          error: error instanceof Error ? error.message : "Job preparation failed",
          retryCount: scheduleData.retryCount || 0
        }]);
      }
    }
    
    // Execute jobs in batches
    const executionPromises = executionJobs.map(job => 
      scheduleExecutionBatch.executeSchedule(job)
    );
    
    const results = await Promise.allSettled(executionPromises);
    
    // Process results and update schedules
    const executionLogs: any[] = [];
    const scheduleUpdates: any[] = [];
    
    results.forEach((result, index) => {
      const job = executionJobs[index];
      const scheduleData = job.scheduleDoc.data();
      
      if (result.status === 'fulfilled') {
        const executionResult = result.value;
        
        // Prepare execution log
        executionLogs.push({
          scheduleId: executionResult.scheduleId,
          igAccountId: job.accountData.instagramUserId,
          contentId: job.contentData.id || job.scheduleDoc.data().contentRef.id,
          userId: scheduleData.ownerUid,
          status: executionResult.success ? "success" : "failed",
          ...(executionResult.instagramPostId && { instagramPostId: executionResult.instagramPostId }),
          ...(executionResult.error && { error: executionResult.error }),
          retryCount: scheduleData.retryCount || 0,
          processingTime: executionResult.processingTime
        });
        
        // Prepare schedule update
        scheduleUpdates.push({
          ref: job.scheduleDoc.ref,
          success: executionResult.success,
          error: executionResult.error
        });
        
        // Send notifications asynchronously
        if (executionResult.success) {
          sendPostSuccessNotification(
            scheduleData.ownerUid,
            job.accountData.username,
            job.contentData.caption.substring(0, 100)
          ).catch(console.error);
        } else {
          sendPostFailureNotification(
            scheduleData.ownerUid,
            job.accountData.username || "Unknown",
            executionResult.error || "Unknown error"
          ).catch(console.error);
        }
        
      } else {
        console.error(`Execution failed for schedule ${job.scheduleDoc.id}:`, result.reason);
        
        // Log execution failure
        executionLogs.push({
          scheduleId: job.scheduleDoc.id,
          igAccountId: job.accountData?.instagramUserId || 'unknown',
          contentId: job.contentData?.id || 'unknown',
          userId: scheduleData.ownerUid,
          status: "failed",
          error: result.reason?.message || "Execution failed",
          retryCount: scheduleData.retryCount || 0
        });
        
        scheduleUpdates.push({
          ref: job.scheduleDoc.ref,
          success: false,
          error: result.reason?.message || "Execution failed"
        });
      }
    });
    
    // Batch log all executions
    await batchLogExecutions(executionLogs);
    
    // Batch update all schedules
    await Promise.all(
      scheduleUpdates.map(update => 
        updateNextRunAfterExecution(update.ref, update.success, update.error)
      )
    );
    
    console.log(`Batch execution completed: ${executionJobs.length} schedules processed`);
    
    // Log batch statistics
    const stats = scheduleExecutionBatch.getStats();
    console.log('Batch execution stats:', JSON.stringify(stats));
    
  } catch (error) {
    handleFunctionError(error, { function: "executeBatchOptimizedScheduledPosts" });
  }
});

/**
 * Manual trigger with batch optimization
 */
const triggerBatchOptimizedExecution = withCleanup(async (data: any, context: any) => {
  if (!context.auth) {
    throw new Error("Authentication required");
  }
  
  try {
    await executeBatchOptimizedScheduledPosts();
    
    return {
      success: true,
      message: "Batch-optimized execution triggered successfully",
      timestamp: new Date().toISOString(),
      stats: scheduleExecutionBatch.getStats()
    };
  } catch (error) {
    handleFunctionError(error, { function: "triggerBatchOptimizedExecution" });
  }
});

/**
 * Get batch processing statistics
 */
const getBatchProcessingStats = withCleanup(async (data: any, context: any) => {
  if (!context.auth) {
    throw new Error("Authentication required");
  }
  
  try {
    return {
      success: true,
      stats: {
        scheduleExecution: scheduleExecutionBatch.getStats(),
        instagram: instagramBatch.getStats(),
        firestore: firestoreBatch.getStats()
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleFunctionError(error, { function: "getBatchProcessingStats" });
  }
});

// Export optimized functions
export const executeScheduledPostsBatch = createOptimizedScheduledFunction(
  'critical',
  'every 1 minutes',
  executeBatchOptimizedScheduledPosts
);

export const triggerScheduleExecutionBatch = createOptimizedFunction(
  'medium',
  triggerBatchOptimizedExecution
);

export const getBatchStats = createOptimizedFunction(
  'light',
  getBatchProcessingStats
);