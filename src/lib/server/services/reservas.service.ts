import type { SqliteCompat } from '../db/adapter';
import { randomBytes } from 'node:crypto';
import { calcularNoches, obtenerFechaHoyISO } from '../../utils/format';

export type EstadoReserva = 'confirmada' | 'en_curso' | 'completada' | 'cancelada';

export interface ReservaDetalle {
	id: number;
	codigo: string;
	usuario_id: number | null;
	huesped_nombre: string;
	huesped_correo: string;
	huesped_telefono: string;
	habitacion_id: number;
	habitacion_numero: string;
	habitacion_tipo: string;
	habitacion_estado: 'disponible' | 'ocupada' | 'limpieza' | 'mantenimiento';
	tarifa_noche: number;
	fecha_entrada: string;
	fecha_salida: string;
	huespedes: number;
	estado: EstadoReserva;
	origen: 'web' | 'presencial';
	identificacion_verificada: number;
	total: number;
	creado_en: string;
	noches: number;
	total_consumos: number;
}

export interface Consumo {
	id: number;
	reserva_id: number;
	concepto: string;
	monto: number;
	fecha: string;
}

export interface MetricasDia {
	llegadasHoy: number;
	salidasHoy: number;
	porcentajeOcupacion: number;
	habitacionesDisponibles: number;
	enCursoTotal: number;
	conteoEstados: {
		disponible: number;
		ocupada: number;
		limpieza: number;
		mantenimiento: number;
	};
}

export function generarCodigoReserva(db: SqliteCompat, anio: number = new Date().getFullYear()): string {
	const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	for (let intento = 0; intento < 20; intento++) {
		const bytes = randomBytes(6);
		let sufijo = '';
		for (let i = 0; i < 6; i++) {
			sufijo += alfabeto[bytes[i] % alfabeto.length];
		}
		const codigo = `HMG-${anio}-${sufijo}`;
		const existe = db.prepare('SELECT id FROM reservas WHERE codigo = ?').get(codigo);
		if (!existe) {
			return codigo;
		}
	}
	throw new Error('No se pudo generar un código de reserva único.');
}

export function existeEmpalmeReserva(
	db: SqliteCompat,
	habitacionId: number,
	fechaEntrada: string,
	fechaSalida: string,
	excluirReservaId?: number
): boolean {
	const consulta = excluirReservaId
		? `SELECT 1 FROM reservas
		   WHERE habitacion_id = ?
		     AND id != ?
		     AND estado IN ('confirmada', 'en_curso')
		     AND fecha_entrada < ?
		     AND fecha_salida > ?
		   LIMIT 1`
		: `SELECT 1 FROM reservas
		   WHERE habitacion_id = ?
		     AND estado IN ('confirmada', 'en_curso')
		     AND fecha_entrada < ?
		     AND fecha_salida > ?
		   LIMIT 1`;

	const fila = excluirReservaId
		? db.prepare(consulta).get(habitacionId, excluirReservaId, fechaSalida, fechaEntrada)
		: db.prepare(consulta).get(habitacionId, fechaSalida, fechaEntrada);

	return Boolean(fila);
}

export function crearReservaTransaccional(
	db: SqliteCompat,
	datos: {
		usuarioId: number | null;
		huespedNombre: string;
		huespedCorreo: string;
		huespedTelefono: string;
		habitacionId: number;
		fechaEntrada: string;
		fechaSalida: string;
		huespedes: number;
		origen: 'web' | 'presencial';
	}
):
	| { ok: true; reservaId: number; codigo: string; total: number }
	| { ok: false; sinDisponibilidad: boolean; error: string } {
	const noches = calcularNoches(datos.fechaEntrada, datos.fechaSalida);
	if (noches < 1) {
		return {
			ok: false,
			sinDisponibilidad: false,
			error: 'La fecha de salida debe ser posterior a la fecha de llegada.'
		};
	}

	const ejecutarTx = db.transaction(() => {
		const hab = db
			.prepare(
				`SELECT id, capacidad, tarifa_noche, estado
				 FROM habitaciones
				 WHERE id = ?`
			)
			.get(datos.habitacionId) as
			| { id: number; capacidad: number; tarifa_noche: number; estado: string }
			| undefined;

		if (!hab) {
			return {
				ok: false as const,
				sinDisponibilidad: true,
				error: 'La habitación seleccionada ya no existe. Por favor intenta cambiar fechas.'
			};
		}

		if (hab.estado === 'mantenimiento') {
			return {
				ok: false as const,
				sinDisponibilidad: true,
				error: 'La habitación entró en mantenimiento. Por favor intenta cambiar fechas.'
			};
		}

		if (datos.huespedes < 1 || datos.huespedes > hab.capacidad) {
			return {
				ok: false as const,
				sinDisponibilidad: false,
				error: `La habitación admite máximo ${hab.capacidad} huéspedes.`
			};
		}

		if (existeEmpalmeReserva(db, datos.habitacionId, datos.fechaEntrada, datos.fechaSalida)) {
			return {
				ok: false as const,
				sinDisponibilidad: true,
				error:
					'Esta habitación ya fue reservada en las fechas elegidas. Por favor selecciona otra o prueba cambiar fechas.'
			};
		}

		const codigo = generarCodigoReserva(db, Number(datos.fechaEntrada.slice(0, 4)));
		const total = noches * hab.tarifa_noche;

		const res = db
			.prepare(
				`INSERT INTO reservas (
					codigo, usuario_id, huesped_nombre, huesped_correo, huesped_telefono,
					habitacion_id, fecha_entrada, fecha_salida, huespedes, estado, origen,
					identificacion_verificada, total, tarifa_noche
					)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmada', ?, 0, ?, ?)`
			)
			.run(
				codigo,
				datos.usuarioId,
				datos.huespedNombre.trim(),
				datos.huespedCorreo.trim(),
				datos.huespedTelefono.trim(),
				datos.habitacionId,
				datos.fechaEntrada,
				datos.fechaSalida,
				datos.huespedes,
									datos.origen,
					total,
					hab.tarifa_noche
				);

		return {
			ok: true as const,
			reservaId: Number(res.lastInsertRowid),
			codigo,
			total
		};
	});

	return ejecutarTx.immediate();
}

export function listarReservasPorUsuario(
	db: SqliteCompat,
	usuarioId: number
): ReservaDetalle[] {
	const filas = db
		.prepare(
			`SELECT
				r.*,
				h.numero AS habitacion_numero,
				h.tipo AS habitacion_tipo,
				h.estado AS habitacion_estado,
				h.tarifa_noche,
				COALESCE((SELECT SUM(c.monto) FROM consumos c WHERE c.reserva_id = r.id), 0) AS total_consumos
			 FROM reservas r
			 INNER JOIN habitaciones h ON h.id = r.habitacion_id
			 WHERE r.usuario_id = ?
			 ORDER BY r.fecha_entrada ASC, r.id DESC`
		)
		.all(usuarioId) as Array<Omit<ReservaDetalle, 'noches'>>;

	return filas.map((f) => ({
		...f,
		noches: calcularNoches(f.fecha_entrada, f.fecha_salida)
	}));
}

export function cancelarReservaHuesped(
	db: SqliteCompat,
	reservaId: number,
	usuarioId: number,
	hoyISO: string = obtenerFechaHoyISO()
): { ok: true } | { ok: false; error: string } {
	const reserva = db
		.prepare('SELECT id, usuario_id, estado, fecha_entrada FROM reservas WHERE id = ?')
		.get(reservaId) as
		| { id: number; usuario_id: number | null; estado: EstadoReserva; fecha_entrada: string }
		| undefined;

	if (!reserva || reserva.usuario_id !== usuarioId) {
		return { ok: false, error: 'No se encontró la reservación.' };
	}

	if (reserva.estado !== 'confirmada') {
		return { ok: false, error: 'Solo es posible cancelar reservaciones confirmadas.' };
	}

	if (reserva.fecha_entrada < hoyISO) {
		return { ok: false, error: 'No se puede cancelar una reservación cuya fecha ya inició.' };
	}

	db.prepare(`UPDATE reservas SET estado = 'cancelada' WHERE id = ?`).run(reservaId);
	return { ok: true };
}

export function obtenerMetricasDelDia(
	db: SqliteCompat,
	hoyISO: string = obtenerFechaHoyISO()
): MetricasDia {
	const habitaciones = db
		.prepare('SELECT estado FROM habitaciones')
		.all() as Array<{ estado: 'disponible' | 'ocupada' | 'limpieza' | 'mantenimiento' }>;

	const conteoEstados = {
		disponible: 0,
		ocupada: 0,
		limpieza: 0,
		mantenimiento: 0
	};
	for (const h of habitaciones) {
		conteoEstados[h.estado]++;
	}

	// La ocupación se calcula sobre habitaciones operativas (sin mantenimiento)
	const totalHabitaciones = Math.max(1, habitaciones.length - conteoEstados.mantenimiento);
	const porcentajeOcupacion = Math.round((conteoEstados.ocupada / totalHabitaciones) * 100);

	const llegadas = db
		.prepare(
			`SELECT COUNT(*) AS total FROM reservas
			 WHERE fecha_entrada = ? AND estado = 'confirmada'`
		)
		.get(hoyISO) as { total: number };

	const salidas = db
		.prepare(
			`SELECT COUNT(*) AS total FROM reservas
			 WHERE fecha_salida <= ? AND estado = 'en_curso'`
		)
		.get(hoyISO) as { total: number };

	const enCurso = db
		.prepare(`SELECT COUNT(*) AS total FROM reservas WHERE estado = 'en_curso'`)
		.get() as { total: number };

	return {
		llegadasHoy: llegadas.total,
		salidasHoy: salidas.total,
		porcentajeOcupacion,
		habitacionesDisponibles: conteoEstados.disponible,
		enCursoTotal: enCurso.total,
		conteoEstados
	};
}

export function listarMovimientosDelDia(
	db: SqliteCompat,
	hoyISO: string = obtenerFechaHoyISO(),
	filtroBusqueda: string = ''
): ReservaDetalle[] {
	const termino = `%${filtroBusqueda.trim().replace(/^#/, '')}%`;
	const filas = db
		.prepare(
			`SELECT
				r.*,
				h.numero AS habitacion_numero,
				h.tipo AS habitacion_tipo,
				h.estado AS habitacion_estado,
				h.tarifa_noche,
				COALESCE((SELECT SUM(c.monto) FROM consumos c WHERE c.reserva_id = r.id), 0) AS total_consumos
			 FROM reservas r
			 INNER JOIN habitaciones h ON h.id = r.habitacion_id
			 WHERE (
			   (r.estado = 'confirmada' AND r.fecha_entrada <= ?)
			   OR r.estado = 'en_curso'
			 )
			 AND (
			   ? = '%%'
			   OR r.codigo LIKE ?
			   OR r.huesped_nombre LIKE ?
			   OR h.numero LIKE ?
			 )
			 ORDER BY
			   CASE WHEN r.estado = 'confirmada' THEN 0 ELSE 1 END ASC,
			   r.fecha_entrada ASC,
			   r.id ASC`
		)
		.all(hoyISO, termino, termino, termino, termino) as Array<Omit<ReservaDetalle, 'noches'>>;

	return filas.map((f) => ({
		...f,
		noches: calcularNoches(f.fecha_entrada, f.fecha_salida)
	}));
}

export function listarTodasReservasRecepcion(
	db: SqliteCompat,
	filtroBusqueda: string = ''
): ReservaDetalle[] {
	const termino = `%${filtroBusqueda.trim().replace(/^#/, '')}%`;
	const filas = db
		.prepare(
			`SELECT
				r.*,
				h.numero AS habitacion_numero,
				h.tipo AS habitacion_tipo,
				h.estado AS habitacion_estado,
				h.tarifa_noche,
				COALESCE((SELECT SUM(c.monto) FROM consumos c WHERE c.reserva_id = r.id), 0) AS total_consumos
			 FROM reservas r
			 INNER JOIN habitaciones h ON h.id = r.habitacion_id
			 WHERE ? = '%%'
			    OR r.codigo LIKE ?
			    OR r.huesped_nombre LIKE ?
			    OR h.numero LIKE ?
			 ORDER BY r.fecha_entrada DESC, r.id DESC`
		)
		.all(termino, termino, termino, termino) as Array<Omit<ReservaDetalle, 'noches'>>;

	return filas.map((f) => ({
		...f,
		noches: calcularNoches(f.fecha_entrada, f.fecha_salida)
	}));
}

export function listarConsumosPorReserva(db: SqliteCompat, reservaId: number): Consumo[] {
	return db
		.prepare('SELECT id, reserva_id, concepto, monto, fecha FROM consumos WHERE reserva_id = ? ORDER BY id ASC')
		.all(reservaId) as Consumo[];
}

export function agregarConsumoReserva(
	db: SqliteCompat,
	reservaId: number,
	concepto: string,
	monto: number
): { ok: true } | { ok: false; error: string } {
	if (!concepto.trim()) {
		return { ok: false, error: 'El concepto del consumo es obligatorio.' };
	}
	if (Number.isNaN(monto) || monto <= 0) {
		return { ok: false, error: 'El monto debe ser mayor a $0 MXN.' };
	}

	const reserva = db
		.prepare('SELECT id, estado FROM reservas WHERE id = ?')
		.get(reservaId) as { id: number; estado: EstadoReserva } | undefined;

	if (!reserva || reserva.estado !== 'en_curso') {
		return { ok: false, error: 'Solo se pueden agregar consumos a reservas en curso.' };
	}

	db.prepare('INSERT INTO consumos (reserva_id, concepto, monto) VALUES (?, ?, ?)').run(
		reservaId,
		concepto.trim(),
		monto
	);
	return { ok: true };
}

export function realizarCheckIn(
	db: SqliteCompat,
	datos: {
		reservaId: number;
		identificacionVerificada: boolean;
		habitacionReasignadaId?: number | null;
		hoyISO?: string;
	}
): { ok: true } | { ok: false; error: string } {
	const hoy = datos.hoyISO ?? obtenerFechaHoyISO();

	if (!datos.identificacionVerificada) {
		return {
			ok: false,
			error: 'Debes confirmar que la identificación oficial del huésped fue verificada.'
		};
	}

	const ejecutarTx = db.transaction(() => {
		const reserva = db
			.prepare(
				`SELECT id, habitacion_id, fecha_entrada, fecha_salida, huespedes, estado
				 FROM reservas WHERE id = ?`
			)
			.get(datos.reservaId) as
			| {
					id: number;
					habitacion_id: number;
					fecha_entrada: string;
					fecha_salida: string;
					huespedes: number;
					estado: EstadoReserva;
			  }
			| undefined;

		if (!reserva) {
			return { ok: false as const, error: 'La reservación no existe.' };
		}

		if (reserva.estado !== 'confirmada') {
			return {
				ok: false as const,
				error: 'Solo se puede realizar check-in en reservaciones confirmadas.'
			};
		}

		if (reserva.fecha_entrada > hoy) {
			return {
				ok: false as const,
				error: 'No se puede hacer check-in antes de la fecha de entrada programada.'
			};
		}

		const habitacionObjetivoId = datos.habitacionReasignadaId || reserva.habitacion_id;
		const habitacion = db
			.prepare('SELECT id, numero, capacidad, tarifa_noche, estado FROM habitaciones WHERE id = ?')
			.get(habitacionObjetivoId) as
			| { id: number; numero: string; capacidad: number; tarifa_noche: number; estado: string }
			| undefined;

		if (!habitacion) {
			return { ok: false as const, error: 'La habitación seleccionada no existe.' };
		}

		if (habitacion.estado !== 'disponible') {
			return {
				ok: false as const,
				error: `La habitación ${habitacion.numero} está en estado "${habitacion.estado}". Selecciona otra habitación disponible.`
			};
		}

		if (habitacion.capacidad < reserva.huespedes) {
			return {
				ok: false as const,
				error: `La habitación ${habitacion.numero} tiene capacidad máxima para ${habitacion.capacidad} huéspedes.`
			};
		}

		if (
			existeEmpalmeReserva(
				db,
				habitacionObjetivoId,
				reserva.fecha_entrada,
				reserva.fecha_salida,
				reserva.id
			)
		) {
			return {
				ok: false as const,
				error: `La habitación ${habitacion.numero} tiene otra reserva empalmada en estas fechas.`
			};
		}

		

		db.prepare(
			`UPDATE reservas
			 SET habitacion_id = ?,
			     estado = 'en_curso',
			     			     identificacion_verificada = 1
				 WHERE id = ?`
			).run(habitacionObjetivoId, reserva.id);

		db.prepare(`UPDATE habitaciones SET estado = 'ocupada' WHERE id = ?`).run(
			habitacionObjetivoId
		);

		return { ok: true as const };
	});

	return ejecutarTx.immediate();
}

export function realizarCheckOut(
	db: SqliteCompat,
	reservaId: number
): { ok: true; totalFinal: number } | { ok: false; error: string } {
	const ejecutarTx = db.transaction(() => {
		const reserva = db
			.prepare(
				`SELECT id, habitacion_id, fecha_entrada, fecha_salida, estado, tarifa_noche
					 FROM reservas
					 WHERE id = ?`
			)
			.get(reservaId) as
			| {
					id: number;
					habitacion_id: number;
					fecha_entrada: string;
					fecha_salida: string;
					estado: EstadoReserva;
					tarifa_noche: number;
			  }
			| undefined;

		if (!reserva) {
			return { ok: false as const, error: 'La reservación no existe.' };
		}

		if (reserva.estado !== 'en_curso') {
			return {
				ok: false as const,
				error: 'Solo se puede realizar check-out a reservaciones en curso.'
			};
		}

		const sumaConsumos = db
			.prepare('SELECT COALESCE(SUM(monto), 0) AS total FROM consumos WHERE reserva_id = ?')
			.get(reservaId) as { total: number };

		const noches = calcularNoches(reserva.fecha_entrada, reserva.fecha_salida);
		const totalFinal = noches * reserva.tarifa_noche + sumaConsumos.total;

		db.prepare(`UPDATE reservas SET estado = 'completada', total = ? WHERE id = ?`).run(
			totalFinal,
			reservaId
		);

		db.prepare(`UPDATE habitaciones SET estado = 'limpieza' WHERE id = ?`).run(
			reserva.habitacion_id
		);

		return { ok: true as const, totalFinal };
	});

	return ejecutarTx.immediate();
}
