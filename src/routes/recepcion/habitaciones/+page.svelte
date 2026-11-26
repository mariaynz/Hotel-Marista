<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import type { EstadoHabitacion, Habitacion } from '$lib/server/services/habitaciones.service';
	import Boton from '$lib/components/Boton.svelte';
	import Campo from '$lib/components/Campo.svelte';
	import EtiquetaEstado from '$lib/components/EtiquetaEstado.svelte';
	import Alerta from '$lib/components/Alerta.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { formatearMoneda } from '$lib/utils/format';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let filtroEstado = $state<'todas' | EstadoHabitacion>('todas');
	let habitacionEditando = $state<Habitacion | null>(null);
	let modalCrear = $state(false);

	const filtros: Array<{ clave: 'todas' | EstadoHabitacion; etiqueta: string }> = [
		{ clave: 'todas', etiqueta: 'Todas' },
		{ clave: 'disponible', etiqueta: 'Disponible' },
		{ clave: 'ocupada', etiqueta: 'Ocupada' },
		{ clave: 'limpieza', etiqueta: 'Limpieza' },
		{ clave: 'mantenimiento', etiqueta: 'Mantenimiento' }
	];

	const habitacionesFiltradas = $derived(
		filtroEstado === 'todas'
			? data.habitaciones
			: data.habitaciones.filter((h) => h.estado === filtroEstado)
	);
</script>

<svelte:head>
	<title>Habitaciones · Recepción · Hotel Marista Gestión</title>
</svelte:head>

<section aria-labelledby="titulo-habitaciones" class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 id="titulo-habitaciones" class="font-display text-[28px] font-bold text-primary">
			Habitaciones
		</h1>

		<Boton tipo="button" variante="primario" onclick={() => (modalCrear = true)}>
			+ Nueva habitación
		</Boton>
	</div>

	{#if form?.mensajeExito}
		<Alerta tipo="exito">{form.mensajeExito}</Alerta>
	{/if}

	{#if form?.errorHabitacion}
		<Alerta tipo="error">{form.errorHabitacion}</Alerta>
	{/if}

	<div role="tablist" aria-label="Filtrar habitaciones por estado" class="flex flex-wrap gap-2">
		{#each filtros as filtro}
			<button
				type="button"
				role="tab"
				aria-selected={filtroEstado === filtro.clave}
				onclick={() => (filtroEstado = filtro.clave)}
				class="inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors {filtroEstado ===
				filtro.clave
					? 'border-primary bg-primary text-white shadow-xs'
					: 'border-ink-soft/30 bg-white text-ink hover:border-primary hover:text-primary'}"
			>
				{filtro.etiqueta}
			</button>
		{/each}
	</div>

	{#if habitacionesFiltradas.length === 0}
		<div class="rounded-xl border border-ink-soft/15 bg-white p-8 text-center text-ink-soft">
			No hay habitaciones en estado "{filtroEstado}".
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each habitacionesFiltradas as hab (hab.id)}
				<article
					class="flex flex-col justify-between rounded-xl border border-ink-soft/15 bg-white p-5 shadow-sm"
				>
					<div>
						<div class="flex items-baseline justify-between gap-2">
							<h2 class="text-xl font-bold text-ink">{hab.numero}</h2>
							<span class="text-sm font-medium text-ink-soft">
								{formatearMoneda(hab.tarifa_noche)}/noche
							</span>
						</div>
						<p class="mt-0.5 text-sm text-ink-soft">
							{hab.tipo.replace('Habitación ', '')}
						</p>

						<div class="mt-3">
							<EtiquetaEstado tipo={hab.estado} />
						</div>
					</div>

					<div class="mt-5">
						<Boton
							tipo="button"
							variante="secundario"
							anchoCompleto
							onclick={() => (habitacionEditando = { ...hab })}
						>
							Cambiar estado
						</Boton>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</section>

<Modal
	abierto={Boolean(habitacionEditando)}
	titulo={habitacionEditando ? `Habitación ${habitacionEditando.numero}` : 'Editar habitación'}
	onCerrar={() => (habitacionEditando = null)}
>
	{#if habitacionEditando}
		<form
			method="POST"
			action="?/actualizar"
			use:enhance={() => {
				return async ({ update }) => {
					habitacionEditando = null;
					await update();
				};
			}}
			class="flex flex-col gap-4"
		>
			<input type="hidden" name="habitacion_id" value={habitacionEditando.id} />

			<div class="flex flex-col gap-1.5">
				<label for="edit-estado" class="text-sm font-medium text-ink">
					Estado operativo <span class="text-error">*</span>
				</label>
				<select
					id="edit-estado"
					name="estado"
					bind:value={habitacionEditando.estado}
					class="min-h-[44px] w-full rounded-lg border border-ink-soft/35 bg-white px-3.5 py-2 text-base text-ink"
				>
					<option value="disponible">Disponible</option>
					<option value="ocupada">Ocupada</option>
					<option value="limpieza">Limpieza</option>
					<option value="mantenimiento">Mantenimiento</option>
				</select>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Campo
					id="edit-tipo"
					nombre="tipo"
					etiqueta="Tipo de habitación"
					bind:valor={habitacionEditando.tipo}
					requerido
				/>
				<Campo
					id="edit-tarifa"
					nombre="tarifa_noche"
					etiqueta="Tarifa por noche (MXN)"
					tipo="number"
					min="1"
					bind:valor={habitacionEditando.tarifa_noche}
					requerido
				/>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Campo
					id="edit-piso"
					nombre="piso"
					etiqueta="Piso"
					tipo="number"
					min="1"
					bind:valor={habitacionEditando.piso}
					requerido
				/>
				<Campo
					id="edit-capacidad"
					nombre="capacidad"
					etiqueta="Capacidad máxima"
					tipo="number"
					min="1"
					max="10"
					bind:valor={habitacionEditando.capacidad}
					requerido
				/>
			</div>

			<Campo
				id="edit-descripcion"
				nombre="descripcion"
				etiqueta="Descripción y amenidades"
				bind:valor={habitacionEditando.descripcion}
				requerido
			/>

			<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<Boton tipo="button" variante="secundario" onclick={() => (habitacionEditando = null)}>
					Cancelar
				</Boton>
				<Boton tipo="submit" variante="primario">
					Guardar cambios
				</Boton>
			</div>
		</form>
	{/if}
</Modal>

<Modal
	abierto={modalCrear}
	titulo="Registrar nueva habitación"
	onCerrar={() => (modalCrear = false)}
>
	<form
		method="POST"
		action="?/crear"
		use:enhance={() => {
			return async ({ update }) => {
				modalCrear = false;
				await update();
			};
		}}
		class="flex flex-col gap-4"
	>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<Campo
				id="nueva-numero"
				nombre="numero"
				etiqueta="Número de habitación"
				placeholder="Ej. 306"
				requerido
			/>
			<Campo
				id="nueva-tipo"
				nombre="tipo"
				etiqueta="Tipo"
				placeholder="Ej. Suite Junior"
				requerido
			/>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<Campo
				id="nueva-piso"
				nombre="piso"
				etiqueta="Piso"
				tipo="number"
				min="1"
				valor={3}
				requerido
			/>
			<Campo
				id="nueva-capacidad"
				nombre="capacidad"
				etiqueta="Capacidad"
				tipo="number"
				min="1"
				max="10"
				valor={2}
				requerido
			/>
			<Campo
				id="nueva-tarifa"
				nombre="tarifa_noche"
				etiqueta="Tarifa (MXN)"
				tipo="number"
				min="1"
				valor={1800}
				requerido
			/>
		</div>

		<Campo
			id="nueva-descripcion"
			nombre="descripcion"
			etiqueta="Descripción"
			placeholder="Ej. Cama king · Vista panorámica · 2 personas"
			requerido
		/>

		<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
			<Boton tipo="button" variante="secundario" onclick={() => (modalCrear = false)}>
				Cancelar
			</Boton>
			<Boton tipo="submit" variante="primario">
				Crear habitación
			</Boton>
		</div>
	</form>
</Modal>
