import {fetch as tFetch, ResponseType} from '@tauri-apps/api/http';
import {BaseDirectory, createDir, writeBinaryFile, readDir} from "@tauri-apps/api/fs";
import { type, arch } from '@tauri-apps/api/os';
import {invoke} from "@tauri-apps/api/tauri";

export async function versionExists(version = '5.6.0') {
    try {
        let entries = await readDir(`versions/${version}`, {
            dir: BaseDirectory.App,
            recursive: false
        });
        return entries.length;
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

export async function downloadFile(url, targetFile) {
    return invoke('download_file', {
        url: url,
        target: targetFile
    });
}

export async function downloadVersion(version = '5.6.0') {
    console.log('we downloadin babey!!');
    let platform = await type();
    switch (platform) {
        case 'Linux':
            await createDir(`versions/${version}`, {
                dir: BaseDirectory.App,
            });
            return downloadFile(`https://github.com/An0n3m0us/Minetest-AppImages/releases/download/${version}/Minetest-${version}-x86_64.AppImage`, `/versions/${version}/minetest.AppImage`);

        case 'Darwin':
            await createDir(`versions/${version}`, {
                dir: BaseDirectory.App,
            });
            return downloadAndUnzip(`https://github.com/minetest/minetest/releases/download/${version}/minetest-${version}-osx.zip`, `/versions/${version}/minetest.app`);

        case 'Windows_NT':
            return downloadAndUnzip(`https://github.com/minetest/minetest/releases/download/${version}/minetest-${version}-win64.zip`, `/versions/${version}`);
    }
    return false;
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