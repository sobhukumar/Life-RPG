'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'

function TiltCard({ children, className }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d"
      }}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  // Mouse parallax for Hero
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-[#170f27] text-[#eaddff] overflow-hidden" style={{ fontFamily: 'Rubik' }}>
      
      {/* Navbar (Landing) */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#120a21]/90 backdrop-blur-md border-b-[3px] border-[#39304a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff45a3] border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#570032] font-black text-[24px]">terminal</span>
          </div>
          <span className="font-black text-[22px] tracking-widest uppercase text-[#ffb0cd]">NEON DRIFT</span>
        </div>
        <Link href="/login">
          <motion.button 
            whileHover={{ y: -2, boxShadow: '0 6px 0 #120a21' }}
            whileTap={{ y: 2, boxShadow: '0 0 0 #120a21' }}
            className="px-6 py-2.5 rounded-xl bg-[#00e3fd] text-[#00363d] font-black text-[14px] uppercase border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] transition-all"
          >
            START
          </motion.button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden" style={{ perspective: 1500 }}>
        {/* Parallax Background Grid */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#39304a 2px, transparent 2px), linear-gradient(90deg, #39304a 2px, transparent 2px)',
            backgroundSize: '40px 40px',
            y: yBg,
            rotateX: mousePos.y * 0.5,
            rotateY: mousePos.x * 0.5,
            transformStyle: "preserve-3d"
          }}
        />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          {/* Text Content */}
          <TiltCard className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#120a21] px-4 py-1.5 rounded-full border-[3px] border-[#39304a] shadow-[0_4px_0_#120a21] mb-6" style={{ transform: "translateZ(40px)" }}>
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffba20] animate-pulse" />
              <span className="font-black text-[12px] uppercase tracking-widest text-[#ffba20]">SYSTEM v2.4 ONLINE</span>
            </div>
            
            <h1 className="font-black text-[56px] md:text-[80px] leading-[1.1] uppercase text-[#ffb0cd] drop-shadow-[0_6px_0_#120a21] mb-6 overflow-visible" style={{ transform: "translateZ(80px)" }}>
              <motion.span 
                initial={{ y: 100, rotateX: 90 }} 
                animate={{ y: 0, rotateX: 0 }} 
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="block text-[#eaddff]"
              >
                LEVEL UP
              </motion.span>
              <motion.span 
                initial={{ y: 100, rotateX: -90 }} 
                animate={{ y: 0, rotateX: 0 }} 
                transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
                className="block"
              >
                YOUR LIFE
              </motion.span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, z: -50 }}
              animate={{ opacity: 1, z: 0 }}
              transition={{ delay: 0.4 }}
              style={{ transform: "translateZ(50px)" }}
              className="font-medium text-[18px] md:text-[22px] text-[#e1bdc8] max-w-lg mb-10"
            >
              Turn daily tasks into rewards. Earn XP, collect cool items, and defeat weekly bosses in the ultimate productivity app.
            </motion.p>
            
            <Link href="/login" style={{ transform: "translateZ(60px)", display: "inline-block" }}>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                whileHover={{ y: -4, boxShadow: '0 12px 0 #120a21', scale: 1.05 }}
                whileTap={{ y: 4, boxShadow: '0 0 0 #120a21', scale: 0.95 }}
                className="px-10 py-5 rounded-2xl bg-[#ff45a3] text-[#570032] font-black text-[20px] uppercase border-[4px] border-[#120a21] shadow-[0_8px_0_#120a21] flex items-center gap-3 group"
              >
                GET STARTED
                <span className="material-symbols-outlined text-[28px] group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </motion.button>
            </Link>
          </TiltCard>
          
          {/* Parallax Mascot */}
          <TiltCard className="flex-1 relative h-[350px] md:h-[500px] w-full max-w-md mt-12 md:mt-0">
            <motion.div 
              className="absolute inset-0 bg-[#ff45a3] rounded-full blur-[100px] opacity-20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 4 }}
              style={{ transform: "translateZ(-20px)" }}
            />
            <motion.img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6SvUhD_8Fs7XGRXdREDdQl9Wh9lfOi_HBcRcbBmN-j0sepduymAE6QDLaR6sUldrttpzQAjiKs5fSQokLhHk4LjdLRUFPdEQzZp71AzKqleQwDtmF17VyZfGBCcW_yub7hGXdntgm1YNdl4JQP2dzgplT1HFuPLV2TN0PuvNWChsn4Ni0IDBZokxXjeJ4HdZzcVghkkW4Kp8qgCmqGNBCiLKeA-AU5qamaBVCYrCnRY_V6gvP7SWt7Q"
              alt="Neon Drift Mascot"
              className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_20px_0_rgba(18,10,33,0.9)] z-20"
              style={{ x: mousePos.x * -2, y: mousePos.y * -2, transform: "translateZ(80px)" }}
            />
            {/* Floating elements around mascot */}
            <motion.div 
              className="absolute top-10 left-0 bg-[#00e3fd] text-[#00363d] font-black text-[14px] px-4 py-2 rounded-xl border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] z-30 uppercase"
              style={{ x: mousePos.x * 2.5, y: mousePos.y * 2.5, transform: "translateZ(120px)" }}
              animate={{ y: [-10, 10, -10], rotateZ: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              +50 XP
            </motion.div>
            <motion.div 
              className="absolute bottom-20 right-0 bg-[#ffba20] text-[#271900] font-black text-[14px] px-4 py-2 rounded-xl border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] z-30 uppercase"
              style={{ x: mousePos.x * 3.5, y: mousePos.y * 3.5, transform: "translateZ(140px)" }}
              animate={{ y: [10, -10, 10], rotateZ: [5, -5, 5] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              LVL UP!
            </motion.div>
          </TiltCard>
        </div>
      </section>

      {/* Feature Section 1: Character Progression */}
      <section className="relative py-24 bg-[#231b34] border-y-4 border-[#120a21] overflow-hidden" style={{ perspective: 1200 }}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <TiltCard className="order-2 md:order-1">
            {/* Visual Preview */}
            <motion.div 
              style={{ transform: "translateZ(40px)" }}
              className="bg-[#120a21] p-6 rounded-3xl border-[4px] border-[#39304a] shadow-[0_12px_0_#120a21]"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#ff45a3] border-4 border-[#120a21] flex items-center justify-center shadow-[0_4px_0_#120a21]">
                  <span className="material-symbols-outlined text-[32px] text-[#570032]">person</span>
                </div>
                <div>
                  <h3 className="font-black text-[24px] uppercase text-[#eaddff]">RUNNER</h3>
                  <p className="font-black text-[14px] uppercase text-[#ffba20]">LEVEL 42</p>
                </div>
              </div>
              <div className="w-full h-8 bg-[#2e263f] rounded-full border-[3px] border-[#120a21] p-1 overflow-hidden relative shadow-[inset_0_4px_0_rgba(0,0,0,0.5)]">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '75%' }}
                  transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#00e3fd] to-[#bdf4ff] rounded-full relative"
                >
                  <div className="absolute right-2 top-0 bottom-0 w-2 bg-white opacity-40 animate-pulse rounded-full" />
                </motion.div>
              </div>
            </motion.div>
          </TiltCard>
          <motion.div 
            initial={{ opacity: 0, x: 50, rotateY: -30 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="order-1 md:order-2"
          >
            <h2 className="font-black text-[40px] md:text-[56px] uppercase text-[#00e3fd] drop-shadow-[0_4px_0_#120a21] mb-6 leading-tight">
              BUILD YOUR STATS
            </h2>
            <p className="font-medium text-[18px] text-[#e1bdc8]">
              Your real-life actions map to RPG attributes. Study to boost Intellect, hit the gym for Strength, and finish chores for Discipline. Watch your character grow as you conquer your to-do list.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Section 2: Missions */}
      <section className="relative py-24 overflow-hidden" style={{ perspective: 1200 }}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50, rotateY: 30 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <h2 className="font-black text-[40px] md:text-[56px] uppercase text-[#ffba20] drop-shadow-[0_4px_0_#120a21] mb-6 leading-tight">
              CRUSH BOUNTIES
            </h2>
            <p className="font-medium text-[18px] text-[#e1bdc8]">
              Add your daily goals as bounties. Check them off to trigger satisfying combo animations, earn tactical coins, and keep your daily streak blazing.
            </p>
          </motion.div>
          <TiltCard className="relative h-64">
            {/* Visual Preview */}
            <motion.div style={{ transform: "translateZ(30px)" }} className="bg-[#261847] p-6 rounded-3xl border-[4px] border-[#120a21] shadow-[0_12px_0_#120a21] relative z-10 mt-8">
              <div className="flex items-center gap-4 relative">
                {/* Mouse Cursor */}
                <motion.div
                  animate={{
                    x: [80, -2, -2, 80],
                    y: [80, 15, 15, 80],
                    scale: [1, 1, 0.85, 1],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute z-50 pointer-events-none"
                  style={{ top: 0, left: 0 }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                    <path d="M7 2L20 12.3333L13.8824 13.9103L16.5 21L13 22.5L10.3824 15.4103L5 19.5V2Z" fill="white" stroke="#120a21" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </motion.div>

                {/* Checkbox */}
                <motion.div 
                  animate={{
                    backgroundColor: ['#120a21', '#120a21', '#00e3fd', '#00e3fd', '#120a21'],
                    scale: [1, 1, 0.9, 1.1, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-14 h-14 rounded-xl border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] flex items-center justify-center shrink-0 overflow-hidden"
                >
                  <motion.span 
                    animate={{ opacity: [0, 0, 1, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="material-symbols-outlined text-[#00363d] font-black text-[32px]"
                  >
                    check
                  </motion.span>
                </motion.div>
                
                {/* Task Text */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#ff45a3] text-[#570032] font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-[#120a21] uppercase">💪 STRENGTH</span>
                  </div>
                  <motion.h3 
                    animate={{
                      color: ['#eaddff', '#eaddff', '#a98893', '#a98893', '#eaddff'],
                      textDecorationLine: ['none', 'none', 'line-through', 'line-through', 'none']
                    }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="font-bold text-[20px] decoration-2"
                  >
                    Hit the Gym
                  </motion.h3>
                </div>
                
                <div className="shrink-0 bg-[#ffba20] text-[#271900] font-black text-[14px] px-3 py-1.5 rounded-xl border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21]">
                  +50 XP
                </div>
              </div>
            </motion.div>
            
            {/* Floating Popups */}
            <motion.div 
              animate={{
                opacity: [0, 0, 1, 0, 0],
                y: [20, 20, -50, -60, -60],
                scale: [0.5, 0.5, 1.2, 1, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{ transform: "translateZ(80px)" }}
              className="absolute -top-2 right-4 bg-[#ff45a3] text-[#570032] font-black text-[20px] px-4 py-2 rounded-2xl border-[3px] border-[#120a21] shadow-[0_6px_0_#120a21] rotate-6 z-20"
            >
              +50 XP!
            </motion.div>
            <motion.div 
              animate={{
                opacity: [0, 0, 0, 1, 0],
                y: [20, 20, 20, -40, -50],
                scale: [0.5, 0.5, 0.5, 1.2, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{ transform: "translateZ(60px)" }}
              className="absolute top-8 -right-8 bg-[#ffba20] text-[#271900] font-black text-[16px] px-3 py-1.5 rounded-2xl border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] -rotate-6 z-20"
            >
              +20 🪙
            </motion.div>
          </TiltCard>
        </div>
      </section>

      {/* Feature Section 3: Boss Battle */}
      <section className="relative py-24 bg-[#120a21] border-t-4 border-[#39304a] overflow-hidden" style={{ perspective: 1200 }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
          <TiltCard>
            <motion.div 
              initial={{ opacity: 0, y: 30, rotateX: -20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 100 }}
              style={{ transform: "translateZ(20px)" }}
            >
              <div className="inline-flex items-center gap-2 bg-[#ff45a3] text-[#570032] px-4 py-1.5 rounded-full border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] mb-6">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                <span className="font-black text-[12px] uppercase tracking-widest">WEEKLY RAID EVENT</span>
              </div>
              <h2 className="font-black text-[40px] md:text-[56px] uppercase text-[#ffb0cd] drop-shadow-[0_4px_0_#120a21] mb-6 leading-tight">
                FIGHT THE GLITCH
              </h2>
              <p className="font-medium text-[18px] text-[#e1bdc8] max-w-2xl mx-auto mb-12">
                Every bounty you complete charges your attack battery. Team up with other runners to deal damage to the weekly boss and unlock legendary loot!
              </p>
              
              <div className="bg-[#261847] p-8 rounded-3xl border-[4px] border-[#39304a] shadow-[0_16px_0_#0B0616] max-w-3xl mx-auto w-full relative">
                <img 
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=GlitchBoss&backgroundColor=transparent" 
                  alt="Boss" 
                  className="w-48 h-48 mx-auto drop-shadow-[0_10px_0_#120a21] -mt-16 mb-6 transform hover:scale-110 transition-transform duration-300"
                />
                <div className="w-full h-8 bg-[#120a21] rounded-full border-[3px] border-[#120a21] p-1 overflow-hidden relative shadow-[inset_0_4px_0_rgba(0,0,0,0.5)]">
                  <motion.div 
                    initial={{ width: '100%' }}
                    whileInView={{ width: '45%' }}
                    transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#ff45a3] to-[#ffb0cd] rounded-full"
                  />
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, type: 'spring' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ffba20] text-[#271900] font-black text-[24px] px-6 py-2 rounded-2xl border-[4px] border-[#120a21] shadow-[0_6px_0_#120a21] -rotate-12"
                >
                  -250 DMG
                </motion.div>
              </div>
            </motion.div>
          </TiltCard>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="relative py-20 bg-[#ff45a3] text-[#570032] border-t-4 border-[#120a21] text-center" style={{ perspective: 1000 }}>
        <TiltCard className="max-w-4xl mx-auto px-6">
          <h2 className="font-black text-[48px] uppercase drop-shadow-[0_4px_0_#120a21] mb-8" style={{ transform: "translateZ(30px)" }}>
            READY TO GET STARTED?
          </h2>
          <Link href="/login" style={{ transform: "translateZ(50px)", display: "inline-block" }}>
            <motion.button
              whileHover={{ y: -4, boxShadow: '0 12px 0 #120a21', scale: 1.05 }}
              whileTap={{ y: 4, boxShadow: '0 0 0 #120a21', scale: 0.95 }}
              className="px-10 py-5 rounded-2xl bg-[#00e3fd] text-[#00363d] font-black text-[20px] uppercase border-[4px] border-[#120a21] shadow-[0_8px_0_#120a21] inline-flex items-center gap-3 group"
            >
              CREATE ACCOUNT
              <span className="material-symbols-outlined text-[28px] group-hover:translate-x-2 transition-transform">bolt</span>
            </motion.button>
          </Link>
        </TiltCard>
      </footer>

      {/* Actual Footer */}
      <footer className="w-full bg-[#120a21] border-t-4 border-[#2e263f] py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-black text-[14px] uppercase text-[#ffb0cd]" style={{ fontFamily: 'Rubik' }}>Made by team EliteX</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-medium text-[13px] text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>"Small steps every day lead to big changes."</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
