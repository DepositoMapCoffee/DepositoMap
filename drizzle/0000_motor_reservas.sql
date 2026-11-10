CREATE TABLE "tasting_ajustes" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"anticipacion_min_minutos" integer DEFAULT 120 NOT NULL,
	"dias_max_futuro" integer DEFAULT 60 NOT NULL,
	"cupos_max_por_reserva" integer DEFAULT 4 NOT NULL,
	"horas_min_cancelacion" integer DEFAULT 24 NOT NULL,
	"cerrar_festivos" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fila_unica" CHECK ("tasting_ajustes"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE "tasting_ajustes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tasting_bloqueos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fecha" date NOT NULL,
	"hora_inicio" text,
	"motivo" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasting_bloqueos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tasting_experiencias" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"resumen" text NOT NULL,
	"descripcion" text NOT NULL,
	"imagen" text,
	"tematica" text NOT NULL,
	"cafes" text NOT NULL,
	"idiomas" text[] NOT NULL,
	"ubicacion" text NOT NULL,
	"precio" integer NOT NULL,
	"duracion_min" integer NOT NULL,
	"activa" boolean DEFAULT true NOT NULL,
	"orden" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "precio_no_negativo" CHECK ("tasting_experiencias"."precio" >= 0),
	CONSTRAINT "duracion_positiva" CHECK ("tasting_experiencias"."duracion_min" > 0)
);
--> statement-breakpoint
ALTER TABLE "tasting_experiencias" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tasting_horarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dia_semana" smallint NOT NULL,
	"hora_inicio" text NOT NULL,
	"capacidad" integer NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dia_semana_valido" CHECK ("tasting_horarios"."dia_semana" BETWEEN 0 AND 6),
	CONSTRAINT "hora_valida" CHECK ("tasting_horarios"."hora_inicio" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
	CONSTRAINT "capacidad_positiva" CHECK ("tasting_horarios"."capacidad" > 0)
);
--> statement-breakpoint
ALTER TABLE "tasting_horarios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tasting_reservas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"experiencia_id" text NOT NULL,
	"fecha" date NOT NULL,
	"hora_inicio" text NOT NULL,
	"cupos" integer NOT NULL,
	"idioma" text NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"telefono" text NOT NULL,
	"notas" text,
	"precio_unitario" integer NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"canal" text DEFAULT 'web' NOT NULL,
	"token_hash" text NOT NULL,
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cupos_positivos" CHECK ("tasting_reservas"."cupos" > 0),
	CONSTRAINT "estado_valido" CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada', 'no_show')),
	CONSTRAINT "canal_valido" CHECK (canal IN ('web', 'whatsapp', 'telefono', 'presencial', 'bot'))
);
--> statement-breakpoint
ALTER TABLE "tasting_reservas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tasting_reservas_historial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reserva_id" uuid NOT NULL,
	"estado_anterior" text,
	"estado_nuevo" text NOT NULL,
	"actor" text NOT NULL,
	"nota" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasting_reservas_historial" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tasting_reservas" ADD CONSTRAINT "tasting_reservas_experiencia_id_tasting_experiencias_id_fk" FOREIGN KEY ("experiencia_id") REFERENCES "public"."tasting_experiencias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasting_reservas_historial" ADD CONSTRAINT "tasting_reservas_historial_reserva_id_tasting_reservas_id_fk" FOREIGN KEY ("reserva_id") REFERENCES "public"."tasting_reservas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasting_bloqueos_fecha_idx" ON "tasting_bloqueos" USING btree ("fecha");--> statement-breakpoint
CREATE UNIQUE INDEX "tasting_horarios_dia_hora_uq" ON "tasting_horarios" USING btree ("dia_semana","hora_inicio");--> statement-breakpoint
CREATE UNIQUE INDEX "tasting_reservas_codigo_uq" ON "tasting_reservas" USING btree ("codigo");--> statement-breakpoint
CREATE UNIQUE INDEX "tasting_reservas_idem_uq" ON "tasting_reservas" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "tasting_reservas_fecha_hora_idx" ON "tasting_reservas" USING btree ("fecha","hora_inicio");--> statement-breakpoint
CREATE INDEX "tasting_reservas_email_idx" ON "tasting_reservas" USING btree ("email");--> statement-breakpoint
CREATE INDEX "tasting_historial_reserva_idx" ON "tasting_reservas_historial" USING btree ("reserva_id");