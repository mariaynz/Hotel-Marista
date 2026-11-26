<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import type { HabitacionDisponible } from '$lib/server/services/habitaciones.service';
	import Boton from '$lib/components/Boton.svelte';
	import EtiquetaEstado from '$lib/components/EtiquetaEstado.svelte';
	import Alerta from '$lib/components/Alerta.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import {
		calcularNoches,
		formatearFechaCorta,
		formatearMoneda,
		obtenerFechaHoyISO
	} from '$lib/utils/format';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let entrada = $state(data.fechaEntrada);
	let salida = $state(data.fechaSalida);
	let huespedes = $state(data.huespedes);
	let habitacionSeleccionada = $state<HabitacionDisponible | null>(null);
	let confirmando = $state(false);

	$effect(() => {
		entrada = data.fechaEntrada;
		salida = data.fechaSalida;
		huespedes = data.huespedes;
	});

	const hoy = obtenerFechaHoyISO();
	const noches = $derived(calcularNoches(data.fechaEntrada, data.fechaSalida));
</script>

<svelte:head>
	<title>Encuentra tu habitación · Hotel Marista Gestión</title>
</svelte:head>

<section aria-labelledby="titulo-busqueda" class="flex flex-col gap-6">
	<h1 id="titulo-busqueda" class="font-display text-[28px] font-bold text-primary">
		Encuentra tu habitación
	</h1>

	{#if data.mensajeSinDisponibilidad}
		<Alerta tipo="advertencia">
			{data.mensajeSinDisponibilidad}
		</Alerta>
	{/if}

	{#if form?.errorReserva}
		<Alerta tipo="error">
			{form.errorReserva}
		</Alerta>
	{/if}

	<form
		method="GET"
		action="/huesped/buscar"
		class="grid grid-cols-1 gap-4 rounded-xl border border-ink-soft/15 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
	>
		<div class="flex flex-col gap-1.5">
			<label for="filtro-entrada" class="text-sm font-medium text-ink">Llegada</label>
			<input
				id="filtro-entrada"
				name="entrada"
				type="date"
				min={hoy}
				bind:value={entrada}
				aria-invalid={data.errores?.fecha_entrada ? 'true' : undefined}
				class="min-h-[44px] w-full rounded-lg border border-ink-soft/35 bg-white px-3.5 py-2 text-base text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
			/>
			{#if data.errores?.fecha_entrada}
				<p role="alert" aria-live="polite" class="text-sm text-error">
					{data.errores.fecha_entrada}
				</p>
			{/if}
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="filtro-salida" class="text-sm font-medium text-ink">Salida</label>
			<input
				id="filtro-salida"
				name="salida"
				type="date"
				min={entrada || hoy}
				bind:value={salida}
				aria-invalid={data.errores?.fecha_salida ? 'true' : undefined}
				class="min-h-[44px] w-full rounded-lg border border-ink-soft/35 bg-white px-3.5 py-2 text-base text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
			/>
			{#if data.errores?.fecha_salida}
				<p role="alert" aria-live="polite" class="text-sm text-error">
					{data.errores.fecha_salida}
				</p>
			{/if}
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="filtro-huespedes" class="text-sm font-medium text-ink">Huéspedes</label>
			<select
				id="filtro-huespedes"
				name="huespedes"
				bind:value={huespedes}
				class="min-h-[44px] w-full rounded-lg border border-ink-soft/35 bg-white px-3.5 py-2 text-base text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
			>
				{#each [1, 2, 3, 4] as cantidad}
					<option value={cantidad}>
						{cantidad} {cantidad === 1 ? 'persona' : 'personas'}
					</option>
				{/each}
			</select>
			{#if data.errores?.huespedes}
				<p role="alert" aria-live="polite" class="text-sm text-error">
					{data.errores.huespedes}
				</p>
			{/if}
		</div>

		<div>
			<Boton tipo="submit" variante="primario" anchoCompleto>
				Buscar
			</Boton>
		</div>
	</form>

	{#if data.habitaciones.length === 0}
		<div class="rounded-xl border border-ink-soft/15 bg-white p-8 text-center">
			<h2 class="text-lg font-semibold text-ink">
				No hay habitaciones disponibles para los criterios seleccionados
			</h2>
			<p class="mt-2 text-base text-ink-soft">
				Intenta cambiar fechas de llegada o salida, o ajusta la cantidad de huéspedes.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each data.habitaciones as hab (hab.id)}
				<article
					class="flex flex-col overflow-hidden rounded-xl border border-ink-soft/15 bg-white shadow-sm transition-shadow hover:shadow-md"
				>
					<div
						class="relative flex h-40 w-full flex-col justify-between bg-gradient-to-br from-primary/15 via-secondary to-accent/20 p-4"
					>
						<div class="flex items-center justify-between">
							<span
								class="rounded-md bg-white/90 px-2.5 py-1 text-sm font-semibold text-primary shadow-xs"
							>
								Hab. {hab.numero} · Piso {hab.piso}
							</span>
						</div>
						<div class="flex items-end justify-between text-primary/70">
							<svg
								class="h-10 w-10"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3 7v11m0-4h18m0 4v-8a2 2 0 00-2-2H7a2 2 0 00-2 2m4-2V5a1 1 0 011-1h4a1 1 0 011 1v2"
								/>
							</svg>
							<span class="text-sm font-medium text-ink-soft">
								Máx. {hab.capacidad} {hab.capacidad === 1 ? 'huésped' : 'huéspedes'}
							</span>
						</div>
					</div>

					<div class="flex flex-1 flex-col justify-between p-5">
						<div>
							<h2 class="text-lg font-semibold text-ink">{hab.tipo}</h2>
							<p class="mt-1 text-sm text-ink-soft">{hab.descripcion}</p>

							<div class="mt-3">
								<EtiquetaEstado
									tipo={hab.disponibles_en_categoria <= 2 ? 'pocas_disponibles' : 'disponible'}
								/>
							</div>

							<p class="mt-4 text-lg font-bold text-ink">
								{formatearMoneda(hab.tarifa_noche)}<span class="text-sm font-normal text-ink-soft"
									>/noche</span
								>
							</p>
						</div>

						<div class="mt-5">
							<Boton
								tipo="button"
								variante="primario"
								anchoCompleto
								onclick={() => (habitacionSeleccionada = hab)}
							>
								Reservar
							</Boton>
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</section>

<Modal
	abierto={Boolean(habitacionSeleccionada)}
	titulo="Confirmar reservación"
	onCerrar={() => (habitacionSeleccionada = null)}
>
	{#if habitacionSeleccionada}
		<div class="flex flex-col gap-4">
			<div class="rounded-xl bg-secondary p-4 text-sm">
				<p class="text-base font-semibold text-ink">
					{habitacionSeleccionada.tipo} (Habitación {habitacionSeleccionada.numero})
				</p>
				<p class="mt-1 text-ink-soft">{habitacionSeleccionada.descripcion}</p>
				<dl class="mt-3 grid grid-cols-2 gap-2 border-t border-ink-soft/20 pt-3">
					<div>
						<dt class="text-ink-soft">Llegada</dt>
						<dd class="font-medium text-ink">{formatearFechaCorta(data.fechaEntrada)}</dd>
					</div>
					<div>
						<dt class="text-ink-soft">Salida</dt>
						<dd class="font-medium text-ink">{formatearFechaCorta(data.fechaSalida)}</dd>
					</div>
					<div>
						<dt class="text-ink-soft">Huéspedes</dt>
						<dd class="font-medium text-ink">
							{data.huespedes} {data.huespedes === 1 ? 'persona' : 'personas'}
						</dd>
					</div>
					<div>
						<dt class="text-ink-soft">Estancia</dt>
						<dd class="font-medium text-ink">
							{noches} {noches === 1 ? 'noche' : 'noches'} × {formatearMoneda(
								habitacionSeleccionada.tarifa_noche
							)}
						</dd>
					</div>
				</dl>
				<div class="mt-3 flex items-center justify-between border-t border-ink-soft/20 pt-3">
					<span class="font-semibold text-ink">Total estimado (MXN)</span>
					<span class="text-xl font-bold text-primary">
						{formatearMoneda(noches * habitacionSeleccionada.tarifa_noche)}
					</span>
				</div>
			</div>

			<form
				method="POST"
				action="?/reservar"
				use:enhance={() => {
					confirmando = true;
					return async ({ update }) => {
						confirmando = false;
						habitacionSeleccionada = null;
						await update();
					};
				}}
				class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
			>
				<input type="hidden" name="habitacion_id" value={habitacionSeleccionada.id} />
				<input type="hidden" name="fecha_entrada" value={data.fechaEntrada} />
				<input type="hidden" name="fecha_salida" value={data.fechaSalida} />
				<input type="hidden" name="huespedes" value={data.huespedes} />

				<Boton
					tipo="button"
					variante="secundario"
					onclick={() => (habitacionSeleccionada = null)}
				>
					Volver
				</Boton>
				<Boton tipo="submit" variante="primario" deshabilitado={confirmando}>
					{confirmando ? 'Confirmando...' : 'Confirmar reserva'}
				</Boton>
			</form>
		</div>
	{/if}
</Modal>
