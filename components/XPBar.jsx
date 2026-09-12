'use client'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

export default function XPBar() {
  const { character, xpToNextLevel } = useAuth()
  if (!character) return null

  const needed = xpToNextLevel(character.level)
  const pct = Math.min(100, Math.round((character.xp / needed) * 100))

  return (
    <div className="bg-[#2e263f] border-4 border-[#120a21] p-5 rounded-2xl shadow-[0_6px_0_#120a21] relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="font-black text-[14px] uppercase tracking-wider text-[#00e3fd] flex items-center gap-1.5" style={{ fontFamily: 'Rubik' }}>
          <span className="material-symbols-outlined text-[18px]">bolt</span> OVERCLOCK XP
        </span>
        <span className="font-black text-[12px] uppercase text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>
          <strong className="text-[#ffba20]">{character.xp.toLocaleString()}</strong> / {needed.toLocaleString()} XP
        </span>
      </div>

      {/* Track */}
      <div className="relative w-full h-8 bg-[#120a21] rounded-full border-[3px] border-[#120a21] overflow-visible flex items-center p-0.5">
        <motion.div
          className="h-full bg-gradient-to-r from-[#00e3fd] to-[#bdf4ff] rounded-full relative flex items-center justify-end"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          {/* Rider marker */}
          <div className="absolute -right-4 w-8 h-8 rounded-full bg-[#ffba20] border-[3px] border-[#120a21] shadow-[0_2px_0_#120a21] flex items-center justify-center -rotate-6">
            <span className="material-symbols-outlined text-[#120a21] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_motorsports</span>
          </div>
        </motion.div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[#e1bdc8] font-black text-[12px] uppercase" style={{ fontFamily: 'Rubik' }}>
        <span>{pct}% TO LEVEL {character.level + 1}</span>
        <span className="text-[#ffb0cd] flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">lock_open</span> Next Unlock: New Gear
        </span>
      </div>
    </div>
  )
}
