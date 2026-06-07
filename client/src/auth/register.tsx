import React, { useState } from 'react'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { registerApi, verifyEmailApi } from '../api/api'

const registerSchema = z.object({
    fullName: z.string().min(2, "Full Name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

const Register = () => {
    const [fullName, setFullName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showOTP, setShowOTP] = useState(false)
    const [otp, setOtp] = useState("")

    const navigate = useNavigate()

    const registerMutation = useMutation({
        mutationFn: async () => {
            return await registerApi(fullName, email, username, password);
        },
        onSuccess: () => {
            toast.success("Verification code sent to your email!");
            setShowOTP(true);
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
            navigate("/login");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Invalid or expired OTP. Please try again.");
            console.error("Verification failed:", error);
        }
    });

    const handleSendOTP = (e?: React.MouseEvent | React.FormEvent) => {
        if (e) e.preventDefault();

        // Safe parse to prevent uncaught validation exceptions from crashing UI
        const result = registerSchema.safeParse({
            fullName,
            username,
            email,
            password,
            confirmPassword
        });

        if (!result.success) {
            const firstError = result.error.issues[0];
            toast.error(firstError.message);
            return;
        }

        registerMutation.mutate();
    };

    const handleRegister = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!otp) {
            toast.error("Please enter the OTP sent to your email");
            return;
        }

        verifyMutation.mutate();
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!showOTP) {
            handleSendOTP();
        } else {
            handleRegister();
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#030303] text-white flex items-center justify-center p-4 md:p-8 font-sans selection:bg-purple-500/30 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="register-container">
                {/* Left Side: Logo/Video (Hidden on Mobile) */}
                <div className="logo-section hidden md:flex">
                    <div className="logo-wrapper mb-6">
                        <img src="/onlyLogo.png" alt="Logo" className="register-logo" />
                    </div>
                    <h2 className="logo-tagline mb-6">Connect with friends and the world around you.</h2>
                    <div className="video-wrapper">
                        <video 
                            src="/Login.webm" 
                            className="register-video" 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                        />
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="form-section">
                    <h1 className="register-title">Create Account</h1>
                    <p className="register-subtitle">Get started with your free account</p>

                    <form onSubmit={handleSubmit} className="register-form">
                        {/* Full Name */}
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input 
                                type="text" 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)} 
                                placeholder="John Doe" 
                                required 
                                disabled={registerMutation.isPending || verifyMutation.isPending}
                                className="form-input"
                            />
                        </div>

                        {/* Username */}
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                placeholder="johndoe" 
                                required 
                                disabled={registerMutation.isPending || verifyMutation.isPending}
                                className="form-input"
                            />
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="john@example.com" 
                                required 
                                disabled={registerMutation.isPending || verifyMutation.isPending}
                                className="form-input"
                            />
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="••••••••" 
                                required 
                                disabled={registerMutation.isPending || verifyMutation.isPending}
                                className="form-input"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                placeholder="••••••••" 
                                required 
                                disabled={registerMutation.isPending || verifyMutation.isPending}
                                className="form-input"
                            />
                        </div>

                        {/* OTP Input Section (Animated/Shown only when showOTP is true) */}
                        <div className={`otp-container ${showOTP ? 'show' : ''}`}>
                            <div className="form-group pt-2">
                                <label className="form-label text-purple-400 font-bold">Enter Verification Code</label>
                                <input 
                                    type="text" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)} 
                                    placeholder="123456" 
                                    required={showOTP}
                                    disabled={verifyMutation.isPending}
                                    className="form-input border-purple-500/50 focus:border-purple-500"
                                />
                            </div>
                        </div>

                        {/* Submit & Secondary Buttons */}
                        {!showOTP ? (
                            <button 
                                type="submit" 
                                disabled={registerMutation.isPending}
                                className="btn btn-primary w-full"
                            >
                                {registerMutation.isPending ? "Sending OTP..." : "Send Verification Code"}
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button 
                                    type="submit" 
                                    disabled={verifyMutation.isPending}
                                    className="btn btn-primary w-full"
                                >
                                    {verifyMutation.isPending ? "Verifying..." : "Verify & Register"}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => registerMutation.mutate()} 
                                    disabled={registerMutation.isPending}
                                    className="btn btn-secondary text-center text-xs py-2 w-full"
                                >
                                    {registerMutation.isPending ? "Resending..." : "Resend Verification Code"}
                                </button>
                            </div>
                        )}

                        <p className="auth-link">
                            Already have an account? <a href="/login">Sign In</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register