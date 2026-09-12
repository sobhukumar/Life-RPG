'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { motion, AnimatePresence } from 'framer-motion'

// Only the 4 real items — removed Glitch Cat (broken img) and Overclock Potion (no real logic)
const SHOP_ITEMS = [
  {
    id: 'jacket-1',
    name: 'Cyber Runner High-Vis Jacket',
    slot: 'jacket',
    price: 0,
    description: 'Violet & magenta reinforced windbreaker with kinetic drift reflections.',
    badge: 'STARTER GEAR',
    badgeColor: 'bg-[#ff45a3] text-[#570032]',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUWnQH08XQ3PXgsJCDi0huT0qqF9efgXZ0XsrorXLZ2K8z4b2ZvuSOVVMa3snEU9CN3kAlRS3E9K2rjADBUwTpd5E2KiQ4YzNdL0pf6x31LVgOwnP_0_Q6CU5S9S2jSE81JEtnQcTqCtnLUSEiqqEfhBbo_62mwXeKBk9pjrbNcrsYj6xol6AmfeZRPzz5MdrqSMT9f2cVYS_diqmfMGDv9X4VA7cPFIbw1lMJNkvqb98ARiX-kF2w7g',
  },
  {
    id: 'visor-1',
    name: 'Holo-Cyan Speed Visor',
    slot: 'visor',
    price: 400,
    description: 'Full-spectrum HUD projecting apex drift vectors and real-time cop tracker.',
    badge: 'RARE HUD VISOR',
    badgeColor: 'bg-[#00e3fd] text-[#00363d]',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNFLQ1UT0ZD4F6yZDcJUfqgaQ8PtcX1sf1ck6P3SpWnT960KQZI94LGbGX5jucECMnLR2LHm6KqnVMjZYpK-xlSW-xB_SjsXRdskiiNDecf2yh73U66mNgqpCPrzdvQIfWQtBphf3fvpVk5hmzmlVuqdD9n7VtgjGY6RgaOLSQEXmlRp21zJuw_rZhXZAYCAOxmXLLKoQkUypesJCKrxavpZ3bIDuMkJyVvyfQgG-7k3JLrG5U1hKHQQ',
  },
  {
    id: 'sneakers-1',
    name: 'Electro-Glide High-Tops',
    slot: 'shoes',
    price: 650,
    description: 'Golden magnetic air-cushion boots. Leaves sparking lightning footprints.',
    badge: 'LEGENDARY KICKS',
    badgeColor: 'bg-[#ffba20] text-[#271900]',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4Vj0x-Wf1hFK9rDD_BHbbBSWiUA0s5Sx0IuyHsiJJ0psVOMvIShZ9S7oLX6qqFis8aZv94aif_q2mZIFHpR7DJrnYWlJM9yFseVL5rp47G4YaEC0U4l-Cbwk-us11WahC3leVHCd-MthXa4aOvl39uyo-WnCS_XmeEaDwUeJsl6LwM39mr2NImRhGX0-yJ3QlW9OVeSICn0q5dYlkRSjKjBtKD8d8YaHCfMQis5LlWDt3EolZS1uCmQ',
  },
  {
    id: 'jacket-2',
    name: 'Neon Katana Cyber-Pack',
    slot: 'jacket',
    price: 800,
    description: 'Matte carbon sling-pack housing a concentrated plasma hardlight blade.',
    badge: 'CYBER BACKPACK',
    badgeColor: 'bg-[#00e3fd] text-[#00363d]',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB85zxCzB5veI1wU3vSReoA3edbMODHfwnIa6k6apoeSclZ2YDD27zZduRmaIOEe1zzBEO6tGitIZliP5I6rYxaR9qrC4ujXEuYjdU8skCbVGcupOlHL5SJeJ2uJGkVKiwY1-_Rngxe8io3b8MQ2ClPtUO_Vg_QGChC690Q8bLaculWqW2zUIEQc8y_LvyjFlMF3Hj1eNgFTIkcAijjbMZcy08KNcPcLrDgjIr0iRMGL6Jr9HgPb3uJDQ',
  },
]

export default function ShopPage() {
  const { user, character, supabase, spendCoins } = useAuth()
  const [inventory, setInventory] = useState([])
  const [toast, setToast] = useState(null)
  const [unlockModal, setUnlockModal] = useState(null)
  const [loading, setLoading] = useState(true)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const fetchInventory = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('inventory').select('*').eq('user_id', user.id)
    setInventory(data || [])
    setLoading(false)
  }, [user, supabase])

  useEffect(() => { fetchInventory() }, [fetchInventory])

  // Find inventory row for a shop item
  const getInvRow = (item) => inventory.find(i => i.item_name === item.name)
  const isOwned = (item) => !!getInvRow(item)
  const isEquipped = (item) => getInvRow(item)?.equipped === true

  const handleBuy = async (item) => {
    if (isOwned(item)) { showToast('Already owned!', 'info'); return }
    if ((character?.coins ?? 0) < item.price) {
      showToast('NOT ENOUGH COINS! Complete more missions! 🚫', 'error')
      return
    }
    const success = await spendCoins(item.price)
    if (!success) { showToast('Purchase failed. Try again.', 'error'); return }

    const { data } = await supabase.from('inventory').insert({
      user_id: user.id,
      item_name: item.name,
      item_category: item.slot,
      price: item.price,
      equipped: false,
      image_url: item.image,
    }).select().single()

    if (data) {
      setInventory(prev => [...prev, data])
      setUnlockModal(item)
    }
  }

  const handleEquip = async (item) => {
    const invRow = getInvRow(item)
    if (!invRow) return
    // Unequip all items in same slot first
    await supabase.from('inventory')
      .update({ equipped: false })
      .eq('user_id', user.id)
      .eq('item_category', item.slot)
    // Equip the new one
    await supabase.from('inventory')
      .update({ equipped: true })
      .eq('id', invRow.id)
    // Update local state
    setInventory(prev =>
      prev.map(i =>
        i.item_category === item.slot
          ? { ...i, equipped: i.id === invRow.id }
          : i
      )
    )
    showToast(`${item.name} EQUIPPED! 🎮`)
  }

  return (
    <div className="min-h-screen bg-[#170f27]">
      <Navbar />
      <main className="w-full pt-20 min-h-[calc(100vh-80px)]">
        <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">

          {/* Hero Banner */}
          <div className="relative w-full bg-[#2e263f] rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_#120a21] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#ff45a3] rounded-full opacity-20 pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#00e3fd] rounded-full opacity-10 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2 bg-[#00e3fd] text-[#00363d] font-black text-[12px] px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_3px_0_#120a21] -rotate-1" style={{ fontFamily: 'Rubik' }}>
                <span className="material-symbols-outlined text-[16px]">local_mall</span>
                <span>CYBER BAZAAR v2.0</span>
              </div>
              <h1 className="font-black text-[36px] md:text-[48px] uppercase tracking-tight text-[#eaddff] drop-shadow-[0_4px_0_#120a21]" style={{ fontFamily: 'Rubik' }}>THE STASH &amp; DRIP</h1>
              <p className="font-medium text-[16px] text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>Purchase gear with coins earned from completing missions.</p>
            </div>
            <div className="relative z-10 bg-[#ffba20] text-[#271900] font-black text-[24px] px-6 py-4 rounded-2xl shadow-[0_6px_0_#120a21] flex items-center gap-3" style={{ fontFamily: 'Rubik' }}>
              <span className="text-3xl">🪙</span>
              <div className="flex flex-col leading-none">
                <span className="font-black text-[10px] uppercase tracking-widest opacity-80" style={{ fontFamily: 'Rubik' }}>YOUR COINS</span>
                <span className="font-black text-[28px]">{(character?.coins ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Character Preview with equipped badge slots */}
          <div className="bg-[#231b34] rounded-3xl border-4 border-[#120a21] shadow-[0_8px_0_#120a21] p-6">
            <p className="font-black text-[12px] uppercase text-[#00e3fd] tracking-widest mb-4" style={{ fontFamily: 'Rubik' }}>EQUIPPED LOADOUT</p>
            <div className="relative flex items-center justify-center">
              {/* Base character avatar */}
              <div className="relative w-36 h-36 rounded-2xl bg-[#120a21] border-4 border-[#39304a] shadow-[0_6px_0_#0B0616] flex items-center justify-center overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6SvUhD_8Fs7XGRXdREDdQl9Wh9lfOi_HBcRcbBmN-j0sepduymAE6QDLaR6sUldrttpzQAjiKs5fSQokLhHk4LjdLRUFPdEQzZp71AzKqleQwDtmF17VyZfGBCcW_yub7hGXdntgm1YNdl4JQP2dzgplT1HFuPLV2TN0PuvNWChsn4Ni0IDBZokxXjeJ4HdZzcVghkkW4Kp8qgCmqGNBCiLKeA-AU5qamaBVCYrCnRY_V6gvP7SWt7Q"
                  alt="Base character"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Slot badges around avatar */}
              {[
                { slot: 'jacket', label: 'JACKET', pos: 'absolute -top-3 -left-3' },
                { slot: 'visor',  label: 'VISOR',  pos: 'absolute -top-3 -right-3' },
                { slot: 'shoes',  label: 'SHOES',  pos: 'absolute -bottom-3 left-1/2 -translate-x-1/2' },
              ].map(({ slot, label, pos }) => {
                const equippedItem = SHOP_ITEMS.find(
                  item => item.slot === slot && isEquipped(item)
                )
                return (
                  <div key={slot} className={pos}>
                    {equippedItem ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-14 h-14 rounded-full border-[3px] border-[#00e3fd] shadow-[0_0_12px_#00e3fd80,0_4px_0_#120a21] bg-[#120a21] overflow-hidden"
                        title={equippedItem.name}
                      >
                        <img src={equippedItem.image} alt={equippedItem.name} className="w-full h-full object-cover" />
                      </motion.div>
                    ) : (
                      <div
                        className="w-14 h-14 rounded-full border-[3px] border-dashed border-[#39304a] bg-[#120a21] flex flex-col items-center justify-center gap-0.5 opacity-50"
                        title={`${label} slot empty`}
                      >
                        <span className="material-symbols-outlined text-[#39304a] text-[18px]">category</span>
                        <span className="font-black text-[8px] text-[#39304a] uppercase" style={{ fontFamily: 'Rubik' }}>{label}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-center font-medium text-[12px] text-[#a98893] mt-6" style={{ fontFamily: 'Rubik' }}>
              Equip items from the shop below to see them appear here.
            </p>
          </div>

          {/* Items grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-64 bg-[#231b34] rounded-3xl animate-pulse border-4 border-[#120a21]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
              <AnimatePresence>
                {SHOP_ITEMS.map(item => {
                  const owned = isOwned(item)
                  const equipped = isEquipped(item)
                  const free = item.price === 0
                  const canAfford = (character?.coins ?? 0) >= item.price

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`group relative bg-[#231b34] rounded-3xl p-5 shadow-[0_6px_0_#120a21] flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_0_#120a21] ${equipped ? 'ring-2 ring-[#00e3fd]' : ''}`}
                    >
                      {/* Badge sticker */}
                      <div className={`absolute -top-4 left-3 z-10 ${item.badgeColor} font-black text-[12px] px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_3px_0_#120a21] -rotate-2 flex items-center gap-1`} style={{ fontFamily: 'Rubik' }}>
                        <span className="material-symbols-outlined text-[14px]">stars</span>
                        <span>{item.badge}</span>
                      </div>

                      <div className="relative w-full">
                        <div className="w-full h-44 rounded-2xl bg-[#120a21] overflow-hidden relative flex items-center justify-center p-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain drop-shadow-[0_8px_0_#120a21] transition-transform duration-300 group-hover:scale-105"
                          />
                          {equipped && (
                            <div className="absolute bottom-3 right-3 bg-[#00e3fd] text-[#00363d] font-black text-[10px] px-2.5 py-1 rounded-full uppercase shadow-[0_2px_0_#120a21] flex items-center gap-1" style={{ fontFamily: 'Rubik' }}>
                              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              ACTIVE
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <h2 className="font-black text-[18px] uppercase tracking-wide text-[#eaddff]" style={{ fontFamily: 'Rubik' }}>{item.name}</h2>
                            <span className="shrink-0 font-black text-[9px] bg-[#2e263f] text-[#bdf4ff] px-2 py-0.5 rounded-full border border-[#39304a] uppercase" style={{ fontFamily: 'Rubik' }}>{item.slot}</span>
                          </div>
                          <p className="font-medium text-[13px] text-[#e1bdc8]" style={{ fontFamily: 'Rubik' }}>{item.description}</p>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 flex items-center justify-between gap-3 bg-[#2e263f] p-3 rounded-2xl">
                        {/* Price or status */}
                        {free || owned ? (
                          <div className="flex items-center gap-2 bg-[#120a21] px-3 py-1.5 rounded-xl">
                            <span className="font-black text-[12px] uppercase text-[#00e3fd]" style={{ fontFamily: 'Rubik' }}>
                              {free ? 'STARTER' : 'OWNED'}
                            </span>
                          </div>
                        ) : (
                          <div className={`flex items-center gap-1.5 bg-[#120a21] px-3 py-1.5 rounded-xl ${!canAfford ? 'opacity-50' : ''}`}>
                            <span className="text-xl leading-none">🪙</span>
                            <span className="font-black text-[20px] text-[#ffba20]" style={{ fontFamily: 'Rubik' }}>{item.price.toLocaleString()}</span>
                          </div>
                        )}

                        {/* Action button */}
                        {(free || owned) && !equipped && (
                          <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ y: 2 }}
                            onClick={() => handleEquip(item)}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-black text-[14px] uppercase bg-[#3e354f] text-[#eaddff] shadow-[0_4px_0_#120a21] hover:bg-[#00e3fd] hover:text-[#00363d] transition-all"
                            style={{ fontFamily: 'Rubik' }}
                          >
                            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                            EQUIP
                          </motion.button>
                        )}
                        {(free || owned) && equipped && (
                          <div className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-black text-[14px] uppercase bg-[#00e3fd] text-[#00363d] shadow-[0_4px_0_#120a21]" style={{ fontFamily: 'Rubik' }}>
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            EQUIPPED
                          </div>
                        )}
                        {!owned && !free && canAfford && (
                          <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ y: 2 }}
                            onClick={() => handleBuy(item)}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-black text-[14px] uppercase bg-[#ffba20] text-[#271900] shadow-[0_4px_0_#120a21] hover:bg-[#ffdea8] transition-all"
                            style={{ fontFamily: 'Rubik' }}
                          >
                            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                            PURCHASE
                          </motion.button>
                        )}
                        {!owned && !free && !canAfford && (
                          <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-[12px] uppercase bg-[#39304a] text-[#a98893] border-2 border-[#120a21]" style={{ fontFamily: 'Rubik' }}>
                            <span className="material-symbols-outlined text-[16px]">lock</span>
                            NEED MORE COINS
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 font-black text-[16px] px-5 py-3 rounded-2xl shadow-[0_6px_0_#120a21] flex items-center gap-3 border-[3px] border-[#120a21] ${
              toast.type === 'error' ? 'bg-[#93000a] text-[#ffb4ab]'
              : toast.type === 'info' ? 'bg-[#2e263f] text-[#eaddff]'
              : 'bg-[#ffba20] text-[#271900]'
            }`}
            style={{ fontFamily: 'Rubik' }}
          >
            <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'check'}</span>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlock modal */}
      <AnimatePresence>
        {unlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#120a21]/80"
            onClick={() => setUnlockModal(null)}
          >
            <motion.div
              initial={{ scale: 0.7, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 20 }}
              className="relative w-full max-w-md bg-[#231b34] rounded-3xl p-6 sm:p-8 shadow-[0_12px_0_#120a21] flex flex-col items-center text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute -top-6 bg-[#ff45a3] text-[#570032] font-black text-[16px] uppercase px-6 py-2 rounded-2xl shadow-[0_6px_0_#120a21] -rotate-2 flex items-center gap-2" style={{ fontFamily: 'Rubik' }}>
                <span className="material-symbols-outlined text-[18px]">military_tech</span>
                ITEM UNLOCKED!
              </div>
              <div className="mt-4 w-36 h-36 bg-[#2e263f] rounded-full flex items-center justify-center shadow-[0_6px_0_#120a21]">
                <img src={unlockModal.image} alt={unlockModal.name} className="w-28 h-28 object-contain" />
              </div>
              <div className="mt-5 flex flex-col items-center gap-1">
                <span className="font-black text-[12px] uppercase tracking-wider text-[#00e3fd]" style={{ fontFamily: 'Rubik' }}>NEW GEAR UNLOCKED</span>
                <h3 className="font-black text-[22px] uppercase text-[#eaddff]" style={{ fontFamily: 'Rubik' }}>{unlockModal.name}</h3>
                <p className="font-medium text-[14px] text-[#e1bdc8] max-w-xs" style={{ fontFamily: 'Rubik' }}>Stored in your inventory! Equip it now.</p>
              </div>
              <div className="mt-6 w-full flex items-center gap-3">
                <button onClick={() => setUnlockModal(null)} className="flex-1 bg-[#2e263f] text-[#eaddff] font-black text-[14px] uppercase py-3 rounded-xl shadow-[0_4px_0_#120a21] hover:bg-[#3e354f] transition-all" style={{ fontFamily: 'Rubik' }}>CLOSE</button>
                <button onClick={() => { handleEquip(unlockModal); setUnlockModal(null) }} className="flex-1 bg-[#ff45a3] text-[#570032] font-black text-[14px] uppercase py-3 rounded-xl shadow-[0_4px_0_#120a21] hover:bg-[#ffd9e4] transition-all" style={{ fontFamily: 'Rubik' }}>EQUIP NOW</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
