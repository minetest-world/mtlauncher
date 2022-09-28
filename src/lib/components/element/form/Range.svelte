<script>
	import { onMount } from 'svelte';

	export let min, max, step;

    export let value;

    onMount(() => {
        if (typeof value === 'undefined') {
            value = min;
		}
	});
</script>

<div class="flex flex-row justify-between items-center">
	<span>{min}</span>
	<input bind:value type="range" {min} {max} {step} class="mx-2 w-full h-2 rounded-lg cursor-pointer appearance-none bg-slate-600" />
	<span>{max}</span>
</div>
