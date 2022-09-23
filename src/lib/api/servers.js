import { fetch as tFetch } from '@tauri-apps/api/http';

let serverCache = false;
export async function getServers(force = false) {
    if (force || !serverCache) {
        let res = await tFetch(`https://servers.minetest.net/list`);
        serverCache = res.data.list.map(serv => {
            return {
                fullAddress: `${serv.address || ''}:${serv.port || 30000}`,
                ...serv
            }
        });
    }

    return serverCache;
}

export async function favouriteServer(address, port) {

}