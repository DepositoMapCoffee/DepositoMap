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

            // app/ compone: usa la API pública de módulos y shared.
            {
              from: { element: { type: 'app' } },
              allow: [
                { to: { element: { type: 'module', fileInternalPath: MODULE_ENTRIES } } },
                { to: { element: { type: 'shared' } } },
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

          ],
        },
      ],
    },
  },

  globalIgnores(['.next/**', 'out/**', 'build/**', 'drizzle/**', 'next-env.d.ts', 'supabase/**']),
]);
