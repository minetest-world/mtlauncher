import { Command, open } from "@tauri-apps/api/shell";
import { appDir } from "@tauri-apps/api/path";
import { invoke } from '@tauri-apps/api/tauri';

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

    await invoke('open_minetest', {
        loc: `${dir}/versions/${version}/bin/minetest${'win64' === arch ? '.exe' : ''}`,
        args: args
    });
}

// TODO: this doesn't work on Windows (--gameid list does not return properly) - just more proof we're on the bleeding edge!
export async function openGame(game = 'minetest_game', version = '5.6.0') {
    let dir = await appDir();
    let arch = 'win64';

    let args = [
        '--gameid',
        game
    ];

    await invoke('open_minetest', {
        loc: `${dir}/versions/${version}/bin/minetest${'win64' === arch ? '.exe' : ''}`,
        args: args
    });
}

export async function openWorld(worldName, version = '5.6.0') {
    let dir = await appDir();
    let arch = 'win64';

    let args = [
        '--worldname',
        worldName,
        '--go'
    ];

    await invoke('open_minetest', {
        loc: `${dir}/versions/${version}/bin/minetest${'win64' === arch ? '.exe' : ''}`,
        args: args
    });
}