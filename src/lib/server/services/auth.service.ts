import type Database from 'better-sqlite3';
import { randomBytes } from 'node:crypto';
import type { UsuarioSesion } from '../../../app';
import { cifrarContrasena, verificarContrasena } from '../db/password';

const DURACION_SESION_HORAS = 24 * 7;

export function autenticarUsuario(
	db: Database.Database,
	correo: string,
	contrasena: string
): UsuarioSesion | null {
	const fila = db
		.prepare(
			`SELECT id, nombre, correo, contrasena_hash, rol, telefono
			 FROM usuarios
			 WHERE LOWER(correo) = LOWER(?)`
		)
		.get(correo.trim()) as
		| {
				id: number;
				nombre: string;
				correo: string;
				contrasena_hash: string;
				rol: 'huesped' | 'recepcion';
				telefono: string;
		  }
		| undefined;

	if (!fila) return null;
	if (!verificarContrasena(contrasena, fila.contrasena_hash)) return null;

	return {
		id: fila.id,
		nombre: fila.nombre,
		correo: fila.correo,
		rol: fila.rol,
		telefono: fila.telefono
	};
}

export function registrarHuesped(
	db: Database.Database,
	datos: { nombre: string; correo: string; telefono: string; contrasena: string }
): { ok: true; usuario: UsuarioSesion } | { ok: false; error: string } {
	const existente = db
		.prepare('SELECT id FROM usuarios WHERE LOWER(correo) = LOWER(?)')
		.get(datos.correo.trim());

	if (existente) {
		return { ok: false, error: 'Ya existe una cuenta registrada con ese correo electrónico.' };
	}

	const hash = cifrarContrasena(datos.contrasena);
	const res = db
		.prepare(
			`INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, telefono)
			 VALUES (?, ?, ?, 'huesped', ?)`
		)
		.run(datos.nombre.trim(), datos.correo.trim().toLowerCase(), hash, datos.telefono.trim());

	return {
		ok: true,
		usuario: {
			id: Number(res.lastInsertRowid),
			nombre: datos.nombre.trim(),
			correo: datos.correo.trim().toLowerCase(),
			rol: 'huesped',
			telefono: datos.telefono.trim()
		}
	};
}

export function crearSesion(db: Database.Database, usuarioId: number): { id: string; expiraEn: Date } {
	const id = randomBytes(32).toString('hex');
	const expiraEn = new Date(Date.now() + DURACION_SESION_HORAS * 60 * 60 * 1000);

	db.prepare('INSERT INTO sesiones (id, usuario_id, expira_en) VALUES (?, ?, ?)').run(
		id,
		usuarioId,
		expiraEn.toISOString()
	);

	return { id, expiraEn };
}

export function obtenerUsuarioPorSesion(
	db: Database.Database,
	sesionId: string | undefined
): UsuarioSesion | null {
	if (!sesionId) return null;

	const fila = db
		.prepare(
			`SELECT u.id, u.nombre, u.correo, u.rol, u.telefono, s.expira_en
			 FROM sesiones s
			 INNER JOIN usuarios u ON u.id = s.usuario_id
			 WHERE s.id = ?`
		)
		.get(sesionId) as
		| (UsuarioSesion & {
				expira_en: string;
		  })
		| undefined;

	if (!fila) return null;

	if (new Date(fila.expira_en).getTime() <= Date.now()) {
		db.prepare('DELETE FROM sesiones WHERE id = ?').run(sesionId);
		return null;
	}

	return {
		id: fila.id,
		nombre: fila.nombre,
		correo: fila.correo,
		rol: fila.rol,
		telefono: fila.telefono
	};
}

export function cerrarSesion(db: Database.Database, sesionId: string | undefined): void {
	if (!sesionId) return;
	db.prepare('DELETE FROM sesiones WHERE id = ?').run(sesionId);
}
