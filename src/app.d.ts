export interface UsuarioSesion {
	id: number;
	nombre: string;
	correo: string;
	rol: 'huesped' | 'recepcion';
	telefono: string;
}

declare global {
	namespace App {
		interface Locals {
			usuario: UsuarioSesion | null;
		}
	}
}

export {};
