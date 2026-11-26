<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import Boton from '$lib/components/Boton.svelte';
	import Campo from '$lib/components/Campo.svelte';
	import Alerta from '$lib/components/Alerta.svelte';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let esRegistro = $state(false);
	let enviando = $state(false);

	$effect(() => {
		if (form?.modo === 'registro') {
			esRegistro = true;
		} else if (form?.modo === 'login') {
			esRegistro = false;
		}
	});
</script>

<svelte:head>
	<title>{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'} · Hotel Marista Gestión</title>
</svelte:head>

<main
	id="contenido-principal"
	class="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-10"
>
	<section
		aria-labelledby="titulo-auth"
		class="w-full max-w-[440px] rounded-2xl border border-ink-soft/15 bg-white p-8 shadow-sm sm:p-10"
	>
		<header class="mb-7 text-center">
			<h1 id="titulo-auth" class="font-display text-[28px] font-bold text-primary">
				Hotel Marista
			</h1>
			<p class="mt-1.5 text-sm text-ink-soft">
				{esRegistro
					? 'Crea tu cuenta de huésped para reservar en línea'
					: 'Inicia sesión para reservar o administrar el hotel'}
			</p>
		</header>

		{#if form?.errorGeneral}
			<div class="mb-5">
				<Alerta tipo="error">{form.errorGeneral}</Alerta>
			</div>
		{/if}

		{#if !esRegistro}
			<form
				method="POST"
				action="?/iniciar"
				use:enhance={() => {
					enviando = true;
					return async ({ update }) => {
						enviando = false;
						await update();
					};
				}}
				class="flex flex-col gap-5"
				novalidate
			>
				<Campo
					id="login-correo"
					nombre="correo"
					etiqueta="Correo electrónico"
					tipo="email"
					valor={form?.correo ?? ''}
					placeholder="nombre@correo.com"
					autocomplete="email"
					error={form?.errores?.correo}
					requerido
				/>

				<Campo
					id="login-contrasena"
					nombre="contrasena"
					etiqueta="Contraseña"
					tipo="password"
					placeholder="••••••••"
					autocomplete="current-password"
					error={form?.errores?.contrasena}
					requerido
				/>

				<div class="pt-1">
					<Boton tipo="submit" variante="primario" anchoCompleto deshabilitado={enviando}>
						{enviando ? 'Ingresando...' : 'Iniciar sesión'}
					</Boton>
				</div>
			</form>

			<div class="mt-6 text-center">
				<button
					type="button"
					onclick={() => (esRegistro = true)}
					class="inline-flex min-h-[44px] items-center justify-center text-sm font-medium text-primary underline-offset-4 hover:underline"
				>
					¿No tienes cuenta? Regístrate
				</button>
			</div>
		{:else}
			<form
				method="POST"
				action="?/registrar"
				use:enhance={() => {
					enviando = true;
					return async ({ update }) => {
						enviando = false;
						await update();
					};
				}}
				class="flex flex-col gap-4"
				novalidate
			>
				<Campo
					id="reg-nombre"
					nombre="nombre"
					etiqueta="Nombre completo"
					tipo="text"
					valor={form?.nombre ?? ''}
					placeholder="Ej. Ana Pérez"
					autocomplete="name"
					error={form?.errores?.nombre}
					requerido
				/>

				<Campo
					id="reg-correo"
					nombre="correo"
					etiqueta="Correo electrónico"
					tipo="email"
					valor={form?.correo ?? ''}
					placeholder="nombre@correo.com"
					autocomplete="email"
					error={form?.errores?.correo}
					requerido
				/>

				<Campo
					id="reg-telefono"
					nombre="telefono"
					etiqueta="Teléfono"
					tipo="tel"
					valor={form?.telefono ?? ''}
					placeholder="9991234567"
					autocomplete="tel"
					error={form?.errores?.telefono}
					requerido
				/>

				<Campo
					id="reg-contrasena"
					nombre="contrasena"
					etiqueta="Contraseña"
					tipo="password"
					placeholder="Mínimo 8 caracteres"
					autocomplete="new-password"
					error={form?.errores?.contrasena}
					requerido
				/>

				<div class="pt-1">
					<Boton tipo="submit" variante="primario" anchoCompleto deshabilitado={enviando}>
						{enviando ? 'Creando cuenta...' : 'Crear cuenta'}
					</Boton>
				</div>
			</form>

			<div class="mt-6 text-center">
				<button
					type="button"
					onclick={() => (esRegistro = false)}
					class="inline-flex min-h-[44px] items-center justify-center text-sm font-medium text-primary underline-offset-4 hover:underline"
				>
					¿Ya tienes cuenta? Inicia sesión
				</button>
			</div>
		{/if}
	</section>
</main>
