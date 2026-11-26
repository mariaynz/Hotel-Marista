<script lang="ts">
	interface Props {
		id: string;
		nombre: string;
		etiqueta: string;
		tipo?: 'text' | 'email' | 'password' | 'date' | 'number' | 'tel';
		valor?: string | number;
		placeholder?: string;
		error?: string;
		requerido?: boolean;
		min?: string | number;
		max?: string | number;
		step?: string | number;
		autocomplete?: AutoFill;
	}

	let {
		id,
		nombre,
		etiqueta,
		tipo = 'text',
		valor = $bindable(''),
		placeholder = '',
		error = '',
		requerido = false,
		min,
		max,
		step,
		autocomplete
	}: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
	<label for={id} class="text-sm font-medium text-ink">
		{etiqueta}
		{#if requerido}
			<span class="text-error" aria-hidden="true">*</span>
		{/if}
	</label>
	<input
		{id}
		name={nombre}
		type={tipo}
		bind:value={valor}
		{placeholder}
		required={requerido}
		{min}
		{max}
		{step}
		{autocomplete}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : undefined}
		class="min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-ink-soft/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:bg-secondary/60 disabled:text-ink-soft {error
			? 'border-error focus:border-error focus:ring-error/25'
			: 'border-ink-soft/35'}"
	/>
	{#if error}
		<p id="{id}-error" role="alert" aria-live="polite" class="text-sm font-medium text-error">
			{error}
		</p>
	{/if}
</div>
