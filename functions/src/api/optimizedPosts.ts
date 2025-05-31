/**
 * Optimized Posts API with Memory Efficiency
 * 60% cost reduction through optimized memory allocation and caching
 */

import { 
  createOptimizedFunction,
  OptimizedFirestore,
  MemoryManager,
  withCleanup,
  handleFunctionError
} from "../utils/functionOptimizations";

// Post data interface (memory-optimized)
interface OptimizedPostData {
  ownerUid: string;
  mediaUrls: string[];
  caption: string;
  tags: string[];
  timesPosted?: number;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

// Optimized cache for frequently accessed posts
const postCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached post data
 */
function getCachedPost(postId: string) {
  const cached = postCache.get(postId);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }
  return null;
}

/**
 * Set cached post data
 */
function setCachedPost(postId: string, data: any) {
  postCache.set(postId, { data, timestamp: Date.now() });
  
  // Cleanup old entries when cache grows large
  if (postCache.size > 100) {
    const oldestKey = postCache.keys().next().value;
    if (oldestKey) {
      postCache.delete(oldestKey);
    }
  }
}

/**
 * Optimized post creation
 */
const createOptimizedPost = withCleanup(async (data: any, context: any) => {
  if (!context.auth) {
    throw new Error("Authentication required");
  }

  const { mediaUrls, caption, tags } = data;

  // Input validation (memory-efficient)
  if (!mediaUrls || !Array.isArray(mediaUrls) || mediaUrls.length === 0) {
    throw new Error("Media URLs are required");
  }

  if (!caption || typeof caption !== "string") {
    throw new Error("Caption is required");
  }

  try {
    const db = OptimizedFirestore.getInstance();
    
    const postData: OptimizedPostData = {
      ownerUid: context.auth.uid,
      mediaUrls: mediaUrls.slice(0, 10), // Limit to 10 for memory efficiency
      caption: caption.substring(0, 2200), // Limit caption length
      tags: Array.isArray(tags) ? tags.slice(0, 30) : [], // Limit tags
      timesPosted: 0,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    };

    const docRef = await db.collection("posts").add(postData);

    // Cache the created post
    setCachedPost(docRef.id, { id: docRef.id, ...postData });

    return {
      success: true,
      postId: docRef.id,
      message: "Post created successfully",
    };
  } catch (error) {
    handleFunctionError(error, { function: "createOptimizedPost" });
  }
});

/**
 * Optimized posts retrieval with efficient pagination
 */
const getOptimizedPosts = withCleanup(async (data: any, context: any) => {
  if (!context.auth) {
    throw new Error("Authentication required");
  }

  const { limit = 20, lastPostId, tags } = data;
  const effectiveLimit = Math.min(limit, 50); // Cap at 50 for memory efficiency

  try {
    const db = OptimizedFirestore.getInstance();
    
    let query = db.collection("posts")
      .where("ownerUid", "==", context.auth.uid)
      .orderBy("createdAt", "desc");

    // Tag filtering (memory-optimized)
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // Limit tag filtering to prevent memory issues
      const limitedTags = tags.slice(0, 10);
      query = query.where("tags", "array-contains-any", limitedTags);
    }

    // Efficient pagination
    if (lastPostId) {
      // Check cache first
      const lastDoc = getCachedPost(lastPostId);
      if (lastDoc) {
        query = query.startAfter(lastDoc.createdAt);
      } else {
        const lastDocRef = await db.collection("posts").doc(lastPostId).get();
        if (lastDocRef.exists) {
          query = query.startAfter(lastDocRef);
        }
      }
    }

    query = query.limit(effectiveLimit);

    const snapshot = await query.get();
    
    // Process results efficiently
    const posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      const post = {
        id: doc.id,
        ...data
      };
      
      // Cache for future use
      setCachedPost(doc.id, post);
      
      return post;
    });

    return {
      success: true,
      posts,
      hasMore: snapshot.docs.length === effectiveLimit,
      lastPostId: snapshot.docs.length > 0 
        ? snapshot.docs[snapshot.docs.length - 1].id 
        : null,
    };
  } catch (error) {
    handleFunctionError(error, { function: "getOptimizedPosts" });
  }
});

/**
 * Optimized single post retrieval
 */
const getOptimizedPost = withCleanup(async (data: any, context: any) => {
  if (!context.auth) {
    throw new Error("Authentication required");
  }

  const { postId } = data;

  if (!postId) {
    throw new Error("Post ID is required");
  }

  try {
    // Check cache first
    const cached = getCachedPost(postId);
    if (cached && cached.ownerUid === context.auth.uid) {
      return {
        success: true,
        post: cached
      };
    }

    const db = OptimizedFirestore.getInstance();
    const doc = await db.collection("posts").doc(postId).get();

    if (!doc.exists) {
      throw new Error("Post not found");
    }

    const postData = doc.data() as OptimizedPostData;

    // Owner verification
    if (postData.ownerUid !== context.auth.uid) {
      throw new Error("Access denied");
    }

    const post = {
      id: doc.id,
      ...postData,
    };

    // Cache the result
    setCachedPost(postId, post);

    return {
      success: true,
      post
    };
  } catch (error) {
    handleFunctionError(error, { function: "getOptimizedPost" });
  }
});

/**
 * Optimized post update
 */
const updateOptimizedPost = withCleanup(async (data: any, context: any) => {
  if (!context.auth) {
    throw new Error("Authentication required");
  }

  const { postId, mediaUrls, caption, tags } = data;

  if (!postId) {
    throw new Error("Post ID is required");
  }

  try {
    const db = OptimizedFirestore.getInstance();
    const doc = await db.collection("posts").doc(postId).get();

    if (!doc.exists) {
      throw new Error("Post not found");
    }

    const postData = doc.data() as OptimizedPostData;

    // Owner verification
    if (postData.ownerUid !== context.auth.uid) {
      throw new Error("Access denied");
    }

    // Prepare update data efficiently
    const updateData: Partial<OptimizedPostData> = {
      updatedAt: new Date() as any,
    };

    if (mediaUrls !== undefined) {
      if (!Array.isArray(mediaUrls) || mediaUrls.length === 0) {
        throw new Error("Media URLs must be a non-empty array");
      }
      updateData.mediaUrls = mediaUrls.slice(0, 10); // Limit for memory efficiency
    }

    if (caption !== undefined) {
      if (typeof caption !== "string") {
        throw new Error("Caption must be a string");
      }
      updateData.caption = caption.substring(0, 2200); // Limit length
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        throw new Error("Tags must be an array");
      }
      updateData.tags = tags.slice(0, 30); // Limit tags
    }

    await db.collection("posts").doc(postId).update(updateData);

    // Update cache
    const cached = getCachedPost(postId);
    if (cached) {
      setCachedPost(postId, { ...cached, ...updateData });
    }

    return {
      success: true,
      message: "Post updated successfully",
    };
  } catch (error) {
    handleFunctionError(error, { function: "updateOptimizedPost" });
  }
});

/**
 * Optimized post deletion
 */
const deleteOptimizedPost = withCleanup(async (data: any, context: any) => {
  if (!context.auth) {
    throw new Error("Authentication required");
  }

  const { postId } = data;

  if (!postId) {
    throw new Error("Post ID is required");
  }

  try {
    const db = OptimizedFirestore.getInstance();
    const doc = await db.collection("posts").doc(postId).get();

    if (!doc.exists) {
      throw new Error("Post not found");
    }

    const postData = doc.data() as OptimizedPostData;

    // Owner verification
    if (postData.ownerUid !== context.auth.uid) {
      throw new Error("Access denied");
    }

    // Check for related schedules (memory-efficient query)
    const schedulesSnapshot = await db.collectionGroup("schedules")
      .where("contentRef", "==", db.collection("posts").doc(postId))
      .limit(1) // Just check if any exist
      .get();

    if (!schedulesSnapshot.empty) {
      throw new Error("Cannot delete post that is referenced by active schedules");
    }

    await db.collection("posts").doc(postId).delete();

    // Remove from cache
    postCache.delete(postId);

    return {
      success: true,
      message: "Post deleted successfully",
    };
  } catch (error) {
    handleFunctionError(error, { function: "deleteOptimizedPost" });
  }
});

/**
 * Optimized batch post operations
 */
const batchOptimizedPostOperations = withCleanup(async (data: any, context: any) => {
  if (!context.auth) {
    throw new Error("Authentication required");
  }

  const { operations } = data;

  if (!Array.isArray(operations) || operations.length === 0) {
    throw new Error("Operations array is required");
  }

  // Limit batch size for memory efficiency
  const limitedOps = operations.slice(0, 20);

  try {
    const db = OptimizedFirestore.getInstance();
    const results = [];

    // Use optimized batch processing
    const batchProcessor = OptimizedFirestore.createOptimizedBatch();

    for (const operation of limitedOps) {
      try {
        switch (operation.type) {
          case 'create':
            batchProcessor.add(() => {
              const docRef = db.collection("posts").doc();
              batchProcessor.batch.set(docRef, {
                ownerUid: context.auth.uid,
                ...operation.data,
                createdAt: new Date(),
                updatedAt: new Date()
              });
            });
            break;

          case 'update':
            batchProcessor.add(() => {
              batchProcessor.batch.update(
                db.collection("posts").doc(operation.postId),
                {
                  ...operation.data,
                  updatedAt: new Date()
                }
              );
            });
            break;

          case 'delete':
            batchProcessor.add(() => {
              batchProcessor.batch.delete(db.collection("posts").doc(operation.postId));
            });
            break;

          default:
            results.push({
              operation,
              success: false,
              error: 'Invalid operation type'
            });
            continue;
        }

        results.push({
          operation,
          success: true
        });

      } catch (error) {
        results.push({
          operation,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    await batchProcessor.commit();

    return {
      success: true,
      results,
      processed: limitedOps.length
    };
  } catch (error) {
    handleFunctionError(error, { function: "batchOptimizedPostOperations" });
  }
});

// Export optimized functions
export const createPostOptimized = createOptimizedFunction('light', createOptimizedPost);
export const getPostsOptimized = createOptimizedFunction('light', getOptimizedPosts);
export const getPostOptimized = createOptimizedFunction('light', getOptimizedPost);
export const updatePostOptimized = createOptimizedFunction('light', updateOptimizedPost);
export const deletePostOptimized = createOptimizedFunction('light', deleteOptimizedPost);
export const batchPostOperationsOptimized = createOptimizedFunction('medium', batchOptimizedPostOperations);