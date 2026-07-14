import { api } from "./api";

export async function createChatApi(otherUserId: string, type: string) {
  try {
    const res = await api.post(`/chat`, { otherUserId, type });
    return res.data;
  } catch (error) {
    console.error("Create chat error:", error);
    throw error;
  }
}

export async function sendMessageApi(chatId: string, content: string, media?: string, mediaType?: string | null) {
  try {
    const res = await api.post(`/chat/sendMessage`, { chatId, content, media, mediaType });
    return res.data;
  } catch (error) {
    console.error("Send message error:", error);
    throw error;
  }
}

export async function uploadFileApi(fileData: string) {
  try {
    const res = await api.post(`/chat/upload`, { fileData });
    return res.data;
  } catch (error) {
    console.error("Upload file error:", error);
    throw error;
  }
}

export async function editMessageApi(messageId: string, content: string) {
  try {
    const res = await api.put(`/chat/edit/${messageId}`, { content });
    return res.data;
  } catch (error) {
    console.error("Edit message error:", error);
    throw error;
  }
}

export async function deleteMessageApi(messageId: string) {
  try {
    const res = await api.delete(`/chat/delete/${messageId}`);
    return res.data;
  } catch (error) {
    console.error("Delete message error:", error);
    throw error;
  }
}

export async function replyMessageApi(chatId: string, message: string) {
  try {
    const res = await api.post(`/chat/replyMessage`, { chatId, message });
    return res.data;
  } catch (error) {
    console.error("Reply message error:", error);
    throw error;
  }
}

export async function clearChatApi(chatId: string) {
  try {
    const res = await api.post(`/chat/clear`, { chatId });
    return res.data;
  } catch (error) {
    console.error("Clear chat error:", error);
    throw error;
  }
}

export async function toggleMuteApi(chatId: string, isMuted: boolean) {
  try {
    const res = await api.put(`/chat/mute`, { chatId, isMuted });
    return res.data;
  } catch (error) {
    console.error("Toggle mute error:", error);
    throw error;
  }
}

export async function toggleReadReceiptsApi(chatId: string, enabled: boolean) {
  try {
    const res = await api.put(`/chat/read-receipts`, { chatId, enabled });
    return res.data;
  } catch (error) {
    console.error("Toggle read receipts error:", error);
    throw error;
  }
}

export async function markChatAsReadApi(chatId: string) {
  try {
    const res = await api.put(`/chat/read/${chatId}`);
    return res.data;
  } catch (error) {
    console.error("Mark chat as read error:", error);
    throw error;
  }
}

export async function getChatsByUserApi(page: number = 1) {
  try {
    const res = await api.get(`/chat/user?page=${page}`);
    return res.data;
  } catch (error) {
    console.error("Get chats by user error:", error);
    throw error;
  }
}

export async function getMessagesApi(chatId: string, page: number = 1) {
  try {
    const res = await api.get(`/chat/messages/${chatId}?page=${page}`);
    return res.data;
  } catch (error) {
    console.error("Get messages error:", error);
    throw error;
  }
}

export async function getChatStatsApi(chatId: string) {
  try {
    const res = await api.get(`/chat/stats/${chatId}`);
    return res.data;
  } catch (error) {
    console.error("Get chat stats error:", error);
    throw error;
  }
}

export async function getBucketListApi(chatId: string) {
  try {
    const res = await api.get(`/chat/bucketlist/${chatId}`);
    return res.data;
  } catch (error) {
    console.error("Get bucket list error:", error);
    throw error;
  }
}

export async function createBucketListItemApi(chatId: string, title: string, timeframe: string, customEndDate?: string) {
  try {
    const res = await api.post("/chat/bucketlist", { chatId, title, timeframe, customEndDate });
    return res.data;
  } catch (error) {
    console.error("Create bucket list item error:", error);
    throw error;
  }
}

export async function toggleBucketListItemApi(itemId: string) {
  try {
    const res = await api.put(`/chat/bucketlist/${itemId}/toggle`);
    return res.data;
  } catch (error) {
    console.error("Toggle bucket list item error:", error);
    throw error;
  }
}

export async function deleteBucketListItemApi(itemId: string) {
  try {
    const res = await api.delete(`/chat/bucketlist/${itemId}`);
    return res.data;
  } catch (error) {
    console.error("Delete bucket list item error:", error);
    throw error;
  }
}
