import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApi, verifyOtpApi, resetPasswordApi } from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import z from "zod";

const safeSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid Email Address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

const ForgotPassword = () => {
    const [step, setStep] = useState(() => {
        return parseInt(sessionStorage.getItem("fp_step") || "1");
    });
    const [email, setEmail] = useState(() => sessionStorage.getItem("fp_email") || "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    
    const navigate = useNavigate();

    // Cooldown timer logic
    useEffect(() => {
        let timer: any;
        if (resendCooldown > 0) {
            timer = setTimeout(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const updateStep = (newStep: number) => {
        setStep(newStep);
        sessionStorage.setItem("fp_step", newStep.toString());
    };

    const updateEmail = (newEmail: string) => {
        setEmail(newEmail);
        sessionStorage.setItem("fp_email", newEmail);
    };

    const forgotPasswordMutation = useMutation({
        mutationFn: async () => {
            return await forgotPasswordApi(email);
        },
        onSuccess: () => {
            toast.success("Verification code sent to your email!");
            updateStep(2);
            setResendCooldown(30);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to send verification code");
        }
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            return await verifyOtpApi(email, otp);
        },
        onSuccess: () => {
             toast.success("Verification code verified!");
             updateStep(3);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Invalid or expired verification code");
        }
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async () => {
            return await resetPasswordApi(email, otp, newPassword);
        },
        onSuccess: () => {
            toast.success("Password reset successful! You can now log in.");
            sessionStorage.removeItem("fp_step");
            sessionStorage.removeItem("fp_email");
            navigate("/login");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to reset password");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (step === 1) {
            const result = safeSchema.pick({ email: true }).safeParse({ email });
            if (!result.success) {
                toast.error(result.error.issues?.[0]?.message);
                return;
            }
            forgotPasswordMutation.mutate();
        } else if (step === 2) {
             if (!otp || otp.length < 6) {
                toast.error("Please enter a valid 6-digit verification code");
                return;
             }
            verifyOtpMutation.mutate();
        } else if (step === 3) {
             const result = safeSchema.pick({ password: true }).safeParse({ password: newPassword });
             if (!result.success) {
                 toast.error(result.error.issues?.[0]?.message);
                 return;
             }
            resetPasswordMutation.mutate();
        }
    };

    // Live Password Strength Checklist Booleans
    const hasMinLength = newPassword.length >= 6;

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
            <div className="w-full max-w-xl backdrop-blur-xl border border-white/40 rounded-[32px] p-8 md:p-10 shadow-2xl relative z-10 text-slate-800 flex flex-col justify-between min-h-[500px]">
                <div>
                    {/* Header */}
                    <div>
                        <div className="flex items-center justify-between gap-4">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reset Password 🔒</h1>
                            <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo-500/25 text-indigo-100 border border-indigo-400/40 rounded-full flex items-center gap-1 select-none shrink-0 animate-pulse">
                                <span>🌧️</span> Monsoon mode active
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mt-2">
                            {step === 1 && "Enter your email to receive a verification code"}
                            {step === 2 && `Enter the 6-digit code sent to ${email}`}
                            {step === 3 && "Create a secure new password"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-350">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => updateEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        required
                                        disabled={forgotPasswordMutation.isPending}
                                        className="w-full bg-white/50 border border-white/40 rounded-2xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:bg-white/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={forgotPasswordMutation.isPending}
                                    className="w-full mt-4 bg-slate-950 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-slate-950/20 text-sm"
                                >
                                    {forgotPasswordMutation.isPending ? "Sending code..." : "Send Verification Code"}
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-350">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">Enter Verification Code</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        required
                                        disabled={verifyOtpMutation.isPending}
                                        className="w-full bg-white/50 border border-white/40 rounded-2xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:bg-white/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={verifyOtpMutation.isPending || forgotPasswordMutation.isPending}
                                        className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-slate-950/20 text-sm"
                                    >
                                        {verifyOtpMutation.isPending ? "Verifying..." : "Verify Code"}
                                    </button>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => forgotPasswordMutation.mutate()} 
                                            disabled={forgotPasswordMutation.isPending || resendCooldown > 0 || verifyOtpMutation.isPending}
                                            className="flex-1 py-2.5 text-xs font-semibold bg-white/50 hover:bg-white border border-white/30 rounded-full transition-all text-slate-800 active:scale-95 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            {forgotPasswordMutation.isPending 
                                                ? "Resending..." 
                                                : resendCooldown > 0 
                                                    ? `Resend in ${resendCooldown}s` 
                                                    : "Resend Code"
                                            }
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => updateStep(1)} 
                                            disabled={verifyOtpMutation.isPending || forgotPasswordMutation.isPending}
                                            className="flex-1 py-2.5 text-xs font-semibold bg-white/50 hover:bg-white border border-white/30 rounded-full transition-all text-slate-800 active:scale-95 shadow-sm"
                                        >
                                            Change Email
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-350">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            disabled={resetPasswordMutation.isPending}
                                            className="w-full bg-white/50 border border-white/40 rounded-2xl py-3.5 px-4 text-sm text-slate-900 focus:outline-none focus:bg-white/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="mt-3 space-y-1.5 ml-1">
                                        <div className="flex items-center gap-2 text-xs font-semibold">
                                            <span className={hasMinLength ? "text-emerald-600" : "text-slate-400"}>
                                                {hasMinLength ? "✓" : "○"}
                                            </span>
                                            <span className={hasMinLength ? "text-emerald-700" : "text-slate-500"}>
                                                Must be at least 6 characters
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={resetPasswordMutation.isPending}
                                    className="w-full mt-4 bg-slate-950 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-slate-950/20 text-sm"
                                >
                                    {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Navigation Pills */}
                <div className="space-y-2.5 pt-6 border-t border-white/20 mt-6">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">I'm looking for...</label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="px-4 py-2 text-xs font-semibold bg-white/50 hover:bg-white border border-white/30 rounded-full transition-all text-slate-800 active:scale-95 shadow-sm cursor-pointer"
                        >
                            Back to Login
                        </button>
                        <button
                            type="button"
                            onClick={() => toast("Contact support via email at support@connect.com")}
                            className="px-4 py-2 text-xs font-semibold bg-white/50 hover:bg-white border border-white/30 rounded-full transition-all text-slate-800 active:scale-95 shadow-sm cursor-pointer"
                        >
                            Get Help
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;