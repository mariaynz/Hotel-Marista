import type { SqliteCompat } from './adapter';

export function aplicarEsquema(db: SqliteCompat): void {
	db.exec(`
		PRAGMA foreign_keys = ON;

		CREATE TABLE IF NOT EXISTS usuarios (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nombre TEXT NOT NULL,
			correo TEXT NOT NULL UNIQUE,
			contrasena_hash TEXT NOT NULL,
			rol TEXT NOT NULL CHECK (rol IN ('huesped', 'recepcion')),
			telefono TEXT NOT NULL DEFAULT '',
			creado_en TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS sesiones (
			id TEXT PRIMARY KEY,
			usuario_id INTEGER NOT NULL,
			expira_en TEXT NOT NULL,
			FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS habitaciones (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			numero TEXT NOT NULL UNIQUE,
			tipo TEXT NOT NULL,
			piso INTEGER NOT NULL,
			capacidad INTEGER NOT NULL CHECK (capacidad >= 1),
			tarifa_noche REAL NOT NULL CHECK (tarifa_noche > 0),
			descripcion TEXT NOT NULL DEFAULT '',
			estado TEXT NOT NULL DEFAULT 'disponible'
				CHECK (estado IN ('disponible', 'ocupada', 'limpieza', 'mantenimiento'))
		);

		CREATE TABLE IF NOT EXISTS reservas (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			codigo TEXT NOT NULL UNIQUE,
			usuario_id INTEGER,
			huesped_nombre TEXT NOT NULL,
			huesped_correo TEXT NOT NULL DEFAULT '',
			huesped_telefono TEXT NOT NULL DEFAULT '',
			habitacion_id INTEGER NOT NULL,
			fecha_entrada TEXT NOT NULL,
			fecha_salida TEXT NOT NULL,
			huespedes INTEGER NOT NULL CHECK (huespedes >= 1),
			estado TEXT NOT NULL DEFAULT 'confirmada'
				CHECK (estado IN ('confirmada', 'en_curso', 'completada', 'cancelada')),
			origen TEXT NOT NULL DEFAULT 'web'
				CHECK (origen IN ('web', 'presencial')),
			identificacion_verificada INTEGER NOT NULL DEFAULT 0 CHECK (identificacion_verificada IN (0, 1)),
							total REAL NOT NULL CHECK (total >= 0),
				tarifa_noche REAL NOT NULL DEFAULT 0,

			creado_en TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
			FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id) ON DELETE RESTRICT,
			CHECK (fecha_salida > fecha_entrada)
		);

		CREATE TABLE IF NOT EXISTS consumos (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			reserva_id INTEGER NOT NULL,
			concepto TEXT NOT NULL,
			monto REAL NOT NULL CHECK (monto > 0),
			fecha TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE
		);

		CREATE INDEX IF NOT EXISTS idx_reservas_habitacion_fechas
			ON reservas (habitacion_id, estado, fecha_entrada, fecha_salida);

		CREATE INDEX IF NOT EXISTS idx_reservas_usuario
			ON reservas (usuario_id);

		CREATE INDEX IF NOT EXISTS idx_sesiones_usuario
							ON sesiones (usuario_id);
		`);

	// Migración para bases creadas antes de guardar la tarifa en la reserva
	const columnas = db.prepare('PRAGMA table_info(reservas)').all() as Array<{ name: string }>;
	if (!columnas.some((c) => c.name === 'tarifa_noche')) {
		db.exec('ALTER TABLE reservas ADD COLUMN tarifa_noche REAL NOT NULL DEFAULT 0');
	}
}

// Congela la tarifa en reservas que aún no la tienen (seed o bases viejas)
export function rellenarTarifasReservas(db: SqliteCompat): void {
	db.exec(`
		UPDATE reservas
		SET tarifa_noche = (SELECT h.tarifa_noche FROM habitaciones h WHERE h.id = reservas.habitacion_id)
		WHERE tarifa_noche = 0
	`);
}
