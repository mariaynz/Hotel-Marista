export function formatearMoneda(monto: number): string {
	return new Intl.NumberFormat('es-MX', {
		style: 'currency',
		currency: 'MXN',
		maximumFractionDigits: 0
	}).format(monto);
}

// El hotel está en Mérida: "hoy" debe ser su fecha local sin importar la zona del servidor (UTC en Vercel)
export const ZONA_HORARIA_HOTEL = 'America/Merida';

export function obtenerFechaHoyISO(referencia: Date = new Date()): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: ZONA_HORARIA_HOTEL,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(referencia);
}

export function sumarDiasISO(fechaISO: string, dias: number): string {
	const [y, m, d] = fechaISO.split('-').map(Number);
	const fecha = new Date(Date.UTC(y, m - 1, d));
	fecha.setUTCDate(fecha.getUTCDate() + dias);
	return fecha.toISOString().slice(0, 10);
}

export function calcularNoches(fechaEntrada: string, fechaSalida: string): number {
	const [y1, m1, d1] = fechaEntrada.split('-').map(Number);
	const [y2, m2, d2] = fechaSalida.split('-').map(Number);
	const t1 = Date.UTC(y1, m1 - 1, d1);
	const t2 = Date.UTC(y2, m2 - 1, d2);
	const diff = Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
	return Math.max(0, diff);
}

const MESES_ES = [
	'enero',
	'febrero',
	'marzo',
	'abril',
	'mayo',
	'junio',
	'julio',
	'agosto',
	'septiembre',
	'octubre',
	'noviembre',
	'diciembre'
];

export function formatearRangoFechas(entradaISO: string, salidaISO: string): string {
	const [y1, m1, d1] = entradaISO.split('-').map(Number);
	const [y2, m2, d2] = salidaISO.split('-').map(Number);
	const mes1 = MESES_ES[(m1 || 1) - 1];
	const mes2 = MESES_ES[(m2 || 1) - 1];

	if (y1 === y2 && m1 === m2) {
		return `${d1}-${d2} de ${mes1}`;
	}
	if (y1 === y2) {
		return `${d1} de ${mes1} - ${d2} de ${mes2}`;
	}
	return `${d1} de ${mes1} ${y1} - ${d2} de ${mes2} ${y2}`;
}

export function formatearFechaCorta(fechaISO: string): string {
	const [y, m, d] = fechaISO.split('-').map(Number);
	const mes = MESES_ES[(m || 1) - 1];
	return `${d} de ${mes} de ${y}`;
}
