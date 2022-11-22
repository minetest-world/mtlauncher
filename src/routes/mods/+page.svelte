<script>
	import { getContent, getInstalledContent } from '$lib/api/contentdb';
    import { onMount } from 'svelte';

    import { goto } from '$app/navigation';
	import { derived } from 'svelte/store';

    import { selectedVersion } from '$lib/stores';

    import FullLoader from '$lib/components/FullLoader.svelte';
  	
	let allcontent, content;
    let installedMods = [];
    onMount(async() => {
        // Get mods and sort by score
        allcontent = await getContent();
		content = derived(allcontent, $content => $content.filter(i => i.type === 'mod').sort((packageA, packageB) => packageB.scoredata.score - packageA.scoredata.score));

        selectedVersion.subscribe(async (val) => {
            if (!val.installed) {
                installedMods = [];
                return;
			}

            let mods = await getInstalledContent('mods', val.name);
            let modArr = [];
            for (const mod of mods) {
                let contentItem = $content.filter(i => i.name === mod);
                if (contentItem.length) {
                    modArr.push(contentItem[0]);
				}
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
							<div class="bg-cover bg-center bg-no-repeat flex h-48" style={`background-image: url('${item.thumbnail}')`}>
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
					<div class="bg-cover bg-center bg-no-repeat flex h-48" style={`background-image: url('${item.thumbnail}')`}>
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