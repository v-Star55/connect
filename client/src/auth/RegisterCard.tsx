import { useState, useEffect } from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { registerApi, verifyEmailApi } from "../api/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const registerSchema = z.object({
    fullName: z.string().min(2, "Full Name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

interface RegisterCardProps {
    onBackToLogin: () => void;
    onSuccess: () => void;
}

export const RegisterCard = ({ onBackToLogin, onSuccess }: RegisterCardProps) => {
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        let timer: any;
        if (resendCooldown > 0) {
            timer = setTimeout(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const registerMutation = useMutation({
        mutationFn: async () => {
            return await registerApi(fullName, email, username, password);
        },
        onSuccess: () => {
            toast(() => (
                <div className="flex flex-col items-center gap-2 p-1">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center">
                        <video 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover"
                        >
                            <source src="/Email successfully sent.webm" type="video/webm" />
                        </video>
                    </div>
                    <span className="text-xs font-bold text-slate-800 text-center">
                        Verification code sent to your email!
                    </span>
                </div>
            ), {
                duration: 5000,
                position: "top-center",
                style: {
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    borderRadius: "20px",
                    padding: "12px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                }
            });
            setShowOTP(true);
            setResendCooldown(30);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Registration failed. Please try again.");
            console.error("Registration failed:", error);
        }
    });

    const verifyMutation = useMutation({
        mutationFn: async () => {
            return await verifyEmailApi(email, otp);
        },
        onSuccess: () => {
            toast.success("Email verified successfully! You can now log in.");
            onSuccess();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Invalid or expired OTP. Please try again.");
            console.error("Verification failed:", error);
        }
    });

    const handleSendOTP = () => {
        const validationResult = registerSchema.safeParse({
            fullName,
            username,
            email,
            password,
            confirmPassword
        });

        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0];
            toast.error(firstError.message);
            return;
        }

        registerMutation.mutate();
    };

    const handleRegisterVerify = () => {
        if (!otp) {
            toast.error("Please enter the OTP sent to your email");
            return;
        }
        verifyMutation.mutate();
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!showOTP) {
            handleSendOTP();
        } else {
            handleRegisterVerify();
        }
    };

    return (
        <>
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account 👋</h1>
                <p className="text-sm font-semibold text-slate-700 mt-2">Get started with your free account</p>
            </div>

            {/* Form fields */}
            <form onSubmit={handleRegisterSubmit} className="space-y-5 mt-6">
                {!showOTP ? (
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3">Leave us your information</h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Full Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)} 
                                        placeholder="John Doe" 
                                        required 
                                        disabled={registerMutation.isPending || verifyMutation.isPending}
                                        className="w-full bg-white/50 border border-white/40 rounded-2xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:bg-white/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>

                                {/* Username */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">Username</label>
                                    <input 
                                        type="text" 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)} 
                                        placeholder="johndoe" 
                                        required 
                                        disabled={registerMutation.isPending || verifyMutation.isPending}
                                        className="w-full bg-white/50 border border-white/40 rounded-2xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:bg-white/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 ml-1">Email</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="john@example.com" 
                                    required 
                                    disabled={registerMutation.isPending || verifyMutation.isPending}
                                    className="w-full bg-white/50 border border-white/40 rounded-2xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:bg-white/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">Password</label>
                                    <input 
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        placeholder="••••••••" 
                                        required 
                                        disabled={registerMutation.isPending || verifyMutation.isPending}
                                        className="w-full bg-white/50 border border-white/40 rounded-2xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:bg-white/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        placeholder="••••••••" 
                                        required 
                                        disabled={registerMutation.isPending || verifyMutation.isPending}
                                        className="w-full bg-white/50 border border-white/40 rounded-2xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:bg-white/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Register primary button */}
                        <button 
                            type="submit" 
                            disabled={registerMutation.isPending}
                            className="w-full mt-6 bg-slate-950 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-slate-950/20 text-sm"
                        >
                            {registerMutation.isPending ? "Sending OTP..." : "Send Verification Code"}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 mb-1">Verify Your Email</h3>
                        <p className="text-xs text-slate-600 leading-normal">
                            We've sent a 6-digit verification code to <span className="font-bold text-slate-900">{email}</span>.
                        </p>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-semibold text-slate-700 ml-1">Enter Verification Code</label>
                            <input 
                                type="text" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                                placeholder="123456" 
                                required={showOTP}
                                disabled={verifyMutation.isPending}
                                className="w-full bg-white/50 border border-white/40 rounded-2xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:bg-white/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <div className="flex flex-col gap-3 pt-3">
                            <button 
                                type="submit" 
                                disabled={verifyMutation.isPending || registerMutation.isPending}
                                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-slate-950/20 text-sm"
                            >
                                {verifyMutation.isPending ? "Verifying..." : "Verify & Register"}
                            </button>
                            <div className="flex gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => registerMutation.mutate()} 
                                    disabled={registerMutation.isPending || resendCooldown > 0 || verifyMutation.isPending}
                                    className="flex-1 py-2.5 text-xs font-semibold bg-white/50 hover:bg-white border border-white/30 rounded-full transition-all text-slate-800 active:scale-95 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {registerMutation.isPending 
                                        ? "Resending..." 
                                        : resendCooldown > 0 
                                            ? `Resend in ${resendCooldown}s` 
                                            : "Resend Code"
                                    }
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowOTP(false)} 
                                    disabled={verifyMutation.isPending || registerMutation.isPending}
                                    className="flex-1 py-2.5 text-xs font-semibold bg-white/50 hover:bg-white border border-white/30 rounded-full transition-all text-slate-800 active:scale-95 shadow-sm"
                                >
                                    Change Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Pills */}
                <div className="space-y-2.5 pt-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">I'm looking for...</label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={onBackToLogin}
                            className="px-4 py-2 text-xs font-semibold bg-white/50 hover:bg-white border border-white/30 rounded-full transition-all text-slate-800 active:scale-95 shadow-sm"
                        >
                            Back to Login
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
                            onClick={() => toast("Contact support via email at support@connect.com")}
                            className="px-4 py-2 text-xs font-semibold bg-white/50 hover:bg-white border border-white/30 rounded-full transition-all text-slate-800 active:scale-95 shadow-sm"
                        >
                            Get Help
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};
