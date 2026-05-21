import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { report } = await req.json()
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN")
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID")

  if (!token || !chatId) {
    return new Response(JSON.stringify({ error: "Configuración de Telegram faltante en el servidor" }), { status: 500 })
  }

  const emoji = report.overallStatus === 'critical' ? '🔴' : '⚠️';
  const header = `*🚀 ALERTA MUNDIAL - Hermes Assistant*`;
  const body = `
${emoji} *Estado:* ${report.overallStatus.toUpperCase()}
🕒 *Fecha:* ${new Date(report.timestamp).toLocaleString()}

🔍 *Resumen de Agentes:*
• Seguridad: ${report.secrets.valid ? '✅' : '❌ ' + (report.secrets.issues[0] || 'Falla')}
• Salud/Uptime: ${report.health.valid ? '✅' : '❌ ' + (report.health.issues[0] || 'Falla')}
• UI/UX: ${report.responsiveness.valid ? '✅' : '❌ ' + (report.responsiveness.issues[0] || 'Falla')}

💡 *Recomendación:* ${report.health.recommendation || report.secrets.recommendation || 'Consultar el Admin Dashboard.'}
  `.trim();

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `${header}\n${body}`,
      parse_mode: 'Markdown'
    })
  })

  const result = await response.json()
  return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } })
})