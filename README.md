# El Depósito – Mapa Interactivo de Cafés de Especialidad ☕🇨🇴

**El Depósito** es un prototipo de interfaz web interactiva diseñada para explorar la riqueza de los cafés de especialidad en Colombia. El proyecto presenta un mapa interactivo del país donde cada departamento funciona como un área seleccionable que despliega información rica y estructurada sobre los lotes de café cultivados en esa región.

---

## ✨ Características Principales

### 1. Mapa Interactivo de Colombia
- **Renderizado Vectorial (SVG):** Un mapa interactivo detallado renderizado mediante capas SVG personalizadas.
- **Interacciones fluidas:** Implementado con [Framer Motion](https://www.framer.com/motion/) para asegurar transiciones sutiles e inmersivas (hover orgánico, zoom-in delicado al seleccionar).
- **Indicadores visuales:** Solo los departamentos que cuentan con datos activos en la base de datos reaccionan al cursos e invitan al usuario a hacer clic.

### 2. Panel Lateral Dinámico
- Al seleccionar un departamento con cafés registrados, el mapa principal se desliza suavemente hacia la izquierda mientras un **panel lateral asombroso** (tipo overlay) aparece desde la derecha.
- **Desenfoque de Fondo (Backdrop Blur):** Todo el contenido de fondo (incluyendo el botón flotante de administración) se oscurece y desenfoca aplicando el atributo `backdrop-blur-sm` con un `z-index` adecuado, dándole todo el protagonismo al panel lateral.
- Muestra una reseña rápida del departamento y lista los orígenes con sus respectivas **Tarjetas de Café** detalladas.

### 3. Tarjetas de Café 
- Cada `CoffeeCard` encapsula información crucial:
  - **Finca y Altura** (con iconos pulidos de `lucide-react`).
  - **Proceso:** Lavado, Honey, Natural, etc.
  - **Categoría:** Regional, Culturing, o Varietal (cada una con un color de etiqueta distintivo).
  - **Notas de cata:** Para enamorar al usuario.

### 4. Detalles de Lote Dedicado (`/lote/[id]`)
- Al pulsar una tarjeta, el usuario es llevado a una **página dedicada de detalles visuales**, dándole la máxima importancia a la procedencia y las notas de copa del lote seleccionado.

### 5. Panel Administrativo Integral
- **Ruta Protegida (`/admin`):** Dashboard administrable para gestionar el catálogo.
- **Login Seguro (`/admin/login`):** Sistema de autenticación JWT gestionado por **Supabase Auth**.
- **Gestión Completa (CRUD):** El administrador puede ver (con barra de búsqueda en tiempo real y filtrado visual), añadir, editar y eliminar cafés del catálogo interactuando con modales limpios y rápidos.

---

## 🛠️ Stack Tecnológico de Vanguadía

Este proyecto ha sido forjado usando tecnologías web de última generación enfocadas en **rendimiento, mantenibilidad, y estética premium**:

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router). Creado para ser rápido e indexable.
- **Diseño & Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) integrado de forma pura sin `@apply`. Implementación de un sistema de diseño oscuro sumamente curado y elegante usando variables globales (`--brand-black`, `--brand-accent`, etc.).
- **Animaciones & Micro-Interacciones:** [Framer Motion](https://www.framer.com/motion/). Las físicas tipo 'spring' (resortes) han sido extraídas centralizadamente en `lib/animations.ts` para coherencia global.
- **Estados Rápidos UI:** [Zustand](https://github.com/pmndrs/zustand). Sustituye complejos providers creando un store global (`useCoffeeStore`) sencillo y potente.
- **Base de datos & Backend:** [Supabase](https://supabase.com/). Integración completa con cliente (TypeScript).
- **Tipografías Premium:** *Newsreader* (Serif elegante para títulos) e *Inter* (Legibilidad sans-serif perfecta) provistas por `next/font`.
- **Iconografía:** Un mix entre [Lucide React](https://lucide.dev/) y SVGs personalizados (como la semilla de café o el mapa de Colombia).

---

## 🚀 Instalación y Ejecución Local

Si deseas correr este proyecto localmente, sigue estas instrucciones:

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/pandemilconqueso-cloud/DepositoMap.git
   cd DepositoMap
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura tu Base de Datos (Supabase)**
   Vas a necesitar configurar tu base de datos de Supabase y crear el archivo de dependencias locales. Crea un archivo `.env.local` en la raíz del proyecto y añade las siguientes variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=URL_DE_TU_PROYECTO
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_PÚBLICA
   ```

   > [!IMPORTANT]
   > Asegúrate de que las estructuras y tablas de tu proyecto en Supabase (tabla `cafes`) correspondan con exactitud a los modelos definidos en el archivo `types/index.ts`.

4. **Inicia el Servidor Local**
   ```bash
   npm run dev
   ```

5. **Abre el Poryecto**
   Visita `http://localhost:3000` en tu explorador.

---

> Hecho con pasión y extrema atención al detalle UX/UI para transformar la forma en la que exploramos los mejores cafés del mundo. 🌍☕
