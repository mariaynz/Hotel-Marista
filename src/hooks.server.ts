import { redirect, type Handle } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { obtenerUsuarioPorSesion } from '$lib/server/services/auth.service';

export const handle: Handle = async ({ event, resolve }) => {
	const db = getDb();
	const sesionId = event.cookies.get('hmg_sesion');
	const usuario = obtenerUsuarioPorSesion(db, sesionId);
	event.locals.usuario = usuario;

	const ruta = event.url.pathname;

	if (ruta.startsWith('/huesped')) {
		if (!usuario) {
			throw redirect(303, '/login');
		}
		if (usuario.rol !== 'huesped') {
			throw redirect(303, '/recepcion');
		}
	}

	if (ruta.startsWith('/recepcion')) {
		if (!usuario) {
			throw redirect(303, '/login');
		}
		if (usuario.rol !== 'recepcion') {
			throw redirect(303, '/huesped/buscar');
		}
	}

	if (ruta === '/login' && usuario) {
		throw redirect(303, usuario.rol === 'recepcion' ? '/recepcion' : '/huesped/buscar');
	}

	return resolve(event);
};
