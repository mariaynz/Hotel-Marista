<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import type { ReservaDetalle } from '$lib/server/services/reservas.service';
	import Boton from '$lib/components/Boton.svelte';
	import Campo from '$lib/components/Campo.svelte';
	import EtiquetaEstado from '$lib/components/EtiquetaEstado.svelte';
	import Alerta from '$lib/components/Alerta.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import {
		formatearFechaCorta,
		formatearMoneda,
		obtenerFechaHoyISO,
		sumarDiasISO
	} from '$lib/utils/format';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let reservaCheckIn = $state<ReservaDetalle | null>(null);
	let idVerificada = $state(false);
	let habitacionReasignadaId = $state<string>('');

	let reservaCheckOut = $state<ReservaDetalle | null>(null);
	let modalNuevaReserva = $state(false);

	const hoy = obtenerFechaHoyISO();
	let nuevaEntrada = $state(hoy);
	let nuevaSalida = $state(sumarDiasISO(hoy, 1));

	const habitacionesDisponibles = $derived(
		data.habitaciones.filter((h) => h.estado === 'disponible')
	);

	function abrirCheckIn(reserva: ReservaDetalle) {
		reservaCheckIn = reserva;
		idVerificada = false;
		habitacionReasignadaId =
			reserva.habitacion_estado === 'disponible' ? '' : String(habitacionesDisponibles[0]?.id ?? '');
	}

	function formatearNombreApellido(nombreCompleto: string): string {
		const partes = nombreCompleto.trim().split(/\s+/);
		if (partes.length < 2) return nombreCompleto;
		const apellido = partes[partes.length - 1];
		const nombre = partes.slice(0, -1).join(' ');
		return `${apellido}, ${nombre}`;
	}
</script>

<svelte:head>
	<title>Panel del día · Recepción · Hotel Marista Gestión</title>
</svelte:head>

<section aria-labelledby="titulo-panel" class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 id="titulo-panel" class="font-display text-[28px] font-bold text-primary">
			{data.vista === 'reservas'
				? 'Todas las reservas'
				: data.vista === 'huespedes'
					? 'Huéspedes registrados'
					: 'Panel del día'}
		</h1>

		<Boton tipo="button" variante="primario" onclick={() => (modalNuevaReserva = true)}>
			+ Nueva reserva
		</Boton>
	</div>

	{#if form?.mensajeExito}
		<Alerta tipo="exito">{form.mensajeExito}</Alerta>
	{/if}

	{#if form?.errorOperacion}
		<Alerta tipo="error">{form.errorOperacion}</Alerta>
	{/if}

	{#if data.vista === 'huespedes'}
		<div class="overflow-hidden rounded-xl border border-ink-soft/15 bg-white shadow-sm">
			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-left">
					<thead class="border-b border-ink-soft/15 bg-secondary/60 text-sm font-semibold text-ink-soft">
						<tr>
							<th class="px-5 py-3.5">Nombre</th>
							<th class="px-5 py-3.5">Correo electrónico</th>
							<th class="px-5 py-3.5">Teléfono</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-ink-soft/15 text-base">
						{#each data.huespedesDirectorio as h (h.id)}
							<tr>
								<td class="px-5 py-4 font-medium text-ink">{h.nombre}</td>
								<td class="px-5 py-4 text-ink-soft">{h.correo}</td>
								<td class="px-5 py-4 text-ink-soft">{h.telefono || '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		{#if data.vista === 'panel'}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<div class="rounded-xl border border-ink-soft/15 bg-white p-5 shadow-sm">
					<p class="text-sm font-medium text-ink-soft">Llegadas hoy</p>
					<p class="mt-2 font-display text-3xl font-bold text-primary">
						{data.metricas.llegadasHoy}
					</p>
				</div>

				<div class="rounded-xl border border-ink-soft/15 bg-white p-5 shadow-sm">
					<p class="text-sm font-medium text-ink-soft">Salidas hoy</p>
					<p class="mt-2 font-display text-3xl font-bold text-primary">
						{data.metricas.salidasHoy}
					</p>
				</div>

				<div class="rounded-xl border border-ink-soft/15 bg-white p-5 shadow-sm">
					<p class="text-sm font-medium text-ink-soft">Ocupación</p>
					<p class="mt-2 font-display text-3xl font-bold text-primary">
						{data.metricas.porcentajeOcupacion}%
					</p>
				</div>

				<div class="rounded-xl border border-ink-soft/15 bg-white p-5 shadow-sm">
					<p class="text-sm font-medium text-ink-soft">Disponibles</p>
					<p class="mt-2 font-display text-3xl font-bold text-primary">
						{data.metricas.habitacionesDisponibles}
					</p>
				</div>
			</div>
		{/if}

		<form method="GET" action="/recepcion" class="flex flex-col gap-3 sm:flex-row">
			{#if data.vista !== 'panel'}
				<input type="hidden" name="vista" value={data.vista} />
			{/if}
			<label for="buscar-reserva-recepcion" class="sr-only">
				Buscar reserva por código o nombre
			</label>
			<div class="relative flex-1">
				<input
					id="buscar-reserva-recepcion"
					name="q"
					type="search"
					value={data.q}
					placeholder="Buscar reserva por código o nombre"
					class="min-h-[44px] w-full rounded-xl border border-ink-soft/30 bg-white px-4 py-2.5 text-base text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
				/>
			</div>
			<Boton tipo="submit" variante="secundario">Buscar</Boton>
		</form>

		{@const listaMostrada =
			data.vista === 'reservas' ? data.todasReservas : data.movimientosDia}

		{#if listaMostrada.length === 0}
			<div class="rounded-xl border border-ink-soft/15 bg-white p-8 text-center text-ink-soft">
				No se encontraron reservaciones para mostrar con el filtro actual.
			</div>
		{:else}
			<div class="hidden overflow-hidden rounded-xl border border-ink-soft/15 bg-white shadow-sm md:block">
				<table class="w-full border-collapse text-left">
					<thead class="border-b border-ink-soft/15 bg-secondary/50 text-sm font-semibold text-ink-soft">
						<tr>
							<th class="px-5 py-3.5">Código</th>
							<th class="px-5 py-3.5">Huésped</th>
							<th class="px-5 py-3.5">Habitación</th>
							<th class="px-5 py-3.5">Tipo</th>
							<th class="px-5 py-3.5">Movimiento</th>
							<th class="px-5 py-3.5 text-right">Acción</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-ink-soft/15 text-base">
						{#each listaMostrada as res (res.id)}
							<tr class="hover:bg-secondary/35">
								<td class="px-5 py-4 font-medium text-ink">#{res.codigo}</td>
								<td class="px-5 py-4 text-ink">{formatearNombreApellido(res.huesped_nombre)}</td>
								<td class="px-5 py-4 font-medium text-ink">{res.habitacion_numero}</td>
								<td class="px-5 py-4 text-ink-soft">{res.habitacion_tipo.replace('Habitación ', '')}</td>
								<td class="px-5 py-4">
									{#if res.estado === 'confirmada'}
										<EtiquetaEstado tipo="llegada" />
									{:else if res.estado === 'en_curso'}
										<EtiquetaEstado tipo={res.fecha_salida <= data.hoy ? 'salida' : 'en_curso'} />
									{:else}
										<EtiquetaEstado tipo={res.estado} />
									{/if}
								</td>
								<td class="px-5 py-4 text-right">
									{#if res.estado === 'confirmada'}
										<Boton tipo="button" variante="primario" onclick={() => abrirCheckIn(res)}>
											Hacer check-in
										</Boton>
									{:else if res.estado === 'en_curso'}
										<Boton
											tipo="button"
											variante="primario"
											onclick={() => (reservaCheckOut = res)}
										>
											Hacer check-out
										</Boton>
									{:else}
										<span class="text-sm text-ink-soft">Sin acción</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="flex flex-col gap-3 md:hidden">
				{#each listaMostrada as res (res.id)}
					<article class="rounded-xl border border-ink-soft/15 bg-white p-4 shadow-sm">
						<div class="flex items-start justify-between gap-2">
							<div>
								<p class="text-sm font-semibold text-primary">#{res.codigo}</p>
								<h2 class="text-base font-semibold text-ink">
									{formatearNombreApellido(res.huesped_nombre)}
								</h2>
								<p class="mt-0.5 text-sm text-ink-soft">
									Hab. {res.habitacion_numero} · {res.habitacion_tipo}
								</p>
							</div>
							{#if res.estado === 'confirmada'}
								<EtiquetaEstado tipo="llegada" />
							{:else if res.estado === 'en_curso'}
								<EtiquetaEstado tipo={res.fecha_salida <= data.hoy ? 'salida' : 'en_curso'} />
							{:else}
								<EtiquetaEstado tipo={res.estado} />
							{/if}
						</div>

						<div class="mt-4">
							{#if res.estado === 'confirmada'}
								<Boton
									tipo="button"
									variante="primario"
									anchoCompleto
									onclick={() => abrirCheckIn(res)}
								>
									Hacer check-in
								</Boton>
							{:else if res.estado === 'en_curso'}
								<Boton
									tipo="button"
									variante="primario"
									anchoCompleto
									onclick={() => (reservaCheckOut = res)}
								>
									Hacer check-out
								</Boton>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{/if}
	{/if}
</section>

<Modal
	abierto={Boolean(reservaCheckIn)}
	titulo="Registrar Check-in"
	onCerrar={() => (reservaCheckIn = null)}
>
	{#if reservaCheckIn}
		<form
			method="POST"
			action="?/checkin"
			use:enhance={() => {
				return async ({ update }) => {
					reservaCheckIn = null;
					await update();
				};
			}}
			class="flex flex-col gap-4"
		>
			<input type="hidden" name="reserva_id" value={reservaCheckIn.id} />

			<div class="rounded-xl bg-secondary p-4 text-sm">
				<p class="font-semibold text-ink">
					#{reservaCheckIn.codigo} · {reservaCheckIn.huesped_nombre}
				</p>
				<p class="mt-1 text-ink-soft">
					Estancia: {formatearFechaCorta(reservaCheckIn.fecha_entrada)} al
					{formatearFechaCorta(reservaCheckIn.fecha_salida)} ({reservaCheckIn.huespedes} huéspedes)
				</p>
				<p class="mt-1 text-ink">
					Habitación asignada: <strong>{reservaCheckIn.habitacion_numero}</strong> ({reservaCheckIn.habitacion_tipo})
				</p>
			</div>

			{#if reservaCheckIn.habitacion_estado !== 'disponible'}
				<Alerta tipo="advertencia">
					La habitación {reservaCheckIn.habitacion_numero} está actualmente en estado
					<strong>{reservaCheckIn.habitacion_estado}</strong>. Selecciona otra habitación disponible
					para completar el ingreso.
				</Alerta>
			{/if}

			<div class="flex flex-col gap-1.5">
				<label for="checkin-reasignar" class="text-sm font-medium text-ink">
					Habitación a asignar
				</label>
				<select
					id="checkin-reasignar"
					name="habitacion_reasignada_id"
					bind:value={habitacionReasignadaId}
					class="min-h-[44px] w-full rounded-lg border border-ink-soft/35 bg-white px-3.5 py-2 text-base text-ink"
				>
					{#if reservaCheckIn.habitacion_estado === 'disponible'}
						<option value="">
							Mantener habitación {reservaCheckIn.habitacion_numero} ({reservaCheckIn.habitacion_tipo})
						</option>
					{/if}
					{#each habitacionesDisponibles.filter((h) => h.id !== reservaCheckIn?.habitacion_id && h.capacidad >= (reservaCheckIn?.huespedes ?? 1)) as hab}
						<option value={String(hab.id)}>
							Hab. {hab.numero} · {hab.tipo} ({formatearMoneda(hab.tarifa_noche)}/noche)
						</option>
					{/each}
				</select>
			</div>

			<label class="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-ink-soft/25 p-3">
				<input
					type="checkbox"
					name="identificacion_verificada"
					bind:checked={idVerificada}
					required
					class="h-5 w-5 accent-primary"
				/>
				<span class="text-sm font-medium text-ink">
					Identificación oficial del huésped verificada
				</span>
			</label>

			<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<Boton tipo="button" variante="secundario" onclick={() => (reservaCheckIn = null)}>
					Cancelar
				</Boton>
				<Boton tipo="submit" variante="primario" deshabilitado={!idVerificada}>
					Confirmar check-in
				</Boton>
			</div>
		</form>
	{/if}
</Modal>

<Modal
	abierto={Boolean(reservaCheckOut)}
	titulo="Check-out y estado de cuenta"
	onCerrar={() => (reservaCheckOut = null)}
>
	{#if reservaCheckOut}
		{@const consumosActuales = data.consumosPorReserva[reservaCheckOut.id] ?? []}
		{@const totalConsumos = consumosActuales.reduce((acc, c) => acc + c.monto, 0)}
		{@const hospedaje = reservaCheckOut.noches * reservaCheckOut.tarifa_noche}

		<div class="flex flex-col gap-4">
			<div class="rounded-xl bg-secondary p-4 text-sm">
				<p class="font-semibold text-ink">
					#{reservaCheckOut.codigo} · {reservaCheckOut.huesped_nombre}
				</p>
				<p class="mt-0.5 text-ink-soft">
					Habitación {reservaCheckOut.habitacion_numero} ({reservaCheckOut.habitacion_tipo})
				</p>

				<div class="mt-3 space-y-1.5 border-t border-ink-soft/20 pt-3">
					<div class="flex justify-between">
						<span>
							Hospedaje ({reservaCheckOut.noches}
							{reservaCheckOut.noches === 1 ? 'noche' : 'noches'} ×
							{formatearMoneda(reservaCheckOut.tarifa_noche)})
						</span>
						<span class="font-medium text-ink">{formatearMoneda(hospedaje)}</span>
					</div>

					{#each consumosActuales as c (c.id)}
						<div class="flex justify-between text-ink-soft">
							<span>Consumo: {c.concepto}</span>
							<span>{formatearMoneda(c.monto)}</span>
						</div>
					{/each}

					<div class="flex justify-between border-t border-ink-soft/20 pt-2 text-base font-bold text-primary">
						<span>Total a liquidar (MXN)</span>
						<span>{formatearMoneda(hospedaje + totalConsumos)}</span>
					</div>
				</div>
			</div>

			<form
				method="POST"
				action="?/agregarConsumo"
				use:enhance
				class="grid grid-cols-1 gap-2 rounded-xl border border-ink-soft/20 p-3 sm:grid-cols-[1fr_120px_auto] sm:items-end"
			>
				<input type="hidden" name="reserva_id" value={reservaCheckOut.id} />
				<Campo
					id="consumo-concepto"
					nombre="concepto"
					etiqueta="Agregar consumo"
					placeholder="Ej. Cafetería / Lavandería"
					requerido
				/>
				<Campo
					id="consumo-monto"
					nombre="monto"
					etiqueta="Monto (MXN)"
					tipo="number"
					min="1"
					step="1"
					placeholder="150"
					requerido
				/>
				<Boton tipo="submit" variante="secundario">Agregar</Boton>
			</form>

			<form
				method="POST"
				action="?/checkout"
				use:enhance={() => {
					return async ({ update }) => {
						reservaCheckOut = null;
						await update();
					};
				}}
				class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
			>
				<input type="hidden" name="reserva_id" value={reservaCheckOut.id} />
				<Boton tipo="button" variante="secundario" onclick={() => (reservaCheckOut = null)}>
					Cerrar
				</Boton>
				<Boton tipo="submit" variante="primario">
					Finalizar check-out
				</Boton>
			</form>
		</div>
	{/if}
</Modal>

<Modal
	abierto={modalNuevaReserva}
	titulo="Nueva reserva presencial"
	onCerrar={() => (modalNuevaReserva = false)}
>
	<form
		method="POST"
		action="?/nuevaReservaPresencial"
		use:enhance={() => {
			return async ({ update }) => {
				modalNuevaReserva = false;
				await update();
			};
		}}
		class="flex flex-col gap-4"
	>
		<Campo
			id="presencial-nombre"
			nombre="huesped_nombre"
			etiqueta="Nombre completo del huésped"
			placeholder="Ej. Sofía Martínez"
			requerido
		/>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<Campo
				id="presencial-correo"
				nombre="huesped_correo"
				etiqueta="Correo electrónico (opcional)"
				tipo="email"
				placeholder="huesped@correo.com"
			/>
			<Campo
				id="presencial-telefono"
				nombre="huesped_telefono"
				etiqueta="Teléfono"
				tipo="tel"
				placeholder="9991234567"
			/>
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="presencial-habitacion" class="text-sm font-medium text-ink">
				Habitación <span class="text-error">*</span>
			</label>
			<select
				id="presencial-habitacion"
				name="habitacion_id"
				required
				class="min-h-[44px] w-full rounded-lg border border-ink-soft/35 bg-white px-3.5 py-2 text-base text-ink"
			>
				{#each data.habitaciones.filter((h) => h.estado !== 'mantenimiento') as hab}
					<option value={hab.id}>
						Hab. {hab.numero} · {hab.tipo} (Máx. {hab.capacidad} pers. · {formatearMoneda(
							hab.tarifa_noche
						)}/noche)
					</option>
				{/each}
			</select>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<Campo
				id="presencial-entrada"
				nombre="fecha_entrada"
				etiqueta="Llegada"
				tipo="date"
				min={hoy}
				bind:valor={nuevaEntrada}
				requerido
			/>
			<Campo
				id="presencial-salida"
				nombre="fecha_salida"
				etiqueta="Salida"
				tipo="date"
				min={nuevaEntrada || hoy}
				bind:valor={nuevaSalida}
				requerido
			/>
			<Campo
				id="presencial-huespedes"
				nombre="huespedes"
				etiqueta="Huéspedes"
				tipo="number"
				min="1"
				max="6"
				valor={2}
				requerido
			/>
		</div>

		<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
			<Boton tipo="button" variante="secundario" onclick={() => (modalNuevaReserva = false)}>
				Cancelar
			</Boton>
			<Boton tipo="submit" variante="primario">
				Guardar reservación
			</Boton>
		</div>
	</form>
</Modal>
