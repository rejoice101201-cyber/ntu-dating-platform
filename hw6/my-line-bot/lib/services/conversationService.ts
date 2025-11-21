import { prisma } from '../db/prisma';
import type { ConversationState, ConversationMetadata } from '../types/conversation';

/**
 * 取得或建立對話
 */
export async function getOrCreateConversation(lineUserId: string) {
  // 尋找最近的活躍對話（30 分鐘內）
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  let conversation = await prisma.conversation.findFirst({
    where: {
      lineUserId,
      status: 'active',
      lastMessageAt: {
        gte: thirtyMinutesAgo,
      },
    },
    orderBy: {
      lastMessageAt: 'desc',
    },
  });

  // 如果沒有活躍對話，建立新的
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        lineUserId,
        status: 'active',
        metadata: {
          state: 'idle',
        },
      },
    });
  }

  return conversation;
}

/**
 * 儲存訊息
 */
export async function saveMessage(
  conversationId: string,
  lineUserId: string,
  messageType: string,
  content: string,
  role: 'user' | 'assistant' | 'system',
  lineMessageId?: string,
  metadata?: any
) {
  const message = await prisma.message.create({
    data: {
      conversationId,
      lineUserId,
      messageType,
      content,
      role,
      lineMessageId,
      metadata,
    },
  });

  // 更新對話的最後訊息時間
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
    },
  });

  return message;
}

/**
 * 取得對話歷史（最近 N 輪）
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 5
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      role: {
        in: ['user', 'assistant'],
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });

  // 反轉順序（從舊到新）
  return messages
    .reverse()
    .map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
}

/**
 * 更新對話狀態
 */
export async function updateConversationState(
  conversationId: string,
  state: ConversationState,
  metadata?: Partial<ConversationMetadata>
) {
  const current = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  const updatedMetadata = {
    ...((current?.metadata as ConversationMetadata) || {}),
    state,
    ...metadata,
  };

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      metadata: updatedMetadata,
    },
  });
}

/**
 * 結束對話
 */
export async function endConversation(conversationId: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: 'ended',
      metadata: {
        ...((await prisma.conversation.findUnique({ where: { id: conversationId } }))?.metadata as ConversationMetadata || {}),
        state: 'ended',
      },
    },
  });
}

