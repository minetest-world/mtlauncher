<script>
	import LocalImage from '$lib/components/image/LocalImage.svelte';
    import Folder from '$lib/icon/Folder.svelte';

    import { openFolderForFile, fileName } from '$lib/files';

    export let src, alt;
</script>

<div class="flex flex-col">
	<LocalImage {src} {alt} />
	<div class="py-2 flex flex-row justify-center">
		<button class="hover:text-dark-green hover:cursor-pointer" on:click={() => openFolderForFile(src)}>
			<Folder />
		</button>
		<span class="pl-2">{alt}</span>
	</div>
</div>