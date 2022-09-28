<script>
	import Minus from '$lib/icon/Minus.svelte';
    import Plus from '$lib/icon/Plus.svelte';
    import Button from '$lib/components/element/form/Button.svelte';
	export let min, max, value;
    export let placeholder;
    export let step = 1;

    function inc() {
        if (value < max) value = value + step;
		else value = max;
	}

    function dec() {
        if (value > min) value = value - step;
        else value = min;
	}
</script>

<div class="flex flex-row bg-slate-600 py-1 px-2 items-center justify-center">
	<Button class="" on:click={dec}>
		<Minus />
	</Button>
	<input type="number" {min} {max} class="bg-transparent appearance-none border-0 outline-none w-full" bind:value placeholder={placeholder} />
	<Button class="" on:click={inc}>
		<Plus />
	</Button>
</div>