<script>
	import { getContent, getInstalledContent } from '$lib/api/contentdb';
    import { onMount } from 'svelte';

    import { goto } from '$app/navigation';

    import { selectedVersion } from '$lib/stores';

    import FullLoader from '$lib/components/FullLoader.svelte';

    let content;
    let installedGames = [];
    onMount(async() => {
        content = await getContent();

        // blah
		$content = $content.filter(i => i.type === 'game');

        selectedVersion.subscribe(async (val) => {
            if (!val.installed) {
                installedGames = [];
                return;
			}

            let games = await getInstalledContent('games', val.name);
            let gameArr = [];
            for (const game of games) {
                let contentItem = $content.filter(i => i.name === game);
                if (contentItem.length) {
                    gameArr.push(contentItem[0]);
				}
			}

            installedGames = gameArr;
        });
	});
</script>
<div class="pt-8">
	{#if content}
		<div class="px-64">
			{#if installedGames.length}
				<div class="pb-16">
					<h1 class="text-2xl font-bold pb-4">Installed Games</h1>
					<div class="grid grid-cols-2 gap-4">
						{#each installedGames as item}
							<div class="bg-cover bg-center bg-no-repeat flex h-48" style={`background-image: url('${item.thumbnail}')`}>
								<div on:click={() => goto(`/games/${item.slug}`)} class="flex flex-col w-full p-4 bg-black/50 h-full justify-end hover:bg-black/60 hover:cursor-pointer">
									<span class="text-xl font-bold">{item.title}</span>
									<span>by {item.author}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			<h1 class="text-2xl font-bold pb-4">All Games</h1>
			<div class="grid grid-cols-2 gap-4">
				{#each $content as item}
					<div class="bg-cover bg-center bg-no-repeat flex h-48" style={`background-image: url('${item.thumbnail}')`}>
						<div on:click={() => goto(`/games/${item.slug}`)} class="flex flex-col w-full p-4 bg-black/50 h-full justify-end hover:bg-black/60 hover:cursor-pointer">
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