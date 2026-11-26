import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { listarTodasHabitaciones } from '$lib/server/services/habitaciones.service';
import {
	agregarConsumoReserva,
	crearReservaTransaccional,
	listarConsumosPorReserva,
	listarMovimientosDelDia,
	listarTodasReservasRecepcion,
	obtenerMetricasDelDia,
	realizarCheckIn,
	realizarCheckOut
} from '$lib/server/services/reservas.service';
import { esCorreoValido, validarRangoBusqueda } from '$lib/server/validators';
import { obtenerFechaHoyISO } from '$lib/utils/format';

export const load: PageServerLoad = async ({ url }) => {
	const db = getDb();
	const hoy = obtenerFechaHoyISO();
	const q = url.searchParams.get('q') || '';
	const vista = url.searchParams.get('vista') || 'panel';

	const metricas = obtenerMetricasDelDia(db, hoy);
	const movimientosDia = listarMovimientosDelDia(db, hoy, q);
	const todasReservas = vista === 'reservas' ? listarTodasReservasRecepcion(db, q) : [];
	const habitaciones = listarTodasHabitaciones(db);

	const consumosPorReserva: Record<
		number,
		Array<{ id: number; concepto: string; monto: number }>
	> = {};
	for (const r of movimientosDia) {
		if (r.estado === 'en_curso') {
			consumosPorReserva[r.id] = listarConsumosPorReserva(db, r.id);
		}
	}

	const huespedesDirectorio =
		vista === 'huespedes'
			? (db
					.prepare(
						`SELECT id, nombre, correo, telefono, creado_en
						 FROM usuarios
						 WHERE rol = 'huesped'
						 ORDER BY nombre ASC`
					)
					.all() as Array<{
					id: number;
					nombre: string;
					correo: string;
					telefono: string;
					creado_en: string;
				}>)
			: [];

	return {
		hoy,
		q,
		vista,
		metricas,
		movimientosDia,
		todasReservas,
		habitaciones,
		consumosPorReserva,
		huespedesDirectorio
	};
};

export const actions: Actions = {
	checkin: async ({ request }) => {
		const datos = await request.formData();
		const reservaId = Number(datos.get('reserva_id'));
		const identificacionVerificada = datos.get('identificacion_verificada') === 'on';
		const habitacionReasignadaRaw = datos.get('habitacion_reasignada_id');
		const habitacionReasignadaId = habitacionReasignadaRaw
			? Number(habitacionReasignadaRaw)
			: null;

		const db = getDb();
		const resultado = realizarCheckIn(db, {
			reservaId,
			identificacionVerificada,
			habitacionReasignadaId
		});

		if (!resultado.ok) {
			return fail(400, { errorOperacion: resultado.error });
		}

		return { mensajeExito: 'Check-in completado. La habitación ahora figura como ocupada.' };
	},

	agregarConsumo: async ({ request }) => {
		const datos = await request.formData();
		const reservaId = Number(datos.get('reserva_id'));
		const concepto = String(datos.get('concepto') ?? '');
		const monto = Number(datos.get('monto'));

		const db = getDb();
		const resultado = agregarConsumoReserva(db, reservaId, concepto, monto);
		if (!resultado.ok) {
			return fail(400, { errorOperacion: resultado.error, reservaIdConsumo: reservaId });
		}

		return {
			mensajeExito: 'Consumo agregado correctamente a la cuenta del huésped.',
			reservaIdConsumo: reservaId
		};
	},

	checkout: async ({ request }) => {
		const datos = await request.formData();
		const reservaId = Number(datos.get('reserva_id'));

		const db = getDb();
		const resultado = realizarCheckOut(db, reservaId);

		if (!resultado.ok) {
			return fail(400, { errorOperacion: resultado.error });
		}

		return {
			mensajeExito:
				'Check-out finalizado. La habitación pasó a estado Limpieza para su preparación.'
		};
	},

	nuevaReservaPresencial: async ({ request }) => {
		const datos = await request.formData();
		const huespedNombre = String(datos.get('huesped_nombre') ?? '');
		const huespedCorreo = String(datos.get('huesped_correo') ?? '');
		const huespedTelefono = String(datos.get('huesped_telefono') ?? '');
		const habitacionId = Number(datos.get('habitacion_id'));
		const fechaEntrada = String(datos.get('fecha_entrada') ?? '');
		const fechaSalida = String(datos.get('fecha_salida') ?? '');
		const huespedes = Number(datos.get('huespedes') ?? '1');

		if (!huespedNombre.trim()) {
			return fail(400, { errorOperacion: 'El nombre del huésped es obligatorio.' });
		}

					if (huespedCorreo.trim() && !esCorreoValido(huespedCorreo)) {
				return fail(400, { errorOperacion: 'El correo del huésped no tiene un formato válido.' });
			}
			if (huespedTelefono.trim() && huespedTelefono.trim().length < 8) {
				return fail(400, { errorOperacion: 'El teléfono debe tener al menos 8 dígitos.' });
			}

			const hoy = obtenerFechaHoyISO();
			const errores = validarRangoBusqueda(fechaEntrada, fechaSalida, huespedes, hoy);
			if (Object.keys(errores).length > 0) {
				const primerError = Object.values(errores)[0];
			return fail(400, { errorOperacion: primerError });
		}

					const db = getDb();
			// Si el huésped ya tiene cuenta, la reserva queda ligada a ella (la verá en "Mis reservas")
			const cuenta = huespedCorreo.trim()
				? (db
						.prepare(`SELECT id FROM usuarios WHERE LOWER(correo) = LOWER(?) AND rol = 'huesped'`)
						.get(huespedCorreo.trim()) as { id: number } | undefined)
				: undefined;
			const resultado = crearReservaTransaccional(db, {
				usuarioId: cuenta?.id ?? null,
			huespedNombre,
			huespedCorreo,
			huespedTelefono,
			habitacionId,
			fechaEntrada,
			fechaSalida,
			huespedes,
			origen: 'presencial'
		});

		if (!resultado.ok) {
			return fail(400, { errorOperacion: resultado.error });
		}

		return {
			mensajeExito: `Reserva presencial creada con el código #${resultado.codigo}.`
		};
	}
};
