import { api } from "./api";

export default async function loginApi(username: string, password: string) {
  try {
    console.log('base URL:', import.meta.env.VITE_BACKEND_URL);
    console.log("Login API called with:", { username, password });
    const res = await api.post("/auth/login", { username, password });
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
