'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [mascotMsg, setMascotMsg] = useState("Ready to manage your tasks?")

  const mascotBarks = [
    "Every mission gives you XP!",
    "Stay focused, earn coins!",
    "Level up your life!",
    "Don't break your streak!"
  ]

  let barkIdx = 0
  const pokeMascot = () => {
    barkIdx = (barkIdx + 1) % mascotBarks.length
    setMascotMsg(mascotBarks[barkIdx])
  }

  const handleForgotPassword = async () => {
    setError('')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Enter a valid email address to reset your password.')
      return
    }
    setLoading(true)
    try {
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${siteUrl}/login`,
      })
      if (resetErr) throw resetErr
      setForgotSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const validatePassword = (pass) => {
    const minLen = pass.length >= 8
    const hasUpper = /[A-Z]/.test(pass)
    const hasLower = /[a-z]/.test(pass)
    const hasNum = /[0-9]/.test(pass)
    const hasSpecial = /[^A-Za-z0-9]/.test(pass)
    return minLen && hasUpper && hasLower && hasNum && hasSpecial
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) { setError('Enter a valid email address.'); return }
    
    if (mode === 'signup') {
      if (!validatePassword(password)) {
        setError('Password does not meet strong password rules.')
        return
      }
    } else {
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error: signupErr } = await supabase.auth.signUp({ email, password })
        if (signupErr) throw signupErr
        // Switch to login tab with a success message
        setPassword('')
        setError('')
        setSignupSuccess(true)
        setMode('login')
      } else {
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
        if (loginErr) throw loginErr
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="w-full min-h-screen bg-[#170f27] flex items-center justify-center relative overflow-hidden select-none">
      {/* Cyberpunk cityscape BG */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen bg-cover bg-center"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBoFNimf24fqmnKUtY7-3dkJoosZ0q5hqwq5m2p9Cg4jL-F3EcK0ld7jTpPu8ueBsJPviO5AnCfQQtA-f5HwpPkizi0Z3NjBlVYqSc9LruCZRoomSmIQ6OLGSEJJI1EbtZr3wh3_i40q2qIdzRlOZl2zlXHVD2rA5e8gppciccKkI3X5smEQt6tbY2isflmNgNgRF0ovnU8-kCXijMytERXxcNKH7fMH7nBtQ0rAX-pXUbiwJldVDaVlw')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#120a21]/80 via-[#170f27]/85 to-[#120a21]/95 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-10">
        {/* Status pill */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 flex items-center gap-2 bg-[#2e263f] px-4 py-1.5 rounded-full shadow-[0_4px_0_#0B0616] -rotate-1"
        >
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#00e3fd] animate-ping" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#00e3fd] -ml-3.5" />
          <span className="font-black text-[12px] text-[#9cf0ff] tracking-wider uppercase" style={{ fontFamily: 'Rubik' }}>GRID SECTOR 09: ONLINE</span>
          <span className="bg-[#ffba20] text-[#271900] font-black text-[10px] px-1.5 py-0.5 rounded-full shadow-[0_2px_0_#0B0616]" style={{ fontFamily: 'Rubik' }}>v2.4</span>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative w-full max-w-md bg-[#231b34] rounded-[24px] shadow-[0_10px_0_#0B0616] p-6 md:p-8 flex flex-col"
        >
          {/* Season sticker */}
          <div className="absolute -top-4 -right-3 bg-[#ffba20] text-[#271900] px-4 py-1.5 rounded-xl rotate-3 shadow-[0_4px_0_#0B0616] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm font-black" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <span className="font-black text-[10px] uppercase tracking-widest" style={{ fontFamily: 'Rubik' }}>SEASON 3 LIVE</span>
          </div>

          {/* Title */}
          <div className="text-center flex flex-col items-center gap-1 mb-6">
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="text-[#00e3fd] text-2xl">★</span>
              <h1 className="font-black text-3xl md:text-4xl uppercase text-[#eaddff] tracking-tight drop-shadow-[0_2px_0_#0B0616]" style={{ fontFamily: 'Rubik' }}>
                JACK INTO <br /><span className="text-[#ff45a3]">THE DRIFT</span>
              </h1>
              <span className="text-[#00e3fd] text-2xl">★</span>
            </div>
            <p className="font-medium text-[14px] text-[#e1bdc8] max-w-xs" style={{ fontFamily: 'Rubik' }}>
              Sign in to sync your missions, vault stash, and hyper-streak.
            </p>
          </div>

          {/* Tab switch */}
          <div className="grid grid-cols-2 p-1 bg-[#120a21] rounded-xl shadow-[inset_0_2px_0_#0B0616] mb-6">
            {['login', 'signup'].map(tab => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setError(''); setSignupSuccess(false) }}
                className={`py-2 rounded-lg font-black text-[14px] transition-all duration-75 ${
                  mode === tab
                    ? 'bg-[#ff45a3] text-[#570032] shadow-[0_3px_0_#0B0616]'
                    : 'text-[#e1bdc8] hover:text-[#eaddff]'
                }`}
                style={{ fontFamily: 'Rubik' }}
              >
                {tab === 'login' ? 'LOGIN' : 'SIGN UP'}
              </button>
            ))}
          </div>

          {/* Signup Success Banner */}
          <AnimatePresence>
            {signupSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 px-4 py-3 rounded-xl bg-[#0d3b2e] border-[3px] border-[#00e3fd] text-[#00e3fd] font-bold text-[13px] flex items-start gap-2"
                style={{ fontFamily: 'Rubik' }}
              >
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">check_circle</span>
                <div>
                  <p className="font-black text-[13px]">Account created! 🎉</p>
                  <p className="font-medium text-[12px] text-[#bdf4ff] mt-0.5">Enter your password below and hit <span className="font-black">LOGIN</span> to enter.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 px-4 py-3 rounded-xl bg-[#93000a] border-[3px] border-[#120a21] text-[#ffb4ab] font-bold text-[13px] flex items-center gap-2"
                style={{ fontFamily: 'Rubik' }}
              >
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-black text-[12px] uppercase text-[#00e3fd] tracking-wider flex items-center gap-1" style={{ fontFamily: 'Rubik' }}>
                <span className="material-symbols-outlined text-sm">alternate_email</span> EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#120a21] text-[#eaddff] placeholder:text-[#a98893]/70 font-semibold text-[14px] px-4 py-3 rounded-xl shadow-[inset_0_3px_0_#0B0616] focus:outline-none focus:ring-2 focus:ring-[#00e3fd] transition-all"
                placeholder="rahul@gmail.com"
                required
                style={{ fontFamily: 'Rubik' }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="font-black text-[12px] uppercase text-[#00e3fd] tracking-wider flex items-center gap-1" style={{ fontFamily: 'Rubik' }}>
                  <span className="material-symbols-outlined text-sm">lock</span> PASSWORD
                </label>
{mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setError(''); setForgotSent(false) }}
                    className="font-black text-[10px] text-[#ffba20] hover:text-[#ff45a3] transition-colors"
                    style={{ fontFamily: 'Rubik' }}
                  >
                    FORGOT PASSWORD?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#120a21] text-[#eaddff] placeholder:text-[#a98893]/70 font-semibold text-[14px] px-4 py-3 rounded-xl shadow-[inset_0_3px_0_#0B0616] focus:outline-none focus:ring-2 focus:ring-[#00e3fd] transition-all"
                  placeholder="••••••••••••"
                  required
                  style={{ fontFamily: 'Rubik' }}
                />
                <button
                  type="button"
                  className="absolute right-3 text-[#a98893] hover:text-[#bdf4ff] transition-colors"
                  onClick={() => setShowPass(v => !v)}
                >
                  <span className="material-symbols-outlined text-lg">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {mode === 'signup' && (
                <div className="mt-1 p-3 bg-[#120a21] rounded-xl border-2 border-[#39304a]">
                  <p className="text-[10px] font-black text-[#e1bdc8] uppercase mb-2">Strong Password Rules:</p>
                  <ul className="text-[10px] font-bold text-[#a98893] grid grid-cols-2 gap-1">
                    <li className={password.length >= 8 ? "text-[#00e3fd]" : ""}>✓ Min 8 chars</li>
                    <li className={/[A-Z]/.test(password) ? "text-[#00e3fd]" : ""}>✓ Uppercase</li>
                    <li className={/[a-z]/.test(password) ? "text-[#00e3fd]" : ""}>✓ Lowercase</li>
                    <li className={/[0-9]/.test(password) ? "text-[#00e3fd]" : ""}>✓ Number</li>
                    <li className={/[^A-Za-z0-9]/.test(password) ? "text-[#00e3fd]" : ""}>✓ Special Char</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ y: -2, boxShadow: '0 8px 0 #0B0616' }}
              whileTap={{ y: 6, boxShadow: '0 0 0 #0B0616' }}
              className="relative mt-2 w-full py-3.5 px-4 rounded-2xl bg-[#ff45a3] text-[#570032] font-black text-[14px] tracking-wider uppercase shadow-[0_6px_0_#0B0616] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Rubik' }}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
              ) : (
                <>
                  <span className="w-6 h-6 rounded-full bg-[#ffba20] text-[#271900] flex items-center justify-center text-xs font-black shadow-[0_2px_0_#0B0616]">⚡</span>
                  <span>{mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}</span>
                  <span className="material-symbols-outlined text-lg font-black">arrow_forward</span>
                </>
              )}
            </motion.button>
          </form>


        </motion.div>
      </div>

      {/* Mascot corner */}
      <div className="fixed bottom-0 right-2 md:right-8 z-30 flex items-end pointer-events-auto">
        {/* Speech bubble */}
        <motion.div
          key={mascotMsg}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-24 mr-2 bg-[#39304a] px-4 py-3 rounded-2xl shadow-[0_6px_0_#0B0616] max-w-[200px] -rotate-2 hover:rotate-0 transition-transform"
        >
          <p className="font-black text-[14px] text-[#9cf0ff] leading-tight" style={{ fontFamily: 'Rubik' }}>
            {mascotMsg}
          </p>
          <div className="absolute -bottom-2.5 right-6 w-4 h-4 bg-[#39304a] rotate-45 shadow-[3px_3px_0_#0B0616]" />
        </motion.div>

        {/* Mascot sticker */}
        <motion.div
          className="relative group cursor-pointer mb-0"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={pokeMascot}
        >
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden bg-[#2e263f] shadow-[0_8px_0_#0B0616]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH12I-eC943UheK1FvlFbBhGTDMyUXu1TcUMN2NQYVtPHo6juzzqv1d1YGohU5R_GIbbLY5DRyFZlbEgoLiga3zN5xW3qdEyug77jY-cR7MiVn59ltA6zL1OP0kukAXCsGXyx850xL3JUl-xiPM2MBjfwDzEQz3-L5XTf6sw7giUgQ6EJtFHcWBkD7Ztp5RTanC-YPgpGPUF-Kx4wDpPpf2HDfi7gQZwGj74jS0x5HAs2XEZ4AFR-T2A"
              alt="Cyber runner mascot"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-2 -left-2 bg-[#ff45a3] text-[#570032] font-black text-[10px] px-2 py-0.5 rounded-full shadow-[0_2px_0_#0B0616] -rotate-[8deg]" style={{ fontFamily: 'Rubik' }}>
            TAP ME!
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#120a21]/80 backdrop-blur-sm"
            onClick={() => { setForgotMode(false); setForgotSent(false); setError('') }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="bg-[#231b34] w-full max-w-sm rounded-3xl border-4 border-[#120a21] shadow-[0_12px_0_#0B0616] p-8 relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => { setForgotMode(false); setForgotSent(false); setError('') }}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#120a21] border-2 border-[#2e263f] text-[#eaddff] hover:bg-[#93000a] hover:text-[#ffb4ab] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>

              {forgotSent ? (
                /* Success state */
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#00e3fd] border-4 border-[#120a21] shadow-[0_4px_0_#120a21] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#00363d] text-[32px] font-black">mark_email_read</span>
                  </div>
                  <h3 className="font-black text-[22px] uppercase text-[#eaddff]" style={{ fontFamily: 'Rubik' }}>
                    Reset Link Sent!
                  </h3>
                  <p className="font-medium text-[14px] text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>
                    Check <span className="text-[#00e3fd] font-black">{email}</span> for a password reset link.
                  </p>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 2 }}
                    onClick={() => { setForgotMode(false); setForgotSent(false) }}
                    className="mt-2 px-6 py-3 rounded-xl bg-[#ff45a3] text-[#570032] font-black text-[14px] uppercase border-[3px] border-[#120a21] shadow-[0_4px_0_#0B0616]"
                    style={{ fontFamily: 'Rubik' }}
                  >
                    Back to Login
                  </motion.button>
                </motion.div>
              ) : (
                /* Input state */
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#ffba20] border-[3px] border-[#120a21] shadow-[0_3px_0_#0B0616] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#271900] text-[20px]">lock_reset</span>
                    </div>
                    <h3 className="font-black text-[20px] uppercase text-[#ffb0cd]" style={{ fontFamily: 'Rubik' }}>Reset Password</h3>
                  </div>
                  <p className="font-medium text-[13px] text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>
                    Enter your email and we'll send you a reset link.
                  </p>

                  {/* Error banner */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-3 rounded-xl bg-[#93000a] border-[3px] border-[#120a21] text-[#ffb4ab] font-bold text-[13px] flex items-center gap-2"
                        style={{ fontFamily: 'Rubik' }}
                      >
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block font-black text-[11px] uppercase text-[#00e3fd] mb-2" style={{ fontFamily: 'Rubik' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      className="w-full bg-[#120a21] text-[#eaddff] placeholder:text-[#a98893]/70 font-semibold text-[14px] px-4 py-3 rounded-xl shadow-[inset_0_3px_0_#0B0616] focus:outline-none focus:ring-2 focus:ring-[#00e3fd] transition-all"
                      placeholder="runner@neondrift.city"
                      style={{ fontFamily: 'Rubik' }}
                      autoFocus
                    />
                  </div>

                  <motion.button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    whileHover={{ y: -2, boxShadow: '0 8px 0 #0B0616' }}
                    whileTap={{ y: 4, boxShadow: '0 0 0 #0B0616' }}
                    className="w-full py-3.5 rounded-2xl bg-[#ffba20] text-[#271900] font-black text-[14px] uppercase shadow-[0_6px_0_#0B0616] border-[3px] border-[#120a21] flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ fontFamily: 'Rubik' }}
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">send</span>
                        Send Reset Link
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
