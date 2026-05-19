# 🏟️ Guía de Miniestadios 3D - OraculoMundial

## 🚀 Inicio Rápido

### 1. Instalar dependencias (si no lo hiciste)
```bash
npm install
```

### 2. Ejecutar en desarrollo
```bash
npm run dev
```

### 3. Abrir en navegador
```
http://localhost:5173
```

### 4. Navegar a Estadios
- Inicia sesión con tu cuenta
- Haz clic en el botón **"📍 Estadios"** en la barra superior
- ¡Explora los 14 estadios del Mundial 2026!

---

## 🎮 Cómo Interactuar

### Con el Mouse
- **Pasar sobre un estadio:** El cursor cambia a "grab" 👆
- **Mover el mouse:** Gira el estadio en 3D
- **Dejar de mover:** El estadio rota automáticamente

### Filtros
- **Todos:** Ver los 14 estadios
- **🇲🇽 México:** 3 estadios
- **🇺🇸 USA:** 8 estadios
- **🇨🇦 Canadá:** 2 estadios

---

## 📊 Información Mostrada

Cada tarjeta de estadio muestra:

```
┌─────────────────────────────────┐
│   [3D Stadium Visualization]    │  ← Interactivo, gira con mouse
│                                 │
├─────────────────────────────────┤
│ Estadio Azteca                  │  ← Nombre
│ 📍 Ciudad de México, México     │  ← Ubicación
│ 🏟️ Capacidad: 87,523            │  ← Capacidad
├─────────────────────────────────┤
│ Hora Local: 14:32:45            │  ← Actualiza cada segundo
│ Período: ☀️ Mediodía            │  ← Cambia según hora
├─────────────────────────────────┤
│ ☀️ Despejado                    │  ← Clima simulado
└─────────────────────────────────┘
```

---

## 🌍 Zonas Horarias

Cada estadio muestra la hora **local real** de su ubicación:

| Estadio | Zona Horaria | Diferencia |
|---------|-------------|-----------|
| CDMX | America/Mexico_City | GMT-6 |
| Kansas City | America/Chicago | GMT-6 |
| Atlanta | America/New_York | GMT-5 |
| San Francisco | America/Los_Angeles | GMT-8 |
| Toronto | America/Toronto | GMT-5 |
| Vancouver | America/Vancouver | GMT-8 |

---

## 🌅 Períodos del Día

La iluminación 3D cambia automáticamente según la hora:

| Período | Hora | Cielo | Luz |
|---------|------|-------|-----|
| 🌙 Madrugada | 0-6 | Oscuro | Mínima |
| 🌅 Mañana | 6-12 | Naranja/Azul | Creciente |
| ☀️ Mediodía | 12-15 | Azul claro | Máxima |
| 🌤️ Tarde | 15-18 | Naranja | Decreciente |
| 🌅 Atardecer | 18-21 | Rojo | Baja |
| 🌙 Noche | 21-0 | Oscuro | Mínima |

---

## 🎨 Características Visuales

### Iluminación Dinámica
- El cielo cambia de color según la hora
- Las sombras se proyectan realísticamente
- La intensidad de luz varía con el período del día

### Efectos de Clima
- **☀️ Despejado:** Sin partículas
- **☁️ Nublado:** Sin partículas (cielo más gris)
- **🌧️ Lluvia:** 500 partículas cayendo
- **⛈️ Tormenta:** 1000 partículas + cielo oscuro

### Geometría del Estadio
- Anillo exterior (estructura)
- Gradas interiores
- Cancha verde con línea central blanca
- 4 luces en las esquinas

---

## 📱 Responsive Design

El grid se adapta automáticamente:
- **Desktop (1400px+):** 4 columnas
- **Tablet (768px-1399px):** 2-3 columnas
- **Mobile (< 768px):** 1 columna

---

## 🔧 Tecnología

- **Three.js:** Renderizado 3D
- **React:** Componentes
- **TypeScript:** Type safety
- **Framer Motion:** Animaciones
- **Tailwind CSS:** Estilos

---

## 📂 Estructura de Archivos

```
src/
├── data/
│   └── StadiumsData.ts              ← Datos de 14 estadios
├── components/
│   ├── Navigation.tsx               ← Barra de navegación
│   ├── StadiumsGrid.tsx             ← Galería de estadios
│   └── scene/
│       └── MiniStadium3D.tsx        ← Componente 3D
└── App.tsx                          ← Integración
```

---

## 🐛 Troubleshooting

### Los estadios no se ven
- Asegúrate de que Three.js esté instalado: `npm install three`
- Recarga la página (F5)
- Abre la consola (F12) para ver errores

### La hora no se actualiza
- Verifica que tu navegador tenga permisos de zona horaria
- Recarga la página

### El mouse no gira el estadio
- Asegúrate de pasar el mouse **sobre el área 3D** del estadio
- El cursor debe cambiar a "grab"

### Performance lento
- Reduce el número de estadios con los filtros
- Cierra otras pestañas
- Actualiza tu navegador

---

## 🎯 Próximas Mejoras

- [ ] Integración con API de clima real
- [ ] Animaciones de partidos en vivo
- [ ] Sonido ambiental
- [ ] Exportar como video (Remotion)
- [ ] Realidad aumentada (AR)
- [ ] Estadísticas de partidos

---

## 📞 Soporte

Si encuentras problemas:
1. Abre la consola del navegador (F12)
2. Busca mensajes de error
3. Verifica que todas las dependencias estén instaladas
4. Intenta `npm run build` para compilar

---

**Última actualización:** 19 de Mayo de 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Producción
