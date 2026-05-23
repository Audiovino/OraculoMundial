# 🎯 GUÍA COMPLETA: SINCRONIZACIÓN AUTOMÁTICA DE PARTIDOS

## ✅ LO QUE SE IMPLEMENTÓ

### 1. **Sincronización Automática de Resultados**
- ✅ Los resultados se descargan **automáticamente cada 15 minutos** (configurable)
- ✅ **Fallback inteligente**: Si API-Football falla → usa GLM-4 Flash
- ✅ Los puntos se calculan automáticamente cuando se carga un resultado
- ✅ Panel de control para activar/desactivar y ajustar intervalo

### 2. **Dos Fuentes de Datos**
- **API-Football** (primaria): Datos oficiales del Mundial 2026
- **GLM-4 Flash** (fallback): Scraping inteligente si API falla

### 3. **Dashboard Mejorado para Admin**
- Estado de sincronización en tiempo real
- Última sincronización y próxima sincronización
- Contador de partidos cargados
- Configuración visual de intervalo automático

---

## 🚀 CÓMO USAR

### **Opción 1: Sincronización Automática (RECOMENDADO)**

1. Abre el Admin Dashboard → Pestaña **"API & Scraping"**
2. Verás el panel de **"Estado de Sincronización"** con:
   - 🔄 Estado: ACTIVADA
   - ⏱️ Última sincronización
   - ⏭️ Próxima sincronización
   - 📊 Partidos cargados

3. **La sincronización ocurre automáticamente cada 15 minutos**
   - No necesitas hacer nada
   - Los resultados se descargan solos
   - Los puntos se calculan automáticamente

### **Opción 2: Sincronización Manual**

1. Haz clic en **"Sincronizar Ahora"** para forzar una sincronización inmediata
2. El sistema intentará:
   - Primero: API-Football
   - Si falla: GLM-4 Flash
3. Verás un mensaje de éxito/error

### **Opción 3: Scraping Manual**

1. Haz clic en **"Scraping con GLM-4"**
2. El sistema buscará resultados recientes en sitios confiables
3. Los partidos se cargarán automáticamente

### **Opción 4: Edición Manual**

1. Haz clic en el botón **"Editar"** (lápiz) en cualquier partido
2. Modifica goles y estado
3. Haz clic en **"Guardar"** (checkmark)

---

## ⚙️ CONFIGURACIÓN AVANZADA

### **Cambiar Intervalo de Sincronización**

1. Haz clic en **"Configuración"**
2. Ajusta el intervalo (5-120 minutos)
3. Se guarda automáticamente en localStorage
4. La sincronización se reinicia con el nuevo intervalo

### **Desactivar Sincronización Automática**

1. Haz clic en **"Configuración"**
2. Desactiva el checkbox **"Habilitar sincronización automática"**
3. Ahora solo se sincroniza cuando hagas clic en "Sincronizar Ahora"

---

## 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO

### **Para API-Football (Edge Function)**

En Supabase → Project Settings → Environment Variables:

```
API_SPORTS_KEY=tu_api_key_aqui
SUPABASE_URL=https://rthdnwkwocojijyfcrtr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

**Cómo obtener:**
1. API_SPORTS_KEY: https://www.api-football.com/
2. SUPABASE_URL y SERVICE_ROLE_KEY: Supabase Dashboard → Settings → API

### **Para GLM-4 Flash (Fallback)**

En `.env.local`:

```
VITE_ZHIPU_API_KEY=tu_api_key_aqui
```

**Cómo obtener:**
1. Regístrate en https://open.bigmodel.cn
2. Crea una API Key
3. Copia en `.env.local`

---

## 📊 FLUJO DE SINCRONIZACIÓN

```
┌─────────────────────────────────────────────────────────┐
│ CADA 15 MINUTOS (O CUANDO HAGAS CLIC EN "SINCRONIZAR") │
└─────────────────────────────────────────────────────────┘
                          ↓
                ┌─────────────────────┐
                │ Intentar API-Football│
                └─────────────────────┘
                          ↓
                    ¿Éxito?
                   /        \
                 SÍ          NO
                 ↓           ↓
            ✅ Guardar   Intentar GLM-4
                        ↓
                    ¿Éxito?
                   /        \
                 SÍ          NO
                 ↓           ↓
            ✅ Guardar   ❌ Error
                        (mostrar mensaje)
                ↓
        ┌──────────────────────┐
        │ Calcular puntos      │
        │ Actualizar ranking   │
        │ Guardar en BD        │
        └──────────────────────┘
                ↓
        ✅ Sincronización completa
```

---

## 🎯 CASOS DE USO

### **Caso 1: Torneo en vivo**
- Activa sincronización automática cada 5 minutos
- Los resultados se cargan automáticamente
- Los puntos se calculan en tiempo real
- Los usuarios ven el ranking actualizado

### **Caso 2: Torneo sin conexión a API**
- Usa "Scraping con GLM-4" manualmente
- O edita los resultados manualmente
- Los puntos se calculan igual

### **Caso 3: Corrección de errores**
- Haz clic en "Editar" en el partido
- Modifica el resultado
- Los puntos se recalculan automáticamente

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Error: "Edge Function no disponible"**
- ✅ Solución: El sistema usa GLM-4 Flash automáticamente
- Verifica que `VITE_ZHIPU_API_KEY` esté configurada

### **Error: "No se encontraron partidos"**
- ✅ Verifica que API-Football tenga datos del Mundial 2026
- Intenta "Scraping con GLM-4" manualmente
- O carga partidos manualmente

### **Los puntos no se calculan**
- ✅ Verifica que el estado del partido sea "FINISHED"
- Recarga la página
- Intenta "Sincronizar Ahora"

### **La sincronización automática no funciona**
- ✅ Verifica que esté activada en "Configuración"
- Abre la consola (F12) y busca logs `[AutoSync]`
- Intenta "Sincronizar Ahora" manualmente

---

## 📈 MONITOREO

### **Logs en Consola**
Abre F12 → Console y busca:
- `[AutoSync]` - Sincronización automática
- `[Sync]` - Sincronización manual
- `[Scrape]` - Scraping con GLM-4

### **Estado en Tiempo Real**
El panel muestra:
- 🔄 Sincronización automática: ACTIVADA/DESACTIVADA
- ⏱️ Última sincronización: fecha y hora
- ⏭️ Próxima sincronización: fecha y hora
- 📊 Partidos cargados: número total

---

## 🎓 RESUMEN PARA ADMINISTRADOR

| Acción | Botón | Resultado |
|--------|-------|-----------|
| Sincronizar ahora | "Sincronizar Ahora" | Descarga resultados inmediatamente |
| Scraping manual | "Scraping con GLM-4" | Busca resultados en web |
| Editar resultado | "Editar" (lápiz) | Modifica goles y estado |
| Recargar tabla | "Recargar" | Actualiza vista sin sincronizar |
| Configurar automático | "Configuración" | Activa/desactiva y ajusta intervalo |

---

## ✨ CARACTERÍSTICAS DESTACADAS

✅ **Sincronización automática** cada 15 minutos (configurable)  
✅ **Fallback inteligente** a GLM-4 si API falla  
✅ **Cálculo automático de puntos** cuando se carga resultado  
✅ **Panel de control visual** con estado en tiempo real  
✅ **Edición manual** de partidos  
✅ **Scraping inteligente** con IA  
✅ **Logs detallados** en consola para debugging  
✅ **Persistencia** de configuración en localStorage  

---

## 🚀 PRÓXIMOS PASOS

1. **Configura las variables de entorno** (API_SPORTS_KEY, ZHIPU_API_KEY)
2. **Abre el Admin Dashboard** → "API & Scraping"
3. **Verifica que la sincronización automática esté ACTIVADA**
4. **Espera 15 minutos** o haz clic en "Sincronizar Ahora"
5. **Verifica que los partidos se carguen** en la tabla
6. **Comprueba que los puntos se calculen** en el ranking

---

## 📞 SOPORTE

Si tienes problemas:
1. Abre la consola (F12)
2. Busca logs `[Sync]`, `[AutoSync]`, `[Scrape]`
3. Copia el error y comparte
4. Intenta "Sincronizar Ahora" manualmente
5. Si persiste, usa "Scraping con GLM-4" como fallback

---

**Última actualización:** 23 de Mayo de 2026  
**Estado:** ✅ COMPLETO Y FUNCIONAL
