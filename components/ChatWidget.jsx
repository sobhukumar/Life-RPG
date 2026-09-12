'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey Runner! I'm your Neon Drift assistant. Need help navigating the grid or completing missions?" }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || isTyping) return

    const newMsg = { role: 'user', content: input.trim() }
    const updatedMessages = [...messages, newMsg]
    
    // Keep only last 10 messages for context (to avoid huge payloads)
    const contextMessages = updatedMessages.slice(-10)

    setMessages(updatedMessages)
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: contextMessages })
      })

      if (!res.ok) throw new Error('API failed')
      
      const data = await res.json()
      
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Hmm, I'm having trouble connecting right now. Try again in a moment, or explore the navbar — Tasks, Shop, and Boss Battle are all there!" }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed bottom-28 right-4 sm:bottom-28 sm:right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 bg-[#170f27] border-[4px] border-[#2e263f] rounded-2xl shadow-[0_8px_0_#120a21] overflow-hidden flex flex-col"
            style={{ height: '450px', maxHeight: 'calc(100vh - 100px)' }}
          >
            {/* Header */}
            <div className="bg-[#231b34] p-4 border-b-[3px] border-[#2e263f] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00e3fd] text-[24px]">smart_toy</span>
                <span className="font-black text-[14px] uppercase text-[#eaddff]" style={{ fontFamily: 'Rubik' }}>Drift Assist</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#120a21] text-[#a98893] hover:text-[#ffb4ab] border-2 border-[#120a21] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#120a21]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] px-4 py-2 rounded-2xl font-medium text-[14px] leading-relaxed shadow-[0_3px_0_#0B0616] ${
                      msg.role === 'user'
                        ? 'bg-[#00e3fd] text-[#00363d] rounded-tr-sm border-[3px] border-[#0B0616]'
                        : 'bg-[#39304a] text-[#eaddff] rounded-tl-sm border-[3px] border-[#170f27]'
                    }`}
                    style={{ fontFamily: 'Rubik' }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#39304a] text-[#00e3fd] px-4 py-3 rounded-2xl rounded-tl-sm border-[3px] border-[#170f27] shadow-[0_3px_0_#0B0616]">
                    <span className="material-symbols-outlined animate-pulse text-[18px]">more_horiz</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#231b34] border-t-[3px] border-[#2e263f] shrink-0">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Neon Drift..."
                  className="flex-1 bg-[#120a21] text-[#eaddff] placeholder:text-[#a98893] px-4 py-2 rounded-xl border-[2px] border-[#2e263f] focus:outline-none focus:border-[#00e3fd] text-[14px] font-medium transition-colors"
                  style={{ fontFamily: 'Rubik' }}
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-[#ff45a3] text-[#570032] border-[3px] border-[#120a21] shadow-[0_3px_0_#120a21] disabled:opacity-50 transition-transform active:translate-y-1 active:shadow-none"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95, y: 0 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#00e3fd] text-[#00363d] flex items-center justify-center border-[4px] border-[#120a21] shadow-[0_6px_0_#120a21] relative z-50"
      >
        <span className="material-symbols-outlined text-[28px]">
          {isOpen ? 'keyboard_arrow_down' : 'chat'}
        </span>
      </motion.button>
    </div>
  )
}
