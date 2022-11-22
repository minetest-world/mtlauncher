<script>
	import { modal, close } from '$lib/modal';
	
	/*
	function checkClose(event){
		if (event.keyCode == 27 && $modal.visible) close();
	}
	Can be used in the future to check if users presses Esc key

	'on:keypress={checkClose}'
	*/
</script>

{#if $modal.visible}
	<div class="relative">
		<div class="fixed inset-0 bg-gray-700 bg-opacity-75 hover:cursor-pointer z-40" on:click={close}></div>
		<div class="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
			<div class="flex min-h-full items-center justify-center text-center">
				{#if !$modal.component}
				<div class="relative transform overflow-hidden rounded-lg bg-darkest pointer-events-auto w-96">
					<button class="absolute top-0 right-0 pr-4 pt-2 text-gray-500 hover:text-white hover:cursor-pointer" on:click={close}>
						X
					</button>
					<div class="flex flex-col items-center justify-center p-8">
						<span class="font-bold text-2xl pb-4">{$modal.title}</span>
						<span>{$modal.content}</span>
					</div>
				</div>
				{:else}
					<div class="pointer-events-auto w-3/4 text-left">
						<svelte:component this={$modal.component.this} {...$modal.component.args} />
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}