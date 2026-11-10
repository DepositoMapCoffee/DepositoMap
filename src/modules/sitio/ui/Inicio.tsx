/**
 * Nueva página de inicio (fase 4C). Server Component: todo el contenido se
 * renderiza en el servidor (rápido y legible por buscadores); solo el
 * encabezado y las apariciones al hacer scroll usan JavaScript.
 *
 * Textos de historia tomados de la home anterior (contenido real del negocio).
 */
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Clock3, Coffee, Globe, MapPin, MessageCircle } from 'lucide-react';
import { Badge, buttonStyles, PieSitio } from '@/shared/ui';
import { NEGOCIO, enlaceWhatsApp } from '@/shared/config/negocio';
import { formatoDuracion, formatoPrecio, type Experiencia } from '@/modules/reservas';
import { nombreDepartamento, type Producto } from '@/modules/catalogo';
import { EncabezadoPrincipal } from './EncabezadoPrincipal';
import { Revelar } from './Revelar';

type Props = {
  experiencias: Experiencia[];
  cafesDestacados: Producto[];
  origenes: { departamentoId: string; nombre: string; total: number }[];
  totalProductos: number;
};

const URL_MAPA = '/mapa';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-[0.35em] text-accent-hover">{children}</p>;
}

export function Inicio({ experiencias, cafesDestacados, origenes, totalProductos }: Props) {
  return (
    <div className="bg-surface text-on-surface">
      <EncabezadoPrincipal transparenteArriba />

      {/* ═══ PORTADA ═══ */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden">
        <Image
          src="/hero-bg.webp"
          alt="Montañas cafeteras de Colombia al atardecer"
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105 animate-[aparecer_1.2s_ease-out_both]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-surface via-surface/55 to-surface/10" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-surface/80 via-surface/20 to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 pb-14 sm:pb-20 pt-32">
          <div className="max-w-3xl animate-entrar">
            <Eyebrow>Café de especialidad · {NEGOCIO.ciudad}</Eyebrow>
            <h1 className="font-serif text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl mt-5 text-on-surface">
              Cuatro generaciones.
              <br />
              <em className="italic text-primary">Un mismo propósito.</em>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-on-surface-soft leading-relaxed max-w-2xl">
              Conectar cafés extraordinarios de Colombia con las personas que realmente los van a valorar.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/reservar" className={buttonStyles('primary', 'lg')}>
                Reservar un Coffee Tasting <ArrowRight className="w-4 h-4" />
              </Link>
              <a href={URL_MAPA} className={buttonStyles('secondary', 'lg', 'bg-surface-high/70 backdrop-blur-sm')}>
                <MapPin className="w-4 h-4" /> Explorar el mapa de orígenes
              </a>
            </div>
          </div>

          <dl className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-[var(--radius-lg)] overflow-hidden border border-outline-soft/60 bg-outline-soft/40 max-w-4xl animate-entrar [animation-delay:200ms]">
            {[
              { valor: '1940', etiqueta: 'El origen, en Viterbo (Caldas)' },
              { valor: '4', etiqueta: 'Generaciones de oficio' },
              { valor: String(totalProductos), etiqueta: 'Cafés y chocolates' },
              { valor: String(origenes.length), etiqueta: origenes.length === 1 ? 'Región de origen' : 'Regiones de origen' },
            ].map((d) => (
              <div key={d.etiqueta} className="bg-surface/80 backdrop-blur-sm px-5 py-4">
                <dt className="sr-only">{d.etiqueta}</dt>
                <dd className="font-serif text-3xl text-on-surface tabular-nums">{d.valor}</dd>
                <dd className="text-xs text-on-surface-muted mt-1">{d.etiqueta}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ═══ EXPERIENCIAS ═══ */}
      <section id="experiencias" className="scroll-mt-20 mx-auto max-w-7xl px-5 sm:px-8 py-24 sm:py-32">
        <Revelar className="max-w-2xl">
          <Eyebrow>Coffee Tasting</Eyebrow>
          <h2 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">Vive el café con todos los sentidos</h2>
          <p className="text-on-surface-soft mt-4 text-lg leading-relaxed">
            Catas guiadas de café de especialidad colombiano en nuestra tienda del Barrio San Diego, del origen a la taza.
          </p>
        </Revelar>

        <div className="mt-14 space-y-8">
          {experiencias.map((e, i) => (
            <Revelar key={e.id} retraso={i * 120}>
              <article className="group grid lg:grid-cols-[1.1fr_1fr] rounded-[var(--radius-xl)] overflow-hidden border border-outline-soft bg-surface-container shadow-[var(--shadow-card)]">
                <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[420px] overflow-hidden bg-surface-high">
                  {e.imagen && (
                    <Image
                      src={e.imagen}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover transition-transform duration-1000 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                <div className="p-7 sm:p-10 flex flex-col">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="primary">
                      <Clock3 className="w-3 h-3" /> {formatoDuracion(e.duracionMin)}
                    </Badge>
                    <Badge>
                      <Globe className="w-3 h-3" /> {e.idiomas.join(' · ')}
                    </Badge>
                  </div>
                  <h3 className="font-serif text-3xl mt-5 leading-snug">{e.nombre}</h3>
                  <p className="text-on-surface-soft mt-4 leading-relaxed">{e.descripcion}</p>
                  <p className="flex items-start gap-2 text-sm text-on-surface-muted mt-5">
                    <Coffee className="w-4 h-4 text-accent-hover shrink-0 mt-0.5" /> {e.cafes}
                  </p>
                  <div className="mt-auto pt-8 flex flex-wrap items-end justify-between gap-4">
                    <p>
                      <span className="font-serif text-4xl text-accent-hover tabular-nums">{formatoPrecio(e.precio)}</span>
                      <span className="text-sm text-on-surface-muted"> / persona</span>
                    </p>
                    <Link href={`/reservar?experiencia=${e.id}`} className={buttonStyles('primary', 'lg')}>
                      Reservar <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            </Revelar>
          ))}
        </div>
      </section>

      {/* ═══ ORÍGENES ═══ */}
      <section id="origenes" className="scroll-mt-20 border-y border-outline-soft/60 bg-surface-low">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24 sm:py-32 grid lg:grid-cols-[0.9fr_1.1fr] gap-14">
          <Revelar>
            <Eyebrow>Orígenes</Eyebrow>
            <h2 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">Cada café cuenta de dónde viene</h2>
            <p className="text-on-surface-soft mt-4 text-lg leading-relaxed">
              Recorre el mapa de Colombia y descubre las fincas, procesos y notas de cata de cada lote que seleccionamos.
            </p>
            <ul className="mt-10 divide-y divide-outline-soft/60 border-y border-outline-soft/60">
              {origenes.map((o) => (
                <li key={o.departamentoId}>
                  <a href={`${URL_MAPA}?region=${o.departamentoId}`} className="group flex items-center justify-between py-5">
                    <span className="font-serif text-2xl sm:text-3xl group-hover:text-primary transition-colors">{o.nombre}</span>
                    <span className="flex items-center gap-3 text-sm text-on-surface-muted">
                      {o.total} {o.total === 1 ? 'producto' : 'productos'}
                      <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Revelar>

          <div className="grid sm:grid-cols-2 gap-4 content-start">
            {cafesDestacados.map((c, i) => (
              <Revelar key={c.id} retraso={i * 90}>
                <a
                  href={`${URL_MAPA}?region=${c.departamentoId}`}
                  className="block h-full rounded-[var(--radius-lg)] border border-outline-soft bg-surface-container p-6 hover:border-primary/50 hover:shadow-[var(--shadow-glow)] transition-[border-color,box-shadow] duration-300"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-on-surface-muted">{nombreDepartamento(c.departamentoId)}</p>
                  <h3 className="font-serif text-2xl mt-3 leading-snug">{c.nombre}</h3>
                  {c.finca && <p className="text-sm text-on-surface-muted mt-1">{c.finca}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {c.proceso && <Badge tone="accent">{c.proceso}</Badge>}
                    {c.altura && <Badge>{c.altura}</Badge>}
                  </div>
                  {c.notas && <p className="text-sm text-on-surface-soft mt-4 leading-relaxed">{c.notas}</p>}
                </a>
              </Revelar>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HISTORIA ═══ */}
      <section id="historia" className="scroll-mt-20 mx-auto max-w-7xl px-5 sm:px-8 py-24 sm:py-32 grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-center">
        <Revelar>
          <figure className="relative">
            <div className="relative aspect-[840/1140] max-w-md mx-auto rounded-[var(--radius-xl)] overflow-hidden border border-outline-soft">
              <Image
                src="/sigifredo.png"
                alt="Sigifredo González, de la familia fundadora de El Depósito"
                fill
                sizes="(min-width: 1024px) 28rem, 90vw"
                className="object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-surface/70 via-transparent to-transparent" />
            </div>
            <figcaption className="text-center text-sm text-on-surface-muted mt-4">Sigifredo González</figcaption>
          </figure>
        </Revelar>

        <Revelar retraso={120}>
          <Eyebrow>Nuestra historia</Eyebrow>
          <h2 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">Un legado de cuatro generaciones</h2>
          <div className="mt-8 space-y-5 text-on-surface-soft text-lg leading-relaxed">
            <p>
              En la década de 1940, en <strong className="text-on-surface font-medium">Viterbo, Caldas</strong>, Félix González
              fundó el Depósito de Café «Félix González e Hijos». No era una cafetería ni una tostadora: era el lugar al que los
              pequeños productores llegaban con sus cosechas, confiando en que la familia sabría reconocer sus mejores granos.
            </p>
            <p>
              A sus 13 años, <strong className="text-on-surface font-medium">Sigifredo González</strong> empezó a aprender lo que
              ningún libro enseña: reconocer un café extraordinario. Casi 80 años después, ese propósito sigue intacto.
            </p>
          </div>
          <blockquote className="mt-10 border-l-2 border-accent pl-6">
            <p className="font-serif text-2xl sm:text-3xl italic leading-snug text-on-surface">
              «El café no es solo de lo que más sabemos. Es parte de quienes somos.»
            </p>
          </blockquote>
        </Revelar>
      </section>

      {/* ═══ LLAMADO FINAL ═══ */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <Revelar>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-outline-soft bg-surface-container px-7 py-14 sm:px-14 sm:py-20 text-center">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-90"
              style={{
                background:
                  'radial-gradient(50% 80% at 20% 0%, rgba(149,90,35,0.22) 0%, transparent 70%), radial-gradient(40% 70% at 85% 100%, rgba(47,163,107,0.16) 0%, transparent 70%)',
              }}
            />
            <div className="relative">
              <h2 className="font-serif text-4xl sm:text-5xl leading-tight">¿Listo para la experiencia?</h2>
              <p className="text-on-surface-soft mt-4 text-lg max-w-xl mx-auto">
                Te esperamos en {NEGOCIO.direccion}, {NEGOCIO.ciudad}.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link href="/reservar" className={buttonStyles('primary', 'lg')}>
                  Reservar ahora <ArrowRight className="w-4 h-4" />
                </Link>
                <a href={enlaceWhatsApp('Hola, quisiera información sobre El Depósito.')} target="_blank" rel="noopener noreferrer" className={buttonStyles('secondary', 'lg')}>
                  <MessageCircle className="w-4 h-4" /> Escríbenos
                </a>
              </div>
            </div>
          </div>
        </Revelar>
      </section>

      <PieSitio />
    </div>
  );
}
