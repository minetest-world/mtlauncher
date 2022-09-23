import { Command, open } from "@tauri-apps/api/shell";
import { type, arch } from '@tauri-apps/api/os';
import { appDir } from "@tauri-apps/api/path";
import { invoke } from '@tauri-apps/api/tauri';

export async function getBinaryLocation(version) {
    let [ platform, osArch, baseDir ] = await Promise.all([
        type(),
        arch(),
        appDir()
    ]);

    switch (platform) {
        case 'Linux':
            return `${baseDir}/versions/${version}/minetest.AppImage`;

        case 'Darwin':
            return `${baseDir}/versions/${version}/minetest.app`;

        case 'Windows_NT':
            return `${baseDir}/versions/${version}/bin/minetest.exe`;
    }

    return `${baseDir}/versions/${version}/minetest`;
}

export async function openServer(server, username, password, version = '5.6.0') {
    let dir = await appDir();
    let arch = 'win64';

    let args = [
        '--address',
        server.address,
        '--port',
        String(server.port),
        '--name',
        username,
        '--password',
        password,
        '--go'
    ];

    await openMinetest(version, args);
}

// TODO: this doesn't work on Windows (--gameid list does not return properly) - just more proof we're on the bleeding edge!
export async function openGame(game = 'minetest_game', version = '5.6.0') {
    let dir = await appDir();
    let arch = 'win64';

    let args = [
        '--gameid',
        game
    ];

    await openMinetest(version, args);
}

export async function openWorld(worldName, version = '5.6.0') {
    let dir = await appDir();
    let arch = 'win64';

    let args = [
        '--worldname',
        worldName,
        '--go'
    ];

    await openMinetest(version, args);
}

async function openMinetest(version, args) {
    let dir = await getBinaryLocation(version);

    await invoke('open_minetest', {
        loc: dir,
        args: args
    });
}