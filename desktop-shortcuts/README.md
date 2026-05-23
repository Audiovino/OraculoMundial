# 🚀 Desktop Shortcuts — Acceso Rápido a IDEs Gratis

## ¿Qué es esto?

Archivos `.bat` para abrir rápidamente tus IDEs locales (Ollama + Qwen3) con un click desde el escritorio.

---

## 📋 Archivos Disponibles

| Archivo | Qué Hace | Atajo |
|---------|----------|-------|
| **1-Ollama-Qwen3.bat** | Chat directo con Qwen3 | Click → Chat local |
| **2-VS-Code-Cline.bat** | Abre VS Code con Cline | Click → IDE completo |
| **3-Antigravity-CrewAI.bat** | Agentes locales con CrewAI | Click → Multi-agentes |
| **4-Kiro-Local.bat** | Abre Kiro (este IDE) | Click → Kiro |
| **5-Obsidian-Vault.bat** | Abre Obsidian con vault | Click → Notas |
| **6-Ollama-Status.bat** | Ver estado de Ollama | Click → Status |
| **7-Save-Context.bat** | Guardar sesión | Click → Guardar |
| **8-Load-Context.bat** | Cargar sesión | Click → Cargar |

---

## 🎯 Cómo Usar

### Opción 1: Copiar al Escritorio (Recomendado)

1. **Abrí esta carpeta:**
   ```
   c:\Proyectos\OraculoMundial\desktop-shortcuts\
   ```

2. **Seleccioná los .bat que querés:**
   - Todos (para acceso completo)
   - O solo los que usés frecuentemente

3. **Copialos al escritorio:**
   - Click derecho → Copiar
   - Ir al escritorio
   - Click derecho → Pegar

4. **Listo!** Ahora tenés acceso rápido con un click

### Opción 2: Crear Accesos Directos

1. **Click derecho en el .bat**
2. **Enviar a → Escritorio (crear acceso directo)**
3. **Listo!** Aparece en el escritorio

### Opción 3: Ejecutar desde PowerShell

```powershell
# Desde cualquier lugar:
c:\Proyectos\OraculoMundial\desktop-shortcuts\1-Ollama-Qwen3.bat
```

---

## 🎮 Uso Rápido

### 1️⃣ Chat Local (Qwen3)
```
Double-click: 1-Ollama-Qwen3.bat
```
Se abre chat directo en terminal con Qwen3

### 2️⃣ VS Code + Cline (IDE Completo)
```
Double-click: 2-VS-Code-Cline.bat
```
Se abre VS Code con Cline configurado para Ollama

### 3️⃣ Agentes (CrewAI)
```
Double-click: 3-Antigravity-CrewAI.bat
```
Se abre Antigravity con agentes multi-tarea

### 4️⃣ Kiro (Este IDE)
```
Double-click: 4-Kiro-Local.bat
```
Verifica que Ollama esté corriendo

### 5️⃣ Obsidian (Notas)
```
Double-click: 5-Obsidian-Vault.bat
```
Se abre Obsidian con tu vault

### 6️⃣ Ver Estado de Ollama
```
Double-click: 6-Ollama-Status.bat
```
Muestra modelos disponibles

### 7️⃣ Guardar Contexto
```
Double-click: 7-Save-Context.bat
```
Guarda sesión actual en Obsidian

### 8️⃣ Cargar Contexto
```
Double-click: 8-Load-Context.bat
```
Carga sesión guardada

---

## 🔧 Configuración

### Verificar que Ollama esté instalado
```powershell
ollama --version
```

### Verificar modelos disponibles
```powershell
ollama list
```

### Descargar modelos si faltan
```powershell
ollama pull qwen2:7b
ollama pull hermes3
ollama pull gemma4
```

---

## 💡 Tips

### Crear carpeta en escritorio para los .bat
1. Click derecho en escritorio
2. Nuevo → Carpeta
3. Nombrar: "IDEs Locales"
4. Copiar todos los .bat ahí
5. Listo! Acceso organizado

### Cambiar icono de los .bat
1. Click derecho en el .bat
2. Propiedades
3. Cambiar icono
4. Seleccionar uno que te guste

### Crear acceso directo con tecla rápida
1. Click derecho en el .bat
2. Propiedades
3. Pestaña "Acceso directo"
4. Campo "Tecla de acceso rápido"
5. Presionar la combinación que querés (ej: Ctrl+Alt+Q)

---

## 🚀 Flujo Típico

```
1. Double-click: 1-Ollama-Qwen3.bat
   ↓
2. Chat con Qwen3 en terminal
   ↓
3. Si necesitás IDE: Double-click: 2-VS-Code-Cline.bat
   ↓
4. Codificás en VS Code con Cline
   ↓
5. Se agota contexto: Double-click: 7-Save-Context.bat
   ↓
6. Continuás después: Double-click: 8-Load-Context.bat
```

---

## 📊 Stack Gratis

| Componente | Herramienta | Costo |
|-----------|-----------|-------|
| **LLM** | Qwen2:7b (Ollama) | Gratis |
| **IDE** | VS Code + Cline | Gratis |
| **Agentes** | CrewAI | Gratis |
| **Chat** | Ollama CLI | Gratis |
| **Notas** | Obsidian | Gratis |
| **Este IDE** | Kiro | Gratis |
| **Total** | **TODO** | **Gratis** |

---

## 🆘 Troubleshooting

### "No se reconoce el comando ollama"
```powershell
# Agregar Ollama al PATH:
$env:Path += ";C:\Users\gerad\AppData\Local\Programs\Ollama"
```

### "Ollama no inicia"
```powershell
# Iniciar manualmente:
C:\Users\gerad\AppData\Local\Programs\Ollama\ollama.exe serve
```

### "VS Code no abre"
```powershell
# Verificar que code esté en PATH:
code --version
```

### "CrewAI no funciona"
```powershell
# Verificar entorno virtual:
C:\Users\gerad\.gemini\antigravity\scratch\antigravity-backup\venv\Scripts\activate.bat
```

---

## 📞 Comandos Útiles

### Abrir carpeta de shortcuts desde PowerShell
```powershell
explorer c:\Proyectos\OraculoMundial\desktop-shortcuts\
```

### Copiar todos los .bat al escritorio
```powershell
Copy-Item "c:\Proyectos\OraculoMundial\desktop-shortcuts\*.bat" "$env:USERPROFILE\Desktop\"
```

### Ver qué .bat hay disponibles
```powershell
Get-ChildItem c:\Proyectos\OraculoMundial\desktop-shortcuts\*.bat
```

---

## 🎓 Resumen

**Antes:** Rutas largas, comandos complejos, difícil de recordar

**Ahora:** Double-click en el escritorio → Todo funciona

**Resultado:** Acceso rápido a IDEs gratis sin complicaciones 🚀

---

*Desktop Shortcuts v1.0 — 2026-05-23*

**¿Necesitás ayuda? Abrí cualquier .bat y verás instrucciones.**
