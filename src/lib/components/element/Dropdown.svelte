<script>
    export let toggled = false;

    // either left or right
    export let align = 'left';
</script>

<div class="relative inline-block w-full">
	<div on:click={() => toggled = !toggled} class="hover:cursor-pointer">
		<slot name="button" toggled={toggled}></slot>
	</div>
	<div class="absolute mb-12 z-30 bg-slate-600 bottom-0" class:right-0={'right' === align} class:left-0={'left' === align} class:hidden={!toggled}>
		<div class="py-2" on:click={() => toggled = false}>
			<slot name="options"></slot>
		</div>
	</div>
</div>