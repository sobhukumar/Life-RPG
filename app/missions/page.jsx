'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LevelUpModal from '@/components/LevelUpModal'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORY_META = {
  focus:      { label: '🧠 Focus',      bg: 'bg-[#ffba20]', text: 'text-[#271900]', attr: 'Intellect' },
  strength:   { label: '💪 Strength',   bg: 'bg-[#ff45a3]', text: 'text-[#570032]', attr: 'Strength'  },
  discipline: { label: '⚔️ Discipline', bg: 'bg-[#00e3fd]', text: 'text-[#00363d]', attr: 'Discipline'},
}

const DIFFICULTY_META = [
  { value: 20,  label: 'Easy',   color: 'bg-[#00e3fd] text-[#00363d]', icon: '⚡' },
  { value: 50,  label: 'Medium', color: 'bg-[#ffba20] text-[#271900]', icon: '🔥' },
  { value: 100, label: 'Hard',   color: 'bg-[#ff45a3] text-[#570032]', icon: '💀' },
]

function CompleteButton({ onClick, disabled }) {
  const [animating, setAnimating] = useState(false)

  const handleClick = async () => {
    if (disabled || animating) return
    setAnimating(true)
    await onClick()
    setTimeout(() => setAnimating(false), 600)
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className="relative shrink-0 w-12 h-12 rounded-xl border-[3px] border-[#39304a] flex items-center justify-center overflow-hidden group"
      style={{ background: animating ? '#00e3fd' : '#120a21' }}
      whileHover={{ scale: 1.1, borderColor: '#00e3fd' }}
      whileTap={{ scale: 0.88 }}
      aria-label="Mark as complete"
    >
      {/* Ripple fill */}
      <AnimatePresence>
        {animating && (
          <motion.div
            key="ripple"
            className="absolute inset-0 rounded-xl bg-[#00e3fd]"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Check icon */}
      <motion.span
        className="material-symbols-outlined text-[26px] font-black relative z-10"
        style={{ color: animating ? '#00363d' : '#39304a' }}
        animate={animating ? { rotate: [0, -20, 0], scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.4 }}
      >
        check
      </motion.span>

      {/* Glow ring on hover */}
      <div className="absolute inset-0 rounded-xl ring-0 group-hover:ring-2 group-hover:ring-[#00e3fd]/50 transition-all" />
    </motion.button>
  )
}

export default function MissionsPage() {
  const { user, character, supabase, awardXP } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeZone, setActiveZone] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskZone, setNewTaskZone] = useState('focus')
  const [newTaskXP, setNewTaskXP] = useState(50)
  const [titleError, setTitleError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [levelUpOpen, setLevelUpOpen] = useState(false)
  const [newLevel, setNewLevel] = useState(1)
  const [xpPopups, setXpPopups] = useState([])
  const [fetchError, setFetchError] = useState(null)
  const [completingId, setCompletingId] = useState(null)

  const fetchTasks = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setTasks(data || [])
    } catch {
      setFetchError('Could not load missions. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) { setTitleError('Mission name cannot be empty!'); return }
    setTitleError('')
    setSubmitting(true)
    try {
      const coinReward = Math.round(newTaskXP * 0.4)
      const { data, error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || null,
        category: newTaskZone,
        xp_reward: newTaskXP,
        coin_reward: coinReward,
      }).select().single()
      if (error) throw error
      setTasks(prev => [data, ...prev])
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskXP(50)
      setModalOpen(false)
    } catch (err) {
      setTitleError(err.message || 'Failed to add mission.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplete = async (task) => {
    if (task.completed || completingId === task.id) return
    setCompletingId(task.id)
    try {
      await supabase.from('tasks').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', task.id)
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t))

      // Award XP + coins
      const result = await awardXP(task.xp_reward, task.coin_reward, task.category)

      // XP popup
      const id = Date.now()
      setXpPopups(prev => [...prev,
        { id, text: `+${task.xp_reward} XP!` },
        { id: id + 1, text: `+${task.coin_reward} 🪙` }
      ])
      setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id && p.id !== id + 1)), 1500)

      if (result?.leveledUp) {
        setNewLevel(result.newLevel)
        setLevelUpOpen(true)
      }
    } catch (err) {
      console.error('Complete error:', err)
    } finally {
      setCompletingId(null)
    }
  }

  const handleDelete = async (taskId) => {
    try {
      await supabase.from('tasks').delete().eq('id', taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const filtered = activeZone === 'all'
    ? tasks
    : tasks.filter(t => t.category === activeZone)

  const active = filtered.filter(t => !t.completed)
  const completed = filtered.filter(t => t.completed)

  const selectedDifficulty = DIFFICULTY_META.find(d => d.value === newTaskXP) || DIFFICULTY_META[1]

  return (
    <div className="min-h-screen bg-[#170f27]">
      <Navbar />
      <LevelUpModal isOpen={levelUpOpen} newLevel={newLevel} onClose={() => setLevelUpOpen(false)} />

      {/* XP Popups */}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {xpPopups.map(p => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 20, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40 }}
              className="bg-[#ff45a3] text-[#570032] font-black text-[14px] px-4 py-2 rounded-full border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] uppercase tracking-wider"
              style={{ fontFamily: 'Rubik' }}
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <main className="w-full pt-20 min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#120a21] px-3.5 py-1 rounded-full border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e3fd] animate-pulse" />
                <span className="font-black text-[10px] uppercase tracking-widest text-[#00e3fd]" style={{ fontFamily: 'Rubik' }}>DAILY PROTOCOL MATRIX</span>
              </div>
              <h1 className="font-black text-[48px] text-[#ffb0cd] tracking-tight uppercase drop-shadow-[0_4px_0_#120a21]" style={{ fontFamily: 'Rubik' }}>
                Active Bounties
              </h1>
              <p className="font-medium text-[16px] text-[#e1bdc8] max-w-xl" style={{ fontFamily: 'Rubik' }}>
                Execute daily terminal directives, harvest raw overclock XP, and claim tactical currency.
              </p>
            </div>

            {/* Streak HUD */}
            <div className="flex items-stretch gap-3 bg-[#1f1730] p-3.5 rounded-2xl border-4 border-[#120a21] shadow-[0_6px_0_#120a21]">
              <div className="bg-[#120a21] p-3 rounded-xl border-[3px] border-[#2e263f] flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[#ffba20]">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  <span className="font-black text-[10px] uppercase" style={{ fontFamily: 'Rubik' }}>Streak</span>
                </div>
                <span className="font-black text-[24px] text-[#ffba20]" style={{ fontFamily: 'Rubik' }}>{character?.streak_count ?? 0} DAYS</span>
              </div>
              <div className="flex flex-col justify-between py-1 px-2 min-w-[120px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-[10px] text-[#e1bdc8] uppercase" style={{ fontFamily: 'Rubik' }}>Daily Milestone</span>
                  <span className="font-black text-[10px] text-[#00e3fd]" style={{ fontFamily: 'Rubik' }}>{completed.length}/{filtered.length}</span>
                </div>
                <div className="w-full h-4 bg-[#120a21] rounded-full p-0.5 border-2 border-[#39304a] flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-full rounded-full flex-1 ${i < completed.length ? 'bg-[#00e3fd]' : 'bg-[#2e263f]'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8">
            {[['all', '🎮 All Bounties'], ...Object.entries(CATEGORY_META).map(([k, v]) => [k, v.label])].map(([zone, label]) => (
              <button
                key={zone}
                onClick={() => setActiveZone(zone)}
                className={`shrink-0 px-5 py-2.5 rounded-full font-black text-[14px] uppercase tracking-wider border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] transition-all hover:-translate-y-0.5 active:translate-y-1 active:shadow-none ${
                  activeZone === zone
                    ? 'bg-[#ff45a3] text-[#570032]'
                    : 'bg-[#2e263f] text-[#eaddff] hover:bg-[#00e3fd] hover:text-[#00363d]'
                }`}
                style={{ fontFamily: 'Rubik' }}
              >
                {label} {zone !== 'all' ? `(${tasks.filter(t => t.category === zone && !t.completed).length})` : `(${tasks.filter(t => !t.completed).length})`}
              </button>
            ))}
          </div>

          {/* Mission List */}
          <div className="flex flex-col gap-4">
            {fetchError && (
              <div className="p-4 rounded-xl bg-[#93000a] border-[3px] border-[#120a21] text-[#ffb4ab] font-bold flex items-center gap-2" style={{ fontFamily: 'Rubik' }}>
                <span className="material-symbols-outlined">wifi_off</span>
                {fetchError}
              </div>
            )}
            {loading ? (
              <LoadingSkeleton type="task" count={4} />
            ) : active.length === 0 && completed.length === 0 ? (
              <div className="text-center py-16 bg-[#261847] rounded-2xl border-4 border-[#120a21] shadow-[0_6px_0_#120a21]">
                <span className="text-6xl block mb-3">🎯</span>
                <p className="font-black text-[20px] uppercase text-[#eaddff]" style={{ fontFamily: 'Rubik' }}>No Missions Yet!</p>
                <p className="font-medium text-[14px] text-[#e1bdc8] mt-1" style={{ fontFamily: 'Rubik' }}>Hit the ⚡ button to add your first bounty.</p>
              </div>
            ) : (
              <>
                {/* Active tasks */}
                <AnimatePresence>
                  {active.map(task => {
                    const zone = CATEGORY_META[task.category] || CATEGORY_META.focus
                    const diff = DIFFICULTY_META.find(d => d.value === task.xp_reward) || { label: 'Custom', color: 'bg-[#39304a] text-[#bdf4ff]', icon: '⚡' }
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative bg-[#261847] p-5 sm:p-6 rounded-2xl border-4 border-[#120a21] shadow-[0_6px_0_#120a21] hover:-translate-y-1 hover:shadow-[0_8px_0_#120a21] transition-all duration-200"
                      >
                        <div className="flex items-start sm:items-center justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                            {/* Animated Complete button on LEFT */}
                            <CompleteButton
                              onClick={() => handleComplete(task)}
                              disabled={completingId === task.id}
                            />

                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`inline-flex items-center gap-1 ${zone.bg} ${zone.text} font-black text-[10px] px-2.5 py-0.5 rounded-full border-2 border-[#120a21] uppercase tracking-wider`} style={{ fontFamily: 'Rubik' }}>
                                  {zone.label}
                                </span>
                                <span className={`font-black text-[10px] px-2.5 py-0.5 rounded-full border-2 border-[#120a21] uppercase ${diff.color}`} style={{ fontFamily: 'Rubik' }}>
                                  {diff.icon} {diff.label}
                                </span>
                              </div>
                              <h2 className="font-bold text-[18px] text-[#eaddff] group-hover:text-[#ffb0cd] transition-colors" style={{ fontFamily: 'Rubik' }}>{task.title}</h2>
                              {task.description && (
                                <p className="font-medium text-[13px] text-[#a98893] mt-1 leading-snug" style={{ fontFamily: 'Rubik' }}>{task.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                            <span className="font-black text-[12px] px-3 py-1.5 bg-[#ff45a3] text-[#570032] rounded-xl border-2 border-[#120a21] shadow-[0_2px_0_#120a21] tracking-wider" style={{ fontFamily: 'Rubik' }}>+{task.xp_reward} XP</span>
                            <span className="font-black text-[12px] px-3 py-1.5 bg-[#ffba20] text-[#271900] rounded-xl border-2 border-[#120a21] shadow-[0_2px_0_#120a21] tracking-wider" style={{ fontFamily: 'Rubik' }}>+{task.coin_reward} 🪙</span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(task.id)}
                              className="w-8 h-8 rounded-lg bg-[#93000a] text-[#ffb4ab] border-2 border-[#120a21] flex items-center justify-center hover:bg-[#690005] transition-colors"
                              aria-label="Delete task"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {/* Completed tasks */}
                {completed.length > 0 && (
                  <div className="mt-4">
                    <p className="font-black text-[12px] uppercase text-[#a98893] mb-3 px-1 tracking-widest" style={{ fontFamily: 'Rubik' }}>✓ COMPLETED ({completed.length})</p>
                    <AnimatePresence>
                      {completed.map(task => {
                        const zone = CATEGORY_META[task.category] || CATEGORY_META.focus
                        return (
                          <motion.div
                            key={task.id}
                            layout
                            className="group relative bg-[#261847] opacity-70 p-5 rounded-2xl border-4 border-[#120a21] shadow-[0_3px_0_#120a21] mb-3 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="shrink-0 w-12 h-12 rounded-xl bg-[#00e3fd] border-[3px] border-[#120a21] flex items-center justify-center shadow-[0_2px_0_#120a21]">
                                <span className="material-symbols-outlined text-[#00363d] text-[28px] font-black">check</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`${zone.bg} ${zone.text} font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-[#120a21] uppercase`} style={{ fontFamily: 'Rubik' }}>{zone.label}</span>
                                  <span className="bg-[#00e3fd] text-[#00363d] font-black text-[10px] px-2 py-0.5 rounded-md border-2 border-[#120a21] uppercase -rotate-1" style={{ fontFamily: 'Rubik' }}>COMPLETED</span>
                                </div>
                                <h2 className="font-bold text-[18px] text-[#a98893] line-through truncate" style={{ fontFamily: 'Rubik' }}>{task.title}</h2>
                                {task.description && (
                                  <p className="font-medium text-[12px] text-[#6b5a72] mt-0.5" style={{ fontFamily: 'Rubik' }}>{task.description}</p>
                                )}
                              </div>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(task.id)}
                              className="w-8 h-8 shrink-0 rounded-lg bg-[#93000a] text-[#ffb4ab] border-2 border-[#120a21] flex items-center justify-center"
                              aria-label="Delete completed task"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </motion.button>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-40">
        <motion.button
          whileHover={{ y: -4, boxShadow: '0 12px 0 #120a21' }}
          whileTap={{ y: 2, boxShadow: '0 0 0 #120a21' }}
          onClick={() => setModalOpen(true)}
          aria-label="Add new mission"
          className="w-16 h-16 rounded-full bg-[#ff45a3] text-[#570032] border-4 border-[#120a21] shadow-[0_8px_0_#120a21] flex items-center justify-center group"
        >
          <span className="material-symbols-outlined text-[36px] font-black group-hover:rotate-90 transition-transform duration-200">add</span>
          <div className="absolute -top-2 -left-2 bg-[#ffba20] text-[#271900] w-7 h-7 rounded-full border-2 border-[#120a21] flex items-center justify-center shadow-[0_2px_0_#120a21]">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
          </div>
        </motion.button>
      </div>

      {/* Add Mission Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#120a21]/80"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.88, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="bg-[#261847] w-full max-w-lg rounded-3xl border-4 border-[#120a21] shadow-[0_12px_0_#120a21] p-6 sm:p-8 relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b-[3px] border-[#120a21]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffb0cd] text-[28px]">add_task</span>
                  <h3 className="font-black text-[24px] uppercase text-[#ffb0cd] tracking-wide" style={{ fontFamily: 'Rubik' }}>New Bounty Directive</h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="w-9 h-9 rounded-xl bg-[#120a21] border-2 border-[#2e263f] text-[#eaddff] hover:bg-[#93000a] hover:text-[#ffb4ab] flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleAddTask}>
                {/* Title */}
                <div>
                  <label className="block font-black text-[12px] uppercase text-[#e1bdc8] mb-2" style={{ fontFamily: 'Rubik' }}>Directive Name *</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl bg-[#120a21] text-[#eaddff] font-bold text-[16px] border-[3px] border-[#39304a] focus:border-[#00e3fd] focus:outline-none transition-colors"
                    placeholder="e.g. Calibrate Nitro Injector"
                    value={newTaskTitle}
                    onChange={e => { setNewTaskTitle(e.target.value); setTitleError('') }}
                    style={{ fontFamily: 'Rubik' }}
                    autoFocus
                  />
                  <AnimatePresence>
                    {titleError && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[#ffb4ab] font-bold text-[12px] mt-1.5 px-1" style={{ fontFamily: 'Rubik' }}>
                        ⚠ {titleError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-black text-[12px] uppercase text-[#e1bdc8] mb-2" style={{ fontFamily: 'Rubik' }}>Description <span className="text-[#6b5a72] normal-case">(optional)</span></label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl bg-[#120a21] text-[#eaddff] font-medium text-[14px] border-[3px] border-[#39304a] focus:border-[#00e3fd] focus:outline-none transition-colors resize-none"
                    placeholder="Describe this mission in detail..."
                    value={newTaskDescription}
                    onChange={e => setNewTaskDescription(e.target.value)}
                    style={{ fontFamily: 'Rubik' }}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block font-black text-[12px] uppercase text-[#e1bdc8] mb-2" style={{ fontFamily: 'Rubik' }}>Category</label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none px-4 py-3 rounded-xl bg-[#120a21] text-[#eaddff] font-black text-[14px] uppercase border-[3px] border-[#39304a] focus:border-[#00e3fd] focus:outline-none cursor-pointer"
                        value={newTaskZone}
                        onChange={e => setNewTaskZone(e.target.value)}
                        style={{ fontFamily: 'Rubik' }}
                      >
                        {Object.entries(CATEGORY_META).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3.5 pointer-events-none text-[#e1bdc8]">expand_more</span>
                    </div>
                  </div>

                  {/* XP Difficulty */}
                  <div>
                    <label className="block font-black text-[12px] uppercase text-[#e1bdc8] mb-2" style={{ fontFamily: 'Rubik' }}>XP Bounty</label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none px-4 py-3 rounded-xl bg-[#120a21] text-[#eaddff] font-black text-[14px] border-[3px] border-[#39304a] focus:border-[#00e3fd] focus:outline-none cursor-pointer"
                        value={newTaskXP}
                        onChange={e => setNewTaskXP(Number(e.target.value))}
                        style={{ fontFamily: 'Rubik' }}
                      >
                        {DIFFICULTY_META.map(d => (
                          <option key={d.value} value={d.value}>{d.icon} {d.label} ({d.value} XP)</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3.5 pointer-events-none text-[#e1bdc8]">expand_more</span>
                    </div>
                    {/* Selected difficulty badge */}
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase border-2 border-[#120a21] ${selectedDifficulty.color}`} style={{ fontFamily: 'Rubik' }}>
                      {selectedDifficulty.icon} {selectedDifficulty.label} — {newTaskXP} XP · {Math.round(newTaskXP * 0.4)} 🪙
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-3 rounded-xl font-black text-[14px] uppercase text-[#e1bdc8] bg-[#2e263f] border-[3px] border-[#120a21] hover:bg-[#3e354f] transition-all" style={{ fontFamily: 'Rubik' }}>
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 2 }}
                    className="px-7 py-3 rounded-xl font-black text-[14px] uppercase bg-[#ff45a3] text-[#570032] border-[3px] border-[#120a21] shadow-[0_4px_0_#120a21] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60"
                    style={{ fontFamily: 'Rubik' }}
                  >
                    {submitting ? '...' : 'Enlist Bounty ⚡'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
