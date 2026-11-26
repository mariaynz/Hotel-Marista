import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { buscarHabitacionesDisponibles } from '$lib/server/services/habitaciones.service';
import { crearReservaTransaccional } from '$lib/server/services/reservas.service';
import { validarRangoBusqueda, type ErroresValidacion } from '$lib/server/validators';
import { obtenerFechaHoyISO, sumarDiasISO } from '$lib/utils/format';

export const load: PageServerLoad = async ({ url }) => {
	const db = getDb();
	const hoy = obtenerFechaHoyISO();

	const entradaParam = url.searchParams.get('entrada') || sumarDiasISO(hoy, 1);
	const salidaParam = url.searchParams.get('salida') || sumarDiasISO(hoy, 3);
	const huespedesParam = Number(url.searchParams.get('huespedes') || '2');
	const motivoRedireccion = url.searchParams.get('motivo');

	const errores = validarRangoBusqueda(entradaParam, salidaParam, huespedesParam, hoy);
	if (Object.keys(errores).length > 0) {
		return {
			fechaEntrada: entradaParam,
			fechaSalida: salidaParam,
			huespedes: Number.isNaN(huespedesParam) ? 2 : huespedesParam,
			habitaciones: [],
			errores,
			mensajeSinDisponibilidad:
				motivoRedireccion === 'cambiar_fechas'
					? 'La habitación dejó de estar disponible para ese rango. Por favor intenta cambiar fechas.'
					: ''
		};
	}

	const habitaciones = buscarHabitacionesDisponibles(
		db,
		entradaParam,
		salidaParam,
		huespedesParam
	);

	return {
		fechaEntrada: entradaParam,
		fechaSalida: salidaParam,
		huespedes: huespedesParam,
		habitaciones,
		errores: {} as ErroresValidacion,
		mensajeSinDisponibilidad:
			motivoRedireccion === 'cambiar_fechas'
				? 'La habitación dejó de estar disponible en el último momento. Por favor selecciona otra habitación o prueba cambiar fechas.'
				: ''
	};
};

export const actions: Actions = {
	reservar: async ({ request, locals }) => {
		const usuario = locals.usuario!;
		const datos = await request.formData();

		const habitacionId = Number(datos.get('habitacion_id'));
		const fechaEntrada = String(datos.get('fecha_entrada') ?? '');
		const fechaSalida = String(datos.get('fecha_salida') ?? '');
		const huespedes = Number(datos.get('huespedes') ?? '1');

		const hoy = obtenerFechaHoyISO();
		const errores = validarRangoBusqueda(fechaEntrada, fechaSalida, huespedes, hoy);
		if (Object.keys(errores).length > 0) {
			return fail(400, {
				errorReserva: 'Verifica que las fechas y el número de huéspedes sean válidos.'
			});
		}

		const db = getDb();
		const resultado = crearReservaTransaccional(db, {
			usuarioId: usuario.id,
			huespedNombre: usuario.nombre,
			huespedCorreo: usuario.correo,
			huespedTelefono: usuario.telefono,
			habitacionId,
			fechaEntrada,
			fechaSalida,
			huespedes,
			origen: 'web'
		});

		if (!resultado.ok) {
			if (resultado.sinDisponibilidad) {
				const params = new URLSearchParams({
					entrada: fechaEntrada,
					salida: fechaSalida,
					huespedes: String(huespedes),
					motivo: 'cambiar_fechas'
				});
				throw redirect(303, `/huesped/buscar?${params.toString()}`);
			}
			return fail(400, { errorReserva: resultado.error });
		}

		throw redirect(303, `/huesped/reservas?creada=${encodeURIComponent(resultado.codigo)}`);
	}
};
