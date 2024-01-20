<script>
	let clazz;
    export { clazz as class };

    export let tag;
</script>

<span class={`${clazz || ''} rounded-full px-3 py-1 font-semibold text-sm mr-4`} on:click >{tag}</span>