import { toast } from "react-hot-toast";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApi, verifyOtpApi, resetPasswordApi } from "../api/api";
import { useNavigate } from "react-router-dom";
import AuthFooter from "../components/AuthFooter";
import z from "zod";


const safeSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid Email Address"),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^()_\-+=])[A-Za-z\d@$!%*#?&^()_\-+=]{6,}$/,
      "Password must be at least 6 characters and include a letter, a number, and a special character"
    ),
});


const ForgotPassword = () => {
    const [step, setStep] = useState(() => {
        return parseInt(sessionStorage.getItem("fp_step") || "1");
    });
    const [email, setEmail] = useState(() => sessionStorage.getItem("fp_email") || "");
    const [otp, setOtp] = useState(""); // OTP is sensitive/short-lived, maybe don't persist or persist implies validity check needed. Let's persist for UX.
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    // Update storage when state changes
    const updateStep = (newStep: number) => {
        setStep(newStep);
        sessionStorage.setItem("fp_step", newStep.toString());
    };

    const updateEmail = (newEmail: string) => {
        setEmail(newEmail);
        sessionStorage.setItem("fp_email", newEmail);
    };

    const navigate = useNavigate();

    // Clear storage on successful completion or unmount(optional, but maybe better to keep until success)

    const forgotPasswordMutation = useMutation({
        mutationFn: async () => {
            return await forgotPasswordApi(email);
        },
        onSuccess: () => {
            toast.success("OTP sent to your email");
            updateStep(2);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        }
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            return await verifyOtpApi(email, otp);
        },
        onSuccess: () => {
             toast.success("OTP verified");
             updateStep(3);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Invalid OTP");
        }
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async () => {
            return await resetPasswordApi(email, otp, newPassword);
        },
        onSuccess: () => {
            toast.success("Password reset successful");
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
                toast.error("Please enter a valid OTP");
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

    return (
        <div className="min-h-screen w-full bg-[#030303] text-white flex flex-col font-sans selection:bg-purple-500/30">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col pt-20 items-center justify-center relative overflow-hidden">
                
                 {/* Background Glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 lg:p-10 shadow-2xl relative z-10">
                    <h1 className="text-3xl font-bold mb-2 text-center">Forgot Password</h1>
                    <p className="text-gray-400 text-sm mb-8 font-medium text-center">
                        {step === 1 && "Enter your email to receive an OTP"}
                        {step === 2 && "Enter the OTP sent to your email"}
                        {step === 3 && "Enter your new password"}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-500 ml-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => updateEmail(e.target.value)}
                                    placeholder="johndoe@example.com"
                                    required
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-700"
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-500 ml-1">OTP</label>
                                <input
                                    type="number"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    required
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-700"
                                />
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-500 ml-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
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
                                <div className="mt-2 space-y-1">
                                    <p className="text-[10px] text-gray-500">• Must be at least 6 characters</p>
                                    <p className="text-[10px] text-gray-500">• Must contain a letter</p>
                                    <p className="text-[10px] text-gray-500">• Must contain a number</p>
                                    <p className="text-[10px] text-gray-500">• Must contain a special character</p>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={forgotPasswordMutation.isPending || verifyOtpMutation.isPending || resetPasswordMutation.isPending}
                            className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {step === 1 && (forgotPasswordMutation.isPending ? "Sending..." : "Send OTP")}
                            {step === 2 && (verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP")}
                            {step === 3 && (resetPasswordMutation.isPending ? "Resetting..." : "Reset Password")}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <a href="/login" className="text-sm text-gray-500 hover:text-white transition-colors font-medium">Back to Login</a>
                    </div>

                </div>
            </div>
             <AuthFooter />
        </div>
    )
}

export default ForgotPassword;