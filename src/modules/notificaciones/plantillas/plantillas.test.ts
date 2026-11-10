import { describe, expect, it } from 'vitest';
import type { ReservaParaNotificar } from '@/modules/reservas';
import { esc } from './base';
import { avisoNegocio, recordatorio, reservaCancelada, reservaConfirmada, reservaRecibida } from './reservas';

const R: ReservaParaNotificar = {
  id: '11111111-1111-4111-8111-111111111111',
  codigo: 'DEP-7K3QX',
  fecha: '2026-11-12',
  horaInicio: '14:00',
  cupos: 2,
  idioma: 'Español',
  nombre: 'Ana <script>alert(1)</script> Gómez',
  email: 'ana@example.com',
  telefono: '+57 300 000 0000',
  notas: 'Cumpleaños "sorpresa" & más',
  precioUnitario: 45000,
  estado: 'pendiente',
  canal: 'web',
  experiencia: { nombre: 'Coffee Tasting El Depósito', ubicacion: 'Calle Curato # 38 - 48', duracionMin: 30 },
  enlaceGestion: 'https://eldeposito.co/reserva/DEP-7K3QX?t=abc123',
};

describe('plantillas de correo', () => {
  it('escapa HTML', () => {
    expect(esc('<b>"x" & \'y\'</b>')).toBe('&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;');
  });

  it('reserva recibida: código, detalles, enlace, .ics y sin HTML inyectado', () => {
    const m = reservaRecibida(R, 'America/Bogota');
    expect(m.asunto).toContain('DEP-7K3QX');
    expect(m.html).toContain('DEP-7K3QX');
    expect(m.html).toContain('Jueves, 12 de noviembre');
    expect(m.html).toContain('2:00 p. m.');
    expect(m.html).toContain('90.000');
    expect(m.html).toContain('href="https://eldeposito.co/reserva/DEP-7K3QX?t=abc123"');
    expect(m.html).not.toContain('<script>');
    expect(m.texto).toContain(R.enlaceGestion);
    expect(m.adjuntos?.[0].nombre).toBe('reserva-DEP-7K3QX.ics');
    expect(m.adjuntos?.[0].contenido).toContain('DTSTART;TZID=America/Bogota:20261112T140000');
  });

  it('el texto plano no tiene dobles puntos tras "p. m."', () => {
    for (const m of [reservaConfirmada(R, 'America/Bogota'), recordatorio(R), reservaRecibida(R, 'America/Bogota')]) {
      expect(m.texto).not.toMatch(/m\.\./);
    }
    expect(recordatorio(R).texto).toContain('mañana, jueves, 12 de noviembre, a las 2:00 p. m.');
  });

  it('confirmada, recordatorio y cancelada', () => {
    expect(reservaConfirmada(R, 'America/Bogota').asunto).toMatch(/^Confirmada/);
    const rec = recordatorio(R);
    expect(rec.asunto).toContain('Mañana');
    expect(rec.html).toContain('google.com/maps');
    expect(reservaCancelada(R, true, 'https://x/reservar').texto).toContain('Confirmamos la cancelación');
    expect(reservaCancelada(R, false, 'https://x/reservar').texto).toContain('Tuvimos que cancelar');
  });

  it('aviso al equipo incluye contacto y notas escapadas', () => {
    const m = avisoNegocio(R, 'nueva', 'https://x/panel/reservas?dia=2026-11-12');
    expect(m.html).toContain('+57 300 000 0000');
    expect(m.html).toContain('Cumpleaños &quot;sorpresa&quot; &amp; más');
    expect(m.html).not.toContain('<script>');
  });
});
