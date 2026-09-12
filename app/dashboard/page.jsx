'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import XPBar from '@/components/XPBar'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function DashboardPage() {
  const { character, attributes, loading, updateStreak, supabase, user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    if (character) updateStreak()
  }, [character?.id])

  useEffect(() => {
    if (!user) return
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', false)
          .order('created_at', { ascending: false })
          .limit(3)
        if (error) throw error
        setTasks(data || [])
      } catch (e) {
        setFetchError('Failed to load missions. Check your connection.')
      } finally {
        setTasksLoading(false)
      }
    }
    fetchTasks()
  }, [user, supabase])

  const streakActive = character?.streak_count > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#170f27]">
        <Navbar />
        <main className="pt-20">
          <LoadingSkeleton type="page" count={4} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#170f27]">
      <Navbar />
      <main className="w-full pt-20 min-h-[calc(100vh-80px)]">
        <div className="flex flex-col w-full px-4 sm:px-8 max-w-7xl mx-auto pb-16">

          {/* Boss spawn alert */}
          <div className="w-full flex justify-end mt-4 mb-2">
            <Link
              href="/boss"
              className="group inline-flex items-center gap-2 bg-[#ff45a3] text-[#570032] font-black text-[14px] uppercase px-4 py-2 rounded-2xl border-[3px] border-[#120a21] shadow-[0_5px_0_#120a21] -rotate-2 hover:rotate-0 hover:-translate-y-1 hover:shadow-[0_8px_0_#120a21] transition-all duration-150"
              style={{ fontFamily: 'Rubik' }}
            >
              <span className="inline-block animate-bounce text-lg">⚠️</span>
              <span>BOSS SPAWNED: GLITCH-O-MATIC 9000</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">bolt</span>
            </Link>
          </div>

          {/* Hero grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mt-2">
            {/* Mascot Stage */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[420px] select-none py-6">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                <div className="w-72 h-72 rounded-full border-[6px] border-[#00e3fd]/30 border-dashed animate-spin" style={{ animationDuration: '25s' }} />
                <div className="absolute w-52 h-52 rounded-full border-[4px] border-[#ffb0cd]/20" />
              </div>

              <div className="relative z-10 flex flex-col items-center">
                {/* Level badge */}
                <motion.div
                  animate={{ rotate: [8, 12, 8] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="absolute -top-3 -right-4 sm:-right-8 z-20 bg-[#ffba20] text-[#271900] font-black text-[28px] px-4 py-1.5 rounded-2xl border-4 border-[#120a21] shadow-[0_6px_0_#120a21]"
                  style={{ fontFamily: 'Rubik' }}
                >
                  <div className="flex items-center gap-1 leading-none">
                    <span className="text-[10px] uppercase tracking-wider text-[#271900]">LVL</span>
                    <span>{character?.level ?? 1}</span>
                  </div>
                </motion.div>

                {/* Mascot */}
                <div className={streakActive ? 'mascot-idle-float' : 'mascot-sad'}>
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6SvUhD_8Fs7XGRXdREDdQl9Wh9lfOi_HBcRcbBmN-j0sepduymAE6QDLaR6sUldrttpzQAjiKs5fSQokLhHk4LjdLRUFPdEQzZp71AzKqleQwDtmF17VyZfGBCcW_yub7hGXdntgm1YNdl4JQP2dzgplT1HFuPLV2TN0PuvNWChsn4Ni0IDBZokxXjeJ4HdZzcVghkkW4Kp8qgCmqGNBCiLKeA-AU5qamaBVCYrCnRY_V6gvP7SWt7Q"
                    alt="Cyber Runner Mascot"
                    className="w-64 sm:w-80 max-h-[360px] object-contain drop-shadow-[0_12px_0_rgba(18,10,33,0.9)]"
                  />
                </div>

                {/* Neon platform */}
                <div className="relative -mt-4 w-60 sm:w-72 h-12 bg-[#2e263f] rounded-[100%] border-4 border-[#120a21] shadow-[0_8px_0_#120a21] flex items-center justify-center overflow-hidden">
                  <div className="w-44 h-5 bg-[#00e3fd] rounded-full blur-[2px] opacity-80 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Stats + XP */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              {/* User callout */}
              <div className="flex items-center justify-between bg-[#231b34] border-[3px] border-[#120a21] p-4 rounded-2xl shadow-[0_4px_0_#120a21]">
                <div>
                  <span className="font-black text-[10px] uppercase tracking-widest text-[#ffb0cd] block" style={{ fontFamily: 'Rubik' }}>Active Cadet</span>
                  <h2 className="font-black text-[22px] text-[#eaddff] uppercase tracking-wide" style={{ fontFamily: 'Rubik' }}>
                    {character?.name ?? 'RUNNER'} <span className="text-[#00e3fd]">// LVL {character?.level ?? 1}</span>
                  </h2>
                </div>
                <div className="bg-[#120a21] px-3 py-1 rounded-xl border-2 border-[#2e263f] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00e3fd] animate-ping" />
                  <span className="font-black text-[12px] uppercase text-[#00e3fd]" style={{ fontFamily: 'Rubik' }}>ONLINE</span>
                </div>
              </div>

              <XPBar />

              {/* Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Streak */}
                <div className="bg-[#231b34] border-[3px] border-[#120a21] p-3 rounded-2xl shadow-[0_4px_0_#120a21] flex flex-col justify-between">
                  <span className="font-black text-[10px] uppercase text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>Daily Streak</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl">{streakActive ? '🔥' : '💀'}</span>
                    <span className="font-black text-[20px] text-[#ffba20]" style={{ fontFamily: 'Rubik' }}>{character?.streak_count ?? 0} DAYS</span>
                  </div>
                  <span className="font-black text-[10px] text-[#ffb0cd] uppercase mt-1" style={{ fontFamily: 'Rubik' }}>
                    {(character?.streak_count ?? 0) >= 7 ? '2x XP Multiplier!' : 'Keep Going!'}
                  </span>
                </div>

                {/* Attributes preview */}
                <div className="bg-[#231b34] border-[3px] border-[#120a21] p-3 rounded-2xl shadow-[0_4px_0_#120a21] flex flex-col justify-between">
                  <span className="font-black text-[10px] uppercase text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>Top Attribute</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[#00e3fd] text-[20px]">psychology</span>
                    <span className="font-black text-[16px] text-[#eaddff] uppercase truncate" style={{ fontFamily: 'Rubik' }}>
                      {attributes.length > 0
                        ? attributes.sort((a, b) => b.value - a.value)[0]?.name
                        : 'NONE YET'}
                    </span>
                  </div>
                  <span className="font-black text-[10px] text-[#bdf4ff] uppercase mt-1" style={{ fontFamily: 'Rubik' }}>
                    LVL {attributes.length > 0 ? attributes.sort((a, b) => b.value - a.value)[0]?.value : 0}
                  </span>
                </div>

                {/* Coins */}
                <div className="bg-[#231b34] border-[3px] border-[#120a21] p-3 rounded-2xl shadow-[0_4px_0_#120a21] flex flex-col justify-between">
                  <span className="font-black text-[10px] uppercase text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>Stash Balance</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[#ffba20] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                    <span className="font-black text-[18px] text-[#ffba20]" style={{ fontFamily: 'Rubik' }}>{(character?.coins ?? 0).toLocaleString()}</span>
                  </div>
                  <span className="font-black text-[10px] text-[#e1bdc8] uppercase mt-1" style={{ fontFamily: 'Rubik' }}>NEON COINS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lower section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Today's missions preview */}
            <div className="lg:col-span-8 bg-[#2e263f] border-4 border-[#120a21] p-6 rounded-3xl shadow-[0_6px_0_#120a21] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#39304a]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffdea8] text-[#271900] flex items-center justify-center border-2 border-[#120a21] shadow-[0_3px_0_#120a21]">
                    <span className="material-symbols-outlined font-black">assignment</span>
                  </div>
                  <div>
                    <h3 className="font-black text-[20px] uppercase text-[#eaddff]" style={{ fontFamily: 'Rubik' }}>Today's Missions</h3>
                    <span className="font-black text-[10px] uppercase text-[#00e3fd]" style={{ fontFamily: 'Rubik' }}>DAILY PROTOCOLS</span>
                  </div>
                </div>
              </div>

              {/* Error */}
              {fetchError && (
                <div className="p-4 rounded-xl bg-[#93000a] border-[3px] border-[#120a21] text-[#ffb4ab] font-bold text-[13px] flex items-center gap-2" style={{ fontFamily: 'Rubik' }}>
                  <span className="material-symbols-outlined">wifi_off</span>
                  {fetchError}
                  <button onClick={() => { setFetchError(null); setTasksLoading(true) }} className="ml-auto underline">Retry</button>
                </div>
              )}

              {tasksLoading ? (
                <LoadingSkeleton type="task" count={3} />
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-[#e1bdc8] font-bold text-[14px]" style={{ fontFamily: 'Rubik' }}>
                  <span className="text-4xl block mb-2">🎮</span>
                  No active missions! Head to <Link href="/missions" className="text-[#ff45a3] underline">Missions</Link> to add some.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {tasks.map(task => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3.5 bg-[#231b34] rounded-2xl border-[3px] border-[#120a21] shadow-[0_3px_0_#120a21]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#120a21] text-[#ffba20] border-2 border-[#ffba20] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px]">radio_button_unchecked</span>
                        </div>
                        <div>
                          <p className="font-bold text-[16px] text-[#eaddff]" style={{ fontFamily: 'Rubik' }}>{task.title}</p>
                          <span className="font-black text-[10px] uppercase text-[#ffba20]" style={{ fontFamily: 'Rubik' }}>+{task.xp_reward} XP REWARD</span>
                        </div>
                      </div>
                      <Link href="/missions" className="bg-[#ff45a3] text-[#570032] font-black text-[12px] px-3.5 py-1.5 rounded-xl border-2 border-[#120a21] shadow-[0_3px_0_#120a21] uppercase hover:-translate-y-0.5 transition-transform" style={{ fontFamily: 'Rubik' }}>
                        GO
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              <Link href="/missions" className="w-full inline-flex items-center justify-center gap-2 bg-[#00e3fd] text-[#00363d] font-black text-[14px] uppercase py-3 rounded-2xl border-[3px] border-[#120a21] shadow-[0_5px_0_#120a21] hover:-translate-y-1 hover:shadow-[0_7px_0_#120a21] transition-all" style={{ fontFamily: 'Rubik' }}>
                <span>VIEW ALL MISSIONS</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            {/* Attributes sidebar */}
            <div className="lg:col-span-4 bg-[#231b34] border-4 border-[#120a21] p-6 rounded-3xl shadow-[0_6px_0_#120a21] flex flex-col gap-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-[10px] uppercase tracking-wider text-[#ffb0cd]" style={{ fontFamily: 'Rubik' }}>RUNNER ATTRIBUTES</span>
                <span className="material-symbols-outlined text-[#ffb0cd]">psychology_alt</span>
              </div>
              {attributes.map(attr => (
                <div key={attr.id}>
                  <div className="flex justify-between font-black text-[10px] text-[#e1bdc8] uppercase mb-1" style={{ fontFamily: 'Rubik' }}>
                    <span>{attr.name}</span>
                    <span className="text-[#00e3fd]">{attr.value}</span>
                  </div>
                  <div className="w-full h-3 bg-[#120a21] rounded-full border-2 border-[#120a21] overflow-hidden">
                    <motion.div
                      className="h-full bg-[#00e3fd] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, attr.value * 5)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
              <Link href="/shop" className="w-full text-center bg-[#2e263f] text-[#eaddff] font-black text-[12px] uppercase py-2.5 rounded-xl border-2 border-[#120a21] shadow-[0_3px_0_#120a21] hover:bg-[#3e354f] transition-all mt-2" style={{ fontFamily: 'Rubik' }}>
                MANAGE INVENTORY
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
