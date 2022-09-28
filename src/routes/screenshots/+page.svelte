<script>
	import { getScreenshots } from '$lib/screenshots';

    import { onMount } from 'svelte';

    import { selectedVersion } from '$lib/stores';

    import FullLoader from '$lib/components/FullLoader.svelte';
	import LocalImage from '$lib/components/image/LocalImage.svelte';

    let screenshots = [], 
	allscreenshots = [];
    onMount(async() => {
		selectedVersion.subscribe(async (val) => {
            if (!val.installed) {
                screenshots = [];
                return;
			}

			screenshots = await getScreenshots(val.name);
        });
		allscreenshots = await getScreenshots();
    });
</script>
<div class="pt-8">
	{#if screenshots}
		<div class="px-64">
			<div class="pb-16">
				<h1 class="text-2xl font-bold pb-4">Screenshots for selected version</h1>
				{#if screenshots.length}
					<div class="grid grid-cols-2 gap-4">
						{#each screenshots as screenshot}
							<LocalImage src={screenshot.path} alt={screenshot.name}/>
						{/each}
					</div>
				{:else}
					<span>No screenshots</span>
				{/if}
			</div>
			<div class="pb-16">
				<h1 class="text-2xl font-bold pb-4">All Screenshots</h1>
				{#if allscreenshots.length}
					<div class="grid grid-cols-2 gap-4">
						{#each allscreenshots as screenshot}
							<LocalImage src={screenshot.path} alt={screenshot.name}/>
						{/each}
					</div>
				{:else}
					<span>No screenshots</span>
				{/if}
			</div>
		</div>
	{:else}
		<FullLoader />
	{/if}
</div>