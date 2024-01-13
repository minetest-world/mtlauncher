<script>
	import Tag from '$lib/components/text/Tag.svelte';
	import Check from '$lib/icon/Check.svelte';
	import Plus from '$lib/icon/Plus.svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import { _ } from 'svelte-i18n';

	import FullLoader from '$lib/components/FullLoader.svelte';
	import Link from '$lib/components/text/Link.svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	let slug = $page.params.slug;

	import { selectedVersion } from '$lib/stores';
	import { getPackageInfo, isInstalledForVersion, getDepList, isSupportedForVersion } from '$lib/api/contentdb';
	import { installMod as actualInstallMod, toggleMod, deleteMod } from '$lib/file/mods';
	import { showText } from '$lib/modal';

	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let packageInfo = false;
	let isInstalled = writable(false);
	let isSupported = null; // false = NO, null = MAYBE, true = YES

	let installing = writable(false);
	let modsToInstall = writable([]);
	let progress = writable(0);
	let currentInstalling = writable("");

	let [ author, pack ] = slug.split('@');

	onMount(updatePackage);
	page.subscribe(updatePackage);

	async function updatePackage() {
		slug = $page.params.slug;
		[ author, pack ] = slug.split('@');
		packageInfo = await getPackageInfo(author, pack);

		if ($selectedVersion.installed) {
			$isInstalled = await isInstalledForVersion(pack, 'mods', $selectedVersion.name);
			isSupported = isSupportedForVersion(packageInfo, $selectedVersion);
		}
	};

	selectedVersion.subscribe(async(val) => {
		if (!val.installed) {
			isSupported = null;
			return;
		}

		$isInstalled = await isInstalledForVersion(pack, 'mods', val.name);
		isSupported = isSupportedForVersion(packageInfo, val);
	});


	async function installMod(packageInfo, version = '5.6.0') {
		return await actualInstallMod(packageInfo, version, installing, modsToInstall, progress, currentInstalling, isInstalled);
	}

</script>

{#if !packageInfo}
	<FullLoader />
{:else}
	<div class="h-96 flex bg-cover bg-center bg-no-repeat flex w-full contentblock">
		<img src="{packageInfo.screenshots[0]}" alt="Screenshot" class="backgroundimg" />
		<div class="flex flex-col p-4 fixed">
			<button class="flex flex-col px-2 py-2 bg-blue-500 hover:bg-emerald-400 hover:cursor-pointer icon-chevron-left" on:click={() => history.back()}/>
		</div>
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
					{#if packageInfo.hard_dependencies && packageInfo.hard_dependencies.length > 0}
						<br>
						<div class="pb-4">
							<span>{$_('mods.required_dependencies')}</span><br>
							{#each packageInfo.hard_dependencies as dep}
								{#if dep.slug}
									<Tag class="bg-blue-500 hover:bg-emerald-400 hover:cursor-pointer" on:click={() => goto(`/mods/${dep.slug}`)} tag={dep.slug.replace('@','/')} />
								{:else}
									<Tag class="bg-blue-500" tag={dep.name} />
								{/if}
							{/each}
						</div>
					{/if}
				</div>
				<div class="flex flex-col items-end justify-end">
					{#if isSupported != null}
						<div class="flex flex-row">
							{#if isSupported == true}
								<Check class="bg-emerald-500 w-6 h-6 mr-2" circle=true />
								<span>
									Supports version <strong>{$selectedVersion.name}</strong>
								</span>
							{:else}
								<Plus class="bg-red-500 w-6 h-6 mr-2 rotate-45" circle=true />
								<span>
									Supports version <strong>{$selectedVersion.name}</strong>
								</span>
							{/if}
						</div>
					{/if}
					<div class="pt-4 flex">
						{#if $selectedVersion.installed}
							{#if !$isInstalled}
							<button on:click={async () => !$installing && (await installMod(packageInfo, $selectedVersion.name))} class="bg-emerald-500 hover:bg-emerald-400 p-4 font-bold text-white flex flex-col items-center">
								{#if $installing}
									<div>Installing {$progress}/{$modsToInstall.length} packages</div>
									<div class="font-medium text-sm">Current package "{$currentInstalling}"</div>
								{:else}
									<div>Install Mod</div>
									<div class="font-medium text-sm">for {$selectedVersion.name}</div>
								{/if}
							</button>
							{:else}
								<button on:click={async () => await deleteMod(pack, $selectedVersion.name)} class="bg-red-500 hover:bg-red-400 p-4 font-bold text-white flex flex-col items-center">
									<div>{$_('mods.delete_mod')}</div>
									<div class="font-medium text-sm">{$_('general.version', { values: { version: $selectedVersion.name } })}</div>
								</button>
								<button on:click={async () => await toggleMod(pack, $selectedVersion.name)} class="bg-emerald-500 hover:bg-emerald-400 p-4 font-bold text-white flex flex-col items-center">
									<div>{$_('mods.toggle_mod')}</div>
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
