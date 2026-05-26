import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ─── Helpers ───
const esc = (s: string) => s.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')

async function sendTelegram(text: string) {
  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      }),
    }
  )
  if (!res.ok) {
    const body = await res.text()
    console.error('Telegram error:', res.status, body)
  }
  return res
}

// ─── Main handler ───
serve(async () => {
  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD
    const yesterday = new Date(now.getTime() - 86400000).toISOString()

    // 1. All users
    const { data: allUsers, error: usersErr } = await supabase
      .from('mundial_users')
      .select('id, user_id, email, team_alias, detected_building, location_city, location_country, created_at, last_location_at')
      .order('created_at', { ascending: false })

    if (usersErr) throw new Error(`Users query error: ${usersErr.message}`)
    const users = allUsers ?? []

    // 2. New users (registered in the last 24h)
    const newUsers = users.filter(u => u.created_at && u.created_at >= yesterday)

    // 3. Active users (visited in the last 24h)
    const activeUsers = users.filter(u => u.last_location_at && u.last_location_at >= yesterday)

    // 4. Predictions made today
    const { data: todayPreds, error: predsErr } = await supabase
      .from('mundial_predictions')
      .select('user_id, match_id, created_at')
      .gte('created_at', yesterday)

    if (predsErr) console.warn('Predictions query error:', predsErr.message)
    const preds = todayPreds ?? []

    // Count predictions per user
    const predCountByUser: Record<string, number> = {}
    for (const p of preds) {
      predCountByUser[p.user_id] = (predCountByUser[p.user_id] || 0) + 1
    }

    // Classify engagement
    const highEngagement: string[] = [] // >5 predictions
    const midEngagement: string[] = []  // 2-5 predictions
    const lowEngagement: string[] = []  // 1 prediction

    for (const [uid, count] of Object.entries(predCountByUser)) {
      const user = users.find(u => u.user_id === uid || u.id === uid)
      const label = user?.team_alias || user?.email?.split('@')[0] || uid.slice(0, 8)
      if (count > 5) highEngagement.push(`${label} (${count})`)
      else if (count >= 2) midEngagement.push(`${label} (${count})`)
      else lowEngagement.push(`${label} (${count})`)
    }

    // 5. Rankings (top 5)
    const { data: rankings } = await supabase
      .from('mundial_rankings')
      .select('username, total_points, position')
      .order('position', { ascending: true })
      .limit(5)

    // ─── Build the message ───
    const lines: string[] = []

    lines.push(`⚽ *ORÁCULO MUNDIAL \\- REPORTE DIARIO*`)
    lines.push(`📅 ${esc(now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}`)
    lines.push(`🕐 ${esc(now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }))}`)
    lines.push('')

    // ── Summary ──
    lines.push(`📊 *RESUMEN GENERAL*`)
    lines.push(`👥 Usuarios totales: *${users.length}*`)
    lines.push(`🆕 Nuevos hoy: *${newUsers.length}*`)
    lines.push(`🟢 Activos hoy: *${activeUsers.length}*`)
    lines.push(`🎯 Predicciones hoy: *${preds.length}*`)
    lines.push('')

    // ── New users ──
    if (newUsers.length > 0) {
      lines.push(`🆕 *NUEVOS REGISTROS*`)
      for (const u of newUsers.slice(0, 10)) {
        const alias = u.team_alias || u.email?.split('@')[0] || 'Anon'
        const loc = u.location_city || u.location_country || u.detected_building || '📍 Pendiente'
        lines.push(`  • ${esc(alias)} — ${esc(loc)}`)
      }
      if (newUsers.length > 10) lines.push(`  _\\.\\.\\. y ${newUsers.length - 10} más_`)
      lines.push('')
    }

    // ── Active users with location ──
    if (activeUsers.length > 0) {
      lines.push(`🟢 *ACCESOS RECIENTES \\(últimas 24h\\)*`)
      for (const u of activeUsers.slice(0, 15)) {
        const alias = u.team_alias || u.email?.split('@')[0] || 'Anon'
        const building = u.detected_building || u.location_city || u.location_country || '—'
        const time = u.last_location_at ? new Date(u.last_location_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '?'
        lines.push(`  • ${esc(alias)} 📍${esc(building)} 🕐${esc(time)}`)
      }
      if (activeUsers.length > 15) lines.push(`  _\\.\\.\\. y ${activeUsers.length - 15} más_`)
      lines.push('')
    }

    // ── Engagement ──
    lines.push(`🎮 *NIVEL DE ENGAGEMENT*`)
    if (highEngagement.length > 0) {
      lines.push(`  🔥 Alto \\(\\>5 pred\\.\\): ${esc(highEngagement.join(', '))}`)
    }
    if (midEngagement.length > 0) {
      lines.push(`  ⚡ Medio \\(2\\-5\\): ${esc(midEngagement.join(', '))}`)
    }
    if (lowEngagement.length > 0) {
      lines.push(`  💤 Bajo \\(1\\): ${esc(lowEngagement.join(', '))}`)
    }
    if (highEngagement.length === 0 && midEngagement.length === 0 && lowEngagement.length === 0) {
      lines.push(`  Sin predicciones hoy`)
    }
    lines.push('')

    // ── Rankings ──
    if (rankings && rankings.length > 0) {
      lines.push(`🏆 *TOP 5 RANKING*`)
      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
      for (let i = 0; i < rankings.length; i++) {
        const r = rankings[i]
        lines.push(`  ${medals[i] || `${i + 1}.`} ${esc(r.username || 'Anon')} — ${r.total_points || 0} pts`)
      }
      lines.push('')
    }

    lines.push(`—`)
    lines.push(`_Reporte generado por Hermes Agent 🤖_`)

    const fullMessage = lines.join('\n')

    await sendTelegram(fullMessage)

    return new Response(JSON.stringify({ ok: true, users: users.length, newToday: newUsers.length, predsToday: preds.length }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('daily-activity-report error:', error)
    // Try to send error alert to Telegram
    try {
      await sendTelegram(`❌ *ERROR en Reporte Diario*\n${esc(String(error))}`)
    } catch (_) { /* silencio */ }
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
