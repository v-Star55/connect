import { api } from "./api";

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

export async function removeConnectionApi(userId: string) {
  try {
    const res = await api.delete(`/user/connections/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Remove connection error:", error);
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

export async function updateProfileApi(name?: string, bio?: string, profilePicture?: string, aboutMe?: any) {
  try {
    const res = await api.put("/user/profile", { name, bio, profilePicture, aboutMe });
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
