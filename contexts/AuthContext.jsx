'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabaseClient'

const AuthContext = createContext(null)

// XP needed to reach next level
export function xpToNextLevel(level) {
  return level * 100
}

// Map task category to attribute name
export const CATEGORY_ATTRIBUTE_MAP = {
  focus: 'Intellect',
  strength: 'Strength',
  discipline: 'Discipline',
}

export function AuthProvider({ children }) {
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [character, setCharacter] = useState(null)
  const [attributes, setAttributes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCharacter = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (!error && data) setCharacter(data)

    const { data: attrs } = await supabase
      .from('attributes')
      .select('*')
      .eq('character_id', data?.id)
    if (attrs) setAttributes(attrs)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchCharacter(user.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await fetchCharacter(currentUser.id)
        } else {
          setCharacter(null)
          setAttributes([])
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchCharacter, supabase])

  // Update streak on dashboard load
  const updateStreak = useCallback(async () => {
    if (!character) return
    const today = new Date().toISOString().split('T')[0]
    const last = character.last_active_date

    if (last === today) return // already updated today

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const newStreak = last === yesterday ? character.streak_count + 1 : 1

    const { data } = await supabase
      .from('characters')
      .update({ streak_count: newStreak, last_active_date: today })
      .eq('id', character.id)
      .select()
      .single()
    if (data) setCharacter(data)
  }, [character, supabase])

  // Award XP + coins on task completion; returns { leveledUp, newLevel }
  const awardXP = useCallback(async (xpAmount, coinAmount, taskCategory) => {
    if (!character) return { leveledUp: false }

    let newXP = character.xp + xpAmount
    let newLevel = character.level
    let leveledUp = false

    while (newXP >= xpToNextLevel(newLevel)) {
      newXP -= xpToNextLevel(newLevel)
      newLevel++
      leveledUp = true
    }

    const newCoins = character.coins + coinAmount
    const newBossDmg = character.boss_damage_dealt + 250

    const { data: updatedChar } = await supabase
      .from('characters')
      .update({
        xp: newXP,
        level: newLevel,
        coins: newCoins,
        boss_damage_dealt: newBossDmg,
      })
      .eq('id', character.id)
      .select()
      .single()

    if (updatedChar) setCharacter(updatedChar)

    // Update corresponding attribute
    const attrName = CATEGORY_ATTRIBUTE_MAP[taskCategory]
    if (attrName) {
      const existing = attributes.find(a => a.name === attrName)
      if (existing) {
        const { data: updatedAttr } = await supabase
          .from('attributes')
          .update({ value: existing.value + 1 })
          .eq('id', existing.id)
          .select()
          .single()
        if (updatedAttr) {
          setAttributes(prev => prev.map(a => a.id === updatedAttr.id ? updatedAttr : a))
        }
      }
    }

    return { leveledUp, newLevel }
  }, [character, attributes, supabase])

  // Deduct coins for shop purchase
  const spendCoins = useCallback(async (amount) => {
    if (!character || character.coins < amount) return false
    const { data } = await supabase
      .from('characters')
      .update({ coins: character.coins - amount })
      .eq('id', character.id)
      .select()
      .single()
    if (data) setCharacter(data)
    return true
  }, [character, supabase])

  // Refresh character from DB
  const refreshCharacter = useCallback(() => {
    if (user) fetchCharacter(user.id)
  }, [user, fetchCharacter])

  const value = {
    user,
    character,
    attributes,
    loading,
    supabase,
    awardXP,
    spendCoins,
    updateStreak,
    refreshCharacter,
    xpToNextLevel,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
