<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		abierto: boolean;
		titulo: string;
		onCerrar: () => void;
		children: Snippet;
	}

	let { abierto, titulo, onCerrar, children }: Props = $props();

	function manejarTecla(e: KeyboardEvent) {
		if (abierto && e.key === 'Escape') {
			onCerrar();
		}
	}
</script>

<svelte:window onkeydown={manejarTecla} />

{#if abierto}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-[1px]"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-titulo"
	>
		<div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-ink-soft/20 bg-white p-6 shadow-xl">
			<div class="mb-4 flex items-start justify-between gap-4 border-b border-ink-soft/15 pb-3">
				<h2 id="modal-titulo" class="font-display text-2xl font-bold text-primary">
					{titulo}
				</h2>
				<button
					type="button"
					onclick={onCerrar}
					aria-label="Cerrar ventana"
					class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-ink-soft hover:bg-secondary hover:text-ink"
				>
					<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path
							d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
						/>
					</svg>
				</button>
			</div>
			<div>
				{@render children()}
			</div>
		</div>
	</div>
{/if}
