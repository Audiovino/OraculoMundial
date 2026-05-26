import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables for daily-location-report.')
}

serve(async () => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/mundial_users?select=id,username,email,created_at,latitude,longitude,location_address,detected_building,location_city,location_region,location_country,location_source,last_location_at`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Supabase request failed: ${response.status} ${errorBody}`)
    }

    const users = await response.json() as Array<Record<string, any>>
    const locationUsers = users
      .filter((user) => user.last_location_at)
      .sort((a, b) => new Date(b.last_location_at).getTime() - new Date(a.last_location_at).getTime())
      .slice(0, 20)

    const countWithLocation = locationUsers.length
    const totalUsers = users.length

    const summaryLines = [
      `*Informe diario de ubicaciones*`,
      `Usuarios totales: ${totalUsers}`,
      `Usuarios con ubicación registrada: ${countWithLocation}`,
      '',
      '*Últimos accesos*:'
    ]

    if (locationUsers.length === 0) {
      summaryLines.push('No se han registrado ubicaciones en el periodo.')
    } else {
      locationUsers.forEach((user, index) => {
        const time = new Date(user.last_location_at).toLocaleString('es-ES', { timeZone: 'UTC' })
        const label = user.username || user.email || 'Usuario'
        const address = user.location_address || `${user.location_city || ''} ${user.location_region || ''} ${user.location_country || ''}`.trim() || 'Dirección no disponible'
        summaryLines.push(`${index + 1}. ${label} — ${address} — ${time}`)
      })
    }

    const text = summaryLines.join('\n')

    const telegramRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    })

    if (!telegramRes.ok) {
      const telegramBody = await telegramRes.text()
      throw new Error(`Telegram request failed: ${telegramRes.status} ${telegramBody}`)
    }

    return new Response(await telegramRes.text(), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
