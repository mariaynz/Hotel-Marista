import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import {
	actualizarHabitacion,
	crearHabitacion,
	listarTodasHabitaciones,
	type EstadoHabitacion
} from '$lib/server/services/habitaciones.service';
import { validarNuevaHabitacion } from '$lib/server/validators';

export const load: PageServerLoad = async () => {
	const db = getDb();
	const habitaciones = listarTodasHabitaciones(db);
	return {
		habitaciones
	};
};

export const actions: Actions = {
	actualizar: async ({ request }) => {
		const datos = await request.formData();
		const id = Number(datos.get('habitacion_id'));
		const tipo = String(datos.get('tipo') ?? '');
		const piso = Number(datos.get('piso'));
		const capacidad = Number(datos.get('capacidad'));
		const tarifa_noche = Number(datos.get('tarifa_noche'));
		const descripcion = String(datos.get('descripcion') ?? '');
		const estado = String(datos.get('estado') ?? 'disponible') as EstadoHabitacion;

		const errores = validarNuevaHabitacion({
			numero: 'OK',
			tipo,
			piso,
			capacidad,
			tarifa_noche,
			descripcion
		});

		if (Object.keys(errores).length > 0) {
			return fail(400, { errorHabitacion: Object.values(errores)[0] });
		}

		const db = getDb();
		const res = actualizarHabitacion(db, id, {
			tipo,
			piso,
			capacidad,
			tarifa_noche,
			descripcion,
			estado
		});

		if (!res.ok) {
			return fail(400, { errorHabitacion: res.error });
		}

		return { mensajeExito: 'Estado y datos de la habitación actualizados correctamente.' };
	},

	crear: async ({ request }) => {
		const datos = await request.formData();
		const numero = String(datos.get('numero') ?? '');
		const tipo = String(datos.get('tipo') ?? '');
		const piso = Number(datos.get('piso'));
		const capacidad = Number(datos.get('capacidad'));
		const tarifa_noche = Number(datos.get('tarifa_noche'));
		const descripcion = String(datos.get('descripcion') ?? '');

		const errores = validarNuevaHabitacion({
			numero,
			tipo,
			piso,
			capacidad,
			tarifa_noche,
			descripcion
		});

		if (Object.keys(errores).length > 0) {
			return fail(400, { errorHabitacion: Object.values(errores)[0] });
		}

		const db = getDb();
		const res = crearHabitacion(db, {
			numero,
			tipo,
			piso,
			capacidad,
			tarifa_noche,
			descripcion
		});

		if (!res.ok) {
			return fail(400, { errorHabitacion: res.error });
		}

		return { mensajeExito: `Habitación ${numero.trim()} agregada al inventario.` };
	}
};
