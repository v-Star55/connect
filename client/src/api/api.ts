import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true, // REQUIRED for cookies
});



api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;

    if ( originalConfig.url !== "/auth/login" && originalConfig.url !== "/auth/refresh" 
      && err.response){
      // Access Token was expired
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          await api.post("/auth/refresh", {}, { withCredentials: true });
          console.log("Access token refreshed");
          return api(originalConfig);
        } catch (_error) {
          console.log("Access token refresh failed");
          return Promise.reject(_error);
        }
      }
    }

    return Promise.reject(err);
  }
);


// //////////////////// AUTH API

export default async function loginApi(username: string, password: string) {
  try {
    console.log('base URL:',import.meta.env.VITE_BACKEND_URL);
    console.log("Login API called with:", { username, password });
    const res= await api.post("/auth/login", { username, password });
    return res.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function registerApi(name: string, email: string, username: string, password: string) {
  try {
    const res = await api.post("/auth/register", { name, email, username, password });
    return res.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function verifyEmailApi(email: string, otp: string) {
  try {
    const res = await api.post("/auth/verify-email", { email, otp });
    return res.data;
  } catch (error) {
    console.error("Verify email error:", error);
    throw error;
  }
}


export async function googleLoginApi(credential: string) {
  try {
    const res = await api.post("/auth/google", { credential });
    return res.data;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
}

export async function logoutApi() {
  try {
    const res = await api.post("/auth/logout");
    return res.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}


export async function forgotPasswordApi(email: string) {
  try {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
}

export async function verifyOtpApi(email: string, otp: string) {
  try {
    const res = await api.post("/auth/verify-otp", { email, otp });
    return res.data;
  } catch (error) {
    console.error("Verify OTP error:", error);
    throw error;
  }
}

export async function resetPasswordApi(email: string, otp: string, newPassword: string) {
  try {
    const res = await api.post("/auth/reset-password", { email, otp, newPassword });
    return res.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
}


export async function meApi() {
  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch (error) {
    console.error("Me error:", error);
    throw error;
  }
}



// ////////////////////////////  USER API


export async function searchUsers(query: string, page: number = 1, vibe: string = "All", sortBy: string = "suggested") {
  try {
    const res = await api.get(`/user/search?q=${query}&page=${page}&vibe=${encodeURIComponent(vibe)}&sortBy=${sortBy}`);
    return res.data;
  } catch (error) {
    console.error("Search users error:", error);
    throw error;
  }
}



export async function addFriendApi(userId: string) {
  try {
    const res = await api.post(`/user/add-friend/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Add friend error:", error);
    throw error;
  }
}


export async function getUserConnectionApi(page: number = 1) {
  try {
    const res = await api.get(`/user/connections?page=${page}`);
    return res.data;
  } catch (error) {
    console.error("Get user connections error:", error);
    throw error;
  }
}


export async function getUserConnectionRequestApi(page: number = 1) {
    try {
    const res = await api.get(`/user/connections/request?page=${page}`);
    return res.data;
  } catch (error) {
    console.error("Get user connections Request error:", error);
    throw error;
  }
}

export async function acceptConnectionRequestApi(requestId: string) {
    try {
    const res = await api.put(`/user/connections/accept/${requestId}`);
    return res.data;
  } catch (error) {
    console.error("Accept connection request error:", error);
    throw error;
  }
}

export async function rejectConnectionRequestApi(requestId: string) {
    try {
    const res = await api.put(`/user/connections/reject/${requestId}`);
    return res.data;
  } catch (error) {
    console.error("Reject connection request error:", error);
    throw error;
  }
}


// ///////////////////////////// chats

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
export async function blockUserApi(userId: string) {
  try {
    const res = await api.post(`/user/block/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Block user error:", error);
    throw error;
  }
}

export async function unblockUserApi(userId: string) {
  try {
    const res = await api.post(`/user/unblock/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Unblock user error:", error);
    throw error;
  }
}

export async function getProfileApi() {
  try {
    const res = await api.get("/user/profile");
    return res.data;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
}

export async function updateProfileApi(name?: string, bio?: string, profilePicture?: string) {
  try {
    const res = await api.put("/user/profile", { name, bio, profilePicture });
    return res.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
}

export async function updateVibeApi(vibes: string[]) {
  try {
    const res = await api.put("/user/profile/vibe", { vibes });
    return res.data;
  } catch (error) {
    console.error("Update vibe error:", error);
    throw error;
  }
}
