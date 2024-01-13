<script>
	import Tag from '$lib/components/text/Tag.svelte';
    import Check from '$lib/icon/Check.svelte';
    import SvelteMarkdown from 'svelte-markdown';
	import { _ } from 'svelte-i18n';

    import FullLoader from '$lib/components/FullLoader.svelte';
    import Link from '$lib/components/text/Link.svelte';

	import { page } from '$app/stores';
	let slug = $page.params.slug;

    import { selectedVersion } from '$lib/stores';
    import { getPackageInfo, isInstalledForVersion } from '$lib/api/contentdb';
    import { downloadAndUnzip } from '$lib/api/download';
    import { openGame } from '$lib/shell';

    import { onMount } from 'svelte';


    let packageInfo = false;
    let isInstalled = false;
    let isSupported = true; //TODO: figure out a way to do this...

	let installing = false;

    let [ author, pack ] = slug.split('@');

    onMount(async() => {
        let slugParts = slug.split('@');
        packageInfo = await getPackageInfo(slugParts[0], slugParts[1]);
        //isInstalled = await isInstalledForVersion(slugParts[1], 'games', $selectedVersion.name);
	});

    selectedVersion.subscribe(async(val) => {
        if (!val.installed) return;

        isInstalled = await isInstalledForVersion(pack, 'games', val.name);
	});

    async function install(url, version, name) {
        if (installing) return;

        installing = true;
        try {
            await downloadAndUnzip(url, `/versions/${version.name}/games/${name}`);
            isInstalled = true;
		}
        catch (err) {
            console.log(err);
		}
        installing = false;
	}
</script>

{#if !packageInfo}
	<FullLoader />
{:else}
	<div class="h-96 flex bg-cover bg-center bg-no-repeat flex w-full" style={`background-image: url('${packageInfo.screenshots[0]}')`}>
		<div class="flex flex-col w-full p-4 bg-black/30 h-full justify-end pl-64 pr-64">
			<div class="flex flex-row justify-between">
				<div class="flex flex-col">
					<div class="pb-4 tag-grid">
						{#if 'WIP' === packageInfo.dev_state}
							<Tag class="bg-blue-500" tag={$_('content.tags.wip')} />
						{/if}
						{#each packageInfo.tags as tag}
							<Tag class="bg-blue-500" tag={tag} />
						{/each}
					</div>
					<span class="text-2xl font-bold">{packageInfo.title}</span>
					<span>{$_('content.by_author', { values: { author: packageInfo.author } })}</span>
				</div>
				<div class="flex flex-col items-end justify-end">
					{#if isSupported}
						<div class="flex flex-row">
							<Check class="bg-emerald-500 w-6 h-6 mr-2" circle=true />
							<span>
								{@html $_('content.support_version', { values: { version: $selectedVersion.name } })}
							</span>
						</div>
					{/if}
					<div class="pt-4">
						{#if $selectedVersion.installed}
							{#if !isInstalled}
							<button on:click={async () => await install(packageInfo.url, $selectedVersion, pack)} class="bg-emerald-500 hover:bg-emerald-400 p-4 font-bold text-white flex flex-col items-center">
								{#if installing}
									<div>{$_('general.installing.title')}</div>
									<div class="font-medium text-sm">{$_('general.installing.subtitle')}</div>
								{:else}
									<div>{$_('games.install_game')}</div>
									<div class="font-medium text-sm">{$_('general.for_version', { values: { version: $selectedVersion.name } })}</div>
								{/if}
							</button>
							{:else}
								<button on:click={async () => await openGame(pack, $selectedVersion.name)} class="bg-emerald-500 hover:bg-emerald-400 p-4 font-bold text-white flex flex-col items-center">
									<div>{$_('games.launch_game')}</div>
									<div class="font-medium text-sm">{$_('general.version', { values: { version: $selectedVersion.name } })}</div>
								</button>
							{/if}
						{/if}
					</div>
				</div>
			</div>

		</div>
	</div>
	<div class="pl-64 pr-64 pt-8">
		<div class="markdown">
			<SvelteMarkdown source={packageInfo.long_description} renderers={{ link: Link }} />
		</div>
	</div>
{/if}
