/**
 * Política de Tratamiento de Datos Personales (Ley 1581 de 2012 y
 * Decreto 1377 de 2013, compilado en el Decreto 1074 de 2015).
 *
 * Redactada a la medida de lo que hace hoy el aplicativo. PENDIENTE de
 * revisión por el asesor legal: cualquier cambio se hace aquí y se
 * actualiza POLITICA_DATOS.version en src/shared/config/negocio.ts
 * (cada reserva guarda la versión que el cliente autorizó).
 */
import { NEGOCIO, POLITICA_DATOS, RESPONSABLE_DATOS, enlaceWhatsApp } from '@/shared/config/negocio';

const VIGENCIA = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
  new Date(`${POLITICA_DATOS.version}T12:00:00Z`),
);

type Seccion = { id: string; titulo: string; contenido: React.ReactNode };

const correo = (
  <a href={`mailto:${RESPONSABLE_DATOS.correo}`} className="text-primary hover:underline underline-offset-2 break-all">
    {RESPONSABLE_DATOS.correo}
  </a>
);

const SECCIONES: Seccion[] = [
  {
    id: 'responsable',
    titulo: 'Responsable del tratamiento',
    contenido: (
      <dl className="grid sm:grid-cols-[180px_1fr] gap-x-6 gap-y-2">
        <dt className="text-on-surface-muted">Razón social</dt>
        <dd>{RESPONSABLE_DATOS.razonSocial}</dd>
        <dt className="text-on-surface-muted">NIT</dt>
        <dd>{RESPONSABLE_DATOS.nit}</dd>
        <dt className="text-on-surface-muted">Nombre comercial</dt>
        <dd>{NEGOCIO.nombre}</dd>
        <dt className="text-on-surface-muted">Domicilio</dt>
        <dd>
          {NEGOCIO.direccion}, {NEGOCIO.ciudad}, Colombia
        </dd>
        <dt className="text-on-surface-muted">Correo para datos personales</dt>
        <dd>{correo}</dd>
        <dt className="text-on-surface-muted">WhatsApp</dt>
        <dd>
          <a href={enlaceWhatsApp()} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-2">
            +{NEGOCIO.whatsapp.replace(/^57/, '57 ')}
          </a>
        </dd>
      </dl>
    ),
  },
  {
    id: 'marco',
    titulo: 'Marco legal y alcance',
    contenido: (
      <p>
        Esta política aplica a los datos personales que tratamos a través de nuestro sitio web, el sistema de reservas de
        Coffee Tasting y los canales de atención (WhatsApp, teléfono y en el local), conforme a la Ley Estatutaria 1581 de
        2012, el Decreto 1377 de 2013 (compilado en el Decreto Único Reglamentario 1074 de 2015) y demás normas que los
        modifiquen o complementen.
      </p>
    ),
  },
  {
    id: 'datos',
    titulo: 'Qué datos recogemos',
    contenido: (
      <ul className="space-y-3">
        <li>
          <strong className="text-on-surface">Al reservar una experiencia</strong> (en línea, por WhatsApp, por teléfono o en
          el local): nombre, número de teléfono o WhatsApp, correo electrónico, número de personas, idioma preferido, fecha y
          hora de la experiencia y, si decides escribirlas, notas adicionales.
        </li>
        <li>
          <strong className="text-on-surface">Si creas una cuenta de usuario</strong>: correo electrónico, contraseña (que no
          conocemos: se guarda cifrada por nuestro proveedor de autenticación) y los cafés que marques como favoritos.
        </li>
        <li>
          <strong className="text-on-surface">Datos técnicos</strong>: los registros básicos que generan nuestros proveedores
          de alojamiento al visitar el sitio (por ejemplo, dirección IP, tipo de navegador y fecha de acceso), con fines de
          seguridad y funcionamiento.
        </li>
      </ul>
    ),
  },
  {
    id: 'finalidades',
    titulo: 'Para qué usamos tus datos',
    contenido: (
      <>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Gestionar tu reserva: apartar cupos, confirmarla, reprogramarla o cancelarla.</li>
          <li>
            Contactarte sobre tu reserva por correo, teléfono o WhatsApp: confirmaciones, recordatorios, cambios o
            imprevistos.
          </li>
          <li>Enviarte el enlace privado con el que puedes consultar o cancelar tu reserva.</li>
          <li>Adaptar la experiencia a lo que nos indiques (idioma, número de personas, notas).</li>
          <li>Administrar tu cuenta de usuario y tus cafés favoritos, si tienes una.</li>
          <li>Atender tus consultas, solicitudes y reclamos.</li>
          <li>Elaborar estadísticas internas y anónimas de ocupación para planear horarios.</li>
          <li>Cumplir obligaciones legales y atender requerimientos de autoridades competentes.</li>
        </ul>
        <p className="mt-3">
          <strong className="text-on-surface">No usamos tus datos para publicidad ni los vendemos.</strong> Si en el futuro
          quisiéramos enviarte novedades o promociones, te pediremos una autorización separada y podrás negarte sin que eso
          afecte tus reservas.
        </p>
      </>
    ),
  },
  {
    id: 'sensibles',
    titulo: 'Datos sensibles y de menores de edad',
    contenido: (
      <>
        <p>
          No solicitamos datos sensibles. Sin embargo, en el campo de notas puedes contarnos, si lo deseas, sobre alergias,
          intolerancias o condiciones relacionadas con la salud para cuidar tu experiencia. Esa información es un dato
          sensible: <strong className="text-on-surface">entregarla es completamente opcional</strong> y solo la usamos para
          preparar tu visita.
        </p>
        <p className="mt-3">
          Nuestras experiencias están dirigidas a personas mayores de edad. Si una reserva incluye menores, sus datos los
          suministra su representante legal, y los tratamos respetando su interés superior y sus derechos fundamentales.
        </p>
      </>
    ),
  },
  {
    id: 'autorizacion',
    titulo: 'Autorización',
    contenido: (
      <p>
        Al marcar la casilla de autorización en el formulario de reserva o de registro nos autorizas a tratar tus datos según
        esta política. Guardamos la fecha y la versión de la política que aceptaste como prueba de la autorización. Cuando
        reservas por WhatsApp, teléfono o en el local, te pediremos la autorización por ese mismo medio. Puedes revocarla en
        cualquier momento (ver «Cómo ejercer tus derechos»), salvo cuando exista un deber legal o contractual de conservar la
        información.
      </p>
    ),
  },
  {
    id: 'derechos',
    titulo: 'Tus derechos',
    contenido: (
      <>
        <p>Como titular de los datos tienes derecho a:</p>
        <ul className="list-disc pl-5 space-y-1.5 mt-2">
          <li>Conocer, actualizar y rectificar tus datos personales.</li>
          <li>Solicitar prueba de la autorización que nos otorgaste.</li>
          <li>Ser informado, previa solicitud, sobre el uso que les hemos dado.</li>
          <li>
            Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley, una vez agotado
            el trámite de consulta o reclamo ante nosotros.
          </li>
          <li>Revocar la autorización y/o pedir la supresión de tus datos cuando no exista un deber legal de conservarlos.</li>
          <li>Acceder gratuitamente a tus datos personales.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'procedimiento',
    titulo: 'Cómo ejercer tus derechos',
    contenido: (
      <>
        <p>
          Escríbenos a {correo} indicando tu nombre, un medio de contacto, la descripción de tu solicitud y, si se trata de
          una reserva, su código (por ejemplo, DEP-7K3QX). Podemos pedirte información adicional para verificar tu identidad.
          El área encargada de atender estas solicitudes es la administración de {NEGOCIO.nombre}.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 mt-3">
          <li>
            <strong className="text-on-surface">Consultas</strong> (conocer tus datos o cómo los usamos): respondemos en un
            máximo de 10 días hábiles, prorrogables por 5 días hábiles más, informándote el motivo.
          </li>
          <li>
            <strong className="text-on-surface">Reclamos</strong> (corrección, actualización, supresión, revocatoria o
            presunto incumplimiento): respondemos en un máximo de 15 días hábiles, prorrogables por 8 días hábiles más. Si el
            reclamo está incompleto te pediremos completarlo dentro de los 5 días siguientes; si pasan 2 meses sin respuesta,
            se entenderá desistido.
          </li>
        </ul>
        <p className="mt-3">
          También puedes cancelar tu reserva directamente desde el enlace privado que te enviamos al reservar.
        </p>
      </>
    ),
  },
  {
    id: 'terceros',
    titulo: 'Con quién compartimos tus datos',
    contenido: (
      <>
        <p>
          No vendemos ni cedemos tus datos. Para operar el servicio usamos proveedores tecnológicos que los tratan por cuenta
          nuestra (encargados), bajo instrucciones y deberes de confidencialidad y seguridad:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 mt-2">
          <li>Alojamiento del sitio web (Vercel).</li>
          <li>Base de datos y autenticación de usuarios (Supabase).</li>
          <li>Servicio de envío de correos transaccionales (confirmaciones y recordatorios de reserva).</li>
        </ul>
        <p className="mt-3">
          Algunos de estos proveedores almacenan información en servidores ubicados fuera de Colombia, principalmente en
          Estados Unidos. Esta transmisión internacional se realiza únicamente para las finalidades descritas, con proveedores
          que ofrecen niveles adecuados de protección conforme a los criterios de la Superintendencia de Industria y Comercio.
          Si nos contactas por WhatsApp, esa conversación también se rige por las políticas de dicho servicio.
        </p>
      </>
    ),
  },
  {
    id: 'seguridad',
    titulo: 'Seguridad',
    contenido: (
      <p>
        Aplicamos medidas técnicas y administrativas razonables para proteger tus datos: conexión cifrada (HTTPS), acceso a la
        información de reservas restringido al personal autorizado del negocio, contraseñas que nunca almacenamos en texto
        claro y enlaces privados firmados para consultar cada reserva.
      </p>
    ),
  },
  {
    id: 'conservacion',
    titulo: 'Cuánto tiempo conservamos tus datos',
    contenido: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Datos de reservas: hasta 24 meses después de la fecha de la experiencia.</li>
        <li>Cuenta de usuario y favoritos: mientras la cuenta esté activa o hasta que solicites su eliminación.</li>
        <li>Registros técnicos: por los plazos que definen nuestros proveedores de alojamiento con fines de seguridad.</li>
      </ul>
    ),
  },
  {
    id: 'cookies',
    titulo: 'Cookies y almacenamiento en tu navegador',
    contenido: (
      <p>
        No usamos cookies de publicidad ni de analítica de terceros. Usamos únicamente almacenamiento técnico necesario: para
        mantener la sesión de quienes inician sesión (cuentas de usuario y personal del negocio) y para recordar la sección
        del sitio que visitaste por última vez. Puedes borrarlo desde la configuración de tu navegador; algunas funciones,
        como mantener la sesión iniciada, podrían dejar de funcionar.
      </p>
    ),
  },
  {
    id: 'vigencia',
    titulo: 'Cambios y vigencia',
    contenido: (
      <p>
        Esta política rige desde el {VIGENCIA}. Si la modificamos de forma sustancial publicaremos la nueva versión en esta
        misma página indicando su fecha, y cuando el cambio afecte las finalidades del tratamiento te pediremos una nueva
        autorización. Las bases de datos permanecerán vigentes mientras existan las finalidades descritas.
      </p>
    ),
  },
];

export function PoliticaDatos() {
  return (
    <article className="animate-entrar">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.35em] text-accent-hover">Ley 1581 de 2012</p>
        <h1 className="font-serif text-4xl sm:text-5xl leading-[1.1] mt-4 text-on-surface">
          Política de tratamiento de datos personales
        </h1>
        <p className="text-on-surface-soft mt-4 text-lg leading-relaxed">
          Cuidamos la información que nos confías para reservar y vivir nuestras experiencias de café. Aquí te contamos qué
          datos usamos, para qué y cómo ejercer tus derechos.
        </p>
        <p className="text-sm text-on-surface-muted mt-3">
          {RESPONSABLE_DATOS.razonSocial} · NIT {RESPONSABLE_DATOS.nit} · Vigente desde el {VIGENCIA}
        </p>
      </header>

      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-10 mt-12">
        <nav aria-label="Contenido" className="hidden lg:block">
          <ol className="sticky top-24 space-y-2 text-sm border-l border-outline-soft">
            {SECCIONES.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block -ml-px border-l border-transparent pl-4 py-0.5 text-on-surface-muted hover:text-on-surface hover:border-primary transition-colors"
                >
                  {i + 1}. {s.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-3xl space-y-10 text-[15px] leading-relaxed text-on-surface-soft">
          {SECCIONES.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24" aria-labelledby={`titulo-${s.id}`}>
              <h2 id={`titulo-${s.id}`} className="font-serif text-2xl text-on-surface mb-4">
                <span className="text-accent-hover mr-2">{i + 1}.</span>
                {s.titulo}
              </h2>
              {s.contenido}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
