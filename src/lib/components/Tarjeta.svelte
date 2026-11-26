<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		clase?: string;
		children: Snippet;
	}

	let { clase = '', children }: Props = $props();
</script>

<div class="rounded-xl border border-ink-soft/15 bg-white p-5 shadow-sm {clase}">
	{@render children()}
</div>
