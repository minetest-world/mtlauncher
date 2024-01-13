<script>
	import '../app.css';

	import { getPreferences } from '$lib/preferences.js';

	import { selectedServer, selectedVersion } from '$lib/stores.js';

	import { openServer } from '$lib/shell.js';

	import { onMount } from 'svelte';
	import { hasUserdata, checkPassword, getUserdata, setServerIdentity } from '$lib/userdata';
	import { showText } from '$lib/modal';
	import { writable } from 'svelte/store';
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n';

	import ProfileSelector from '$lib/components/ProfileSelector.svelte';
	import FullLoader from '$lib/components/FullLoader.svelte';
	import TextBox from '$lib/components/element/form/TextBox.svelte';
	import Button from '$lib/components/element/form/Button.svelte';
	import Navbar from '$lib/components/nav/Navbar.svelte';
	import NavbarItem from '$lib/components/nav/NavbarItem.svelte';
	import ModalContainer from '$lib/components/modal/ModalContainer.svelte';
	import Cog from '$lib/icon/Cog.svelte';
	import Folder from '$lib/icon/Folder.svelte';
	import VersionDropdown from './VersionDropdown.svelte';

	import { getVersions, getInstalledVersions, openVersionFolder } from '$lib/api/versions';
	import { downloadVersion, unzipVersion } from '$lib/api/download';

	let versions = [];
	let loading = true;
	let installing = false;
	let preferences;

	let firstStart = false;
	let passwordAdded = false;

	let tempPass, tempConfirmPass;

	let username = writable('');
	let password = writable('');
	let saveIdentity = writable(false);

	onMount(async() => {
		preferences = await getPreferences();
		versions = await getVersions();
		$selectedVersion = versions[0];

		selectedServer.subscribe(server => {
			if (server.hasOwnProperty('proto_max')) {
				let recommendedVersion = versions.filter(i => i.branch.protocolVersion === server.proto_max && !i.branch.isDev);
				if (recommendedVersion.length) {
					console.log(recommendedVersion);
					$selectedVersion = recommendedVersion[0];
				}
			}
		});

		firstStart = !(await hasUserdata());

		loading = false;
	})

	async function install(version) {
		installing = true;
		await downloadVersion(version.name)
			.then(async () => {
				versions = await getVersions(true)
				let selVer = $selectedVersion;
				selVer.installed = true;
				$selectedVersion = selVer;
			}) // force list to update
			.catch(err => console.log(err));
		installing = false;
			//.finally(installing = false);
	}

	async function initFirstTime() {
		if (tempPass !== tempConfirmPass) {
			showText($_('lockscreen.passwords_no_match.title'), $_('lockscreen.passwords_no_match.content'));
			return;
		}

		loading = true;
		// load userdata for the first time, which will init and encrypt a blank file
		await getUserdata(tempPass);

		// not needed anymore, userdata is in memory (unencrypted)
		tempPass = null;
		tempConfirmPass = null;

		loading = false;

		passwordAdded = true;
	}

	async function login() {
		if (await checkPassword(tempPass)) {
			loading = true;
			await getUserdata(tempPass);

			tempPass = null;
			loading = false;
			passwordAdded = true;
		}
		else {
			showText($_('lockscreen.password_invalid.title'), $_('lockscreen.password_invalid.content'));
			tempPass = '';
		}
	}

	async function checkKeyInput(event){
		if (event.keyCode == 13 && tempPass) login();
	}

	async function doOpenServer(server, username, password, saveIdentity, version) {
		console.log(version);
		if (saveIdentity) {
			console.log('Saving identity...');
			await setServerIdentity(server, username, password);
		}

		await openServer(server, username, password, version.name);
	}

	async function checkJoinServer(event){
		if (event.keyCode == 13) doOpenServer($selectedServer, $username, $password, $saveIdentity, $selectedVersion);
	}
</script>
{#if loading}
	<FullLoader />
{:else}
	{#if passwordAdded}
		<Navbar>
			<svelte:fragment slot="left">
				<NavbarItem href="/news" label={$_('navbar.news')} />
				<NavbarItem href="/games" label={$_('navbar.games')} />
				<NavbarItem href="/mods" label={$_('navbar.mods')} />
				<NavbarItem href="/servers" label={$_('navbar.play_online')} />
				<NavbarItem href="/screenshots" label={$_('navbar.screenshots')} />
			</svelte:fragment>
			<svelte:fragment slot="right">
				<NavbarItem href="/settings">
					<Cog />
				</NavbarItem>
			</svelte:fragment>
		</Navbar>
		<div class="w-full h-full">
			<div class="pt-12 pb-24">
				<slot />
			</div>
		</div>
		<div class="fixed w-full z-20 bottom-0 h-24 bg-darkest">
			<div class="w-full grid grid-cols-3 gap-4 px-8 py-4">
				<div class="flex flex-col">
					<div class="text-lg font-bold text-white pb-1">
						<span class="mr-2">{$_('general.current_version')}</span>
						{#if $selectedVersion.installed}
							<button class="hover:text-dark-green hover:cursor-pointer" on:click={() => openVersionFolder($selectedVersion.name)}>
								<Folder />
							</button>

						{/if}
					</div>
					<VersionDropdown />
				</div>
				<div class="flex justify-center">
					{#if $selectedVersion.hasOwnProperty('installed') && !$selectedVersion.installed}
						<button on:click={async () => await install($selectedVersion)} class="bg-emerald-500 hover:bg-emerald-400 p-4 font-bold text-white flex flex-col items-center">
							{#if installing}
								<div>{$_('general.installing.title')}</div>
								<div class="font-medium text-sm">{$_('general.installing.subtitle')}</div>
							{:else}
								<div>{$_('general.install.title')}</div>
								<div class="font-medium text-sm">{$_('general.version', { values: { version: $selectedVersion.name } })}</div>
							{/if}
						</button>
					{:else if $selectedServer.hasOwnProperty('address')}
						<button on:click={() => doOpenServer($selectedServer, $username, $password, $saveIdentity, $selectedVersion)} class="bg-emerald-500 hover:bg-emerald-400 p-4 font-bold text-white flex flex-col items-center">
							<div>{$_('general.play')}</div>
							<div class="font-medium text-sm">{$selectedServer.address}:{$selectedServer.port || 30000}</div>
						</button>
					{/if}
				</div>
				<div class="flex flex-col">
					{#if $selectedServer.hasOwnProperty('address')}
						<ProfileSelector username={username} password={password} saveIdentity={saveIdentity} on:keypress={checkJoinServer} />
					{/if}
				</div>
			</div>
		</div>
	{:else if firstStart}
		<div class="w-full h-full flex items-center justify-center flex-col text-center">
			<span class="text-2xl font-bold">{$_('lockscreen.first_time.title')}</span>
			<span class="w-96 py-4">
					{@html $_('lockscreen.first_time.welcome')}
			</span>
			<div class="w-64">
				<div class="pb-4">
					<TextBox bind:value={tempPass} isPassword placeholder={$_('lockscreen.password')} />
				</div>
				<div class="pb-4">
					<TextBox bind:value={tempConfirmPass} isPassword placeholder={$_('lockscreen.confirm_password')} />
				</div>
				<div class="flex w-full justify-end">
					{#if (tempConfirmPass && tempPass) && tempConfirmPass === tempPass}
						<Button on:click={() => initFirstTime()} class="bg-emerald-500 hover:bg-emerald-400 py-2 rounded-md">
							{$_('lockscreen.set')}
						</Button>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="w-full h-full flex items-center justify-center flex-col text-center">
			<span class="text-2xl font-bold">{$_('lockscreen.login')}</span>
			<span class="w-96 py-4">
				{$_('lockscreen.welcome')}
			</span>
			<div class="w-64">
				<div class="pb-4">
					<TextBox bind:value={tempPass} isPassword placeholder={$_('lockscreen.password')} on:keypress={checkKeyInput} autofocus  />
				</div>
				<div class="flex w-full justify-end">
					{#if tempPass}
						<Button on:click={() => login()} class="bg-emerald-500 hover:bg-emerald-400 py-2 rounded-md">
							{$_('lockscreen.login')}
						</Button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
{/if}
<ModalContainer />
