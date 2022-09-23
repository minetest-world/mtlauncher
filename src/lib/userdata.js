import { fileBackedStore } from '$lib/preferences';
import { BaseDirectory, readDir, readTextFile } from '@tauri-apps/api/fs';
import { AES, enc } from 'crypto-js';
import { get } from 'svelte/store';

export async function hasUserdata() {
    let entries = await readDir('', {
        dir: BaseDirectory.App,
        recursive: false
    });
    console.log(entries);
    return entries.filter(ent => !ent.hasOwnProperty('children') && 'user.dat' === ent.name).length;
}

let userdataCache = false;
export async function getUserdata(password) {
    if (!userdataCache) {
        userdataCache = await fileBackedStore('user.dat', {
            friends: [],
            profiles: [],
            server_identities: {}
        },
            //TODO: proper encryption lol
            (content) => JSON.parse(decrypt(content, password)),
            (content) => encrypt(JSON.stringify(content), password)
        );
    }

    return userdataCache;
}

export function setServerIdentity(server, username, password) {
    let data = get(userdataCache);
    let identities = data.server_identities;
    identities[server.fullAddress] = {
        username: username,
        password: password
    };

    data.server_identities = identities;

    userdataCache.set(data);
}

// TODO: THIS IS REALLY FUCKING STUPID
let rawUserdataCache = false;
export async function checkPassword(password) {
    if (!rawUserdataCache) {
        rawUserdataCache = await readTextFile('user.dat', {
            dir: BaseDirectory.App
        });
    }

    try {
        console.log(rawUserdataCache);
        console.log(decrypt(rawUserdataCache, password));
        console.log(decrypt(rawUserdataCache, password).startsWith('{"friends"'));
        return decrypt(rawUserdataCache, password).startsWith('{"friends"');
    }
    catch {
        return false;
    }
}

function decrypt(data, password) {
    return AES.decrypt(data, password).toString(enc.Utf8);
}

function encrypt(data, password) {
    return AES.encrypt(data, password).toString();
}