<script>
	import Star from '$lib/icon/Star.svelte';

	export let toggled = false;
    export let onFavourite = () => {};
</script>

<span on:click|stopPropagation={() => {
    toggled = !toggled;
    onFavourite();
}} class:text-amber-500={toggled} class:hover:text-red-500={toggled} class:hover:text-emerald-500={!toggled}>
	<Star />
</span>