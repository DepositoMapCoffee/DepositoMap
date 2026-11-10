/**
 * Departamentos de Colombia (código ISO 3166-2 y nombre), para el catálogo.
 * Extraído de los datos del mapa (src/legacy/data/mapaData.ts) sin los trazos SVG.
 */
export const DEPARTAMENTOS = [
  { id: 'CO-AMA', nombre: 'Amazonas' },
  { id: 'CO-ANT', nombre: 'Antioquia' },
  { id: 'CO-ARA', nombre: 'Arauca' },
  { id: 'CO-ATL', nombre: 'Atlántico' },
  { id: 'CO-BOL', nombre: 'Bolívar' },
  { id: 'CO-BOY', nombre: 'Boyacá' },
  { id: 'CO-CAL', nombre: 'Caldas' },
  { id: 'CO-CAQ', nombre: 'Caquetá' },
  { id: 'CO-CAS', nombre: 'Casanare' },
  { id: 'CO-CAU', nombre: 'Cauca' },
  { id: 'CO-CES', nombre: 'Cesar' },
  { id: 'CO-CHO', nombre: 'Chocó' },
  { id: 'CO-COR', nombre: 'Córdoba' },
  { id: 'CO-CUN', nombre: 'Cundinamarca' },
  { id: 'CO-DC', nombre: 'Distrito Capital de Bogotá' },
  { id: 'CO-GUA', nombre: 'Guainía' },
  { id: 'CO-GUV', nombre: 'Guaviare' },
  { id: 'CO-HUI', nombre: 'Huila' },
  { id: 'CO-LAG', nombre: 'La Guajira' },
  { id: 'CO-MAG', nombre: 'Magdalena' },
  { id: 'CO-MET', nombre: 'Meta' },
  { id: 'CO-NAR', nombre: 'Nariño' },
  { id: 'CO-NSA', nombre: 'Norte De Santander' },
  { id: 'CO-PUT', nombre: 'Putumayo' },
  { id: 'CO-QUI', nombre: 'Quindío' },
  { id: 'CO-RIS', nombre: 'Risaralda' },
  { id: 'CO-SAN', nombre: 'Santander' },
  { id: 'CO-SUC', nombre: 'Sucre' },
  { id: 'CO-TOL', nombre: 'Tolima' },
  { id: 'CO-VAC', nombre: 'Valle Del Cauca' },
  { id: 'CO-VAU', nombre: 'Vaupés' },
  { id: 'CO-VID', nombre: 'Vichada' },
] as const;

export type DepartamentoId = (typeof DEPARTAMENTOS)[number]['id'];

const porId = new Map<string, string>(DEPARTAMENTOS.map((d) => [d.id, d.nombre]));

export function nombreDepartamento(id: string): string {
  return porId.get(id) ?? id;
}
