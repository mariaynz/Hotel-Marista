<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import Boton from '$lib/components/Boton.svelte';
	import EtiquetaEstado from '$lib/components/EtiquetaEstado.svelte';
	import Alerta from '$lib/components/Alerta.svelte';
	import { formatearMoneda, formatearRangoFechas } from '$lib/utils/format';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<svelte:head>
	<title>Mis reservas · Hotel Marista Gestión</title>
</svelte:head>

<section aria-labelledby="titulo-reservas" class="flex flex-col gap-6">
	<h1 id="titulo-reservas" class="font-display text-[28px] font-bold text-primary">
		Mis reservas
	</h1>

	{#if data.codigoRecienCreado}
		<Alerta tipo="exito">
			Tu reservación fue confirmada con éxito. Tu código de reserva es
			<strong>#{data.codigoRecienCreado}</strong>.
		</Alerta>
	{/if}

	{#if form?.canceladaOk}
		<Alerta tipo="exito">
			La reservación ha sido cancelada y la habitación quedó liberada.
		</Alerta>
	{/if}

	{#if form?.errorCancelacion}
		<Alerta tipo="error">{form.errorCancelacion}</Alerta>
	{/if}

	<div class="flex flex-col gap-3">
		<h2 class="text-lg font-semibold text-ink">Próximas</h2>

		{#if data.proximas.length === 0}
			<div class="rounded-xl border border-ink-soft/15 bg-white p-6 text-ink-soft">
				No tienes reservaciones próximas.
				<a href="/huesped/buscar" class="ml-1 font-medium text-primary underline">
					Explora habitaciones disponibles
				</a>.
			</div>
		{:else}
			<div class="flex flex-col gap-4">
				{#each data.proximas as reserva (reserva.id)}
					<article
						class="flex flex-col justify-between gap-4 rounded-xl border border-ink-soft/15 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-secondary text-primary"
								aria-hidden="true"
							>
								<span class="font-semibold text-sm">Hab. {reserva.habitacion_numero}</span>
							</div>

							<div>
								<h3 class="text-base font-semibold text-ink sm:text-lg">
									#{reserva.codigo} · {reserva.habitacion_tipo}
								</h3>
								<p class="mt-0.5 text-sm text-ink-soft">
									{formatearRangoFechas(reserva.fecha_entrada, reserva.fecha_salida)} · {reserva.huespedes}
									{reserva.huespedes === 1 ? 'huésped' : 'huéspedes'} ·
									<span class="font-medium text-ink">{formatearMoneda(reserva.total)} MXN</span>
								</p>
							</div>
						</div>

						<div class="flex flex-wrap items-center gap-3 self-end sm:self-center">
							<EtiquetaEstado tipo={reserva.estado} />

							{#if reserva.estado === 'confirmada' && reserva.fecha_entrada >= data.hoy}
								<form method="POST" action="?/cancelar" use:enhance>
									<input type="hidden" name="reserva_id" value={reserva.id} />
									<Boton tipo="submit" variante="secundario">
										Cancelar reserva
									</Boton>
								</form>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>

	<div class="mt-2 flex flex-col gap-3">
		<h2 class="text-lg font-semibold text-ink">Anteriores</h2>

		{#if data.anteriores.length === 0}
			<div class="rounded-xl border border-ink-soft/15 bg-white p-6 text-ink-soft">
				Aún no tienes historial de estancias anteriores.
			</div>
		{:else}
			<div class="flex flex-col gap-4">
				{#each data.anteriores as reserva (reserva.id)}
					<article
						class="flex flex-col justify-between gap-4 rounded-xl border border-ink-soft/15 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-secondary text-ink-soft"
								aria-hidden="true"
							>
								<span class="text-sm font-medium">Hab. {reserva.habitacion_numero}</span>
							</div>

							<div>
								<h3 class="text-base font-semibold text-ink sm:text-lg">
									#{reserva.codigo} · {reserva.habitacion_tipo}
								</h3>
								<p class="mt-0.5 text-sm text-ink-soft">
									{formatearRangoFechas(reserva.fecha_entrada, reserva.fecha_salida)} · {reserva.huespedes}
									{reserva.huespedes === 1 ? 'huésped' : 'huéspedes'} ·
									<span class="font-medium text-ink">{formatearMoneda(reserva.total)} MXN</span>
								</p>
							</div>
						</div>

						<div class="self-end sm:self-center">
							<EtiquetaEstado tipo={reserva.estado} />
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</section>
