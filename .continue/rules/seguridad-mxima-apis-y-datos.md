---
globs: "**/*"
regex: .*
description: Aplicar siempre que se trabaje con Hermes, Obsidian, APIs, datos
  sensibles, credenciales, despliegues o automatizaciones que puedan generar
  coste o riesgo.
alwaysApply: true
---

Antes de conectar herramientas, agentes, Obsidian, APIs, Supabase, Vercel, pagos o automatizaciones, prioriza seguridad: no exponer secrets/tokens/API keys/service role keys, no registrar credenciales en notas/logs, no ejecutar acciones con coste económico o destructivas sin confirmación explícita, y redactar datos sensibles en salidas persistentes.