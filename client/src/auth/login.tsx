import { useState, useEffect } from "react";
import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import loginApi from "../api/api";
import { toast } from "react-hot-toast";
import { login } from "../slice/auth/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { RegisterCard } from "./RegisterCard";

const loginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
    // Shared states
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // View states (syncs with router path)
    const location = useLocation();
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(location.pathname === "/register");

    useEffect(() => {
        setIsRegistering(location.pathname === "/register");
    }, [location.pathname]);

    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    const result = loginSchema.safeParse({ username, password });

    const mutation = useMutation({
        mutationFn: async () => {
            return await loginApi(username, password);
        },
        onSuccess: (res) => {
            toast.success("Login successful");
            dispatch(login(res.user));
            queryClient.setQueryData(["user"], res.user);
            navigate("/");
        },
        onError: (error: any) => {
            toast.error("Login failed: " + (error.response?.data?.message || error.message));
            console.error("Login failed:", error);
        },
    });



    const toggleView = () => {
        setUsername("");
        setPassword("");
        if (location.pathname === "/register") {
            navigate("/login");
        } else {
            navigate("/register");
        }
    };

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
        <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-between p-6 lg:p-16 xl:p-24 overflow-hidden font-sans select-none">
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
            >
                <source src="/rain.mp4" type="video/mp4" />
            </video>

            {/* Left Side: Hero Text (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col justify-end h-full max-w-xl pb-12 z-10 select-none gap-5">
                <div>
                    <h1
                        className="text-6xl xl:text-7xl font-extrabold text-white tracking-tight"
                        style={{ textShadow: "0 8px 30px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3)" }}
                    >
                        Connect
                    </h1>
                    <p
                        className="text-lg xl:text-xl font-semibold text-white/90 tracking-wide mt-2"
                        style={{ textShadow: "0 4px 15px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.3)" }}
                    >
                        Always Stay Connected
                    </p>
                </div>

                {/* Monsoon Greeting */}
                <div
                    className="p-4 rounded-2xl backdrop-blur-md border border-white/20 text-white/95 max-w-md shadow-lg"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
                >
                    <p className="text-sm font-bold flex items-center gap-1.5 text-sky-200">
                        <span>🌧️</span> Monsoon Season is Live!
                    </p>
                    <p className="text-xs text-white/80 mt-1 font-medium leading-relaxed">
                        Cozy up with a hot cup of tea ☕ and chat with your connections while the rain pours. Stay close, stay warm.
                    </p>
                </div>
            </div>

            {/* Right Side: Glassmorphism Card */}
            <div className="w-full max-w-xl  backdrop-blur-xl border border-white/40 rounded-[32px] p-8 md:p-10 shadow-2xl relative z-10 text-slate-800 flex flex-col justify-between">
                {!isRegistering ? (
                    /* LOGIN CARD VIEW */
                    <>
                        {/* Header */}
                        <div>
                            <div className="flex items-center justify-between gap-4">
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back! 👋</h1>
                                <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo-500/25 text-indigo-100 border border-indigo-400/40 rounded-full flex items-center gap-1 select-none shrink-0 animate-pulse">
                                    <span>🌧️</span> Monsoon mode active
                                </span>
                            </div>
                        </div>

                        {/* Form fields */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-3">Sign in to your account</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Username input */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 ml-1">Username</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Your name"
                                            required
                                            className="w-full bg-white/50 border border-white/40 rounded-2xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:bg-white/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                        />
                                    </div>

                                    {/* Password input */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 ml-1">Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            required
                                            className="w-full bg-white/50 border border-white/40 rounded-2xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:bg-white/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Pills */}
                            <div className="space-y-2.5 pt-1">
                                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">I'm looking for...</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={toggleView}
                                        className="px-4 py-2 text-xs font-semibold bg-white/50 hover:bg-white border border-white/30 rounded-full transition-all text-slate-800 active:scale-95 shadow-sm"
                                    >
                                        Register Account
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/forgot-password")}
                                        className="px-4 py-2 text-xs font-semibold bg-white/50 hover:bg-white border border-white/30 rounded-full transition-all text-slate-800 active:scale-95 shadow-sm"
                                    >
                                        Forgot Password?
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toast("Explore features and chat connections in the workspace.")}
                                        className="px-4 py-2 text-xs font-semibold bg-white/50 hover:bg-white border border-white/30 rounded-full transition-all text-slate-800 active:scale-95 shadow-sm"
                                    >
                                        Explore App
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toast("Contact support via email at support@connect.com")}
                                        className="px-4 py-2 text-xs font-semibold bg-white/50 hover:bg-white border border-white/30 rounded-full transition-all text-slate-800 active:scale-95 shadow-sm"
                                    >
                                        Get Help
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full mt-6 bg-slate-950 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-slate-950/20 text-sm"
                            >
                                {mutation.isPending ? "Signing in..." : "Sign In"}
                            </button>
                        </form>
                    </>
                ) : (
                    /* REGISTER CARD VIEW */
                    <RegisterCard
                        onBackToLogin={toggleView}
                        onSuccess={() => navigate("/login")}
                    />
                )}
            </div>
        </div>
    );
};

export default Login;
