import fs from 'node:fs';
import path from 'node:path';
import { SqliteCompat } from './adapter';
import { aplicarEsquema, rellenarTarifasReservas } from './schema';
import { ejecutarSeedSiVacio } from './seed';

let instanciaDb: SqliteCompat | null = null;

export function getDb(): SqliteCompat {
	if (instanciaDb) {
		return instanciaDb;
	}

	// En Vercel solo se puede escribir en /tmp (demo: los datos no persisten entre arranques)
	const rutaPorDefecto = process.env.VERCEL ? '/tmp/hmg.sqlite' : path.resolve('data', 'hmg.sqlite');
	const rutaDb = process.env.DATABASE_PATH || rutaPorDefecto;
	if (rutaDb !== ':memory:') {
		const directorio = path.dirname(rutaDb);
		if (!fs.existsSync(directorio)) {
			fs.mkdirSync(directorio, { recursive: true });
		}
	}

	const db = new SqliteCompat(rutaDb);
	db.pragma('journal_mode = WAL');
	db.pragma('busy_timeout = 5000');
	db.pragma('foreign_keys = ON');

	aplicarEsquema(db);
	ejecutarSeedSiVacio(db);
	rellenarTarifasReservas(db);

	instanciaDb = db;
	return db;
}

export function crearDbEnMemoria(): SqliteCompat {
	const db = new SqliteCompat(':memory:');
	db.pragma('foreign_keys = ON');
	aplicarEsquema(db);
	ejecutarSeedSiVacio(db);
	rellenarTarifasReservas(db);
	return db;
}