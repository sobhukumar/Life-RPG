'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'

const ATTRIBUTE_ICONS = {
  Intellect: { icon: 'psychology', color: 'text-[#00e3fd]' },
  Strength: { icon: 'fitness_center', color: 'text-[#ff45a3]' },
  Agility: { icon: 'directions_run', color: 'text-[#ffba20]' },
  Discipline: { icon: 'military_tech', color: 'text-[#ffb0cd]' },
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, character, attributes, supabase, refreshCharacter } = useAuth()
  const [editName, setEditName] = useState(false)
  const [newName, setNewName] = useState(character?.name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [inventory, setInventory] = useState([])

  useEffect(() => {
    async function fetchInventory() {
      if (!user) return
      const { data } = await supabase.from('inventory').select('*').eq('user_id', user.id).eq('equipped', true)
      setInventory(data || [])
    }
    fetchInventory()
  }, [user, supabase])

  const getEquipped = (slot) => inventory.find(i => i.item_category === slot)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleSaveName = async () => {
    if (!newName.trim()) { setNameError('Name cannot be empty!'); return }
    setNameError('')
    setSavingName(true)
    try {
      await supabase.from('characters').update({ name: newName.trim() }).eq('id', character.id)
      refreshCharacter()
      setEditName(false)
      showToast('Runner name updated! ⚡')
    } catch {
      setNameError('Failed to save. Try again.')
    } finally {
      setSavingName(false)
    }
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const totalXP = character
    ? (character.level - 1) * 100 + character.xp  // simplified
    : 0

  return (
    <div className="min-h-screen bg-[#170f27]">
      <Navbar />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 bg-[#ffba20] text-[#271900] font-black text-[16px] px-5 py-3 rounded-2xl shadow-[0_6px_0_#120a21] border-[3px] border-[#120a21] flex items-center gap-2"
            style={{ fontFamily: 'Rubik' }}
          >
            <span className="material-symbols-outlined">check</span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full pt-20 min-h-[calc(100vh-80px)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8">
          {/* Profile hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-[#231b34] rounded-3xl border-4 border-[#120a21] shadow-[0_10px_0_#120a21] p-8 flex flex-col sm:flex-row items-center gap-8 overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#ff45a3] rounded-full opacity-10 pointer-events-none" />

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-3xl overflow-hidden bg-[#2e263f] border-4 border-[#120a21] shadow-[0_8px_0_#120a21] flex items-center justify-center">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6SvUhD_8Fs7XGRXdREDdQl9Wh9lfOi_HBcRcbBmN-j0sepduymAE6QDLaR6sUldrttpzQAjiKs5fSQokLhHk4LjdLRUFPdEQzZp71AzKqleQwDtmF17VyZfGBCcW_yub7hGXdntgm1YNdl4JQP2dzgplT1HFuPLV2TN0PuvNWChsn4Ni0IDBZokxXjeJ4HdZzcVghkkW4Kp8qgCmqGNBCiLKeA-AU5qamaBVCYrCnRY_V6gvP7SWt7Q"
                  alt="Character"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Equipped Slot Badges */}
              {[
                { slot: 'jacket', pos: 'absolute -top-3 -left-3' },
                { slot: 'visor',  pos: 'absolute -top-3 -right-3' },
                { slot: 'shoes',  pos: 'absolute -bottom-1 left-1/2 -translate-x-1/2' },
              ].map(({ slot, pos }) => {
                const item = getEquipped(slot)
                if (!item) return null
                return (
                  <motion.div
                    key={slot}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`${pos} w-10 h-10 rounded-full border-[3px] border-[#00e3fd] shadow-[0_0_8px_#00e3fd80,0_2px_0_#120a21] bg-[#120a21] overflow-hidden z-10`}
                    title={item.item_name}
                  >
                    <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                  </motion.div>
                )
              })}

              <motion.div
                animate={{ rotate: [8, 12, 8] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute bottom-6 -right-5 bg-[#ff45a3] text-[#570032] font-black text-[14px] px-3 py-1 rounded-full border-2 border-[#120a21] shadow-[0_3px_0_#120a21] uppercase z-20"
                style={{ fontFamily: 'Rubik' }}
              >
                LVL {character?.level ?? 1}
              </motion.div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-3 w-full">
              {/* Name with inline edit */}
              <div>
                <span className="font-black text-[10px] uppercase text-[#ffb0cd] tracking-widest block mb-1" style={{ fontFamily: 'Rubik' }}>RUNNER CALLSIGN</span>
                {editName ? (
                  <div className="flex gap-2 items-center flex-wrap">
                    <input
                      autoFocus
                      value={newName}
                      onChange={e => { setNewName(e.target.value); setNameError('') }}
                      className="flex-1 min-w-0 bg-[#120a21] text-[#eaddff] font-black text-[22px] uppercase px-4 py-2 rounded-xl border-[3px] border-[#00e3fd] focus:outline-none"
                      style={{ fontFamily: 'Rubik' }}
                      maxLength={24}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditName(false) }}
                    />
                    <button onClick={handleSaveName} disabled={savingName} className="bg-[#00e3fd] text-[#00363d] font-black text-[14px] uppercase px-4 py-2 rounded-xl border-[3px] border-[#120a21] shadow-[0_3px_0_#120a21] hover:-translate-y-0.5 transition-transform" style={{ fontFamily: 'Rubik' }}>
                      {savingName ? '...' : 'SAVE'}
                    </button>
                    <button onClick={() => setEditName(false)} className="bg-[#39304a] text-[#eaddff] font-black text-[14px] uppercase px-4 py-2 rounded-xl border-[3px] border-[#120a21] shadow-[0_3px_0_#120a21]" style={{ fontFamily: 'Rubik' }}>CANCEL</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="font-black text-[32px] uppercase text-[#eaddff] tracking-wide" style={{ fontFamily: 'Rubik' }}>
                      {character?.name ?? 'RUNNER'}
                    </h1>
                    <button onClick={() => { setEditName(true); setNewName(character?.name ?? '') }} className="w-9 h-9 rounded-xl bg-[#2e263f] border-2 border-[#120a21] text-[#e1bdc8] hover:bg-[#00e3fd] hover:text-[#00363d] flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                )}
                <AnimatePresence>
                  {nameError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#ffb4ab] font-bold text-[12px] mt-1" style={{ fontFamily: 'Rubik' }}>⚠ {nameError}</motion.p>
                  )}
                </AnimatePresence>
              </div>

              <p className="font-medium text-[14px] text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>{user?.email}</p>

              {/* Quick stats row */}
              <div className="flex flex-wrap gap-3 mt-1">
                {[
                  { label: 'Level', value: character?.level ?? 1, color: 'text-[#ffba20]' },
                  { label: 'Total XP', value: totalXP.toLocaleString(), color: 'text-[#00e3fd]' },
                  { label: 'Coins', value: (character?.coins ?? 0).toLocaleString(), color: 'text-[#ffba20]' },
                  { label: 'Streak', value: `${character?.streak_count ?? 0}d`, color: 'text-[#ff45a3]' },
                ].map(s => (
                  <div key={s.label} className="bg-[#120a21] px-4 py-2 rounded-xl border-2 border-[#2e263f] flex flex-col">
                    <span className="font-black text-[10px] uppercase text-[#e1bdc8] tracking-widest" style={{ fontFamily: 'Rubik' }}>{s.label}</span>
                    <span className={`font-black text-[20px] ${s.color}`} style={{ fontFamily: 'Rubik' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Attributes card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#231b34] rounded-3xl border-4 border-[#120a21] shadow-[0_8px_0_#120a21] p-6"
          >
            <h2 className="font-black text-[22px] uppercase text-[#eaddff] mb-5 flex items-center gap-2" style={{ fontFamily: 'Rubik' }}>
              <span className="material-symbols-outlined text-[#00e3fd]">psychology_alt</span>
              Runner Attributes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {attributes.map(attr => {
                const meta = ATTRIBUTE_ICONS[attr.name] || { icon: 'star', color: 'text-[#ffb0cd]' }
                return (
                  <div key={attr.id} className="bg-[#120a21] rounded-2xl border-[3px] border-[#2e263f] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`material-symbols-outlined ${meta.color} text-[22px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                      <span className="font-black text-[14px] uppercase text-[#eaddff]" style={{ fontFamily: 'Rubik' }}>{attr.name}</span>
                      <span className="ml-auto font-black text-[18px] text-[#00e3fd]" style={{ fontFamily: 'Rubik' }}>{attr.value}</span>
                    </div>
                    <div className="w-full h-3 bg-[#231b34] rounded-full border-2 border-[#39304a] overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#00e3fd] to-[#bdf4ff] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, attr.value * 5)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Danger zone — Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#231b34] rounded-3xl border-4 border-[#120a21] shadow-[0_8px_0_#120a21] p-6"
          >
            <h2 className="font-black text-[22px] uppercase text-[#ffb4ab] mb-2 flex items-center gap-2" style={{ fontFamily: 'Rubik' }}>
              <span className="material-symbols-outlined">warning</span>
              Danger Zone
            </h2>
            <p className="font-medium text-[14px] text-[#e1bdc8] mb-5" style={{ fontFamily: 'Rubik' }}>
              Logging out ends your active session. Your progress is safely stored in the cloud.
            </p>
            <motion.button
              whileHover={{ y: -2, boxShadow: '0 8px 0 #0B0616' }}
              whileTap={{ y: 4, boxShadow: '0 0 0 #0B0616' }}
              onClick={handleLogout}
              disabled={logoutLoading}
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#93000a] text-[#ffb4ab] font-black text-[14px] uppercase border-[3px] border-[#120a21] shadow-[0_6px_0_#0B0616] transition-all disabled:opacity-60"
              style={{ fontFamily: 'Rubik' }}
            >
              {logoutLoading ? (
                <span className="material-symbols-outlined animate-spin">autorenew</span>
              ) : (
                <span className="material-symbols-outlined">logout</span>
              )}
              {logoutLoading ? 'Signing Out...' : 'SIGN OUT OF NEON DRIFT'}
            </motion.button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
