import {fetch as tFetch, ResponseType} from '@tauri-apps/api/http';
import {BaseDirectory, readDir} from "@tauri-apps/api/fs";
import { writable, get, derived } from 'svelte/store';

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
            i.score_data = scoredata[i.slug] || {"downloads":0,"score":0,"score_downloads":0,"score_reviews":0};
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
        let [ { data: packageData }, { data: dependencyData }, { data: releasesData }, { data: scoreData } ]  = await Promise.all([
            tFetch(`https://content.minetest.net/api/packages/${author}/${pack}/`),
            tFetch(`https://content.minetest.net/api/packages/${author}/${pack}/dependencies/?only_hard=1`),
            tFetch(`https://content.minetest.net/api/packages/${author}/${pack}/releases/`),
            tFetch(`https://content.minetest.net/api/scores/?type=mod&type=game&type=txp&q=${pack}`),
        ]);
        let deps = dependencyData[`${author}/${pack}`];
        for (const dep of deps){
            for (let packagename in dependencyData){
                if(packagename.endsWith('/'+dep.name)){
                    dep.slug = packagename.replace('/', '@');
                    break;
                }
            }
        }
        let data = { ...packageData, hard_dependencies: deps, releases_data: releasesData, score_data: {"downloads":0,"score":0,"score_downloads":0,"score_reviews":0} };

        for (const score of scoreData){
            if (score.author == author && score.name == pack){
                data.score_data = score;
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

export async function getDepList(packageInfo, version = '5.6.0', all=false) {
    let packageList = [];
    if (packageInfo.hard_dependencies && packageInfo.hard_dependencies.length > 0){
        for (const dep of packageInfo.hard_dependencies) {
            if (dep.slug) {
                let [author, pack] = dep.slug.split('@');
                if (!await isInstalledForVersion(pack, 'mods', version) || all){
                    let packageDep = await getPackageInfo(author, pack);
                    packageList.concat(await getDepList(packageDep, version));
                    packageList.push(packageDep);
                }
            }
        }
    }
    return packageList;
}

export async function filterAllContent(type = 'game') {
    // Get content, filter by type (without editing the content writable) and sort by score
    let allcontent = await getContent();
    return derived(allcontent, $content => $content.filter(i => i.type === type).sort((packageA, packageB) => packageB.score_data.score - packageA.score_data.score));
}