import {BaseDirectory, readTextFile} from '@tauri-apps/api/fs';
import { appDir } from "@tauri-apps/api/path";
import { watch } from 'tauri-plugin-fs-watch-api';
import { showText } from '$lib/modal';

let dir = false;
export async function getLastDebugLines(version, lines = 2) {
    if (!dir) {
        dir = await appDir();
    }

    return await readTextFile(`${dir}/versions/${version}/debug.txt`, {
        dir: BaseDirectory.App
    }).then(res => res.split(/\r?\n/).slice(lines * -1));
}

let stopWatch = null;
export async function watchDebugLog(version) {
    if (!dir) {
        dir = await appDir();
    }

    stopWatch = await watch(
        `${dir}/versions/${version}/debug.txt`,
        { recursive: false, delayMs: 1 },
        (event) => {
            if ('Write' === event.type) {
                console.log('Write event');
                getLastDebugLines(version).then(lines => {
                    for (const line of lines) {
                        if (line.includes('ERROR[Main]:')) {
                            showText('An error occurred', line.split('ERROR[Main]:')[1].trim());
                            break;
                        }
                    }
                });
            }
        }
    ).catch(console.log);
}

export async function stopWatching() {
    if (stopWatch) {
        await stopWatch();
        stopWatch = null;
    }
}