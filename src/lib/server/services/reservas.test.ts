import { describe, expect, it, beforeEach } from 'vitest';
import type Database from 'better-sqlite3';
import { crearDbEnMemoria } from '../db';
import {
	agregarConsumoReserva,
	crearReservaTransaccional,
	existeEmpalmeReserva,
	realizarCheckIn,
	realizarCheckOut
} from './reservas.service';
import { calcularNoches, obtenerFechaHoyISO, sumarDiasISO } from '../../utils/format';

describe('Lógica de negocio de Hotel Marista Gestión', () => {
	let db: Database.Database;
	const hoy = obtenerFechaHoyISO();

	beforeEach(() => {
		db = crearDbEnMemoria();
	});

	it('detecta correctamente empalmes de fechas (entrada_A < salida_B && salida_A > entrada_B)', () => {
		const entrada1 = sumarDiasISO(hoy, 10);
		const salida1 = sumarDiasISO(hoy, 14);

		const res1 = crearReservaTransaccional(db, {
			usuarioId: 2,
			huespedNombre: 'Ana Pérez',
			huespedCorreo: 'ana.perez@correo.com',
			huespedTelefono: '9992345678',
			habitacionId: 1,
			fechaEntrada: entrada1,
			fechaSalida: salida1,
			huespedes: 2,
			origen: 'web'
		});
		expect(res1.ok).toBe(true);

		expect(
			existeEmpalmeReserva(db, 1, sumarDiasISO(hoy, 8), sumarDiasISO(hoy, 11))
		).toBe(true);

		const resDuplicada = crearReservaTransaccional(db, {
			usuarioId: 3,
			huespedNombre: 'Luis Ruiz',
			huespedCorreo: 'luis.ruiz@correo.com',
			huespedTelefono: '9993456789',
			habitacionId: 1,
			fechaEntrada: entrada1,
			fechaSalida: salida1,
			huespedes: 2,
			origen: 'web'
		});
		expect(resDuplicada.ok).toBe(false);
		if (!resDuplicada.ok) {
			expect(resDuplicada.sinDisponibilidad).toBe(true);
		}

		const resConsecutiva = crearReservaTransaccional(db, {
			usuarioId: 3,
			huespedNombre: 'Luis Ruiz',
			huespedCorreo: 'luis.ruiz@correo.com',
			huespedTelefono: '9993456789',
			habitacionId: 1,
			fechaEntrada: salida1,
			fechaSalida: sumarDiasISO(hoy, 16),
			huespedes: 2,
			origen: 'web'
		});
		expect(resConsecutiva.ok).toBe(true);
	});

	it('calcula correctamente las noches, el total de hospedaje y los consumos en check-out', () => {
		const entrada = sumarDiasISO(hoy, 20);
		const salida = sumarDiasISO(hoy, 23);
		expect(calcularNoches(entrada, salida)).toBe(3);

		const habSuite = db
			.prepare("SELECT id, tarifa_noche FROM habitaciones WHERE numero = '203'")
			.get() as { id: number; tarifa_noche: number };

		const creacion = crearReservaTransaccional(db, {
			usuarioId: 2,
			huespedNombre: 'Ana Pérez',
			huespedCorreo: 'ana.perez@correo.com',
			huespedTelefono: '9992345678',
			habitacionId: habSuite.id,
			fechaEntrada: entrada,
			fechaSalida: salida,
			huespedes: 2,
			origen: 'web'
		});

		expect(creacion.ok).toBe(true);
		if (creacion.ok) {
			expect(creacion.total).toBe(3 * 2900);
		}
	});

	it('ejecuta transiciones completas de check-in y check-out actualizando estados de reserva y habitación', () => {
		const reservaLlegada = db
			.prepare("SELECT id, habitacion_id FROM reservas WHERE codigo = 'HMG-2026-0231AP'")
			.get() as { id: number; habitacion_id: number };

		const checkInSinId = realizarCheckIn(db, {
			reservaId: reservaLlegada.id,
			identificacionVerificada: false,
			hoyISO: hoy
		});
		expect(checkInSinId.ok).toBe(false);

		const checkInOk = realizarCheckIn(db, {
			reservaId: reservaLlegada.id,
			identificacionVerificada: true,
			hoyISO: hoy
		});
		expect(checkInOk.ok).toBe(true);

		const estadoReservaTrasCheckIn = db
			.prepare('SELECT estado, identificacion_verificada FROM reservas WHERE id = ?')
			.get(reservaLlegada.id) as { estado: string; identificacion_verificada: number };
		expect(estadoReservaTrasCheckIn.estado).toBe('en_curso');
		expect(estadoReservaTrasCheckIn.identificacion_verificada).toBe(1);

		const estadoHabTrasCheckIn = db
			.prepare('SELECT estado FROM habitaciones WHERE id = ?')
			.get(reservaLlegada.habitacion_id) as { estado: string };
		expect(estadoHabTrasCheckIn.estado).toBe('ocupada');

		const consumoOk = agregarConsumoReserva(db, reservaLlegada.id, 'Cena restaurante', 450);
		expect(consumoOk.ok).toBe(true);

		const checkOutOk = realizarCheckOut(db, reservaLlegada.id);
		expect(checkOutOk.ok).toBe(true);
		if (checkOutOk.ok) {
			expect(checkOutOk.totalFinal).toBe(4050);
		}

		const estadoReservaTrasCheckOut = db
			.prepare('SELECT estado FROM reservas WHERE id = ?')
			.get(reservaLlegada.id) as { estado: string };
		expect(estadoReservaTrasCheckOut.estado).toBe('completada');

		const estadoHabTrasCheckOut = db
			.prepare('SELECT estado FROM habitaciones WHERE id = ?')
			.get(reservaLlegada.habitacion_id) as { estado: string };
		expect(estadoHabTrasCheckOut.estado).toBe('limpieza');
	});
});
