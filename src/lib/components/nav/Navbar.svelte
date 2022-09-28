<script>
	import Logo from '$lib/icon/Logo.svelte';
</script>
<div class="text-md text-center text-copy bg-darkest fixed top-0 z-10 w-full flex flex-row justify-between">
	<div class="flex flex-row">
		<div class="w-12 mx-4 mt-1">
			<Logo />
		</div>

		<ul class="flex flex-wrap -mb-px text-neutral-400">
			<slot name="left"></slot>
		</ul>
	</div>
	<div>
		<ul class="flex flex-wrap -mb-px text-neutral-400">
			<slot name="right"></slot>
		</ul>
	</div>

</div>