import fs from 'node:fs';
import path from 'node:path';
import { SqliteCompat } from './adapter';
import { aplicarEsquema } from './schema';
import { ejecutarSeedSiVacio } from './seed';

let instanciaDb: SqliteCompat | null = null;

export function getDb(): SqliteCompat {
	if (instanciaDb) {
		return instanciaDb;
	}

	const rutaDb = process.env.DATABASE_PATH || path.resolve('data', 'hmg.sqlite');
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

	aplicarEsquema(db as never);
	ejecutarSeedSiVacio(db as never);

	instanciaDb = db;
	return db;
}

export function crearDbEnMemoria(): SqliteCompat {
	const db = new SqliteCompat(':memory:');
	db.pragma('foreign_keys = ON');
	aplicarEsquema(db as never);
	ejecutarSeedSiVacio(db as never);
	return db;
}