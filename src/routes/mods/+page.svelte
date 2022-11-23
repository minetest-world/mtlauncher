<script>
	import { filterAllContent, getInstalledContent } from '$lib/api/contentdb';
    import { onMount } from 'svelte';

    import { goto } from '$app/navigation';

    import { selectedVersion } from '$lib/stores';

    import FullLoader from '$lib/components/FullLoader.svelte';
  	
	let content;
    let installedMods = [];
    onMount(async() => {
		content = await filterAllContent('mod');
        selectedVersion.subscribe(async (val) => {
            if (!val.installed) {
                installedMods = [];
                return;
			}

            let mods = await getInstalledContent('mods', val.name);
            let modArr = [];
            for (const mod of mods) {
                let contentItem = $content.filter(i => i.name === mod);
                if (contentItem.length) modArr.push(contentItem[0]);
			}

            installedMods = modArr;
        });
	});
</script>
<div class="pt-8">
	{#if content}
		<div class="px-64">
			{#if installedMods.length}
				<div class="pb-16">
					<h1 class="text-2xl font-bold pb-4">Installed Mods</h1>
					<div class="grid grid-cols-2 gap-4">
						{#each installedMods as item}
							<div class="flex h-48 contentblock">
								<img src="{item.thumbnail}" alt="Thumbnail" class="backgroundimg" />
								<div on:click={() => goto(`/mods/${item.slug}`)} class="flex flex-col w-full p-4 bg-black/50 h-full justify-end hover:bg-black/60 hover:cursor-pointer">
									<span class="text-xl font-bold">{item.title}</span>
									<span>by {item.author}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			<h1 class="text-2xl font-bold pb-4">All Mods</h1>
			<div class="grid grid-cols-2 gap-4">
				{#each $content as item}
					<div class="flex h-48 contentblock">
						<img src="{item.thumbnail}" alt="Thumbnail" class="backgroundimg" />
						<div on:click={() => goto(`/mods/${item.slug}`)} class="flex flex-col w-full p-4 bg-black/50 h-full justify-end hover:bg-black/60 hover:cursor-pointer">
							<span class="text-xl font-bold">{item.title}</span>
							<span>by {item.author}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<FullLoader />
	{/if}
</div>