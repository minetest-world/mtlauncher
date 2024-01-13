import { BaseDirectory, readDir, createDir } from "@tauri-apps/api/fs";
import {fetch as tFetch, ResponseType} from '@tauri-apps/api/http';
import { appDir, join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/api/shell";
import { type } from '@tauri-apps/api/os';

import { writable, get } from 'svelte/store';

let versionCache = writable([]);
export async function getVersions(forceReload = false) {
    let platform = await type();
    if (forceReload || !get(versionCache).length) {
        let branches = await tFetch('https://content.minetest.net/api/minetest_versions/');
        // fix the weird split in branch names that are otherwise identical
        let weirdVersion = branches.data.filter(i => i.name === '0.4.16/17');
        if (weirdVersion.length) {
            // remove
            branches.data = branches.data.filter(i => i.name !== '0.4.16/17');
            branches.data.push({
                is_dev: false,
                name: '0.4.16',
                protocol_version: 32
            });
            branches.data.push({
                is_dev: false,
                name: '0.4.17',
                protocol_version: 32
            });
        }

        let versions;
        const fetchOptions = { headers: { "User-Agent": "MTLauncher" } };
        switch (platform) {
            case 'Linux':
                versions = await tFetch(`https://api.github.com/repos/An0n3m0us/Minetest-AppImages/releases`, fetchOptions);
                break;

            case 'Darwin':
            case 'Windows_NT':
                versions = await tFetch('https://api.github.com/repos/minetest/minetest/releases', fetchOptions);
                break;
        }

        versions = versions.data;
        versions = versions.filter(i => i.tag_name !== '5.4.2-android');

        if ('Darwin' === platform) {
            versions = versions.filter(i => i.assets.filter(j => j.name.includes('-osx')).length);
        }

        let installedVersions = await getInstalledVersions();

        versions = versions.map(ver => {
            let res = {};

            res.name = ver.tag_name;
            res.installed = installedVersions.includes(ver.tag_name);

            // get the major version for relevant release
            let majorName = ver.tag_name.split('.');
            if ('0' === majorName[0]) majorName = `0.${majorName[1]}.${majorName[2]}`;
            else majorName = `${majorName[0]}.${majorName[1]}`;

            let protocolVersion = -1;
            let isDev = false;
            let relevantBranches = branches.data.filter(i => majorName === i.name);
            if (relevantBranches.length) {
                protocolVersion = relevantBranches[0].protocol_version;
                isDev = relevantBranches[0].is_dev;
            }

            res.branch = {
                name: majorName,
                protocolVersion: protocolVersion,
                isDev: isDev
            };

            return res;
        })
        versionCache.set(versions);
    }

    return get(versionCache);
}


export async function getInstalledVersions() {
    try {
        let entries = await readDir(`versions`, {
            dir: BaseDirectory.App,
            recursive: false
        });
        return entries
            .filter(ent => ent.children) //only get directories
            .map(ent => ent.name);
    }
    catch {
        await createDir('versions', {
            dir: BaseDirectory.App,
            recursive: false
        });
        return [];
    }
}

export async function openVersionFolder(version = '5.6.0') {
    const basePath = await appDir();
    const path = await join(basePath, 'versions', version);
    await open(
        path
    );
}