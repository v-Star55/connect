import { z } from 'zod'
import { useState } from 'react'
import toast from 'react-hot-toast'
import AuthFooter from '../components/AuthFooter'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { registerApi, verifyEmailApi } from '../api/api'


const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
    password: z.string().min(6, "Password must be at least 6 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"),
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),

})

const Register = () => {
    const [fullName, setFullName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showOTP, setShowOTP] = useState(false)
    const [otp, setOtp] = useState("")
    
    const navigate = useNavigate();

    const registerMutation = useMutation({
        mutationFn: async () => {
             return await registerApi(fullName, email, username, password);
        },
        onSuccess: () => {
            toast.success("Verification code sent to your email!");
            setShowOTP(true);
        },
        onError: (error: any) => {
             toast.error(error.response?.data?.message || "Registration failed");
        }
    });

    const verifyEmailMutation = useMutation({
        mutationFn: async () => {
             return await verifyEmailApi(email, otp);
        },
        onSuccess: () => {
            toast.success("Account verified successfully!");
            navigate("/login");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Verification failed");
        }
    });

    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (showOTP) {
            // If in OTP mode, verify
            if (!otp || otp.length < 6) {
                toast.error("Please enter a valid OTP");
                return;
            }
            verifyEmailMutation.mutate();
            return;
        }

        // Validate form
        try {
            registerSchema.parse({ username, password, email });
            if (password !== confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
            if (!fullName) {
                toast.error("Please enter your full name");
                return;
            }
            registerMutation.mutate();
        } catch (error: any) {
             toast.error(error.issues?.[0]?.message || "Invalid input");
        }
    }

  return (
    <div className="min-h-screen w-full bg-[#030303] text-white flex flex-col font-sans selection:bg-purple-500/30">
      {/* Navigation Bar */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row pt-5">
        
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

            <h2 className="text-6xl font-black leading-tight mb-6">
              Stay connected<br />
              <span className="bg-linear-to-r from-green-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                stay close.
              </span>
            </h2>
            
            <p className="text-gray-400 text-lg max-w-lg mb-10 leading-relaxed font-medium">
              Join our vibrant community. Experience messaging like never before with high-speed, secure, and playful interactions.
            </p>

          </div>
           
          {/* Floating Heart Icon */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
             <svg className="w-64 h-64 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
             </svg>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 xl:p-24 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="w-full max-w-lg bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 lg:p-10 shadow-2xl relative z-10">
            <h1 className="text-3xl font-bold mb-2">{showOTP ? "Verify Email" : "Create an account"}</h1>
            <p className="text-gray-400 text-sm mb-8 font-medium">
                {showOTP ? "Enter the 6-digit code sent to your email." : "Start chatting with your friends and family in seconds."}
            </p>

            <form onSubmit={handleRegister} className="space-y-5">
              
              {!showOTP && (
                  <>
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-500 ml-1">Full Name</label>
                        <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-white transition-colors">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-700"
                        />
                        </div>
                    </div>

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
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-700"
                        />
                        </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-500 ml-1">Email Address</label>
                        <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-white transition-colors">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-700"
                        />
                        </div>
                    </div>

                    {/* Password & Confirm Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-500 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-white transition-colors">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            </div>
                            <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-700"
                            />
                        </div>
                        </div>
                        <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-500 ml-1">Confirm</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-white transition-colors">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            </div>
                            <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-700"
                            />
                        </div>
                        </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-center gap-3 px-1 py-1">
                        <input 
                        type="checkbox" 
                        id="terms" 
                        required
                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-green-500 focus:ring-offset-0 focus:ring-0 checked:bg-green-500"
                        />
                        <label htmlFor="terms" className="text-[11px] text-gray-500 font-medium cursor-pointer">
                        I agree to the <span className="text-green-500 font-bold">Terms</span> and <span className="text-green-500 font-bold">Privacy</span>
                        </label>
                    </div>
                  </>
              )}

              {/* OTP Field if shown */}
              {showOTP && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  <label className="text-xs font-black uppercase tracking-wider text-purple-400 ml-1">Verification Code</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400/50 group-focus-within:text-purple-400 transition-colors">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-digit code"
                      className="w-full bg-purple-500/5 border border-purple-500/20 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-purple-500/40 transition-all placeholder:text-purple-900/40 font-mono tracking-widest text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Sent to <span className="text-white">{email}</span>
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerMutation.isPending || verifyEmailMutation.isPending}
                className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showOTP 
                    ? (verifyEmailMutation.isPending ? "Verifying..." : "Verify & Create Account") 
                    : (registerMutation.isPending ? "Creating..." : "Create Account")
                }
              </button>

              {!showOTP && (
                  <>
                    {/* Divider */}
                    <div className="relative py-4 flex items-center">
                        <div className="grow border-t border-white/5"></div>
                        <span className="shrink mx-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Social Sign Up</span>
                        <div className="grow border-t border-white/5"></div>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex flex-1">
                        <button type="button" className="flex grow items-center justify-center gap-3 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 py-3.5 rounded-2xl transition-all font-medium text-sm">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" /> Google
                        </button>
                    </div>

                    <p className="text-center text-xs text-gray-500 font-medium pt-4">
                        Already have an account? <a href="/login" className="text-purple-500 font-bold hover:underline transition-all">Login instead</a>
                    </p>
                  </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <AuthFooter />
    </div>
  )
}

export default Register