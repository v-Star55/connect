import { useState } from "react";
import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import loginApi, { googleLoginApi } from "../api/api";
import { toast } from "react-hot-toast";
import { login } from "../slice/auth/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthFooter from "../components/AuthFooter";
import { GoogleLogin } from "@react-oauth/google";

const loginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const queryClient = useQueryClient()
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const result = loginSchema.safeParse({ username, password });

    const mutation = useMutation({
        mutationFn: async () => {
            return await loginApi(username, password);
        },
        onSuccess: (res) => {
            toast.success("Login successful");
            dispatch(login(res.user));
            queryClient.setQueryData(["user"], res.user);
            console.log(res);
            console.log("Login successful");
            navigate("/");
        },
        onError: (error: any) => {
            // Handle login error, e.g., show an error message
            toast.error("Login failed: " + (error.response?.data?.message || error.message));
            console.error("Login failed:", error);
        },
    });

    const googleMutation = useMutation({
        mutationFn: async (googleCredential: string) => {
            return await googleLoginApi(googleCredential);
        },
        onSuccess: (res) => {
            toast.success("Login successful");
            toast("You can always change your username and profile picture in settings")
            dispatch(login(res.user));
            queryClient.setQueryData(["user"], res.user);
            console.log(res);
            console.log("Login successful");
            navigate("/");
        },
        onError: (error: any) => {
            // Handle login error, e.g., show an error message
            toast.error("Login failed: " + (error.response?.data?.message || error.message));
            console.error("Login failed:", error);
        },
    });

    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!result.success) {
            const firstError = result.error.issues[0];
            toast.error(firstError.message);
            return;
        }
        mutation.mutate();
    };


    return (
        <div className="min-h-screen w-full bg-[#030303] text-white flex flex-col font-sans selection:bg-purple-500/30">
    
        

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row pt-20">

                {/* Left Side: Hero/Marketing (Hidden on Mobile) */}
                <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-24 relative overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute top-20 left-20 w-3 h-3 bg-green-500 rounded-full blur-[2px] animate-pulse"></div>
                    <div className="absolute top-10 right-40 w-4 h-4 bg-green-600/30 rounded-full blur-[1px]"></div>

                    <div className="flex items-center flex-col justify-center relative z-10">
                        {/* Big Logo */}
                        <div className="flex justify-center relative">
                            <img src="/logo.png" alt="Logo" className="relative z-10 w-80 h-80 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" />
                        </div>

                        <h2 className="text-6xl font-black leading-tight mb-6 text-center">
                            Welcome back<br />
                            <span className="bg-linear-to-r from-green-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                                stay connected.
                            </span>
                        </h2>

                        <p className="text-gray-400 text-lg max-w-lg mb-10 leading-relaxed font-medium text-center">
                            Enter your credentials to access your account and continue your journey within our community.
                        </p>
                    </div>

                    {/* Floating Heart Icon */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                        <svg className="w-64 h-64 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-12 xl:p-24 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 lg:p-10 shadow-2xl relative z-10">
                        <h1 className="text-3xl font-bold mb-2">Sign In</h1>
                        <p className="text-gray-400 text-sm mb-8 font-medium">Access your personal space and messages.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-500 ml-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-white transition-colors">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="johndoe"
                                        required
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-500 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-white transition-colors">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <a href="/forgot-password" className="text-[11px] font-bold text-purple-500 hover:text-purple-400 transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {mutation.isPending ? "Signing in..." : "Sign In"}
                            </button>

                            {/* Divider */}
                            <div className="relative py-4 flex items-center">
                                <div className="grow border-t border-white/5"></div>
                                <span className="shrink mx-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Secure Access</span>
                                <div className="grow border-t border-white/5"></div>
                            </div>

                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    const cred = credentialResponse.credential || "";
                                    googleMutation.mutate(cred);
                                    console.log(credentialResponse);
                                }}
                                onError={() => {
                                    console.log("Login Failed");
                                }}
                                size="large"
                                shape="pill"
                                
                                
                            />

                            <p className="text-center text-xs text-gray-500 font-medium pt-4">
                                Don't have an account? <a href="/register" className="text-green-500 font-bold hover:underline transition-all">Create account</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <AuthFooter />
        </div>
    )
}

export default Login;
