'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'

// Spawn confetti particles using canvas-confetti
function fireConfetti() {
  if (typeof window === 'undefined') return
  import('canvas-confetti').then(({ default: confetti }) => {
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 }, colors: ['#ff45a3', '#00e3fd', '#ffba20', '#ffb0cd', '#bdf4ff'] })
    setTimeout(() => confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 }, angle: 60, colors: ['#ff45a3', '#ffba20'] }), 200)
    setTimeout(() => confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 }, angle: 120, colors: ['#00e3fd', '#ffb0cd'] }), 400)
  })
}

export default function LevelUpModal({ isOpen, newLevel, onClose }) {
  useEffect(() => {
    if (isOpen) fireConfetti()
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#120a21]/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.4, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="relative bg-[#231b34] rounded-3xl border-4 border-[#120a21] shadow-[0_12px_0_#0B0616] p-8 flex flex-col items-center text-center max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Top ribbon */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="absolute -top-6 bg-[#ffba20] text-[#271900] font-black text-[14px] uppercase px-6 py-2 rounded-xl border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] -rotate-2"
              style={{ fontFamily: 'Rubik' }}
            >
              ⚡ LEVEL UP! ⚡
            </motion.div>

            {/* Big level badge */}
            <motion.div
              animate={{ scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="mt-4 w-36 h-36 rounded-full bg-[#ff45a3] border-4 border-[#120a21] shadow-[0_8px_0_#0B0616] flex flex-col items-center justify-center"
            >
              <span className="font-black text-[12px] uppercase text-[#570032]" style={{ fontFamily: 'Rubik' }}>LEVEL</span>
              <span className="font-black text-[56px] leading-none text-[#570032]" style={{ fontFamily: 'Rubik' }}>{newLevel}</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-5 font-black text-[28px] uppercase tracking-wide text-[#eaddff]"
              style={{ fontFamily: 'Rubik' }}
            >
              Rank Upgraded!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="font-medium text-[14px] text-[#e1bdc8] mt-2 max-w-xs"
              style={{ fontFamily: 'Rubik' }}
            >
              You've crossed into Level {newLevel}! New perks and power are unlocked. Keep running the grid! 🏆
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={onClose}
              className="mt-6 w-full py-3.5 rounded-2xl bg-[#ff45a3] text-[#570032] font-black text-[14px] uppercase tracking-wider border-4 border-[#120a21] shadow-[0_6px_0_#0B0616] hover:shadow-[0_8px_0_#0B0616] active:shadow-none transition-shadow"
              style={{ fontFamily: 'Rubik' }}
            >
              BACK TO THE GRID ⚡
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
