// NOTE: You can remove this file. Declaring the shape
// of the database is entirely optional in Convex.
// See https://docs.convex.dev/database/schemas.

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const agent = v.union(
  v.object({
    type: v.literal('user'),
    id: v.id('users'),
  }),
  v.object({
    type: v.literal('openai'),
  })
);

export default defineSchema({
  allowedEmails: defineTable({
    email: v.string(),
  }).index('by_email', ['email']),

  users: defineTable({
    // this is UserJSON from @clerk/backend
    clerkUser: v.any(),
  }).index('by_clerk_id', ['clerkUser.id']),

  conversations: defineTable({
    name: v.optional(v.string()),
    creatorId: v.id('users'),
  }).index('by_creator', ['creatorId']),

  messages: defineTable({
    agent,
    body: v.string(),
    isComplete: v.boolean(),
    conversationId: v.id('conversations'),
    thinking: v.optional(v.string()),
  }).index('by_conversation', ['conversationId']),

  memoriesToIndex: defineTable({
    source: v.union(
      v.object({
        type: v.literal('message'),
        messageId: v.id('messages'),
      })
    ),
  }).index('by_source', ['source']),

  memories: defineTable({
    userId: v.id('users'),
    source: v.union(
      v.object({
        type: v.literal('message'),
        messageId: v.id('messages'),
      })
    ),
    body: v.array(v.float64()),
  })
    .vectorIndex('body', {
      dimensions: 1536,
      filterFields: ['userId'],
      vectorField: 'body',
    })
    .index('by_source', ['source']),
});
