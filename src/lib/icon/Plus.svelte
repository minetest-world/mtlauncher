<script>
	export let circle = false;

    let clazz;
    export { clazz as class };
</script>
<div
	class={clazz || ''}
	class:rounded-full={circle}
	class:flex={circle}
	class:items-center={circle}
	class:justify-center={circle}
>
<svg class="svgicon" viewBox="0 0 24 24">
	<path d="M5 13h6v6c0 0.552 0.448 1 1 1s1-0.448 1-1v-6h6c0.552 0 1-0.448 1-1s-0.448-1-1-1h-6v-6c0-0.552-0.448-1-1-1s-1 0.448-1 1v6h-6c-0.552 0-1 0.448-1 1s0.448 1 1 1z"></path>
</svg>
</div>