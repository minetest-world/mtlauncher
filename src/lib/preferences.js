import { writable } from 'svelte/store';
import { readTextFile, writeTextFile, BaseDirectory, createDir, readDir } from "@tauri-apps/api/fs";

export async function fileBackedStore(fileName,
                                      defaultValue = {},
                                      readFunc = (content) => JSON.parse(content),
                                      writeFunc = (content) => JSON.stringify(content)
                                      ) {
    try {
        await readDir('', { dir: BaseDirectory.App });
    }
    catch {
        console.log('App directory not found, creating...')

        await createDir('', {
            dir: BaseDirectory.App,
            recursive: true
        });
    }
    let shouldCreateFile = false;
    let startContent = await readTextFile(fileName, {
        dir: BaseDirectory.App
    }).then(res => readFunc(res)).catch(err => {
        console.log(err);
        shouldCreateFile = true;
    }) || defaultValue;

    if (shouldCreateFile) {
        console.log(`Writing ${fileName} for the first time...`)
        await writeTextFile(fileName, writeFunc(defaultValue), {
            dir: BaseDirectory.App
        });
    }

    const { subscribe, set, update } = writable(startContent);

    let firstRun = true;
    subscribe(async value => {
        if (firstRun) {
            console.log(`Discarding write for ${fileName} because it's the first run`);
            firstRun = false;
            return;
        }
        console.log(`Writing ${fileName}...`);
        await writeTextFile(fileName, writeFunc(value), {
            dir: BaseDirectory.App
        });
        console.log(`Written!`);
    });

    return { subscribe, set, update };
}

let preferencesCache = false;
export async function getPreferences() {
    if (!preferencesCache) {
        preferencesCache = await fileBackedStore('preferences.json', {
            default_version: "5.6.0",
            favourites: {
                servers: [],
                mods: [],
                games: []
            }
        });
    }
    return preferencesCache;
}