/**
 * ESLint — calidad + fronteras de arquitectura (piezas Lego).
 *
 * Las reglas de `boundaries/dependencies` impiden que una pieza dependa
 * del interior de otra. Ver src/modules/README.md.
 */
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import boundaries from 'eslint-plugin-boundaries';

/** Puntos de entrada públicos de un módulo. */
const MODULE_ENTRIES = ['index.ts', 'client.ts'];

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { alwaysTryTypes: true, project: './tsconfig.json' } },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'module', pattern: 'src/modules/*', capture: ['modulo'] },
        { type: 'shared', pattern: 'src/shared/*', capture: ['pieza'] },
        { type: 'legacy', pattern: 'src/legacy' },
        { type: 'bootstrap', pattern: 'src/bootstrap' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            // Dentro de una misma pieza, todo vale.
            { allow: { dependency: { relationship: { to: 'internal' } } } },

            // app/ compone: usa la API pública de módulos, shared y (temporalmente) legacy.
            {
              from: { element: { type: 'app' } },
              allow: [
                { to: { element: { type: 'module', fileInternalPath: MODULE_ENTRIES } } },
                { to: { element: { types: ['shared', 'legacy'] } } },
              ],
            },

            // Un módulo usa shared y SOLO la API pública de otros módulos.
            {
              from: { element: { type: 'module' } },
              allow: [
                { to: { element: { type: 'shared' } } },
                { to: { element: { type: 'module', fileInternalPath: MODULE_ENTRIES } } },
              ],
            },

            // bootstrap/ (registro) enchufa los suscriptores de cada módulo.
            {
              from: { element: { type: 'bootstrap' } },
              allow: [
                { to: { element: { type: 'module', fileInternalPath: 'subscribers.ts' } } },
                { to: { element: { type: 'shared' } } },
              ],
            },

            // shared es la base: solo depende de otras piezas de shared.
            { from: { element: { type: 'shared' } }, allow: { to: { element: { type: 'shared' } } } },

            // legacy (código antiguo): puede usar shared mientras se migra.
            { from: { element: { type: 'legacy' } }, allow: { to: { element: { types: ['legacy', 'shared'] } } } },
          ],
        },
      ],
    },
  },

  // El código legacy se reemplaza por módulos: no se le exige el estándar nuevo.
  {
    files: ['src/legacy/**', 'src/app/page.tsx', 'src/app/admin/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },

  globalIgnores(['.next/**', 'out/**', 'build/**', 'drizzle/**', 'next-env.d.ts', 'supabase/**']),
]);
