import { obtenerFechaHoyISO } from '../../utils/format';

export interface ErroresValidacion {
	[campo: string]: string;
}

const REGEX_FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esFechaISOValida(fecha: string): boolean {
	if (!REGEX_FECHA_ISO.test(fecha)) return false;
	const [y, m, d] = fecha.split('-').map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	return (
		dt.getUTCFullYear() === y &&
		dt.getUTCMonth() === m - 1 &&
		dt.getUTCDate() === d
	);
}

export function esCorreoValido(correo: string): boolean {
	return REGEX_CORREO.test(correo.trim());
}

export function validarLogin(datos: { correo: string; contrasena: string }): ErroresValidacion {
	const errores: ErroresValidacion = {};
	if (!datos.correo.trim()) {
		errores.correo = 'Ingresa tu correo electrónico.';
	} else if (!REGEX_CORREO.test(datos.correo.trim())) {
		errores.correo = 'El formato del correo electrónico no es válido.';
	}

	if (!datos.contrasena) {
		errores.contrasena = 'Ingresa tu contraseña.';
	}
	return errores;
}

export function validarRegistroHuesped(datos: {
	nombre: string;
	correo: string;
	telefono: string;
	contrasena: string;
}): ErroresValidacion {
	const errores: ErroresValidacion = {};

	if (!datos.nombre.trim() || datos.nombre.trim().length < 3) {
		errores.nombre = 'Ingresa tu nombre completo (mínimo 3 caracteres).';
	}
	if (!datos.correo.trim()) {
		errores.correo = 'El correo electrónico es obligatorio.';
	} else if (!REGEX_CORREO.test(datos.correo.trim())) {
		errores.correo = 'Ingresa un correo electrónico válido.';
	}
	if (!datos.telefono.trim() || datos.telefono.trim().length < 8) {
		errores.telefono = 'Ingresa un teléfono de contacto válido (mínimo 8 dígitos).';
	}
	if (!datos.contrasena || datos.contrasena.length < 8) {
		errores.contrasena = 'La contraseña debe tener al menos 8 caracteres.';
	}

	return errores;
}

export function validarRangoBusqueda(
	fechaEntrada: string,
	fechaSalida: string,
	huespedes: number,
	hoyISO: string = obtenerFechaHoyISO()
): ErroresValidacion {
	const errores: ErroresValidacion = {};

	if (!fechaEntrada || !esFechaISOValida(fechaEntrada)) {
		errores.fecha_entrada = 'Selecciona una fecha de llegada válida.';
	} else if (fechaEntrada < hoyISO) {
		errores.fecha_entrada = 'La fecha de llegada no puede ser anterior a hoy.';
	}

	if (!fechaSalida || !esFechaISOValida(fechaSalida)) {
		errores.fecha_salida = 'Selecciona una fecha de salida válida.';
	} else if (fechaEntrada && esFechaISOValida(fechaEntrada) && fechaSalida <= fechaEntrada) {
		errores.fecha_salida = 'La fecha de salida debe ser posterior a la llegada.';
	}

	if (!Number.isInteger(huespedes) || huespedes < 1 || huespedes > 10) {
		errores.huespedes = 'Indica un número válido de huéspedes (entre 1 y 10).';
	}

	return errores;
}

export function validarNuevaHabitacion(datos: {
	numero: string;
	tipo: string;
	piso: number;
	capacidad: number;
	tarifa_noche: number;
	descripcion: string;
}): ErroresValidacion {
	const errores: ErroresValidacion = {};

	if (!datos.numero.trim()) {
		errores.numero = 'El número de habitación es obligatorio.';
	}
	if (!datos.tipo.trim()) {
		errores.tipo = 'Selecciona o escribe el tipo de habitación.';
	}
	if (!Number.isInteger(datos.piso) || datos.piso < 1 || datos.piso > 50) {
		errores.piso = 'Indica un número de piso válido.';
	}
	if (!Number.isInteger(datos.capacidad) || datos.capacidad < 1 || datos.capacidad > 10) {
		errores.capacidad = 'La capacidad debe estar entre 1 y 10 huéspedes.';
	}
	if (Number.isNaN(datos.tarifa_noche) || datos.tarifa_noche <= 0) {
		errores.tarifa_noche = 'La tarifa por noche debe ser mayor a $0 MXN.';
	}
	if (!datos.descripcion.trim()) {
		errores.descripcion = 'Agrega una descripción breve de la habitación.';
	}

	return errores;
}
