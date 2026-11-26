<script lang="ts">
	interface Props {
		tipo:
			| 'disponible'
			| 'pocas_disponibles'
			| 'ocupada'
			| 'limpieza'
			| 'mantenimiento'
			| 'confirmada'
			| 'en_curso'
			| 'completada'
			| 'cancelada'
			| 'llegada'
			| 'salida';
		textoPersonalizado?: string;
	}

	let { tipo, textoPersonalizado }: Props = $props();

	const configuracion: Record<
		Props['tipo'],
		{ etiqueta: string; clases: string; icono: 'check' | 'clock' | 'alert' | 'x' }
	> = {
		disponible: {
			etiqueta: 'Disponible',
			clases: 'bg-success/12 text-success border-success/30',
			icono: 'check'
		},
		pocas_disponibles: {
			etiqueta: 'Pocas disponibles',
			clases: 'bg-warning/12 text-warning border-warning/30',
			icono: 'alert'
		},
		ocupada: {
			etiqueta: 'Ocupada',
			clases: 'bg-error/12 text-error border-error/30',
			icono: 'x'
		},
		limpieza: {
			etiqueta: 'Limpieza',
			clases: 'bg-warning/12 text-warning border-warning/30',
			icono: 'clock'
		},
		mantenimiento: {
			etiqueta: 'Mantenimiento',
			clases: 'bg-warning/15 text-warning border-warning/35',
			icono: 'alert'
		},
		confirmada: {
			etiqueta: 'Confirmada',
			clases: 'bg-success/12 text-success border-success/30',
			icono: 'check'
		},
		en_curso: {
			etiqueta: 'En curso',
			clases: 'bg-primary/12 text-primary border-primary/30',
			icono: 'clock'
		},
		completada: {
			etiqueta: 'Completada',
			clases: 'bg-secondary text-ink-soft border-ink-soft/30',
			icono: 'check'
		},
		cancelada: {
			etiqueta: 'Cancelada',
			clases: 'bg-error/10 text-error border-error/25',
			icono: 'x'
		},
		llegada: {
			etiqueta: 'Llegada',
			clases: 'bg-success/12 text-success border-success/30',
			icono: 'check'
		},
		salida: {
			etiqueta: 'Salida',
			clases: 'bg-warning/12 text-warning border-warning/30',
			icono: 'clock'
		}
	};

	const actual = $derived(configuracion[tipo]);
</script>

<span
	class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium {actual.clases}"
>
	{#if actual.icono === 'check'}
		<svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path
				fill-rule="evenodd"
				d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
				clip-rule="evenodd"
			/>
		</svg>
	{:else if actual.icono === 'clock'}
		<svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path
				fill-rule="evenodd"
				d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
				clip-rule="evenodd"
			/>
		</svg>
	{:else if actual.icono === 'alert'}
		<svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path
				fill-rule="evenodd"
				d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
				clip-rule="evenodd"
			/>
		</svg>
	{:else}
		<svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path
				d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
			/>
		</svg>
	{/if}
	<span>{textoPersonalizado ?? actual.etiqueta}</span>
</span>
