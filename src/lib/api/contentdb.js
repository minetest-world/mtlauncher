import {fetch as tFetch, ResponseType} from '@tauri-apps/api/http';
import {BaseDirectory, readDir} from "@tauri-apps/api/fs";
import { writable, get } from 'svelte/store';

let contentCache = writable([]);
export async function getContent() {
    if (!get(contentCache).length) {
        // we can grab e v e r y t h i n g because filtering on page is easy and makes the most sense
        let res = await tFetch(`https://content.minetest.net/api/packages/?type=mod&type=game&type=txp&hide=nonfree&hide=desktop_default`);

        contentCache.set(res.data.map(i => {
            i.slug = `${i.author.trim()}@${i.name.trim()}`;
            // LIFE HACK to get a higher resolution thumbnail
            if (i.thumbnail) {
                i.thumbnail = i.thumbnail.replace('/thumbnails/1/', '/thumbnails/2/');
            }
            return i;
        }));
    }

    return contentCache;
}

let packageCache = writable({});
export async function getPackageInfo(author, pack) {
    let cache = get(packageCache);
    let keys = Object.keys(cache);
    if (!keys.length || !keys.includes(`${author}@${pack}`)) {
        let [ baseResponse, dependencyResponse ]  = await Promise.all([
            tFetch(`https://content.minetest.net/api/packages/${author}/${pack}/`),
            tFetch(`https://content.minetest.net/api/packages/${author}/${pack}/dependencies/?only_hard=1`),
        ]);
        let deps = Object.values(dependencyResponse.data)[0];
        let data = baseResponse.data;
        data.hard_dependencies = deps;

        cache[`${author}@${pack}`] = data;
        packageCache.set(cache);

        return data;
    }
    return cache[`${author}@${pack}`]
}

export async function isInstalledForVersion(pack, type, version = '5.6.0') {
    let content = await getInstalledContent(type, version)
    return content.filter(i => i === pack).length;
}

export async function getInstalledContent(type, version = '5.6.0') {
    let entries = await readDir(`versions/${version}/${type}`, {
        dir: BaseDirectory.App,
        recursive: false
    });
    return entries.map(ent => ent.name);
}