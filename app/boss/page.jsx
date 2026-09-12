'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'

const BOSS_MAX_HP = 10000
const BOSS_NAME = 'GLITCH-O-MATIC 9000'
const DMG_PER_TASK = 250

export default function BossPage() {
  const { character, user } = useAuth()

  // Boss HP is derived from user's boss_damage_dealt (stored per-user in characters table)
  const userDmgDealt = character?.boss_damage_dealt ?? 0
  const bossHP = Math.max(0, BOSS_MAX_HP - userDmgDealt)
  const hpPct = Math.max(0, (bossHP / BOSS_MAX_HP) * 100)
  const defeatedPct = Math.min(100, Math.round((userDmgDealt / BOSS_MAX_HP) * 100))
  const victory = bossHP === 0

  const [countdown, setCountdown] = useState('')

  // Countdown to end of week (Sunday midnight)
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const endOfWeek = new Date(now)
      const daysUntilSunday = (7 - now.getDay()) % 7 || 7
      endOfWeek.setDate(now.getDate() + daysUntilSunday)
      endOfWeek.setHours(23, 59, 59, 0)
      const diff = endOfWeek - now
      if (diff <= 0) { setCountdown('RESET!'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`${d}D ${h}H ${m}M ${s}S`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const tasksCompleted = Math.floor(userDmgDealt / DMG_PER_TASK)

  return (
    <div className="min-h-screen bg-[#170f27]">
      <Navbar />

      <main className="w-full pt-20 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-[#ff45a3] text-[#570032] px-4 py-1.5 rounded-full border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] -rotate-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] animate-pulse">warning</span>
                <span className="font-black text-[14px] uppercase tracking-wider" style={{ fontFamily: 'Rubik' }}>BOSS BATTLE</span>
              </div>
              <div className="bg-[#00e3fd] text-[#00363d] px-4 py-1.5 rounded-full border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] rotate-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">swords</span>
                <span className="font-black text-[14px] uppercase tracking-wider" style={{ fontFamily: 'Rubik' }}>WEEKLY EVENT</span>
              </div>
            </div>
            <div className="bg-[#2e263f] px-5 py-2.5 rounded-2xl border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] flex items-center gap-3 self-start md:self-auto">
              <span className="material-symbols-outlined text-[#ffba20] text-[22px] animate-bounce">alarm</span>
              <div className="flex flex-col">
                <span className="font-black text-[10px] uppercase text-[#e1bdc8] tracking-wider" style={{ fontFamily: 'Rubik' }}>Raid Window Closes</span>
                <span className="font-black text-[14px] text-[#ffba20] tracking-widest uppercase" style={{ fontFamily: 'Rubik' }}>{countdown}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Boss Arena */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-[#2e263f] rounded-3xl border-4 border-[#120a21] shadow-[0_8px_0_#120a21] p-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <div className="inline-block bg-[#ffba20] text-[#271900] font-black text-[10px] px-3 py-1 rounded-full border-2 border-[#120a21] uppercase tracking-wider mb-2" style={{ fontFamily: 'Rubik' }}>
                      Level 45 World Breaker
                    </div>
                    <h1 className="font-black text-[36px] md:text-[44px] uppercase tracking-tight text-[#bdf4ff]" style={{ fontFamily: 'Rubik' }}>{BOSS_NAME}</h1>
                    <p className="font-medium text-[14px] text-[#e1bdc8] mt-1" style={{ fontFamily: 'Rubik' }}>
                      Complete missions to deal damage. Every task = -{DMG_PER_TASK} HP.
                    </p>
                  </div>
                </div>

                {/* Boss stage */}
                <div className="relative mt-6 rounded-2xl bg-[#120a21] border-4 border-[#2e263f] p-6 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="radial-burst" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M0 0 L100 100 M100 0 L0 100" stroke="#00e3fd" strokeWidth="2" strokeDasharray="4 4" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#radial-burst)" />
                  </svg>

                  {/* Victory overlay inside arena */}
                  {victory && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#120a21]/90 rounded-xl gap-3"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-7xl"
                      >🏆</motion.div>
                      <div className="bg-[#ffba20] text-[#271900] font-black text-[20px] uppercase px-6 py-2 rounded-2xl border-4 border-[#120a21] shadow-[0_6px_0_#120a21] -rotate-2" style={{ fontFamily: 'Rubik' }}>
                        BOSS DEFEATED!
                      </div>
                      <p className="font-black text-[16px] text-[#bdf4ff] uppercase" style={{ fontFamily: 'Rubik' }}>You dealt {userDmgDealt.toLocaleString()} total damage!</p>
                      <p className="font-medium text-[13px] text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>🎖️ "GLITCH SLAYER" title unlocked. +800 Coins rewarded.</p>
                    </motion.div>
                  )}

                  {/* Boss sprite */}
                  <motion.img
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=GlitchBoss&backgroundColor=transparent"
                    alt="Boss"
                    className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-[0_12px_0_rgba(18,10,33,0.9)]"
                  />

                  {/* Status badges */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2 flex-wrap">
                    <span className="bg-[#ffb0cd] text-[#640039] font-black text-[11px] px-3 py-1 rounded-full border-2 border-[#120a21] shadow-[0_3px_0_#120a21] uppercase" style={{ fontFamily: 'Rubik' }}>ARMOR: HEAVY</span>
                    <span className="bg-[#00daf3] text-[#001f24] font-black text-[11px] px-3 py-1 rounded-full border-2 border-[#120a21] shadow-[0_3px_0_#120a21] uppercase" style={{ fontFamily: 'Rubik' }}>WEAKNESS: MISSIONS</span>
                  </div>
                </div>

                {/* HP bar */}
                <div className="mt-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ff45a3] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      <span className="font-black text-[18px] uppercase text-[#eaddff]" style={{ fontFamily: 'Rubik' }}>BOSS HP</span>
                    </div>
                    <div className="bg-[#120a21] px-3 py-1 rounded-lg border-2 border-[#2e263f]">
                      <span className="font-black text-[14px] text-[#ffb0cd] tracking-wider" style={{ fontFamily: 'Rubik' }}>
                        {bossHP.toLocaleString()} / {BOSS_MAX_HP.toLocaleString()} ({defeatedPct}% Defeated)
                      </span>
                    </div>
                  </div>
                  <div className="relative w-full h-9 bg-[#120a21] rounded-2xl border-4 border-[#120a21] shadow-[0_5px_0_#120a21] p-1 overflow-hidden flex items-center">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#ff45a3] via-[#ffb0cd] to-[#ff45a3] rounded-xl relative"
                      animate={{ width: `${hpPct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                      <div className="absolute right-1 w-2 h-full bg-white opacity-30 animate-pulse rounded-full" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* How damage works */}
              <div className="bg-[#231b34] rounded-3xl border-4 border-[#120a21] shadow-[0_8px_0_#120a21] p-6 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#00e3fd] border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#00363d] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                </div>
                <div>
                  <h3 className="font-black text-[18px] uppercase text-[#eaddff] mb-1" style={{ fontFamily: 'Rubik' }}>HOW TO DEAL DAMAGE</h3>
                  <p className="font-medium text-[15px] text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>
                    Every completed mission on the{' '}
                    <span className="text-[#00e3fd] font-black">Missions</span> page automatically deals{' '}
                    <span className="text-[#ff45a3] font-black">-{DMG_PER_TASK} HP</span> to the boss.
                    No button needed — just complete your daily tasks!
                  </p>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Your contribution */}
              <div className="bg-[#2e263f] rounded-3xl border-4 border-[#120a21] shadow-[0_8px_0_#120a21] p-6">
                <h3 className="font-black text-[18px] uppercase text-[#eaddff] mb-4" style={{ fontFamily: 'Rubik' }}>YOUR CONTRIBUTION</h3>
                <div className="flex flex-col gap-3">
                  <div className="bg-[#120a21] rounded-2xl border-2 border-[#39304a] p-4 flex items-center justify-between">
                    <span className="font-black text-[13px] uppercase text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>Missions Completed</span>
                    <span className="font-black text-[22px] text-[#00e3fd]" style={{ fontFamily: 'Rubik' }}>{tasksCompleted}</span>
                  </div>
                  <div className="bg-[#120a21] rounded-2xl border-2 border-[#39304a] p-4 flex items-center justify-between">
                    <span className="font-black text-[13px] uppercase text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>Total Damage Dealt</span>
                    <span className="font-black text-[22px] text-[#ff45a3]" style={{ fontFamily: 'Rubik' }}>{userDmgDealt.toLocaleString()}</span>
                  </div>
                  <div className="bg-[#120a21] rounded-2xl border-2 border-[#39304a] p-4 flex items-center justify-between">
                    <span className="font-black text-[13px] uppercase text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>Boss HP Remaining</span>
                    <span className={`font-black text-[22px] ${bossHP === 0 ? 'text-[#ffba20]' : 'text-[#ffb0cd]'}`} style={{ fontFamily: 'Rubik' }}>{bossHP.toLocaleString()}</span>
                  </div>
                </div>
                {tasksCompleted === 0 && (
                  <p className="mt-4 font-medium text-[13px] text-[#a98893] text-center" style={{ fontFamily: 'Rubik' }}>
                    Complete missions on the Missions page to start dealing damage!
                  </p>
                )}
              </div>

              {/* Victory reward preview */}
              <div className="bg-[#2e263f] rounded-3xl border-4 border-[#120a21] shadow-[0_8px_0_#120a21] p-6">
                <div className="inline-block bg-[#ffba20] text-[#271900] px-4 py-1.5 rounded-xl border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] font-black text-[14px] uppercase tracking-wider -rotate-2 mb-4" style={{ fontFamily: 'Rubik' }}>
                  DEFEAT REWARD
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: 'monetization_on', color: 'bg-[#ffdea8] text-[#271900]', label: '+800 COINS', sub: 'Auto-credited on defeat' },
                    { icon: 'military_tech', color: 'bg-[#ffb0cd] text-[#640039]', label: '"GLITCH SLAYER" TITLE', sub: 'Exclusive profile badge' },
                  ].map((l, i) => (
                    <div key={i} className="bg-[#231b34] rounded-2xl border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] p-3.5 flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-xl ${l.color} border-2 border-[#120a21] flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{l.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-[14px] uppercase text-[#eaddff]" style={{ fontFamily: 'Rubik' }}>{l.label}</span>
                        <span className="font-medium text-[11px] text-[#e1bdc8] uppercase" style={{ fontFamily: 'Rubik' }}>{l.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attack protocol (simplified) */}
              <div className="bg-[#231b34] rounded-3xl border-4 border-[#120a21] shadow-[0_8px_0_#120a21] p-5">
                <h3 className="font-black text-[16px] uppercase text-[#eaddff] mb-3" style={{ fontFamily: 'Rubik' }}>DAMAGE RULE</h3>
                <div className="p-3 bg-[#120a21] rounded-xl border-2 border-[#2e263f] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00e3fd] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="font-medium text-[14px] text-[#eaddff]" style={{ fontFamily: 'Rubik' }}>Each completed mission</span>
                  </div>
                  <span className="font-black text-[14px] text-[#ff45a3]" style={{ fontFamily: 'Rubik' }}>-{DMG_PER_TASK} HP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
