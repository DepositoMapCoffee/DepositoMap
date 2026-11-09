/**
 * Módulo `identidad` — sesión de usuarios y administradores.
 * API PÚBLICA: re-expone el adaptador de auth para que los demás módulos
 * no dependan del proveedor (Supabase hoy).
 */
export { getCurrentUser, isAdmin, requireAdmin, UnauthorizedError, type CurrentUser } from '@/shared/infra/auth';
