<script>
	let clazz;
    export { clazz as class };

	export let placeholder;
    export let isPassword = false;
    export let value;
</script>

<div class={`${clazz || ''} bg-slate-600 py-1 px-2 flex items-center`}>
	{#if isPassword}
		<input type="password" class="bg-transparent appearance-none border-0 outline-none w-full" bind:value placeholder={placeholder} />
	{:else}
		<input type="text" class="bg-transparent appearance-none border-0 outline-none w-full" bind:value placeholder={placeholder} />
	{/if}

</div>