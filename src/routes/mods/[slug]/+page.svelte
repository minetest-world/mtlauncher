<script>
	import Tag from '$lib/components/text/Tag.svelte';
    import Check from '$lib/icon/Check.svelte';
    import SvelteMarkdown from 'svelte-markdown';

    import FullLoader from '$lib/components/FullLoader.svelte';
    import Link from '$lib/components/text/Link.svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	let slug = $page.params.slug;

    import { selectedVersion } from '$lib/stores';
    import { getPackageInfo, isInstalledForVersion, getDepList } from '$lib/api/contentdb';
    import { downloadAndUnzip } from '$lib/api/download';
    //import { openGame } from '$lib/shell';

    import { onMount } from 'svelte';
  	import { writable } from 'svelte/store';
	
    let packageInfo = false;
    let isInstalled = false;
    let isSupported = false; //TODO: figure out a way to do this...

	let installing = false;
	let currentinstalling = writable("");
	let progress = writable(0);
	let modToInstall = [];
	
    let [ author, pack ] = slug.split('@');

    onMount(updatePackage);
	page.subscribe(updatePackage);

	async function updatePackage() {
		slug = $page.params.slug;
		let slugParts = slug.split('@');
        packageInfo = await getPackageInfo(slugParts[0], slugParts[1]);
		//isInstalled = await isInstalledForVersion(slugParts[1], 'mods', $selectedVersion.name);
	};

    selectedVersion.subscribe(async(val) => {
        if (!val.installed) {
			isSupported = false;
			return;
		}

        isInstalled = await isInstalledForVersion(pack, 'mods', val.name);
		for (let i in packageInfo.releases_data){
			const release = packageInfo.releases_data[i];
			if (release.min_minetest_version){
				isSupported = release.min_minetest_version.protocol_version >= val.branch.protocolVersion;
				if (isSupported && release.max_minetest_version) {
					isSupported = release.max_minetest_version.protocol_version <= val.branch.protocolVersion;
				}
			} else if (release.max_minetest_version) {
				isSupported = release.max_minetest_version.protocol_version <= val.branch.protocolVersion;
			}
			if (isSupported) break;
		}
	});

    async function install(version = '5.6.0') {
		if (installing) return;
		modToInstall = await getDepList(packageInfo, version);
		modToInstall.push(packageInfo);
		
        installing = true;
		progress.set(0);
		let installedProgress = 0;
		for (const installPackage of modToInstall) {
			progress.update(n => n + 1);
			currentinstalling.set(installPackage.name);
			try {
				await downloadAndUnzip(installPackage.url, `/versions/${version}/mods/${installPackage.name}`);
				installedProgress += 1;
			}
			catch (err) {
				console.log(err);
			}
		}
        installing = false;
		isInstalled = installedProgress == modToInstall.length;
		return isInstalled;
	}

	async function toggleMod(pack, version = '5.6.0'){
		if (pack || version && isInstalled){
			/* 
			* Steps:
			* 1. check if world.mt (need worlds thing first) includes 'load_mod_${pack}'
			* 2. if step1 then get the value of 'load_mod_${pack} = <VALUE>' and set NEWVALUE to !VALUE
			* 3. else set NEWVALUE to true
			* 4. write the new value as 'load_mod_${pack} = <NEWVALUE>' into the world.mt file
			*/
			alert("Need to implement this!");
		}
	}

	async function deleteMod(pack, version = '5.6.0'){
		if (pack || version && isInstalled){
			/* 
			* Steps:
			* 1. SKIP for now:
			*     1. check if there are any mod needing this mod
			*     2. if step1 then show modal that there are any mods needing this mod
			* 2. check if world.mt (need worlds thing first) includes 'load_mod_${pack} = true'
			* 3. if step2 then remove that line(s)
			* 4. delete the `/versions/${version}/mods/${pack}` folder
			*/
			alert("This hasn't been added yet!\n\nFor now you can go to the minetest folder (button next to 'Current Version')\nThen go into the mods folder and remove the mod from the folder");
		}
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
							<Tag class="bg-blue-500" tag="Work in Progress" />
						{/if}
						{#each packageInfo.tags as tag}
							<Tag class="bg-blue-500" tag={tag} />
						{/each}
					</div>
					<span class="text-2xl font-bold">{packageInfo.title}</span>
					<span>by {packageInfo.author}</span>
					{#if packageInfo.hard_dependencies && packageInfo.hard_dependencies.length > 0}
						<br>
						<div class="pb-4">
							<span>Required Dependencies:</span><br>
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
					{#if isSupported}
						<div class="flex flex-row">
							<Check class="bg-emerald-500 w-6 h-6 mr-2" circle=true />
							<span>
								Supports version <strong>{$selectedVersion.name}</strong>
							</span>
						</div>
					{/if}
					<div class="pt-4 flex">
						{#if $selectedVersion.installed}
							{#if !isInstalled}
							<button on:click={async () => await install($selectedVersion.name)} class="bg-emerald-500 hover:bg-emerald-400 p-4 font-bold text-white flex flex-col items-center">
								{#if installing}
									<div>Installing {$progress}/{modToInstall.length} packages</div>
									<div class="font-medium text-sm">Current package "{$currentinstalling}"</div>
								{:else}
									<div>Install Mod</div>
									<div class="font-medium text-sm">for {$selectedVersion.name}</div>
								{/if}
							</button>
							{:else}
								<button on:click={async () => await deleteMod(pack, $selectedVersion.name)} class="bg-red-500 hover:bg-red-400 p-4 font-bold text-white flex flex-col items-center">
									<div>Delete Mod</div>
									<div class="font-medium text-sm">version {$selectedVersion.name}</div>
								</button>
								<button on:click={async () => await toggleMod(pack, $selectedVersion.name)} class="bg-emerald-500 hover:bg-emerald-400 p-4 font-bold text-white flex flex-col items-center">
									<div>Toggle Mod</div>
									<div class="font-medium text-sm">version {$selectedVersion.name}</div>
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
