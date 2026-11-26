<script lang="ts">
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';
	import type { UsuarioSesion } from '../../app';

	interface Props {
		data: { usuario: UsuarioSesion };
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const ruta = $derived($page.url.pathname);
	const vista = $derived($page.url.searchParams.get('vista') || 'panel');
</script>

<div class="flex min-h-screen flex-col bg-secondary text-ink lg:flex-row">
	<aside
		class="flex w-full flex-col justify-between bg-primary text-white lg:w-64 lg:shrink-0"
		aria-label="Menú principal de recepción"
	>
		<div>
			<div class="border-b border-white/15 px-6 py-5">
				<a href="/recepcion" class="block font-display text-2xl font-bold text-white">
					Hotel Marista
				</a>
				<p class="mt-0.5 text-sm text-white/80">Recepción</p>
			</div>

			<nav class="flex flex-row gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:px-4 lg:py-5">
				<a
					href="/recepcion"
					aria-current={ruta === '/recepcion' && vista === 'panel' ? 'page' : undefined}
					class="flex min-h-[44px] shrink-0 items-center rounded-lg px-4 py-2.5 text-base font-medium transition-colors {ruta ===
						'/recepcion' && vista === 'panel'
						? 'bg-white/18 text-white font-semibold'
						: 'text-white/85 hover:bg-white/10 hover:text-white'}"
				>
					Panel del día
				</a>

				<a
					href="/recepcion?vista=reservas"
					aria-current={ruta === '/recepcion' && vista === 'reservas' ? 'page' : undefined}
					class="flex min-h-[44px] shrink-0 items-center rounded-lg px-4 py-2.5 text-base font-medium transition-colors {ruta ===
						'/recepcion' && vista === 'reservas'
						? 'bg-white/18 text-white font-semibold'
						: 'text-white/85 hover:bg-white/10 hover:text-white'}"
				>
					Reservas
				</a>

				<a
					href="/recepcion/habitaciones"
					aria-current={ruta.startsWith('/recepcion/habitaciones') ? 'page' : undefined}
					class="flex min-h-[44px] shrink-0 items-center rounded-lg px-4 py-2.5 text-base font-medium transition-colors {ruta.startsWith(
						'/recepcion/habitaciones'
					)
						? 'bg-white/18 text-white font-semibold'
						: 'text-white/85 hover:bg-white/10 hover:text-white'}"
				>
					Habitaciones
				</a>

				<a
					href="/recepcion?vista=huespedes"
					aria-current={ruta === '/recepcion' && vista === 'huespedes' ? 'page' : undefined}
					class="flex min-h-[44px] shrink-0 items-center rounded-lg px-4 py-2.5 text-base font-medium transition-colors {ruta ===
						'/recepcion' && vista === 'huespedes'
						? 'bg-white/18 text-white font-semibold'
						: 'text-white/85 hover:bg-white/10 hover:text-white'}"
				>
					Huéspedes
				</a>
			</nav>
		</div>

		<div class="flex items-center justify-between border-t border-white/15 px-6 py-4">
			<span class="text-sm text-white/90">
				{data.usuario.nombre.split(' ')[0]} · Recepcionista
			</span>
			<form method="POST" action="/logout">
				<button
					type="submit"
					class="inline-flex min-h-[44px] items-center rounded-lg px-2.5 text-sm font-medium text-white/85 hover:bg-white/15 hover:text-white"
				>
					Salir
				</button>
			</form>
		</div>
	</aside>

	<main id="contenido-principal" class="flex-1 px-4 py-7 sm:px-8">
		<div class="mx-auto max-w-6xl">
			{@render children()}
		</div>
	</main>
</div>
