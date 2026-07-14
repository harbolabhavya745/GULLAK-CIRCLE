import { supabase } from '../lib/supabase'
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Coins, 
  Fingerprint, 
  ArrowRight, 
  Lock, 
  Mail, 
  Sparkles, 
  Check, 
  Eye, 
  EyeOff,
  Info,
  Chrome
} from "lucide-react";

interface LoginPageProps {
  onLaunch: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLaunch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fullName, setFullName] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<"google" | null>(null)

  const resetFormState = () => {
    setError("")
    setPassword("")
  }

  const toggleMode = () => {
    setIsSignup((prev) => !prev)
    resetFormState()
    setNeedsEmailConfirm(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!email) {
    setError("Please enter your registered email")
    return
  }
  setError("")
  setIsLoading(true)

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    setError(error.message)
    setIsLoading(false)
  } else {
    setIsSuccess(true)
    setTimeout(() => onLaunch(), 800)
  }
}
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!fullName.trim()) {
    setError("Please enter your name")
    return
  }
  if (password.length < 6) {
    setError("Password must be at least 6 characters")
    return
  }
  setError("")
  setIsLoading(true)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: fullName } }
  })

  if (error) {
    setError(error.message)
    setIsLoading(false)
  } else if (!data.session) {
    // Email confirmation is required before a session exists
    setIsLoading(false)
    setNeedsEmailConfirm(true)
  } else {
    setIsSuccess(true)
    setTimeout(() => onLaunch(), 800)
  }
}

const handleOAuthLogin = async (provider: "google") => {
  setError("")
  setOauthLoading(provider)
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin }
  })
  if (error) {
    setError(error.message)
    setOauthLoading(null)
  }
  // On success, Supabase redirects the browser to the provider, so no further
  // state change is needed here.
}

  return (
    <div className="min-h-screen font-sans overflow-x-hidden bg-matte-black text-slate-100 flex flex-col justify-between relative selection:bg-gold-500/20 selection:text-gold-300">
      
      {/* Decorative Premium Lighting & Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Top Header/Bar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-gold-500/10 backdrop-blur-md bg-matte-black/60 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 flex items-center justify-center text-matte-black shadow-lg shadow-gold-500/15">
            <Coins className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gold-gradient">
              Gullak Circle
            </h1>
            <p className="text-[9px] font-mono tracking-widest text-gold-500 uppercase">Apne circle ka gullak</p>
          </div>
        </div>

      </header>

      {/* Main Content Form Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-[420px] space-y-8">
          
          {/* Welcome Intro Text */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/5 border border-gold-500/15 text-gold-500 text-[10px] font-mono uppercase tracking-wider mb-2"
            >
              <Shield className="w-3 h-3" /> Secure Vault Access
            </motion.div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
              {isSignup ? "Create Your Circle" : "Welcome Back"}
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {isSignup
                ? "Join a trust circle and start your mutual savings pool with roundup protection."
                : "Access your trust circle and mutual savings pool with decentralized guarantee."}
            </p>
          </div>

          {/* Premium Card Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 rounded-3xl bg-matte-charcoal border border-gold-500/20 shadow-2xl relative overflow-hidden group"
          >
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-gold-500/10 transition-colors" />

            <AnimatePresence mode="wait">
              {needsEmailConfirm ? (
                <motion.div
                  key="confirm-email"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 shadow-xl shadow-gold-500/10">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Confirm Your Email</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
                      We've sent a confirmation link to <span className="text-gold-500">{email}</span>. Verify it, then log in below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNeedsEmailConfirm(false);
                      setIsSignup(false);
                      resetFormState();
                    }}
                    className="px-4 py-1.5 rounded-lg border border-gold-500/10 text-gold-500 hover:text-gold-400 transition-colors text-xs font-mono uppercase"
                  >
                    Back to Login
                  </button>
                </motion.div>
              ) : isSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 shadow-xl shadow-gold-500/10">
                    <Check className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Authentication Confirmed</h3>
                    <p className="text-xs text-slate-400 mt-1">Decrypting your circular vault...</p>
                  </div>
                </motion.div>
              ) : isBiometricAuthenticating ? (
                <motion.div 
                  key="biometric"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gold-500/10 animate-ping" />
                    <div className="w-20 h-20 rounded-full bg-gold-500/10 border-2 border-gold-500/50 flex items-center justify-center text-gold-500 relative z-10">
                      <Fingerprint className="w-10 h-10 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-200">Scanning Biometrics</h3>
                    <p className="text-xs text-slate-500">Touch sensor or align with camera...</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBiometricAuthenticating(false)}
                    className="px-4 py-1.5 rounded-lg border border-gold-500/10 text-slate-500 hover:text-slate-300 transition-colors text-xs font-mono uppercase"
                  >
                    Cancel
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  onSubmit={handleLogin} 
                  className="space-y-5"
                >
                  {error && (
                    <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                      {error}
                    </div>
                  )}

                  {/* Registered Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="w-full pl-11 pr-4 py-3 bg-matte-black/50 border border-gold-500/15 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-500/50 transition-all text-sm font-sans"
                        required
                      />
                    </div>
                  </div>

                  {/* Secret Passcode / Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                        Circle Passcode
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] font-mono text-gold-500 hover:text-gold-400 font-bold uppercase transition-colors"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 bg-matte-black/50 border border-gold-500/15 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-500/50 transition-all text-sm font-sans"
                        required
                      />
                    </div>
                  </div>

                  {/* Primary Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gold-500 hover:bg-gold-400 text-matte-black font-bold rounded-2xl transition-all duration-300 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-gold-500/10 group/btn cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-matte-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Unlock Circle <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Biometric Integration Option */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gold-500/5"></div>
                    <span className="flex-shrink mx-4 text-[9px] font-mono text-slate-600 uppercase tracking-widest font-bold">Or authenticate with</span>
                    <div className="flex-grow border-t border-gold-500/5"></div>
                  </div>

                  {/* Social Auth Options */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={oauthLoading !== null}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-matte-black/50 border border-gold-500/15 text-slate-300 hover:text-gold-500 hover:border-gold-500/40 transition-all disabled:opacity-50 text-xs font-mono uppercase tracking-widest font-bold"
                  >
                    {oauthLoading === "google" ? (
                      <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Chrome className="w-4 h-4" /> Continue with Google
                      </>
                    )}
                  </button>

                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-6 border-t border-gold-500/5 text-center">
        <p className="text-[9px] font-mono text-slate-600 tracking-wider">
          © 2026 Gullak Circle. End-to-end mutual protection vaults. Securely authenticated.
        </p>
      </footer>

    </div>
  );
};
