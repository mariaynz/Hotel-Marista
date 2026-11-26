import type Database from 'better-sqlite3';
import { cifrarContrasena } from './password';
import { obtenerFechaHoyISO, sumarDiasISO } from '../../utils/format';

export function ejecutarSeedSiVacio(db: Database.Database): void {
	const conteoUsuarios = db.prepare('SELECT COUNT(*) as total FROM usuarios').get() as {
		total: number;
	};
	if (conteoUsuarios.total > 0) {
		return;
	}

	const hoy = obtenerFechaHoyISO();
	const ayer = sumarDiasISO(hoy, -1);
	const haceDosDias = sumarDiasISO(hoy, -2);
	const manana = sumarDiasISO(hoy, 1);
	const enDosDias = sumarDiasISO(hoy, 2);
	const enCincoDias = sumarDiasISO(hoy, 5);
	const enSieteDias = sumarDiasISO(hoy, 7);
	const haceUnMesEntrada = sumarDiasISO(hoy, -32);
	const haceUnMesSalida = sumarDiasISO(hoy, -31);

	const insertarSeed = db.transaction(() => {
		const stmtUsuario = db.prepare(`
			INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, telefono)
			VALUES (?, ?, ?, ?, ?)
		`);

		const hashRecepcion = cifrarContrasena('Recepcion2026!');
		const hashHuesped = cifrarContrasena('Huesped2026!');

		stmtUsuario.run(
			'Laura Gómez',
			'laura.recepcion@hotelmarista.mx',
			hashRecepcion,
			'recepcion',
			'9991204500'
		);

		const resAna = stmtUsuario.run(
			'Ana Pérez',
			'ana.perez@correo.com',
			hashHuesped,
			'huesped',
			'9992345678'
		);
		const anaId = Number(resAna.lastInsertRowid);

		const resLuis = stmtUsuario.run(
			'Luis Ruiz',
			'luis.ruiz@correo.com',
			hashHuesped,
			'huesped',
			'9993456789'
		);
		const luisId = Number(resLuis.lastInsertRowid);

		const resEva = stmtUsuario.run(
			'Eva Mora',
			'eva.mora@correo.com',
			hashHuesped,
			'huesped',
			'9994567890'
		);
		const evaId = Number(resEva.lastInsertRowid);

		const resMarco = stmtUsuario.run(
			'Marco Díaz',
			'marco.diaz@correo.com',
			hashHuesped,
			'huesped',
			'9995678901'
		);
		const marcoId = Number(resMarco.lastInsertRowid);

		const habitacionesSeed: Array<{
			numero: string;
			tipo: string;
			piso: number;
			capacidad: number;
			tarifa: number;
			descripcion: string;
			estado: 'disponible' | 'ocupada' | 'limpieza' | 'mantenimiento';
		}> = [
			{
				numero: '101',
				tipo: 'Habitación Sencilla',
				piso: 1,
				capacidad: 2,
				tarifa: 1200,
				descripcion: '1 cama matrimonial · Vista al jardín · 2 personas',
				estado: 'disponible'
			},
			{
				numero: '102',
				tipo: 'Habitación Sencilla',
				piso: 1,
				capacidad: 2,
				tarifa: 1200,
				descripcion: '1 cama matrimonial · Patio interior · 2 personas',
				estado: 'ocupada'
			},
			{
				numero: '103',
				tipo: 'Habitación Doble',
				piso: 1,
				capacidad: 4,
				tarifa: 1800,
				descripcion: '2 camas matrimoniales · Aire acondicionado · 4 personas',
				estado: 'limpieza'
			},
			{
				numero: '104',
				tipo: 'Habitación Doble',
				piso: 1,
				capacidad: 4,
				tarifa: 1800,
				descripcion: '2 camas matrimoniales · Acceso rápido a alberca · 4 personas',
				estado: 'mantenimiento'
			},
			{
				numero: '110',
				tipo: 'Habitación Sencilla',
				piso: 1,
				capacidad: 2,
				tarifa: 1200,
				descripcion: '1 cama queen · Escritorio de trabajo · 2 personas',
				estado: 'ocupada'
			},
			{
				numero: '118',
				tipo: 'Habitación Doble',
				piso: 1,
				capacidad: 4,
				tarifa: 1800,
				descripcion: '2 camas matrimoniales · Aire acondicionado · 4 personas',
				estado: 'ocupada'
			},
			{
				numero: '201',
				tipo: 'Habitación Doble',
				piso: 2,
				capacidad: 4,
				tarifa: 1800,
				descripcion: '2 camas matrimoniales · Balcón con vista al jardín · 4 personas',
				estado: 'disponible'
			},
			{
				numero: '202',
				tipo: 'Habitación Doble',
				piso: 2,
				capacidad: 4,
				tarifa: 1800,
				descripcion: '2 camas matrimoniales · Aire acondicionado · 4 personas',
				estado: 'disponible'
			},
			{
				numero: '203',
				tipo: 'Suite Junior',
				piso: 2,
				capacidad: 2,
				tarifa: 2900,
				descripcion: 'Cama king · Terraza privada · 2 personas',
				estado: 'disponible'
			},
			{
				numero: '204',
				tipo: 'Habitación Doble',
				piso: 2,
				capacidad: 4,
				tarifa: 1800,
				descripcion: '2 camas matrimoniales · Aire acondicionado · 4 personas',
				estado: 'disponible'
			},
			{
				numero: '205',
				tipo: 'Habitación Sencilla',
				piso: 2,
				capacidad: 2,
				tarifa: 1250,
				descripcion: '1 cama queen · Balcón norte · 2 personas',
				estado: 'disponible'
			},
			{
				numero: '301',
				tipo: 'Suite Junior',
				piso: 3,
				capacidad: 3,
				tarifa: 2900,
				descripcion: 'Cama king · Sala de estar y terraza · 3 personas',
				estado: 'disponible'
			},
			{
				numero: '302',
				tipo: 'Suite Master',
				piso: 3,
				capacidad: 4,
				tarifa: 3800,
				descripcion: 'Cama king + sofá cama · Terraza panorámica · 4 personas',
				estado: 'disponible'
			},
			{
				numero: '305',
				tipo: 'Suite Junior',
				piso: 3,
				capacidad: 2,
				tarifa: 2900,
				descripcion: 'Cama king · Terraza privada · 2 personas',
				estado: 'disponible'
			}
		];

		const stmtHab = db.prepare(`
			INSERT INTO habitaciones (numero, tipo, piso, capacidad, tarifa_noche, descripcion, estado)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`);

		const mapaHab = new Map<string, number>();
		for (const h of habitacionesSeed) {
			const res = stmtHab.run(
				h.numero,
				h.tipo,
				h.piso,
				h.capacidad,
				h.tarifa,
				h.descripcion,
				h.estado
			);
			mapaHab.set(h.numero, Number(res.lastInsertRowid));
		}

		const stmtReserva = db.prepare(`
			INSERT INTO reservas (
				codigo, usuario_id, huesped_nombre, huesped_correo, huesped_telefono,
				habitacion_id, fecha_entrada, fecha_salida, huespedes, estado, origen,
				identificacion_verificada, total
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`);

		stmtReserva.run(
			'HMG-2026-0231AP',
			anaId,
			'Ana Pérez',
			'ana.perez@correo.com',
			'9992345678',
			mapaHab.get('204')!,
			hoy,
			enDosDias,
			2,
			'confirmada',
			'web',
			0,
			3600
		);

		const resSalida1 = stmtReserva.run(
			'HMG-2026-0240LR',
			luisId,
			'Luis Ruiz',
			'luis.ruiz@correo.com',
			'9993456789',
			mapaHab.get('110')!,
			haceDosDias,
			hoy,
			1,
			'en_curso',
			'web',
			1,
			2400
		);

		stmtReserva.run(
			'HMG-2026-0252EM',
			evaId,
			'Eva Mora',
			'eva.mora@correo.com',
			'9994567890',
			mapaHab.get('305')!,
			hoy,
			enDosDias,
			2,
			'confirmada',
			'web',
			0,
			5800
		);

		const resSalida2 = stmtReserva.run(
			'HMG-2026-0233MD',
			marcoId,
			'Marco Díaz',
			'marco.diaz@correo.com',
			'9995678901',
			mapaHab.get('118')!,
			haceDosDias,
			hoy,
			2,
			'en_curso',
			'presencial',
			1,
			3600
		);

		stmtReserva.run(
			'HMG-2026-0219CS',
			null,
			'Carlos Solís',
			'carlos.solis@correo.com',
			'9996789012',
			mapaHab.get('102')!,
			ayer,
			manana,
			2,
			'en_curso',
			'presencial',
			1,
			2400
		);

		stmtReserva.run(
			'HMG-2026-0245AP',
			anaId,
			'Ana Pérez',
			'ana.perez@correo.com',
			'9992345678',
			mapaHab.get('203')!,
			enCincoDias,
			enSieteDias,
			2,
			'confirmada',
			'web',
			0,
			5800
		);

		stmtReserva.run(
			'HMG-2026-0198AP',
			anaId,
			'Ana Pérez',
			'ana.perez@correo.com',
			'9992345678',
			mapaHab.get('101')!,
			haceUnMesEntrada,
			haceUnMesSalida,
			1,
			'completada',
			'web',
			1,
			1200
		);

		const stmtConsumo = db.prepare(`
			INSERT INTO consumos (reserva_id, concepto, monto)
			VALUES (?, ?, ?)
		`);
		stmtConsumo.run(Number(resSalida1.lastInsertRowid), 'Servicio a la habitación - Desayuno', 240);
		stmtConsumo.run(Number(resSalida2.lastInsertRowid), 'Minibar y bebidas', 180);
	});

	insertarSeed();
}
