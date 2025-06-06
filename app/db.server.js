import { PrismaClient } from "@prisma/client";

let db;

// For now, we'll create a mock database that doesn't require persistent storage
// In production environments like Vercel, SQLite files can't be written
const createMockDb = () => ({
  $connect: () => Promise.resolve(),
  customerToken: {
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({ id: 'mock', accessToken: 'mock' })
  },
  codeVerifier: {
    create: () => Promise.resolve({ id: 'mock', state: 'mock', verifier: 'mock' }),
    findUnique: () => Promise.resolve(null)
  },
  conversation: {
    upsert: () => Promise.resolve({ id: 'mock' })
  },
  message: {
    create: () => Promise.resolve({ id: 'mock', content: 'mock' }),
    findMany: () => Promise.resolve([])
  },
  customerAccountUrl: {
    upsert: () => Promise.resolve({ id: 'mock', url: 'mock' }),
    findUnique: () => Promise.resolve(null)
  }
});

try {
  if (process.env.NODE_ENV === "production") {
    // Try to create Prisma client, but fall back to mock if it fails
    db = new PrismaClient();
  } else {
    if (!globalThis.__db__) {
      globalThis.__db__ = new PrismaClient();
    }
    db = globalThis.__db__;
  }
} catch (error) {
  console.warn('Database connection failed, using mock database:', error.message);
  db = createMockDb();
}

export { db };

// Customer Token functions
export async function getCustomerToken(conversationId) {
  try {
    const customerToken = await db.customerToken.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' }
    });
    return customerToken;
  } catch (error) {
    console.warn('Database error getting customer token, returning null:', error.message);
    return null;
  }
}

export async function storeCustomerToken(conversationId, accessToken, refreshToken, expiresAt) {
  try {
    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customerToken = await db.customerToken.create({
      data: {
        id: tokenId,
        conversationId,
        accessToken,
        refreshToken,
        expiresAt: new Date(expiresAt)
      }
    });
    return customerToken;
  } catch (error) {
    console.warn('Database error storing customer token, continuing without persistence:', error.message);
    return { id: 'mock', conversationId, accessToken };
  }
}

// Code Verifier functions
export async function storeCodeVerifier(state, verifier, expiresAt) {
  try {
    const codeVerifier = await db.codeVerifier.create({
      data: {
        id: `verifier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        state,
        verifier,
        expiresAt: new Date(expiresAt)
      }
    });
    return codeVerifier;
  } catch (error) {
    console.warn('Database error storing code verifier, continuing without persistence:', error.message);
    return { id: 'mock', state, verifier };
  }
}

export async function getCodeVerifier(state) {
  try {
    const codeVerifier = await db.codeVerifier.findUnique({
      where: { state }
    });
    return codeVerifier;
  } catch (error) {
    console.warn('Database error getting code verifier, returning null:', error.message);
    return null;
  }
}

// Conversation and Message functions
export async function saveMessage(conversationId, role, content) {
  try {
    // Ensure conversation exists
    await db.conversation.upsert({
      where: { id: conversationId },
      update: { updatedAt: new Date() },
      create: { id: conversationId }
    });

    // Save the message
    const message = await db.message.create({
      data: {
        conversationId,
        role,
        content
      }
    });
    return message;
  } catch (error) {
    console.warn('Database error saving message, continuing without persistence:', error.message);
    return { id: 'mock', conversationId, role, content };
  }
}

export async function getConversationHistory(conversationId, limit = 50) {
  try {
    const messages = await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit
    });
    return messages;
  } catch (error) {
    console.warn('Database error getting conversation history, returning empty array:', error.message);
    return [];
  }
}

// Customer Account URL functions
export async function storeCustomerAccountUrl(conversationId, url) {
  try {
    const customerAccountUrl = await db.customerAccountUrl.upsert({
      where: { conversationId },
      update: { url, updatedAt: new Date() },
      create: { conversationId, url }
    });
    return customerAccountUrl;
  } catch (error) {
    console.warn('Database error storing customer account URL, continuing without persistence:', error.message);
    return { id: 'mock', conversationId, url };
  }
}

export async function getCustomerAccountUrl(conversationId) {
  try {
    const customerAccountUrl = await db.customerAccountUrl.findUnique({
      where: { conversationId }
    });
    return customerAccountUrl?.url || null;
  } catch (error) {
    console.warn('Database error getting customer account URL, returning null:', error.message);
    return null;
  }
}