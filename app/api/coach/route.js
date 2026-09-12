import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const data = await request.json()

    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is missing")
      return NextResponse.json({ error: 'API key missing' }, { status: 500 })
    }

    const systemPrompt = `Tum ek friendly, motivating game coach ho ek RPG-style productivity app ke liye. User ka data dekhkar 2-3 line ka chhota, personalized insight do — unka strongest attribute highlight karo, weakest area pe ek actionable suggestion do. RPG/game language use karo (jaise 'quest', 'level up'), casual aur encouraging tone rakho.`

    const userMessage = JSON.stringify({
      level: data.level,
      streak: data.streak,
      completedMissionsCount: data.completedTasksCount,
      attributes: data.attributes
    })

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API responded with status ${response.status}`)
    }

    const result = await response.json()
    const insight = result.choices?.[0]?.message?.content || "Keep grinding, Runner! Every completed mission makes you stronger."

    return NextResponse.json({ insight })
  } catch (error) {
    console.error("Coach API Error:", error)
    return NextResponse.json({ insight: "Keep grinding, Runner! Every completed mission makes you stronger." })
  }
}
