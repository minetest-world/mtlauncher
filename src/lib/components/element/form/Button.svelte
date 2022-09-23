<script>
	let clazz;
    export { clazz as class };

    export let disabled = false;
</script>

<button on:click {disabled} class={`${clazz || ''} p-4 font-bold text-white flex flex-col items-center`} class:hover:cursor-not-allowed={disabled}>
	<slot></slot>
</button>