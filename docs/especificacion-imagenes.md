# Especificación de imágenes — El Depósito 1928

> Versión: 1.0
> Fecha: 2026-07-04
> Para: Equipo visual / diseño gráfico

---

## Resumen

Se necesitan **6 imágenes** para la nueva sección de servicios Coffee Tasting y el rediseño del hero de la página web. Todas deben entregarse en **WebP** (calidad 85) con copia de respaldo en **JPEG**.

---

## 1. Hero — Fondo de paisaje cafetero

| Campo | Valor |
|---|---|
| **Archivo** | `hero-bg.webp` / `hero-bg.jpg` |
| **Contenido** | Paisaje cafetero colombiano. Montañas verdes, cultivos de café, horizonte amplio. Atmósfera sobria y elegante. |
| **Relación de aspecto** | **16:9** |
| **Resolución** | **1920 × 1080 px** |
| **Peso estimado** | 200-400 KB |
| **Uso** | Fondo de pantalla completa en la página de inicio. Detrás del logo y tagline. |
| **Tono** | Oscuro o sobrio para permitir superposición de texto blanco/dorado. O bien se le aplicará un overlay oscuro en CSS. |
| **Composición** | El horizonte debe estar en el **tercio superior** del encuadre. En mobile (< 768 px) la imagen se recorta lateralmente y se alinea al centro-top. |

### Referencia visual

```
┌──────────────────────────────────────────────┐
│  ☁️            ☁️                              │
│                                               │
│       ⛰️  (horizonte aquí, tercio superior)    │
│    ──────────── ⛰️ ───────────                │
│  ⛰️  🌿  🌿  🌿  🌿  🌿  🌿  🌿             │
│   🌿  cafetales  🌿  🌿                       │
│                                               │
│  Aquí va el logo + "Specialty Coffee" encima   │
│                                               │
└──────────────────────────────────────────────┘
```

---

## 2. Servicio — Coffee Tasting

| Campo | Valor |
|---|---|
| **Archivo** | `service-tasting.webp` / `service-tasting.jpg` |
| **Contenido** | Experiencia de cata de café: mesa con tazas de catación, café siendo servido, ambiente acogedor de la tienda. |
| **Relación de aspecto** | **3:2** |
| **Resolución** | **1200 × 800 px** |
| **Peso estimado** | 150-300 KB |
| **Uso** | Acompaña visualmente la card del servicio "Coffee Tasting El Depósito" ($45.000). |
| **Tono** | Cálido, iluminación acogedora. Que invite a la experiencia. |

---

## 3. Servicio — Completo

| Campo | Valor |
|---|---|
| **Archivo** | `service-completo.webp` / `service-completo.jpg` |
| **Contenido** | Experiencia completa: preparación de café filtrado, granos, catación más elaborada. Debe diferenciarse visualmente de la imagen anterior. |
| **Relación de aspecto** | **3:2** |
| **Resolución** | **1200 × 800 px** |
| **Peso estimado** | 150-300 KB |
| **Uso** | Acompaña visualmente la card del servicio "Coffee Tasting El Depósito Completo" ($120.000). |
| **Tono** | Cálido, iluminación acogedora. Que invite a la experiencia. |

---

## 4. Retratos del equipo (3 fotos)

| Campo | Valor |
|---|---|
| **Archivos** | `team-javier.webp` / `team-javier.jpg` |
| | `team-santiago.webp` / `team-santiago.jpg` |
| | `team-[nombre].webp` / `team-[nombre].jpg` |
| **Contenido** | Retrato de cada persona de cintura para arriba. Fondo neutro o en la tienda. Mirada a cámara o en actitud profesional. |
| **Relación de aspecto** | **4:5** |
| **Resolución** | **800 × 1000 px** |
| **Peso estimado** | 100-200 KB c/u |
| **Uso** | Sección "Nuestro Equipo" al final de la vista de servicios. Cada foto irá acompañada de un nombre y una frase. |
| **Tono** | Iluminación natural, profesional. Puede ser en la tienda con granos o herramientas de café. |

### Composición sugerida

```
┌──────────┐
│          │
│   😊    │  ← cabeza en tercio superior
│          │
│          │
│  nombre  │  ← espacio para nombre/cargo
│  frase   │
└──────────┘
```

El ratio 4:5 permite usar la foto como rectángulo vertical, o crop circular/cuadrado si el diseño final lo requiere.

---

## Entregables por imagen

Cada imagen debe entregarse en:

1. **`nombre.webp`** — WebP calidad 85 (formato principal, más liviano)
2. **`nombre.jpg`** — JPEG calidad 90 (fallback para navegadores que no soportan WebP)

**Total: 12 archivos** (6 imágenes × 2 formatos)

---

## Notas importantes

| # | Regla |
|---|---|
| 1 | **No incrustar texto** en las imágenes. Todos los títulos, precios y textos van en HTML superpuesto. |
| 2 | Nombrar archivos en **minúscula con guiones** (ej. `hero-bg.webp`, `service-tasting.webp`). |
| 3 | La imagen 1 (hero) debe funcionar bien con un **overlay semitransparente oscuro** encima. |
| 4 | Las imágenes 2 y 3 deben ser **visualmente distintas** para que el usuario diferencie los dos servicios. |
| 5 | Las imágenes 4-6 deben tener **iluminación consistente entre sí** (misma sesión de fotos idealmente). |
| 6 | No exceder **400 KB por imagen** en WebP para mantener buena performance en mobile. |

---

## Destino

Las imágenes se colocarán en la carpeta `public/` del proyecto y se servirán desde:

```
/hero-bg.webp
/service-tasting.webp
/service-completo.webp
/team-javier.webp
/team-santiago.webp
/team-[nombre].webp
```

---
