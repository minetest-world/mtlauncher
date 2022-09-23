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
		<path d="M19.293 5.293l-10.293 10.293-4.293-4.293c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414l5 5c0.391 0.391 1.024 0.391 1.414 0l11-11c0.391-0.391 0.391-1.024 0-1.414s-1.024-0.391-1.414 0z"></path>
	</svg>
</div>
