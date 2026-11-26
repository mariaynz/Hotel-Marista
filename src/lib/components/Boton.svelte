<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tipo?: 'button' | 'submit' | 'reset';
		variante?: 'primario' | 'secundario' | 'fantasma' | 'peligro';
		anchoCompleto?: boolean;
		deshabilitado?: boolean;
		onclick?: (e: MouseEvent) => void;
		ariaLabel?: string;
		children: Snippet;
	}

	let {
		tipo = 'button',
		variante = 'primario',
		anchoCompleto = false,
		deshabilitado = false,
		onclick,
		ariaLabel,
		children
	}: Props = $props();

	const clasesVariante: Record<NonNullable<Props['variante']>, string> = {
		primario:
			'bg-primary text-white hover:bg-primary/90 active:bg-primary/95 border border-primary shadow-sm',
		secundario:
			'bg-white text-ink border border-ink-soft/40 hover:bg-secondary hover:border-primary hover:text-primary',
		fantasma:
			'bg-transparent text-ink-soft hover:text-primary hover:bg-secondary/70 border border-transparent',
		peligro:
			'bg-error text-white hover:bg-error/90 border border-error shadow-sm'
	};
</script>

<button
	type={tipo}
	disabled={deshabilitado}
	aria-label={ariaLabel}
	{onclick}
	class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-base font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-55 {clasesVariante[
		variante
	]} {anchoCompleto ? 'w-full' : ''}"
>
	{@render children()}
</button>
