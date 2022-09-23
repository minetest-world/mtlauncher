import {fetch as tFetch, ResponseType} from '@tauri-apps/api/http';
import {BaseDirectory, createDir, writeBinaryFile, readDir} from "@tauri-apps/api/fs";
import { loadAsync } from 'jszip';
import {invoke} from "@tauri-apps/api/tauri";

export async function versionExists(version = '5.6.0') {
    try {
        let entries = await readDir(`versions/${version}`, {
            dir: BaseDirectory.App,
            recursive: false
        });
        return entries.filter(ent => 'minetest.conf.example' === ent.name).length;
    }
    catch {
        return false;
    }
}

export async function downloadAndUnzip(url, targetDir) {
    return invoke('download_and_unzip', {
        url: url,
        target: targetDir
    });
}

export async function downloadVersion(version = '5.6.0') {
    console.log('we downloadin babey!!');
    let arch = 'win64'; // or 'osx'
    return downloadAndUnzip(`https://github.com/minetest/minetest/releases/download/${version}/minetest-${version}-${arch}.zip`, `/versions/${version}`);
}

export async function unzipVersion(zipFile, version = '5.6.0') {
    let arch = 'win64';
    let files = Object.values(zipFile.files);//.filter(i => !i.dir);
    //console.log(files);
    //files = Object.keys(files);
    for (const file of files) {
        if (file.dir) {
            await createDir(`versions/${file.name.replace(`minetest-${version}-${arch}`, version)}`, {
                dir: BaseDirectory.App,
                recursive: true
            }).then(() => console.log(`created directory for ${file.name}`));
        }
        else {
            await zipFile.file(file.name).async('uint8array').then(data => {
                return writeBinaryFile({
                    path: `versions/${file.name.replace(`minetest-${version}-${arch}`, version)}`,
                    contents: data
                }, {
                    dir: BaseDirectory.App
                })
            }).then(`Saved ${file.name}`).catch(err => console.log(err));
        }
    }
}