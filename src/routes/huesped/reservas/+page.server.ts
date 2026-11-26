import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import {
	cancelarReservaHuesped,
	listarReservasPorUsuario
} from '$lib/server/services/reservas.service';
import { obtenerFechaHoyISO } from '$lib/utils/format';

export const load: PageServerLoad = async ({ locals, url }) => {
	const db = getDb();
	const usuario = locals.usuario!;
	const hoy = obtenerFechaHoyISO();

	const todas = listarReservasPorUsuario(db, usuario.id);
	const proximas = todas.filter(
		(r) => r.estado === 'confirmada' || r.estado === 'en_curso'
	);
	const anteriores = todas.filter(
				(r) => r.estado === 'completada' || r.estado === 'cancelada'
	).sort((a, b) => b.fecha_entrada.localeCompare(a.fecha_entrada));

	return {
		proximas,
		anteriores,
		hoy,
		codigoRecienCreado: url.searchParams.get('creada') || ''
	};
};

export const actions: Actions = {
	cancelar: async ({ request, locals }) => {
		const usuario = locals.usuario!;
		const datos = await request.formData();
		const reservaId = Number(datos.get('reserva_id'));

		const db = getDb();
		const resultado = cancelarReservaHuesped(db, reservaId, usuario.id);

		if (!resultado.ok) {
			return fail(400, { errorCancelacion: resultado.error });
		}

		return { canceladaOk: true };
	}
};
