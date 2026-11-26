<script lang="ts">
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';
	import type { UsuarioSesion } from '../../app';

	interface Props {
		data: { usuario: UsuarioSesion };
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const rutaActual = $derived($page.url.pathname);
</script>

<div class="min-h-screen bg-secondary text-ink">
	<header class="border-b border-ink-soft/15 bg-white">
		<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
			<a
				href="/huesped/buscar"
				class="font-display text-2xl font-bold text-primary focus-visible:outline-primary"
			>
				Hotel Marista
			</a>

			<nav aria-label="Navegación de huésped" class="flex flex-wrap items-center gap-2 sm:gap-6">
				<a
					href="/huesped/buscar"
					aria-current={rutaActual.startsWith('/huesped/buscar') ? 'page' : undefined}
					class="inline-flex min-h-[44px] items-center border-b-2 px-2 text-base font-medium transition-colors {rutaActual.startsWith(
						'/huesped/buscar'
					)
						? 'border-primary text-primary font-semibold'
						: 'border-transparent text-ink-soft hover:text-primary'}"
				>
					Habitaciones
				</a>

				<a
					href="/huesped/reservas"
					aria-current={rutaActual.startsWith('/huesped/reservas') ? 'page' : undefined}
					class="inline-flex min-h-[44px] items-center border-b-2 px-2 text-base font-medium transition-colors {rutaActual.startsWith(
						'/huesped/reservas'
					)
						? 'border-primary text-primary font-semibold'
						: 'border-transparent text-ink-soft hover:text-primary'}"
				>
					Mis reservas
				</a>

				<div class="flex items-center gap-3 border-l border-ink-soft/20 pl-3 sm:pl-5">
					<span class="text-sm font-medium text-ink">
						{data.usuario.nombre} <span class="text-ink-soft">· Huésped</span>
					</span>
					<form method="POST" action="/logout">
						<button
							type="submit"
							class="inline-flex min-h-[44px] items-center rounded-lg px-2.5 text-sm font-medium text-ink-soft hover:bg-secondary hover:text-error"
						>
							Salir
						</button>
					</form>
				</div>
			</nav>
		</div>
	</header>

	<main id="contenido-principal" class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
		{@render children()}
	</main>
</div>
