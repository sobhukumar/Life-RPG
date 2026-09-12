'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/missions', label: 'Tasks', icon: 'assignment' },
  { path: '/shop', label: 'Shop', icon: 'local_mall' },
  { path: '/boss', label: 'Boss Battle', icon: 'swords' },
  { path: '/profile', label: 'Profile', icon: 'person' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { character, supabase } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-[#120a21] border-b-4 border-[#2e263f] shadow-[0_6px_0_#0B0616]">
        <div className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 bg-[#2e263f] border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] px-3 py-1.5 rounded-xl hover:-translate-y-0.5 transition-transform">
              <span className="material-symbols-outlined text-[#ffb0cd] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports_esports</span>
              <span className="font-black text-lg uppercase tracking-wider text-[#ffb0cd]" style={{ fontFamily: 'Rubik' }}>Neon Drift</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2 bg-[#120a21] p-1.5 rounded-full border-[3px] border-[#2e263f]">
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.path
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-5 py-2 rounded-full font-black text-[14px] uppercase tracking-wider border-[3px] transition-all ${
                    isActive
                      ? 'bg-[#ff45a3] text-[#570032] border-[#120a21] shadow-none translate-y-0.5'
                      : 'text-[#e1bdc8] bg-[#231b34] border-[#120a21] shadow-[0_4px_0_#120a21] hover:bg-[#00e3fd] hover:text-[#00363d] hover:-translate-y-0.5'
                  }`}
                  style={{ fontFamily: 'Rubik' }}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {character && (
              <>
                <div className="hidden sm:flex items-center gap-2 bg-[#ffdea8] text-[#271900] font-black text-[14px] px-4 py-2 rounded-full border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] uppercase tracking-wider" style={{ fontFamily: 'Rubik' }}>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                  <span>{character.coins.toLocaleString()}</span>
                </div>
                <div className="relative flex items-center">
                  <div className="w-9 h-9 rounded-full bg-[#ffb0cd] flex items-center justify-center border-2 border-[#120a21] shadow-[0_3px_0_#120a21]">
                    <span className="material-symbols-outlined text-[#640039] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  </div>
                  <div className="absolute -bottom-1 -right-2 bg-[#ff45a3] text-[#570032] font-black text-[10px] px-1.5 py-0.5 rounded-full border-2 border-[#120a21] uppercase shadow-[0_2px_0_#120a21]" style={{ fontFamily: 'Rubik' }}>
                    LVL {character.level}
                  </div>
                </div>
              </>
            )}

            {/* Theme Toggle */}
            <ThemeToggleButton />

            {/* Mobile hamburger */}
            <button
              className="lg:hidden w-10 h-10 rounded-xl bg-[#231b34] border-[3px] border-[#120a21] shadow-[0_3px_0_#120a21] flex items-center justify-center text-[#eaddff]"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-0 right-0 z-40 bg-[#170f27] border-b-4 border-[#120a21] shadow-[0_8px_0_#0B0616] p-4 flex flex-col gap-2 lg:hidden"
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[14px] uppercase tracking-wider border-[3px] transition-all ${
                  pathname === link.path
                    ? 'bg-[#ff45a3] text-[#570032] border-[#120a21]'
                    : 'text-[#eaddff] bg-[#231b34] border-[#120a21] shadow-[0_3px_0_#120a21]'
                }`}
                style={{ fontFamily: 'Rubik' }}
              >
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[14px] uppercase tracking-wider border-[3px] text-[#ffb4ab] bg-[#93000a] border-[#120a21] shadow-[0_3px_0_#120a21] mt-2"
              style={{ fontFamily: 'Rubik' }}
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ThemeToggleButton() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const saved = localStorage.getItem('neon-theme') || 'dark'
    setTheme(saved)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('neon-theme', next)
    document.documentElement.setAttribute('data-theme', next)
    document.body.style.backgroundColor = next === 'light' ? '#f4f0fb' : '#170f27'
    document.body.style.color = next === 'light' ? '#1a0d2e' : '#eaddff'
  }

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 1 }}
      onClick={toggle}
      className="w-10 h-10 rounded-xl bg-[#231b34] border-[3px] border-[#120a21] shadow-[0_3px_0_#120a21] flex items-center justify-center text-[#eaddff] hover:bg-[#00e3fd] hover:text-[#00363d] transition-colors"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className="material-symbols-outlined text-[20px]">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </motion.button>
  )
}
