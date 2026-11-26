import { DatabaseSync } from 'node:sqlite';

export class SqliteCompat {
	private raw: DatabaseSync;

	constructor(ruta: string) {
		this.raw = new DatabaseSync(ruta);
	}

	pragma(sentencia: string): void {
		this.raw.exec(`PRAGMA ${sentencia};`);
	}

	exec(sql: string): void {
		this.raw.exec(sql);
	}

	prepare(sql: string) {
		const stmt = this.raw.prepare(sql);
		return {
			get: (...params: unknown[]) => stmt.get(...(params as never[])),
			all: (...params: unknown[]) => stmt.all(...(params as never[])),
			run: (...params: unknown[]) => {
				const res = stmt.run(...(params as never[]));
				return {
					lastInsertRowid: res.lastInsertRowid,
					changes: res.changes
				};
			}
		};
	}

	transaction<T extends (...args: never[]) => unknown>(fn: T) {
		const ejecutar = (modo: 'DEFERRED' | 'IMMEDIATE', ...args: Parameters<T>): ReturnType<T> => {
			this.raw.exec(`BEGIN ${modo};`);
			try {
				const resultado = fn(...args) as ReturnType<T>;
				this.raw.exec('COMMIT;');
				return resultado;
			} catch (err) {
				this.raw.exec('ROLLBACK;');
				throw err;
			}
		};

		const wrapped = (...args: Parameters<T>): ReturnType<T> => ejecutar('DEFERRED', ...args);
		wrapped.immediate = (...args: Parameters<T>): ReturnType<T> => ejecutar('IMMEDIATE', ...args);
		return wrapped;
	}
}