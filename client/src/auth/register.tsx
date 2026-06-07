import React from 'react'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import logo from '../../public/logo.png'
import { useState } from 'react'
import toast from 'react-hot-toast'


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

    const handleSendOTP = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!email) {
            alert("Please enter an email address")
            return
        } 
        try {
            registerSchema.parse({ email })
        } catch (error) {
            toast(error)
            return
        }

        setShowOTP(true)
        console.log("Sending OTP...")
    }

    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log("Registering...")
    }

  return (
    <div className='flex gap-4'> 
      <h1>Register</h1>
      <div className='flex flex-col gap-4'>
        <img src={logo} alt="Logo" />
      </div>
      <form className='flex flex-col gap-4' onSubmit={handleRegister}>
        <label htmlFor="name">Full Name</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />

        <label htmlFor="username">Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />

        <label htmlFor="email">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />

        <button onClick={handleSendOTP}>Send OTP</button>

        <label htmlFor="otp">OTP</label>
        <input className={showOTP ? 'block' : 'hidden'} value={otp} onChange={(e) => setOtp(e.target.value)} type="text" placeholder="OTP" />

        <label htmlFor="password">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

        <label htmlFor="confirm-password">Confirm Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />

        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default Register