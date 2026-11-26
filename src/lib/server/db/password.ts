import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function cifrarContrasena(contrasena: string): string {
	const salt = randomBytes(16).toString('hex');
	const hash = scryptSync(contrasena, salt, 64).toString('hex');
	return `${salt}:${hash}`;
}

export function verificarContrasena(contrasena: string, almacenada: string): boolean {
	const partes = almacenada.split(':');
	if (partes.length !== 2) return false;
	const [salt, hashOriginal] = partes;
	const hashBuffer = Buffer.from(hashOriginal, 'hex');
	const intentoBuffer = scryptSync(contrasena, salt, 64);
	if (hashBuffer.length !== intentoBuffer.length) return false;
	return timingSafeEqual(hashBuffer, intentoBuffer);
}
