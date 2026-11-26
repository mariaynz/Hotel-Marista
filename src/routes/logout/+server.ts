import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { cerrarSesion } from '$lib/server/services/auth.service';

export const POST: RequestHandler = async ({ cookies }) => {
	const db = getDb();
	const sesionId = cookies.get('hmg_sesion');
	cerrarSesion(db, sesionId);
	cookies.delete('hmg_sesion', { path: '/' });
	throw redirect(303, '/login');
};
