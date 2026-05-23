# 🧠 Context Handoff Guide — Cuando se Agota el Contexto

Tenés **3 formas** de guardar y cargar contexto cuando se agota el token budget en Kiro, Antigravity o VS Code.

---

## 🎯 Opción 1: VS Code (Más Rápido)

### Guardar Contexto
1. Abrí la **Command Palette** (`Ctrl+Shift+P`)
2. Buscá: `Tasks: Run Task`
3. Seleccioná: **💾 Save Context to Obsidian**
4. ✅ Se guarda automáticamente en Obsidian

### Cargar Contexto
1. Abrí la **Command Palette** (`Ctrl+Shift+P`)
2. Buscá: `Tasks: Run Task`
3. Seleccioná: **📖 Load Context from Obsidian**
4. Elegí la sesión que querés cargar

---

## 🎯 Opción 2: Terminal PowerShell (Más Control)

### Guardar Contexto
```powershell
cd c:\Proyectos\OraculoMundial
.\scripts\context-saver.ps1 -SessionName "mi-sesion-importante"
```

**Output esperado:**
```
✅ SESIÓN GUARDADA
📁 Archivo: C:\Proyectos\Propgear-AI\Propgear-Notas\Sesiones-Kiro\mi-sesion-importante.md
📊 Archivos modificados: 5
```

### Cargar Contexto
```powershell
cd c:\Proyectos\OraculoMundial
.\scripts\context-loader.ps1 -SessionName "mi-sesion-importante"
```

O sin parámetro para ver todas las sesiones:
```powershell
.\scripts\context-loader.ps1
```

---

## 🎯 Opción 3: Kiro (Automático)

### Auto-Save Activado ✅
Kiro tiene un **hook automático** que guarda contexto cuando detecta que estás al 80% del token budget.

**Qué hace:**
- Detecta cuando se agota el contexto
- Guarda automáticamente en Obsidian
- Te avisa en el chat

**Ubicación del hook:**
```
Kiro → Agent Hooks → auto-save-context-80pct
```

---

## 📁 Dónde se Guardan las Sesiones

Todas las sesiones se guardan en:
```
C:\Proyectos\Propgear-AI\Propgear-Notas\Sesiones-Kiro\
```

**Estructura de cada sesión:**
```markdown
---
fecha: 2026-05-23 14:30:00
tags: [sesion, kiro, propgear, context-handoff]
workspace: c:\Proyectos\OraculoMundial
ide: vscode
---

# Sesión sesion-2026-05-23-1430

## 📋 Resumen Rápido
- Workspace: c:\Proyectos\OraculoMundial
- Hora: 14:30:00
- Archivos modificados: 5

## 📝 Archivos Modificados (últimas 2 horas)
- ./src/components/AdminDashboard.tsx
- ./src/services/hermesAgents.ts
- ...

## 🔧 Estado de Git
M  src/components/AdminDashboard.tsx
M  src/services/hermesAgents.ts
```

---

## 🚀 Flujo Recomendado

### Cuando se agota el contexto:

1. **En VS Code:**
   - `Ctrl+Shift+P` → `Tasks: Run Task` → `💾 Save Context to Obsidian`
   - Se guarda automáticamente

2. **Abrí Obsidian:**
   - Navega a `Sesiones-Kiro`
   - Abrí la sesión más reciente
   - Revisá qué archivos se modificaron

3. **Continuá en una nueva sesión:**
   - Abrí Kiro nuevamente
   - `Ctrl+Shift+P` → `Tasks: Run Task` → `📖 Load Context from Obsidian`
   - Seleccioná la sesión anterior
   - Continuá desde donde se quedó

---

## 💡 Tips

### Guardar manualmente antes de cambiar de IDE
```powershell
# Antes de cerrar VS Code y abrir Antigravity:
.\scripts\context-saver.ps1 -SessionName "cambio-a-antigravity"
```

### Ver todas las sesiones guardadas
```powershell
.\scripts\context-loader.ps1
# Muestra las últimas 10 sesiones
```

### Limpiar sesiones antiguas (>30 días)
```powershell
$SessionDir = "C:\Proyectos\Propgear-AI\Propgear-Notas\Sesiones-Kiro"
Get-ChildItem -Path $SessionDir -Filter "*.md" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
    Remove-Item -Force
```

---

## 🔗 Integración con Antigravity

Si usás Antigravity, podés agregar esto a tu `crew_agent.py`:

```python
import subprocess
import datetime

def save_context_to_obsidian(session_name=None):
    """Guarda contexto actual en Obsidian"""
    if not session_name:
        session_name = f"antigravity-{datetime.datetime.now().strftime('%Y-%m-%d-%H%M')}"
    
    cmd = [
        "powershell",
        "-NoProfile",
        "-Command",
        f"cd c:\\Proyectos\\OraculoMundial; .\\scripts\\context-saver.ps1 -SessionName '{session_name}'"
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    return session_name

# Uso:
# save_context_to_obsidian("mi-sesion-antigravity")
```

---

## ✅ Checklist

- [ ] Scripts creados en `c:\Proyectos\OraculoMundial\scripts\`
- [ ] VS Code tasks configuradas (`.vscode\tasks.json`)
- [ ] Kiro hook activado (`auto-save-context-80pct`)
- [ ] Obsidian vault accesible en `C:\Proyectos\Propgear-AI\Propgear-Notas`
- [ ] Probé guardar contexto desde VS Code
- [ ] Probé cargar contexto desde VS Code
- [ ] Probé desde terminal PowerShell

---

## 🆘 Troubleshooting

### "Sesión no encontrada"
```powershell
# Verificá que la carpeta existe:
Test-Path "C:\Proyectos\Propgear-AI\Propgear-Notas\Sesiones-Kiro"

# Si no existe, créala:
New-Item -ItemType Directory -Force -Path "C:\Proyectos\Propgear-AI\Propgear-Notas\Sesiones-Kiro"
```

### "Access denied" en scripts
```powershell
# Permitir ejecución de scripts locales:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### VS Code no encuentra los scripts
- Verificá que estés en el workspace correcto
- Probá con ruta absoluta: `c:\Proyectos\OraculoMundial\scripts\context-saver.ps1`

---

## 📞 Soporte Rápido

**Guardar ahora:**
```powershell
cd c:\Proyectos\OraculoMundial; .\scripts\context-saver.ps1
```

**Cargar última sesión:**
```powershell
cd c:\Proyectos\OraculoMundial; .\scripts\context-loader.ps1
```

**Ver todas las sesiones:**
```powershell
Get-ChildItem "C:\Proyectos\Propgear-AI\Propgear-Notas\Sesiones-Kiro" | Sort-Object LastWriteTime -Descending
```

---

*Última actualización: 2026-05-23*
