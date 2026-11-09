import { describe, expect, it, vi } from 'vitest';
import { publish, subscribe } from './index';

declare module './index' {
  interface EventMap {
    'test.evento': { id: string };
  }
}

describe('bus de eventos', () => {
  it('entrega el payload a todos los suscriptores', async () => {
    const a = vi.fn();
    const b = vi.fn();
    const offA = subscribe('test.evento', a);
    const offB = subscribe('test.evento', b);

    await publish('test.evento', { id: '1' });

    expect(a).toHaveBeenCalledWith({ id: '1' });
    expect(b).toHaveBeenCalledWith({ id: '1' });
    offA();
    offB();
  });

  it('un suscriptor que falla no afecta a los demás ni al emisor', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ok = vi.fn();
    const offFail = subscribe('test.evento', () => {
      throw new Error('falla el correo');
    });
    const offOk = subscribe('test.evento', ok);

    await expect(publish('test.evento', { id: '2' })).resolves.toBeUndefined();
    expect(ok).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalled();
    offFail();
    offOk();
    error.mockRestore();
  });

  it('desuscribirse detiene la entrega', async () => {
    const h = vi.fn();
    const off = subscribe('test.evento', h);
    off();
    await publish('test.evento', { id: '3' });
    expect(h).not.toHaveBeenCalled();
  });
});
