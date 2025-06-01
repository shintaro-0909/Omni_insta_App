/**
 * Advanced Batch Processing System for Omniy Instagram Scheduler
 * Reduces API costs and improves efficiency through intelligent batching
 */

import * as admin from "firebase-admin";
import { MemoryManager } from "./functionOptimizations";

interface BatchJob<T, R> {
  id: string;
  data: T;
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  scheduledAt?: number;
  resolve: (result: R) => void;
  reject: (error: Error) => void;
}

interface BatchResult<R> {
  success: boolean;
  data?: R;
  error?: string;
  processingTime: number;
}

interface BatchProcessorConfig<T, R> {
  maxBatchSize: number;
  maxWaitTime: number; // milliseconds
  maxConcurrentBatches: number;
  retryDelay: number;
  processor: (items: T[]) => Promise<R[]>;
  rateLimitDelay?: number;
  priorityWeights?: {
    high: number;
    medium: number;
    low: number;
  };
}

export class BatchProcessor<T, R> {
  private queue: BatchJob<T, R>[] = [];
  private processing = false;
  private activeBatches = 0;
  private lastProcessTime = 0;
  private processingStats = {
    totalProcessed: 0,
    totalErrors: 0,
    averageProcessingTime: 0,
    batchesSent: 0
  };

  private readonly config: Required<BatchProcessorConfig<T, R>>;

  constructor(config: BatchProcessorConfig<T, R>) {
    this.config = {
      rateLimitDelay: 1000,
      priorityWeights: { high: 3, medium: 2, low: 1 },
      ...config
    };

    // Start processing loop
    this.startProcessingLoop();
  }

  /**
   * Add item to batch queue
   */
  async add(data: T, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<R> {
    return new Promise((resolve, reject) => {
      const job: BatchJob<T, R> = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data,
        priority,
        retryCount: 0,
        maxRetries: 3,
        createdAt: Date.now(),
        resolve,
        reject
      };

      this.queue.push(job);
      this.sortQueueByPriority();

      // Trigger immediate processing if queue is large enough
      if (this.queue.length >= this.config.maxBatchSize) {
        this.processQueue();
      }
    });
  }

  /**
   * Add scheduled item to be processed at specific time
   */
  async schedule(data: T, scheduledAt: Date, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<R> {
    return new Promise((resolve, reject) => {
      const job: BatchJob<T, R> = {
        id: `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data,
        priority,
        retryCount: 0,
        maxRetries: 3,
        createdAt: Date.now(),
        scheduledAt: scheduledAt.getTime(),
        resolve,
        reject
      };

      this.queue.push(job);
      this.sortQueueByPriority();
    });
  }

  /**
   * Process queue immediately
   */
  async flush(): Promise<void> {
    await this.processQueue();
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      ...this.processingStats,
      queueLength: this.queue.length,
      activeBatches: this.activeBatches,
      isProcessing: this.processing
    };
  }

  /**
   * Clear queue and reset stats
   */
  clear() {
    // Reject all pending jobs
    this.queue.forEach(job => {
      job.reject(new Error('Queue cleared'));
    });
    
    this.queue = [];
    this.processing = false;
    this.activeBatches = 0;
    this.processingStats = {
      totalProcessed: 0,
      totalErrors: 0,
      averageProcessingTime: 0,
      batchesSent: 0
    };
  }

  private startProcessingLoop() {
    setInterval(() => {
      if (!this.processing && this.shouldProcess()) {
        this.processQueue();
      }
    }, Math.min(this.config.maxWaitTime / 2, 5000)); // Check every 5 seconds or half max wait time
  }

  private shouldProcess(): boolean {
    const now = Date.now();
    
    // Process if queue is full
    if (this.queue.length >= this.config.maxBatchSize) {
      return true;
    }
    
    // Process if max wait time exceeded
    if (this.queue.length > 0 && (now - this.lastProcessTime) >= this.config.maxWaitTime) {
      return true;
    }
    
    // Process if we have high priority items waiting too long
    const highPriorityItems = this.queue.filter(job => job.priority === 'high');
    if (highPriorityItems.length > 0 && (now - highPriorityItems[0].createdAt) >= 10000) { // 10 seconds
      return true;
    }
    
    // Process scheduled items
    const readyScheduledItems = this.queue.filter(job => 
      job.scheduledAt && job.scheduledAt <= now
    );
    if (readyScheduledItems.length > 0) {
      return true;
    }

    return false;
  }

  private sortQueueByPriority() {
    this.queue.sort((a, b) => {
      // First by scheduled time (past due items first)
      const now = Date.now();
      const aOverdue = a.scheduledAt && a.scheduledAt <= now;
      const bOverdue = b.scheduledAt && b.scheduledAt <= now;
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // Then by priority weight
      const aWeight = this.config.priorityWeights[a.priority];
      const bWeight = this.config.priorityWeights[b.priority];
      
      if (aWeight !== bWeight) {
        return bWeight - aWeight; // Higher weight first
      }
      
      // Finally by creation time (older first)
      return a.createdAt - b.createdAt;
    });
  }

  private async processQueue() {
    if (this.processing || this.activeBatches >= this.config.maxConcurrentBatches) {
      return;
    }

    this.processing = true;
    
    try {
      // Respect rate limiting
      const timeSinceLastProcess = Date.now() - this.lastProcessTime;
      if (timeSinceLastProcess < this.config.rateLimitDelay) {
        await this.sleep(this.config.rateLimitDelay - timeSinceLastProcess);
      }

      // Get next batch
      const batch = this.getNextBatch();
      
      if (batch.length === 0) {
        this.processing = false;
        return;
      }

      this.activeBatches++;
      this.lastProcessTime = Date.now();

      // Process batch
      await this.processBatch(batch);

    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      this.processing = false;
      this.activeBatches = Math.max(0, this.activeBatches - 1);
    }
  }

  private getNextBatch(): BatchJob<T, R>[] {
    const now = Date.now();
    const batch: BatchJob<T, R>[] = [];
    
    // Get items ready for processing
    const readyItems = this.queue.filter(job => 
      !job.scheduledAt || job.scheduledAt <= now
    );
    
    // Take up to maxBatchSize items
    const batchSize = Math.min(readyItems.length, this.config.maxBatchSize);
    
    for (let i = 0; i < batchSize; i++) {
      const job = readyItems[i];
      const index = this.queue.indexOf(job);
      if (index !== -1) {
        batch.push(this.queue.splice(index, 1)[0]);
      }
    }

    return batch;
  }

  private async processBatch(batch: BatchJob<T, R>[]) {
    const startTime = Date.now();
    
    try {
      // Extract data for processing
      const dataItems = batch.map(job => job.data);
      
      // Process the batch
      const results = await this.config.processor(dataItems);
      
      const processingTime = Date.now() - startTime;
      
      // Handle results
      batch.forEach((job, index) => {
        if (index < results.length) {
          job.resolve(results[index]);
          this.processingStats.totalProcessed++;
        } else {
          job.reject(new Error('No result for this item'));
          this.processingStats.totalErrors++;
        }
      });

      // Update stats
      this.processingStats.batchesSent++;
      this.processingStats.averageProcessingTime = 
        (this.processingStats.averageProcessingTime * (this.processingStats.batchesSent - 1) + processingTime) / 
        this.processingStats.batchesSent;

      console.log(`Batch processed: ${batch.length} items in ${processingTime}ms`);

    } catch (error) {
      console.error('Batch processing failed:', error);
      
      // Handle failed batch - retry or reject
      batch.forEach(job => {
        if (job.retryCount < job.maxRetries) {
          job.retryCount++;
          
          // Add back to queue with delay
          setTimeout(() => {
            this.queue.push(job);
            this.sortQueueByPriority();
          }, this.config.retryDelay * Math.pow(2, job.retryCount)); // Exponential backoff
          
        } else {
          job.reject(new Error(`Batch processing failed after ${job.maxRetries} retries: ${error}`));
          this.processingStats.totalErrors++;
        }
      });
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Instagram API Batch Processor
 */
export class InstagramBatchProcessor {
  private mediaUploadProcessor: BatchProcessor<any, string>;
  private postPublishProcessor: BatchProcessor<any, string>;
  private accountInfoProcessor: BatchProcessor<string, any>;

  constructor() {
    // Media upload batch processor
    this.mediaUploadProcessor = new BatchProcessor({
      maxBatchSize: 5, // Instagram API limits
      maxWaitTime: 30000, // 30 seconds
      maxConcurrentBatches: 2,
      rateLimitDelay: 2000, // 2 seconds between batches
      retryDelay: 5000,
      processor: this.processMediaUploads.bind(this)
    });

    // Post publish batch processor  
    this.postPublishProcessor = new BatchProcessor({
      maxBatchSize: 3, // Conservative for publishing
      maxWaitTime: 60000, // 1 minute
      maxConcurrentBatches: 1, // Sequential publishing
      rateLimitDelay: 5000, // 5 seconds between batches
      retryDelay: 8000,
      processor: this.processPostPublishes.bind(this)
    });

    // Account info batch processor
    this.accountInfoProcessor = new BatchProcessor({
      maxBatchSize: 10, // Higher for read operations
      maxWaitTime: 15000, // 15 seconds
      maxConcurrentBatches: 3,
      rateLimitDelay: 1000, // 1 second between batches
      retryDelay: 3000,
      processor: this.processAccountInfoRequests.bind(this)
    });
  }

  async uploadMedia(mediaData: any, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<string> {
    return this.mediaUploadProcessor.add(mediaData, priority);
  }

  async publishPost(postData: any, priority: 'high' | 'medium' | 'low' = 'high'): Promise<string> {
    return this.postPublishProcessor.add(postData, priority);
  }

  async getAccountInfo(accountId: string, priority: 'high' | 'medium' | 'low' = 'low'): Promise<any> {
    return this.accountInfoProcessor.add(accountId, priority);
  }

  async scheduleMediaUpload(mediaData: any, scheduledAt: Date): Promise<string> {
    return this.mediaUploadProcessor.schedule(mediaData, scheduledAt, 'medium');
  }

  async schedulePostPublish(postData: any, scheduledAt: Date): Promise<string> {
    return this.postPublishProcessor.schedule(postData, scheduledAt, 'high');
  }

  getStats() {
    return {
      mediaUpload: this.mediaUploadProcessor.getStats(),
      postPublish: this.postPublishProcessor.getStats(),
      accountInfo: this.accountInfoProcessor.getStats()
    };
  }

  async flush() {
    await Promise.all([
      this.mediaUploadProcessor.flush(),
      this.postPublishProcessor.flush(),
      this.accountInfoProcessor.flush()
    ]);
  }

  clear() {
    this.mediaUploadProcessor.clear();
    this.postPublishProcessor.clear();
    this.accountInfoProcessor.clear();
  }

  private async processMediaUploads(items: any[]): Promise<string[]> {
    // Implementation would call Instagram Graph API for media uploads
    // This is a placeholder for the actual implementation
    console.log(`Processing ${items.length} media uploads`);
    
    const results: string[] = [];
    
    for (const item of items) {
      try {
        // Simulate Instagram API call
        await this.sleep(100);
        results.push(`media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      } catch (error) {
        throw new Error(`Failed to upload media: ${error}`);
      }
    }
    
    return results;
  }

  private async processPostPublishes(items: any[]): Promise<string[]> {
    // Implementation would call Instagram Graph API for post publishing
    console.log(`Processing ${items.length} post publishes`);
    
    const results: string[] = [];
    
    for (const item of items) {
      try {
        // Simulate Instagram API call with longer delay
        await this.sleep(500);
        results.push(`post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      } catch (error) {
        throw new Error(`Failed to publish post: ${error}`);
      }
    }
    
    return results;
  }

  private async processAccountInfoRequests(accountIds: string[]): Promise<any[]> {
    // Implementation would call Instagram Graph API for account info
    console.log(`Processing ${accountIds.length} account info requests`);
    
    const results: any[] = [];
    
    for (const accountId of accountIds) {
      try {
        // Simulate Instagram API call
        await this.sleep(50);
        results.push({
          id: accountId,
          username: `user_${accountId}`,
          followers_count: Math.floor(Math.random() * 10000),
          media_count: Math.floor(Math.random() * 500)
        });
      } catch (error) {
        throw new Error(`Failed to get account info: ${error}`);
      }
    }
    
    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Firestore Batch Processor
 */
export class FirestoreBatchProcessor {
  private writeProcessor: BatchProcessor<any, boolean>;
  private readProcessor: BatchProcessor<string, any>;
  private deleteProcessor: BatchProcessor<string, boolean>;

  constructor() {
    this.writeProcessor = new BatchProcessor({
      maxBatchSize: 500, // Firestore batch limit
      maxWaitTime: 10000, // 10 seconds
      maxConcurrentBatches: 3,
      rateLimitDelay: 100, // 100ms between batches
      retryDelay: 2000,
      processor: this.processWrites.bind(this)
    });

    this.readProcessor = new BatchProcessor({
      maxBatchSize: 100, // Reasonable read batch size
      maxWaitTime: 5000, // 5 seconds
      maxConcurrentBatches: 5,
      rateLimitDelay: 50, // 50ms between batches
      retryDelay: 1000,
      processor: this.processReads.bind(this)
    });

    this.deleteProcessor = new BatchProcessor({
      maxBatchSize: 500, // Firestore batch limit
      maxWaitTime: 15000, // 15 seconds
      maxConcurrentBatches: 2,
      rateLimitDelay: 200, // 200ms between batches
      retryDelay: 2500,
      processor: this.processDeletes.bind(this)
    });
  }

  async write(operation: any, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<boolean> {
    return this.writeProcessor.add(operation, priority);
  }

  async read(docPath: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<any> {
    return this.readProcessor.add(docPath, priority);
  }

  async delete(docPath: string, priority: 'high' | 'medium' | 'low' = 'low'): Promise<boolean> {
    return this.deleteProcessor.add(docPath, priority);
  }

  getStats() {
    return {
      writes: this.writeProcessor.getStats(),
      reads: this.readProcessor.getStats(),
      deletes: this.deleteProcessor.getStats()
    };
  }

  private async processWrites(operations: any[]): Promise<boolean[]> {
    const db = admin.firestore();
    const batch = db.batch();
    
    operations.forEach(op => {
      switch (op.type) {
        case 'set':
          batch.set(op.ref, op.data);
          break;
        case 'update':
          batch.update(op.ref, op.data);
          break;
        case 'create':
          batch.create(op.ref, op.data);
          break;
      }
    });

    await batch.commit();
    return operations.map(() => true);
  }

  private async processReads(docPaths: string[]): Promise<any[]> {
    const db = admin.firestore();
    const promises = docPaths.map(path => db.doc(path).get());
    const snapshots = await Promise.all(promises);
    
    return snapshots.map(snap => snap.exists ? snap.data() : null);
  }

  private async processDeletes(docPaths: string[]): Promise<boolean[]> {
    const db = admin.firestore();
    const batch = db.batch();
    
    docPaths.forEach(path => {
      batch.delete(db.doc(path));
    });

    await batch.commit();
    return docPaths.map(() => true);
  }
}

// Global batch processor instances
export const instagramBatch = MemoryManager.getInstance(
  'instagramBatch',
  () => new InstagramBatchProcessor(),
  30 * 60 * 1000 // 30 minutes TTL
);

export const firestoreBatch = MemoryManager.getInstance(
  'firestoreBatch', 
  () => new FirestoreBatchProcessor(),
  30 * 60 * 1000 // 30 minutes TTL
);

// Utility functions
export async function batchInstagramUploads(uploads: any[]): Promise<string[]> {
  const promises = uploads.map(upload => instagramBatch.uploadMedia(upload));
  return Promise.all(promises);
}

export async function batchInstagramPublishes(publishes: any[]): Promise<string[]> {
  const promises = publishes.map(publish => instagramBatch.publishPost(publish));
  return Promise.all(promises);
}

export async function batchFirestoreWrites(writes: any[]): Promise<boolean[]> {
  const promises = writes.map(write => firestoreBatch.write(write));
  return Promise.all(promises);
}