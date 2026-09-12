import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { messages } = await request.json()

    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is missing")
      return NextResponse.json({ error: 'API key missing' }, { status: 500 })
    }

    const systemPrompt = `You are the in-app assistant for "Neon Drift — Life RPG," a gamified productivity web app. Help the user understand how to use the app. Here is what the app does:

- Users complete real-life tasks ("missions") in categories: Focus, Strength, Discipline
- Completing a mission gives XP and coins, and increases the matching attribute
- Gaining enough XP levels up the character
- There's a daily streak counter for consistent activity
- The Shop ("Shop") lets users spend coins on cosmetic items (jackets, visors, shoes) and equip them
- Boss Battle is a shared challenge — completing missions automatically damages the boss, no manual action needed
- Pages: Dashboard, Tasks/Missions, Shop, Boss Battle, Profile

Answer briefly (2-4 sentences), in a friendly, encouraging tone. If asked something unrelated to this app, politely redirect the conversation back to how you can help them use Neon Drift.`

    const payloadMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: payloadMessages,
        max_tokens: 300,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Groq API failed: ${response.status} - ${errorText}`)
      throw new Error(`Groq API responded with status ${response.status}`)
    }

    const result = await response.json()
    const reply = result.choices?.[0]?.message?.content || "Hmm, I'm having trouble connecting right now. Try again in a moment, or explore the navbar — Tasks, Shop, and Boss Battle are all there!"

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json({ error: "Hmm, I'm having trouble connecting right now. Try again in a moment, or explore the navbar — Tasks, Shop, and Boss Battle are all there!" }, { status: 500 })
  }
}
