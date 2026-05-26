import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')

serve(async (req) => {
  try {
    const { message, file, fileName, caption } = await req.json()

    // Si hay un archivo adjunto (Base64)
    if (file && fileName) {
      const binaryString = atob(file)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const formData = new FormData()
      formData.append('chat_id', CHAT_ID!)
      formData.append('document', new File([bytes], fileName, { type: 'text/csv' }))
      if (caption) formData.append('caption', caption)
      formData.append('parse_mode', 'Markdown')

      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        body: formData,
      })
      return new Response(JSON.stringify(await res.json()), { headers: { 'Content-Type': 'application/json' } })
    }

    // Si es solo un mensaje de texto
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    return new Response(JSON.stringify(await res.json()), { 
      headers: { 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    })
  }
})