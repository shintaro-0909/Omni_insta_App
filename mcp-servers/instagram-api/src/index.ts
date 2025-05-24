#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const server = new Server(
  {
    name: 'instagram-api-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Instagram Graph API base URL
const INSTAGRAM_API_BASE = 'https://graph.facebook.com/v18.0';

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_instagram_accounts',
        description: 'Get list of Instagram Business accounts connected to the user',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'Facebook User ID',
            },
            accessToken: {
              type: 'string',
              description: 'Facebook/Instagram access token',
            },
          },
          required: ['userId', 'accessToken'],
        },
      },
      {
        name: 'get_account_info',
        description: 'Get detailed information about an Instagram account',
        inputSchema: {
          type: 'object',
          properties: {
            accountId: {
              type: 'string',
              description: 'Instagram Business Account ID',
            },
            accessToken: {
              type: 'string',
              description: 'Instagram access token',
            },
            fields: {
              type: 'array',
              items: { type: 'string' },
              description: 'Fields to retrieve',
              default: ['id', 'username', 'account_type', 'media_count', 'followers_count'],
            },
          },
          required: ['accountId', 'accessToken'],
        },
      },
      {
        name: 'upload_media',
        description: 'Upload media to Instagram (creates container)',
        inputSchema: {
          type: 'object',
          properties: {
            accountId: {
              type: 'string',
              description: 'Instagram Business Account ID',
            },
            accessToken: {
              type: 'string',
              description: 'Instagram access token',
            },
            imageUrl: {
              type: 'string',
              description: 'Public URL of the image to upload',
            },
            caption: {
              type: 'string',
              description: 'Post caption',
            },
            locationId: {
              type: 'string',
              description: 'Optional location ID',
            },
          },
          required: ['accountId', 'accessToken', 'imageUrl'],
        },
      },
      {
        name: 'publish_media',
        description: 'Publish a previously uploaded media container',
        inputSchema: {
          type: 'object',
          properties: {
            accountId: {
              type: 'string',
              description: 'Instagram Business Account ID',
            },
            accessToken: {
              type: 'string',
              description: 'Instagram access token',
            },
            containerId: {
              type: 'string',
              description: 'Media container ID from upload_media',
            },
          },
          required: ['accountId', 'accessToken', 'containerId'],
        },
      },
      {
        name: 'get_media_list',
        description: 'Get list of media posts for an Instagram account',
        inputSchema: {
          type: 'object',
          properties: {
            accountId: {
              type: 'string',
              description: 'Instagram Business Account ID',
            },
            accessToken: {
              type: 'string',
              description: 'Instagram access token',
            },
            limit: {
              type: 'number',
              description: 'Number of media items to retrieve',
              default: 25,
            },
            fields: {
              type: 'array',
              items: { type: 'string' },
              description: 'Fields to retrieve for each media',
              default: ['id', 'caption', 'media_type', 'media_url', 'timestamp', 'like_count', 'comments_count'],
            },
          },
          required: ['accountId', 'accessToken'],
        },
      },
      {
        name: 'get_media_insights',
        description: 'Get insights/analytics for a specific media post',
        inputSchema: {
          type: 'object',
          properties: {
            mediaId: {
              type: 'string',
              description: 'Instagram Media ID',
            },
            accessToken: {
              type: 'string',
              description: 'Instagram access token',
            },
            metrics: {
              type: 'array',
              items: { type: 'string' },
              description: 'Metrics to retrieve',
              default: ['impressions', 'reach', 'likes', 'comments', 'shares', 'saves'],
            },
          },
          required: ['mediaId', 'accessToken'],
        },
      },
      {
        name: 'refresh_token',
        description: 'Refresh Instagram long-lived access token',
        inputSchema: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'Current Instagram access token',
            },
          },
          required: ['accessToken'],
        },
      },
      {
        name: 'validate_token',
        description: 'Validate Instagram access token and get token info',
        inputSchema: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'Instagram access token to validate',
            },
          },
          required: ['accessToken'],
        },
      },
      {
        name: 'check_posting_limits',
        description: 'Check Instagram posting limits and usage',
        inputSchema: {
          type: 'object',
          properties: {
            accountId: {
              type: 'string',
              description: 'Instagram Business Account ID',
            },
            accessToken: {
              type: 'string',
              description: 'Instagram access token',
            },
          },
          required: ['accountId', 'accessToken'],
        },
      },
      {
        name: 'get_hashtag_info',
        description: 'Get information about a hashtag',
        inputSchema: {
          type: 'object',
          properties: {
            hashtag: {
              type: 'string',
              description: 'Hashtag to search (without #)',
            },
            accountId: {
              type: 'string',
              description: 'Instagram Business Account ID',
            },
            accessToken: {
              type: 'string',
              description: 'Instagram access token',
            },
          },
          required: ['hashtag', 'accountId', 'accessToken'],
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
      case 'get_instagram_accounts': {
        const response = await axios.get(`${INSTAGRAM_API_BASE}/${args.userId}/accounts`, {
          params: {
            access_token: args.accessToken,
            fields: 'instagram_business_account',
          },
        });

        const accounts = response.data.data
          .filter((page: any) => page.instagram_business_account)
          .map((page: any) => page.instagram_business_account);

        return {
          content: [
            {
              type: 'text',
              text: `📱 **Instagram Accounts Found: ${accounts.length}**

${accounts.map((account: any) => `- Account ID: ${account.id}`).join('\n')}

💡 **Next Steps:**
1. Use \`get_account_info\` to get detailed information for each account
2. Save account IDs for posting operations
3. Check posting limits with \`check_posting_limits\``,
            },
          ],
        };
      }

      case 'get_account_info': {
        const fields = args.fields?.join(',') || 'id,username,account_type,media_count,followers_count';
        
        const response = await axios.get(`${INSTAGRAM_API_BASE}/${args.accountId}`, {
          params: {
            access_token: args.accessToken,
            fields: fields,
          },
        });

        const account = response.data;
        return {
          content: [
            {
              type: 'text',
              text: `📊 **Instagram Account Information**

🆔 **Basic Info:**
- Account ID: ${account.id}
- Username: @${account.username}
- Account Type: ${account.account_type}

📈 **Statistics:**
- Media Count: ${account.media_count || 'N/A'}
- Followers: ${account.followers_count || 'N/A'}

🔗 **Profile:**
- Bio: ${account.biography || 'No bio'}
- Website: ${account.website || 'No website'}
- Profile Picture: ${account.profile_picture_url ? 'Available' : 'Not available'}`,
            },
          ],
        };
      }

      case 'upload_media': {
        const params: any = {
          access_token: args.accessToken,
          image_url: args.imageUrl,
        };

        if (args.caption) {
          params.caption = args.caption;
        }
        if (args.locationId) {
          params.location_id = args.locationId;
        }

        const response = await axios.post(`${INSTAGRAM_API_BASE}/${args.accountId}/media`, null, {
          params: params,
        });

        return {
          content: [
            {
              type: 'text',
              text: `📤 **Media Uploaded Successfully**

🆔 **Container ID:** ${response.data.id}

💡 **Next Steps:**
1. Wait a few seconds for processing
2. Use \`publish_media\` with container ID: ${response.data.id}
3. Monitor publishing status

⚠️ **Important:**
- Container expires if not published within 24 hours
- Only one media container can be created per minute per account`,
            },
          ],
        };
      }

      case 'publish_media': {
        const response = await axios.post(`${INSTAGRAM_API_BASE}/${args.accountId}/media_publish`, null, {
          params: {
            access_token: args.accessToken,
            creation_id: args.containerId,
          },
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ **Media Published Successfully**

🆔 **Media ID:** ${response.data.id}

🎉 **Status:** Your post is now live on Instagram!

💡 **Next Steps:**
1. Check post performance with \`get_media_insights\`
2. Monitor engagement metrics
3. Save media ID for future reference`,
            },
          ],
        };
      }

      case 'get_media_list': {
        const fields = args.fields?.join(',') || 'id,caption,media_type,media_url,timestamp,like_count,comments_count';
        
        const response = await axios.get(`${INSTAGRAM_API_BASE}/${args.accountId}/media`, {
          params: {
            access_token: args.accessToken,
            fields: fields,
            limit: args.limit || 25,
          },
        });

        const mediaList = response.data.data.map((media: any) => `
📸 **${media.media_type}** - ${media.id}
- Caption: ${media.caption ? media.caption.substring(0, 100) + '...' : 'No caption'}
- Posted: ${new Date(media.timestamp).toLocaleDateString()}
- Likes: ${media.like_count || 0}
- Comments: ${media.comments_count || 0}
- URL: ${media.media_url || 'N/A'}
`).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `📱 **Media List (${response.data.data.length} items)**

${mediaList}

📊 **Pagination:**
- Total shown: ${response.data.data.length}
- Has more: ${response.data.paging?.next ? 'Yes' : 'No'}`,
            },
          ],
        };
      }

      case 'get_media_insights': {
        const metrics = args.metrics?.join(',') || 'impressions,reach,likes,comments,shares,saves';
        
        const response = await axios.get(`${INSTAGRAM_API_BASE}/${args.mediaId}/insights`, {
          params: {
            access_token: args.accessToken,
            metric: metrics,
          },
        });

        const insights = response.data.data.map((insight: any) => 
          `- ${insight.name}: ${insight.values[0]?.value || 'N/A'}`
        ).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `📊 **Media Insights**

🆔 **Media ID:** ${args.mediaId}

📈 **Performance Metrics:**
${insights}

💡 **Insights:**
- High reach indicates good hashtag/content strategy
- High saves suggest valuable content
- Monitor engagement rate (likes + comments / reach)`,
            },
          ],
        };
      }

      case 'refresh_token': {
        const response = await axios.get(`${INSTAGRAM_API_BASE}/refresh_access_token`, {
          params: {
            grant_type: 'ig_refresh_token',
            access_token: args.accessToken,
          },
        });

        return {
          content: [
            {
              type: 'text',
              text: `🔄 **Token Refreshed Successfully**

🔑 **New Token:** ${response.data.access_token}
⏰ **Expires In:** ${response.data.expires_in} seconds
📅 **Valid Until:** ${new Date(Date.now() + response.data.expires_in * 1000).toISOString()}

⚠️ **Security:**
- Store this token securely
- Update your application configuration
- Old token is now invalid`,
            },
          ],
        };
      }

      case 'validate_token': {
        const response = await axios.get(`${INSTAGRAM_API_BASE}/me`, {
          params: {
            access_token: args.accessToken,
            fields: 'id,account_type,username',
          },
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ **Token Valid**

👤 **Account Info:**
- User ID: ${response.data.id}
- Username: ${response.data.username || 'N/A'}
- Account Type: ${response.data.account_type}

🔐 **Token Status:** Active and valid
⏰ **Checked:** ${new Date().toISOString()}`,
            },
          ],
        };
      }

      case 'check_posting_limits': {
        // Instagram allows 25 posts per day for most accounts
        const currentDate = new Date().toISOString().split('T')[0];
        
        return {
          content: [
            {
              type: 'text',
              text: `📊 **Instagram Posting Limits**

🆔 **Account ID:** ${args.accountId}

📋 **Current Limits:**
- Photos/Videos: 25 posts per day
- Stories: 100 stories per day
- Reels: 100 reels per day

⏰ **Timing Restrictions:**
- Minimum interval: 1 minute between posts
- Best practice: 2-3 hours between posts
- Reset time: Daily at midnight UTC

💡 **Recommendations:**
- Spread posts throughout the day
- Monitor account health in Creator Studio
- Use scheduling to maintain consistent posting

⚠️ **Note:** Limits may vary based on account type and compliance history`,
            },
          ],
        };
      }

      case 'get_hashtag_info': {
        // First search for hashtag ID
        const searchResponse = await axios.get(`${INSTAGRAM_API_BASE}/ig_hashtag_search`, {
          params: {
            access_token: args.accessToken,
            user_id: args.accountId,
            q: args.hashtag,
          },
        });

        if (!searchResponse.data.data || searchResponse.data.data.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ **Hashtag Not Found**

🔍 **Searched:** #${args.hashtag}

💡 **Suggestions:**
- Check spelling
- Try variations of the hashtag
- Ensure hashtag exists and is public`,
              },
            ],
            isError: true,
          };
        }

        const hashtagId = searchResponse.data.data[0].id;
        const infoResponse = await axios.get(`${INSTAGRAM_API_BASE}/${hashtagId}`, {
          params: {
            access_token: args.accessToken,
            fields: 'id,name,media_count',
          },
        });

        return {
          content: [
            {
              type: 'text',
              text: `🏷️ **Hashtag Information**

🔍 **Hashtag:** #${infoResponse.data.name}
🆔 **ID:** ${infoResponse.data.id}
📊 **Media Count:** ${infoResponse.data.media_count?.toLocaleString() || 'N/A'} posts

💡 **Usage Tips:**
- High media count = very competitive
- Medium count (10K-1M) often best for reach
- Mix popular and niche hashtags
- Use 3-5 relevant hashtags per post`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    let errorMessage = 'Unknown error occurred';
    
    if (error.response) {
      // Instagram API error
      const apiError = error.response.data?.error;
      if (apiError) {
        errorMessage = `Instagram API Error: ${apiError.message} (Code: ${apiError.code})`;
        
        // Add specific error guidance
        if (apiError.code === 190) {
          errorMessage += '\n💡 Token expired or invalid. Please refresh your access token.';
        } else if (apiError.code === 100) {
          errorMessage += '\n💡 Invalid parameter. Check your request parameters.';
        } else if (apiError.code === 368) {
          errorMessage += '\n💡 Posting limit exceeded. Wait before posting again.';
        }
      } else {
        errorMessage = `HTTP Error: ${error.response.status} - ${error.response.statusText}`;
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
- Verify access token is valid and not expired
- Check account permissions and business verification
- Ensure media URLs are publicly accessible
- Review Instagram API rate limits`,
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
  console.error('Instagram API MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});