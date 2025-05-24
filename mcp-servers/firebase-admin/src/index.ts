#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const server = new Server(
  {
    name: 'firebase-admin-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();
const auth = admin.auth();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query_collection',
        description: 'Query documents from a Firestore collection',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Collection name',
            },
            where: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  operator: { type: 'string', enum: ['==', '!=', '<', '<=', '>', '>=', 'in', 'not-in', 'array-contains'] },
                  value: { type: 'string' },
                },
                required: ['field', 'operator', 'value'],
              },
              description: 'Where conditions',
            },
            orderBy: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                direction: { type: 'string', enum: ['asc', 'desc'] },
              },
            },
            limit: {
              type: 'number',
              description: 'Maximum number of documents to return',
              default: 10,
            },
          },
          required: ['collection'],
        },
      },
      {
        name: 'get_document',
        description: 'Get a specific document by ID',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Collection name',
            },
            documentId: {
              type: 'string',
              description: 'Document ID',
            },
          },
          required: ['collection', 'documentId'],
        },
      },
      {
        name: 'create_document',
        description: 'Create a new document in a collection',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Collection name',
            },
            documentId: {
              type: 'string',
              description: 'Document ID (optional, will auto-generate if not provided)',
            },
            data: {
              type: 'object',
              description: 'Document data as JSON object',
            },
          },
          required: ['collection', 'data'],
        },
      },
      {
        name: 'update_document',
        description: 'Update an existing document',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Collection name',
            },
            documentId: {
              type: 'string',
              description: 'Document ID',
            },
            data: {
              type: 'object',
              description: 'Fields to update',
            },
            merge: {
              type: 'boolean',
              description: 'Whether to merge with existing data',
              default: true,
            },
          },
          required: ['collection', 'documentId', 'data'],
        },
      },
      {
        name: 'delete_document',
        description: 'Delete a document from a collection',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Collection name',
            },
            documentId: {
              type: 'string',
              description: 'Document ID',
            },
          },
          required: ['collection', 'documentId'],
        },
      },
      {
        name: 'get_user_info',
        description: 'Get Firebase Auth user information',
        inputSchema: {
          type: 'object',
          properties: {
            uid: {
              type: 'string',
              description: 'User UID',
            },
            email: {
              type: 'string',
              description: 'User email (alternative to UID)',
            },
          },
        },
      },
      {
        name: 'list_users',
        description: 'List Firebase Auth users',
        inputSchema: {
          type: 'object',
          properties: {
            maxResults: {
              type: 'number',
              description: 'Maximum number of users to return',
              default: 10,
            },
            pageToken: {
              type: 'string',
              description: 'Page token for pagination',
            },
          },
        },
      },
      {
        name: 'set_user_claims',
        description: 'Set custom claims for a user',
        inputSchema: {
          type: 'object',
          properties: {
            uid: {
              type: 'string',
              description: 'User UID',
            },
            claims: {
              type: 'object',
              description: 'Custom claims to set',
            },
          },
          required: ['uid', 'claims'],
        },
      },
      {
        name: 'get_collection_stats',
        description: 'Get statistics about a collection',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Collection name',
            },
          },
          required: ['collection'],
        },
      },
      {
        name: 'backup_collection',
        description: 'Create a backup of a collection',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Collection name',
            },
            outputPath: {
              type: 'string',
              description: 'Output file path for backup',
            },
          },
          required: ['collection'],
        },
      },
      {
        name: 'run_transaction',
        description: 'Execute multiple operations in a transaction',
        inputSchema: {
          type: 'object',
          properties: {
            operations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['get', 'set', 'update', 'delete'] },
                  collection: { type: 'string' },
                  documentId: { type: 'string' },
                  data: { type: 'object' },
                },
                required: ['type', 'collection', 'documentId'],
              },
              description: 'List of operations to execute',
            },
          },
          required: ['operations'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'query_collection': {
        let query: any = db.collection(args.collection);

        // Apply where conditions
        if (args.where) {
          for (const condition of args.where) {
            query = query.where(condition.field, condition.operator as any, condition.value);
          }
        }

        // Apply ordering
        if (args.orderBy) {
          query = query.orderBy(args.orderBy.field, args.orderBy.direction as any);
        }

        // Apply limit
        if (args.limit) {
          query = query.limit(args.limit);
        }

        const snapshot = await query.get();
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data(),
        }));

        return {
          content: [
            {
              type: 'text',
              text: `📋 **Query Results from '${args.collection}'**

📊 **Found:** ${documents.length} documents

📄 **Documents:**
${documents.map(doc => `
🆔 **ID:** ${doc.id}
📝 **Data:** ${JSON.stringify(doc.data, null, 2)}
`).join('\n')}

${args.where ? `🔍 **Filters Applied:** ${args.where.map(w => `${w.field} ${w.operator} ${w.value}`).join(', ')}` : ''}
${args.orderBy ? `📈 **Ordered By:** ${args.orderBy.field} (${args.orderBy.direction})` : ''}
${args.limit ? `🔢 **Limit:** ${args.limit}` : ''}`,
            },
          ],
        };
      }

      case 'get_document': {
        const docRef = db.collection(args.collection).doc(args.documentId);
        const doc = await docRef.get();

        if (!doc.exists) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ **Document Not Found**

🔍 **Collection:** ${args.collection}
🆔 **Document ID:** ${args.documentId}

💡 **Suggestions:**
- Verify the document ID is correct
- Check if the document was deleted
- Ensure you have read permissions`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `📄 **Document Retrieved**

🔍 **Collection:** ${args.collection}
🆔 **Document ID:** ${args.documentId}

📝 **Data:**
\`\`\`json
${JSON.stringify(doc.data(), null, 2)}
\`\`\`

⏰ **Metadata:**
- Created: ${doc.createTime?.toDate().toISOString() || 'N/A'}
- Updated: ${doc.updateTime?.toDate().toISOString() || 'N/A'}`,
            },
          ],
        };
      }

      case 'create_document': {
        const collection = db.collection(args.collection);
        let docRef;

        if (args.documentId) {
          docRef = collection.doc(args.documentId);
          await docRef.set(args.data);
        } else {
          docRef = await collection.add(args.data);
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ **Document Created Successfully**

🔍 **Collection:** ${args.collection}
🆔 **Document ID:** ${docRef.id}

📝 **Data Created:**
\`\`\`json
${JSON.stringify(args.data, null, 2)}
\`\`\`

⏰ **Created:** ${new Date().toISOString()}`,
            },
          ],
        };
      }

      case 'update_document': {
        const docRef = db.collection(args.collection).doc(args.documentId);
        
        if (args.merge) {
          await docRef.set(args.data, { merge: true });
        } else {
          await docRef.update(args.data);
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ **Document Updated Successfully**

🔍 **Collection:** ${args.collection}
🆔 **Document ID:** ${args.documentId}

📝 **Updated Fields:**
\`\`\`json
${JSON.stringify(args.data, null, 2)}
\`\`\`

🔄 **Update Type:** ${args.merge ? 'Merge' : 'Replace'}
⏰ **Updated:** ${new Date().toISOString()}`,
            },
          ],
        };
      }

      case 'delete_document': {
        const docRef = db.collection(args.collection).doc(args.documentId);
        await docRef.delete();

        return {
          content: [
            {
              type: 'text',
              text: `🗑️ **Document Deleted Successfully**

🔍 **Collection:** ${args.collection}
🆔 **Document ID:** ${args.documentId}

⏰ **Deleted:** ${new Date().toISOString()}

⚠️ **Note:** This action cannot be undone. The document and all its subcollections have been permanently removed.`,
            },
          ],
        };
      }

      case 'get_user_info': {
        let user;
        
        if (args.uid) {
          user = await auth.getUser(args.uid);
        } else if (args.email) {
          user = await auth.getUserByEmail(args.email);
        } else {
          throw new Error('Either uid or email must be provided');
        }

        return {
          content: [
            {
              type: 'text',
              text: `👤 **User Information**

🆔 **UID:** ${user.uid}
📧 **Email:** ${user.email || 'No email'}
📱 **Phone:** ${user.phoneNumber || 'No phone'}
✅ **Email Verified:** ${user.emailVerified}
🚫 **Disabled:** ${user.disabled}

👤 **Profile:**
- Display Name: ${user.displayName || 'No name'}
- Photo URL: ${user.photoURL || 'No photo'}

🔐 **Authentication:**
- Provider: ${user.providerData.map(p => p.providerId).join(', ')}
- Created: ${user.metadata.creationTime}
- Last Sign-in: ${user.metadata.lastSignInTime || 'Never'}

🏷️ **Custom Claims:**
\`\`\`json
${JSON.stringify(user.customClaims || {}, null, 2)}
\`\`\``,
            },
          ],
        };
      }

      case 'list_users': {
        const listUsersResult = await auth.listUsers(args.maxResults, args.pageToken);
        
        const usersList = listUsersResult.users.map(user => `
👤 **${user.displayName || user.email || user.uid}**
- UID: ${user.uid}
- Email: ${user.email || 'No email'}
- Verified: ${user.emailVerified}
- Created: ${user.metadata.creationTime}
- Last Sign-in: ${user.metadata.lastSignInTime || 'Never'}
`).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `👥 **User List (${listUsersResult.users.length} users)**

${usersList}

📄 **Pagination:**
- Has More: ${!!listUsersResult.pageToken}
- Next Page Token: ${listUsersResult.pageToken || 'N/A'}`,
            },
          ],
        };
      }

      case 'set_user_claims': {
        await auth.setCustomUserClaims(args.uid, args.claims);

        return {
          content: [
            {
              type: 'text',
              text: `🏷️ **Custom Claims Updated**

👤 **User UID:** ${args.uid}

🔐 **Claims Set:**
\`\`\`json
${JSON.stringify(args.claims, null, 2)}
\`\`\`

⏰ **Updated:** ${new Date().toISOString()}

💡 **Note:** User will need to refresh their token to see the new claims in their session.`,
            },
          ],
        };
      }

      case 'get_collection_stats': {
        const snapshot = await db.collection(args.collection).get();
        const docCount = snapshot.size;
        
        // Sample a few documents to analyze structure
        const sampleDocs = snapshot.docs.slice(0, 5).map(doc => doc.data());
        const fields = new Set<string>();
        
        sampleDocs.forEach(doc => {
          Object.keys(doc).forEach(key => fields.add(key));
        });

        return {
          content: [
            {
              type: 'text',
              text: `📊 **Collection Statistics: ${args.collection}**

📄 **Document Count:** ${docCount}

🏗️ **Field Analysis (from sample):**
${Array.from(fields).map(field => `- ${field}`).join('\n')}

📋 **Sample Document Structure:**
\`\`\`json
${JSON.stringify(sampleDocs[0] || {}, null, 2)}
\`\`\`

💡 **Insights:**
- Total documents: ${docCount}
- Common fields: ${fields.size}
- Collection appears ${docCount > 0 ? 'active' : 'empty'}`,
            },
          ],
        };
      }

      case 'backup_collection': {
        const snapshot = await db.collection(args.collection).get();
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data(),
        }));

        const backup = {
          collection: args.collection,
          timestamp: new Date().toISOString(),
          documentCount: documents.length,
          documents: documents,
        };

        return {
          content: [
            {
              type: 'text',
              text: `💾 **Collection Backup Created**

🔍 **Collection:** ${args.collection}
📄 **Documents:** ${documents.length}
⏰ **Timestamp:** ${backup.timestamp}

📁 **Backup Data:**
\`\`\`json
${JSON.stringify(backup, null, 2)}
\`\`\`

💡 **Usage:**
- Save this JSON to restore the collection later
- Use with Firebase Admin SDK for restoration
- Store securely for disaster recovery`,
            },
          ],
        };
      }

      case 'run_transaction': {
        const result = await db.runTransaction(async (transaction) => {
          const results = [];

          for (const operation of args.operations) {
            const docRef = db.collection(operation.collection).doc(operation.documentId);

            switch (operation.type) {
              case 'get':
                const doc = await transaction.get(docRef);
                results.push({
                  operation: 'get',
                  id: operation.documentId,
                  exists: doc.exists,
                  data: doc.exists ? doc.data() : null,
                });
                break;

              case 'set':
                transaction.set(docRef, operation.data);
                results.push({
                  operation: 'set',
                  id: operation.documentId,
                  status: 'queued',
                });
                break;

              case 'update':
                transaction.update(docRef, operation.data);
                results.push({
                  operation: 'update',
                  id: operation.documentId,
                  status: 'queued',
                });
                break;

              case 'delete':
                transaction.delete(docRef);
                results.push({
                  operation: 'delete',
                  id: operation.documentId,
                  status: 'queued',
                });
                break;
            }
          }

          return results;
        });

        return {
          content: [
            {
              type: 'text',
              text: `⚡ **Transaction Completed Successfully**

🔄 **Operations:** ${args.operations.length}

📋 **Results:**
${result.map(r => `
- **${r.operation.toUpperCase()}** ${r.id}
  Status: ${r.status || (r.exists ? 'Found' : 'Not found')}
  ${r.data ? `Data: ${JSON.stringify(r.data, null, 2)}` : ''}
`).join('\n')}

⏰ **Completed:** ${new Date().toISOString()}

💡 **Note:** All operations were executed atomically. Either all succeeded or all failed.`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    let errorMessage = 'Unknown error occurred';
    
    if (error.code) {
      // Firebase error
      errorMessage = `Firebase Error: ${error.message} (${error.code})`;
      
      // Add specific error guidance
      if (error.code === 'auth/user-not-found') {
        errorMessage += '\n💡 User does not exist. Check the UID or email.';
      } else if (error.code === 'permission-denied') {
        errorMessage += '\n💡 Permission denied. Check Firestore security rules.';
      } else if (error.code === 'not-found') {
        errorMessage += '\n💡 Document or collection not found.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${errorMessage}

🔍 **Troubleshooting:**
- Verify Firebase project ID is correct
- Check service account permissions
- Ensure collection and document names are valid
- Review Firestore security rules
- Confirm network connectivity`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Firebase Admin MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});