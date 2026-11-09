/**
 * Hook de arranque de Next.js: se ejecuta una vez al iniciar el servidor
 * (Vercel y VPS por igual). Conecta los módulos que escuchan eventos.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registrarModulos } = await import('./bootstrap/registry');
    registrarModulos();
  }
}
