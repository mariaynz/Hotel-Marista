import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import {
	autenticarUsuario,
	crearSesion,
	registrarHuesped
} from '$lib/server/services/auth.service';
import { validarLogin, validarRegistroHuesped } from '$lib/server/validators';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	iniciar: async ({ request, cookies, url }) => {
		const datos = await request.formData();
		const correo = String(datos.get('correo') ?? '');
		const contrasena = String(datos.get('contrasena') ?? '');

		const errores = validarLogin({ correo, contrasena });
		if (Object.keys(errores).length > 0) {
			return fail(400, {
				modo: 'login',
				correo,
				errores
			});
		}

		const db = getDb();
		const usuario = autenticarUsuario(db, correo, contrasena);
		if (!usuario) {
			return fail(401, {
				modo: 'login',
				correo,
				errorGeneral: 'Correo electrónico o contraseña incorrectos.'
			});
		}

		const sesion = crearSesion(db, usuario.id);
		cookies.set('hmg_sesion', sesion.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: url.protocol === 'https:',
			expires: sesion.expiraEn
		});

		throw redirect(303, usuario.rol === 'recepcion' ? '/recepcion' : '/huesped/buscar');
	},

	registrar: async ({ request, cookies, url }) => {
		const datos = await request.formData();
		const nombre = String(datos.get('nombre') ?? '');
		const correo = String(datos.get('correo') ?? '');
		const telefono = String(datos.get('telefono') ?? '');
		const contrasena = String(datos.get('contrasena') ?? '');

		const errores = validarRegistroHuesped({ nombre, correo, telefono, contrasena });
		if (Object.keys(errores).length > 0) {
			return fail(400, {
				modo: 'registro',
				nombre,
				correo,
				telefono,
				errores
			});
		}

		const db = getDb();
		const resultado = registrarHuesped(db, { nombre, correo, telefono, contrasena });
		if (!resultado.ok) {
			return fail(400, {
				modo: 'registro',
				nombre,
				correo,
				telefono,
				errorGeneral: resultado.error
			});
		}

		const sesion = crearSesion(db, resultado.usuario.id);
		cookies.set('hmg_sesion', sesion.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: url.protocol === 'https:',
			expires: sesion.expiraEn
		});

		throw redirect(303, '/huesped/buscar');
	}
};
