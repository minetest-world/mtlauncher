import {fetch as tFetch, ResponseType} from '@tauri-apps/api/http';
import {BaseDirectory, readDir} from "@tauri-apps/api/fs";
import { writable, get } from 'svelte/store';

let contentCache = writable([]);
export async function getContent(forceReload = false) {
    if (forceReload || !get(contentCache).length) {
        // we can grab e v e r y t h i n g because filtering on page is easy and makes the most sense
        const query = '?type=mod&type=game&type=txp&hide=nonfree&hide=desktop_default';
        let [res,scoresResponse] = await Promise.all([
            tFetch(`https://content.minetest.net/api/packages/${query}`),
            tFetch(`https://content.minetest.net/api/scores/${query}`),
        ]);
        let scoredata = [];
        let scores = scoresResponse.data;
        for (let i in scores){
            let score = scores[i];
            scoredata[`${score.author.trim()}@${score.name.trim()}`] = score;
        }

        contentCache.set(res.data.map(i => {
            i.slug = `${i.author.trim()}@${i.name.trim()}`;
            // LIFE HACK to get a higher resolution thumbnail
            if (i.thumbnail) {
                i.thumbnail = i.thumbnail.replace('/thumbnails/1/', '/thumbnails/2/');
            }
            i.scoredata = scoredata[i.slug] || {"downloads":0,"score":0,"score_downloads":0,"score_reviews":0};
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
        let [ baseResponse, dependencyResponse, releasesResponse, scoresResponse ]  = await Promise.all([
            tFetch(`https://content.minetest.net/api/packages/${author}/${pack}/`),
            tFetch(`https://content.minetest.net/api/packages/${author}/${pack}/dependencies/?only_hard=1`),
            tFetch(`https://content.minetest.net/api/packages/${author}/${pack}/releases/`),
            tFetch(`https://content.minetest.net/api/scores/?type=mod&q=${pack}&hide=nonfree`),
        ]);
        let depresponse = dependencyResponse.data;
        let deps = depresponse[`${author}/${pack}`];
        for (let i in deps){
            let dep = deps[i].name;
            for (let packagename in depresponse){
                if(packagename.endsWith('/'+dep)){
                    deps[i].slug = packagename.replace('/', '@');
                    break;
                }
            }
        }
        let data = baseResponse.data;
        data.hard_dependencies = deps;
        data.releasesdata = releasesResponse.data;

        let scores = scoresResponse.data;
        for (let i in scores){
            if (scores[i].author == author && scores[i].name == pack){
                data.scoredata = scores[i];
                break;
            }
        }

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

export async function getDeplist(packageInfo, version = '5.6.0', all=false) {
    let packagelist = [];
    if (packageInfo.hard_dependencies && packageInfo.hard_dependencies.length > 0){
        for (let i in packageInfo.hard_dependencies) {
            let dep = packageInfo.hard_dependencies[i];
            if (dep.slug) {
                let [author, pack] = dep.slug.split('@');
                if (!await isInstalledForVersion(pack, 'mods', version) || all){
                    let packagedep = await getPackageInfo(author, pack);
                    packagelist.concat(await getDeplist(packagedep, version));
                    packagelist.push(packagedep);
                }
            }
        }
    }
    return packagelist;
}
