import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.usuario) {
		throw redirect(303, '/login');
	}
	if (locals.usuario.rol === 'recepcion') {
		throw redirect(303, '/recepcion');
	}
	throw redirect(303, '/huesped/buscar');
};
