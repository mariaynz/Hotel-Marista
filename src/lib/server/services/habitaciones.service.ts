import type Database from 'better-sqlite3';

export type EstadoHabitacion = 'disponible' | 'ocupada' | 'limpieza' | 'mantenimiento';

export interface Habitacion {
	id: number;
	numero: string;
	tipo: string;
	piso: number;
	capacidad: number;
	tarifa_noche: number;
	descripcion: string;
	estado: EstadoHabitacion;
}

export interface HabitacionDisponible extends Habitacion {
	disponibles_en_categoria: number;
}

export function listarTodasHabitaciones(db: Database.Database): Habitacion[] {
	return db
		.prepare(
			`SELECT id, numero, tipo, piso, capacidad, tarifa_noche, descripcion, estado
			 FROM habitaciones
			 ORDER BY CAST(numero AS INTEGER) ASC, numero ASC`
		)
		.all() as Habitacion[];
}

export function obtenerHabitacionPorId(db: Database.Database, id: number): Habitacion | null {
	const fila = db
		.prepare(
			`SELECT id, numero, tipo, piso, capacidad, tarifa_noche, descripcion, estado
			 FROM habitaciones
			 WHERE id = ?`
		)
		.get(id) as Habitacion | undefined;
	return fila ?? null;
}

export function buscarHabitacionesDisponibles(
	db: Database.Database,
	fechaEntrada: string,
	fechaSalida: string,
	huespedes: number
): HabitacionDisponible[] {
	const disponibles = db
		.prepare(
			`SELECT h.id, h.numero, h.tipo, h.piso, h.capacidad, h.tarifa_noche, h.descripcion, h.estado
			 FROM habitaciones h
			 WHERE h.estado != 'mantenimiento'
			   AND h.capacidad >= ?
			   AND NOT EXISTS (
			       SELECT 1
			       FROM reservas r
			       WHERE r.habitacion_id = h.id
			         AND r.estado IN ('confirmada', 'en_curso')
			         AND r.fecha_entrada < ?
			         AND r.fecha_salida > ?
			   )
			 ORDER BY h.tarifa_noche ASC, CAST(h.numero AS INTEGER) ASC`
		)
		.all(huespedes, fechaSalida, fechaEntrada) as Habitacion[];

	const conteoPorTipo = new Map<string, number>();
	for (const h of disponibles) {
		conteoPorTipo.set(h.tipo, (conteoPorTipo.get(h.tipo) ?? 0) + 1);
	}

	return disponibles.map((h) => ({
		...h,
		disponibles_en_categoria: conteoPorTipo.get(h.tipo) ?? 1
	}));
}

export function cambiarEstadoHabitacion(
	db: Database.Database,
	habitacionId: number,
	nuevoEstado: EstadoHabitacion
): { ok: true } | { ok: false; error: string } {
	const hab = obtenerHabitacionPorId(db, habitacionId);
	if (!hab) {
		return { ok: false, error: 'La habitación indicada no existe.' };
	}

	if (hab.estado === 'ocupada' && nuevoEstado !== 'ocupada') {
		const reservaActiva = db
			.prepare(
				`SELECT id FROM reservas WHERE habitacion_id = ? AND estado = 'en_curso' LIMIT 1`
			)
			.get(habitacionId);
		if (reservaActiva) {
			return {
				ok: false,
				error:
					'No puedes liberar manualmente una habitación con una estancia en curso. Realiza primero el check-out.'
			};
		}
	}

	db.prepare('UPDATE habitaciones SET estado = ? WHERE id = ?').run(nuevoEstado, habitacionId);
	return { ok: true };
}

export function crearHabitacion(
	db: Database.Database,
	datos: {
		numero: string;
		tipo: string;
		piso: number;
		capacidad: number;
		tarifa_noche: number;
		descripcion: string;
	}
): { ok: true; id: number } | { ok: false; error: string } {
	const duplicada = db
		.prepare('SELECT id FROM habitaciones WHERE numero = ?')
		.get(datos.numero.trim());
	if (duplicada) {
		return { ok: false, error: `Ya existe una habitación con el número ${datos.numero.trim()}.` };
	}

	const res = db
		.prepare(
			`INSERT INTO habitaciones (numero, tipo, piso, capacidad, tarifa_noche, descripcion, estado)
			 VALUES (?, ?, ?, ?, ?, ?, 'disponible')`
		)
		.run(
			datos.numero.trim(),
			datos.tipo.trim(),
			datos.piso,
			datos.capacidad,
			datos.tarifa_noche,
			datos.descripcion.trim()
		);

	return { ok: true, id: Number(res.lastInsertRowid) };
}

export function actualizarHabitacion(
	db: Database.Database,
	id: number,
	datos: {
		tipo: string;
		piso: number;
		capacidad: number;
		tarifa_noche: number;
		descripcion: string;
		estado: EstadoHabitacion;
	}
): { ok: true } | { ok: false; error: string } {
	const hab = obtenerHabitacionPorId(db, id);
	if (!hab) {
		return { ok: false, error: 'Habitación no encontrada.' };
	}

	if (hab.estado === 'ocupada' && datos.estado !== 'ocupada') {
		const reservaActiva = db
			.prepare(`SELECT id FROM reservas WHERE habitacion_id = ? AND estado = 'en_curso' LIMIT 1`)
			.get(id);
		if (reservaActiva) {
			return {
				ok: false,
				error: 'La habitación tiene un huésped en curso; realiza el check-out antes de cambiar su estado.'
			};
		}
	}

	db.prepare(
		`UPDATE habitaciones
		 SET tipo = ?, piso = ?, capacidad = ?, tarifa_noche = ?, descripcion = ?, estado = ?
		 WHERE id = ?`
	).run(
		datos.tipo.trim(),
		datos.piso,
		datos.capacidad,
		datos.tarifa_noche,
		datos.descripcion.trim(),
		datos.estado,
		id
	);

	return { ok: true };
}
