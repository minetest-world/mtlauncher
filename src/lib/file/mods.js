import { writable, get } from 'svelte/store';
import { getDepList } from '$lib/api/contentdb';
import { downloadAndUnzip } from '$lib/api/download';
import { showText } from '$lib/modal';

export async function installMod(packageInfo, version = '5.6.0', installing = null, modsToInstall = null, progress = null, currentInstalling = null, isInstalled = null) {
	if (installing !== null && get(installing) === true) return;
	if (modsToInstall === null) modsToInstall = writable([]);
	modsToInstall.set([...(await getDepList(packageInfo, version)), packageInfo]);

	if (installing !== null) installing.set(true);
	if (progress === null) progress = writable(0);
	progress.set(0);

	let installedProgress = 0; // This one is for success checker
	for (const installPackage of get(modsToInstall)) {
		progress.update(n => n + 1);
		if (currentInstalling !== null) currentInstalling.set(installPackage.name);
		try {
			await downloadAndUnzip(installPackage.url, `/versions/${version}/mods/${installPackage.name}`);
			installedProgress += 1;
		}
		catch (err) {
			showText(err);
			console.log(err);
		}
	}

	if (installing != null) installing.set(false);
	if (isInstalled !== null) isInstalled.set(installedProgress == get(modsToInstall).length);
	return installedProgress == get(modsToInstall).length;
}

export async function toggleMod(pack, version = '5.6.0'){
	if (pack || version) {
		/* 
		* Steps:
		* 1. check if world.mt (need worlds thing first) includes 'load_mod_${pack}'
		* 2. if step1 then get the value of 'load_mod_${pack} = <VALUE>' and set NEWVALUE to !VALUE
		* 3. else set NEWVALUE to true
		* 4. write the new value as 'load_mod_${pack} = <NEWVALUE>' into the world.mt file
		*/

		/*
		* Update: <VALUE> is changed from bool to path since a newer version of the game...
		*/
		alert("Need to implement this!");
	}
}

export async function deleteMod(pack, version = '5.6.0'){
	if (pack || version) {
		/* 
		* Steps:
		* 1. SKIP for now:
		*     1. check if there are any mod needing this mod
		*     2. if step1 then show modal that there are any mods needing this mod
		* 2. check if world.mt (need worlds thing first) includes 'load_mod_${pack} = true' (Update: this is a path in newer versions of the game)
		* 3. if step2 then remove that line(s)
		* 4. delete the `/versions/${version}/mods/${pack}` folder
		*/
		alert("This hasn't been added yet!\n\nFor now you can go to the minetest folder (button next to 'Current Version')\nThen go into the mods folder and remove the mod from the folder");
	}
}

