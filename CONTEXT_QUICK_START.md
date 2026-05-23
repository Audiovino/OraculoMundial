# 🚀 Context Handoff — Quick Start

## ⚡ 30 Segundos para Empezar

### Opción 1: VS Code (Recomendado)
```
Ctrl+Shift+P → Tasks: Run Task → 💾 Save Context to Obsidian
```

### Opción 2: Terminal
```powershell
cd c:\Proyectos\OraculoMundial
.\scripts\context-saver.ps1
```

### Opción 3: Kiro (Automático)
✅ Ya está configurado. Se guarda automáticamente al 80% de tokens.

---

## 📁 Archivos Creados

```
c:\Proyectos\OraculoMundial\
├── scripts/
│   ├── context-saver.ps1                    # Guardar sesión
│   ├── context-loader.ps1                   # Cargar sesión
│   └── antigravity-context-integration.py   # Integración Python
├── .vscode/
│   ├── tasks.json                           # VS Code tasks
│   └── cline-settings.json                  # Cline config
├── context-dashboard.html                   # Dashboard visual
├── CONTEXT_HANDOFF_GUIDE.md                 # Guía completa
└── CONTEXT_QUICK_START.md                   # Este archivo
```

---

## 🎯 Dónde se Guardan las Sesiones

```
C:\Proyectos\Propgear-AI\Propgear-Notas\Sesiones-Kiro\
```

Cada sesión es un archivo `.md` con:
- Timestamp exacto
- Archivos modificados
- Estado de Git
- Próximos pasos

---

## 🔄 Flujo Típico

1. **Trabajás en VS Code/Kiro/Antigravity**
2. **Se agota el contexto** (o lo decidís vos)
3. **Guardás:** `Ctrl+Shift+P` → `💾 Save Context`
4. **Cerrás la sesión**
5. **Abrís Obsidian** → `Sesiones-Kiro` → Ves la sesión guardada
6. **Continuás en nueva sesión:** `Ctrl+Shift+P` → `📖 Load Context`
7. **Continuás desde donde se quedó**

---

## 🎮 Comandos Rápidos

### Guardar
```powershell
# VS Code
Ctrl+Shift+P → Tasks: Run Task → 💾 Save Context to Obsidian

# Terminal
.\scripts\context-saver.ps1 -SessionName "mi-sesion"

# Python (Antigravity)
python scripts/antigravity-context-integration.py save "mi-sesion"
```

### Cargar
```powershell
# VS Code
Ctrl+Shift+P → Tasks: Run Task → 📖 Load Context from Obsidian

# Terminal
.\scripts\context-loader.ps1 -SessionName "mi-sesion"

# Python (Antigravity)
python scripts/antigravity-context-integration.py load "mi-sesion"
```

### Ver Sesiones
```powershell
# Terminal
.\scripts\context-loader.ps1

# Python
python scripts/antigravity-context-integration.py list
```

---

## 🌐 Dashboard Visual

Abrí en el navegador:
```
file:///c:/Proyectos/OraculoMundial/context-dashboard.html
```

O desde terminal:
```powershell
start c:\Proyectos\OraculoMundial\context-dashboard.html
```

---

## ✅ Verificación Rápida

```powershell
# 1. Verificá que los scripts existen
Test-Path c:\Proyectos\OraculoMundial\scripts\context-saver.ps1

# 2. Verificá que la carpeta de sesiones existe
Test-Path C:\Proyectos\Propgear-AI\Propgear-Notas\Sesiones-Kiro

# 3. Probá guardar una sesión
cd c:\Proyectos\OraculoMundial
.\scripts\context-saver.ps1 -SessionName "test"

# 4. Verificá que se guardó
Get-ChildItem C:\Proyectos\Propgear-AI\Propgear-Notas\Sesiones-Kiro
```

---

## 🔗 Documentación Completa

Para más detalles, abrí:
- **`CONTEXT_HANDOFF_GUIDE.md`** — Guía completa con troubleshooting
- **`context-dashboard.html`** — Dashboard visual interactivo

---

## 🆘 Problemas Comunes

### "Sesión no encontrada"
```powershell
# Crear carpeta si no existe
New-Item -ItemType Directory -Force -Path "C:\Proyectos\Propgear-AI\Propgear-Notas\Sesiones-Kiro"
```

### "Access denied" en scripts
```powershell
# Permitir ejecución
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### VS Code no encuentra tasks
- Verificá que estés en el workspace: `c:\Proyectos\OraculoMundial`
- Recargá VS Code: `Ctrl+Shift+P` → `Developer: Reload Window`

---

## 🎯 Próximos Pasos

1. ✅ Probá guardar una sesión desde VS Code
2. ✅ Probá cargar una sesión
3. ✅ Abrí el dashboard visual
4. ✅ Lee la guía completa si necesitás más detalles

---

*Sistema de Context Handoff v1.0 — 2026-05-23*
