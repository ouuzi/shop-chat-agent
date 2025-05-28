import { PrismaClient } from "@prisma/client";

let db;

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
} else {
  if (!globalThis.__db__) {
    globalThis.__db__ = new PrismaClient();
  }
  db = globalThis.__db__;
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
    console.error('Error getting customer token:', error);
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
    console.error('Error storing customer token:', error);
    return null;
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
    console.error('Error storing code verifier:', error);
    return null;
  }
}

export async function getCodeVerifier(state) {
  try {
    const codeVerifier = await db.codeVerifier.findUnique({
      where: { state }
    });
    return codeVerifier;
  } catch (error) {
    console.error('Error getting code verifier:', error);
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
    console.error('Error saving message:', error);
    return null;
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
    console.error('Error getting conversation history:', error);
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
    console.error('Error storing customer account URL:', error);
    return null;
  }
}

export async function getCustomerAccountUrl(conversationId) {
  try {
    const customerAccountUrl = await db.customerAccountUrl.findUnique({
      where: { conversationId }
    });
    return customerAccountUrl?.url || null;
  } catch (error) {
    console.error('Error getting customer account URL:', error);
    return null;
  }
}