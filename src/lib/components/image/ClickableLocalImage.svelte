<script>
	import { showComponent } from '$lib/modal';
	import LocalImage from '$lib/components/image/LocalImage.svelte';
	import LocalImageModal from '$lib/components/image/LocalImageModal.svelte';

	export let src, alt;
</script>
	
<div class="hover:cursor-pointer" on:click={showComponent(LocalImageModal, { src, alt })}>
	<LocalImage {src} {alt} />
</div>