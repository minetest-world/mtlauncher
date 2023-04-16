<script>
    import Table from '$lib/components/table/Table.svelte';
    import {writable} from "svelte/store";

    import PlayerCount from '$lib/components/table/renderer/PlayerCount.svelte';
    import Time from '$lib/components/table/renderer/Time.svelte';
    import Favourite from '$lib/components/table/renderer/Favourite.svelte';
    import HasIdentity from '$lib/components/table/renderer/HasIdentity.svelte';

    import { onMount, onDestroy } from 'svelte';
    import {createRender} from "svelte-headless-table";

    import { getPreferences } from '$lib/preferences.js';

    export let selectedRow = writable({});
    export let servers = writable([]);

    let preferences;

    onMount(async() => {
        preferences = await getPreferences();
	});

    async function favouriteServer(server) {
        let string = `${server.address}:${server.port || 30000}`;
        let pref = $preferences;
        if (pref.favourites.servers.includes(string)) {
            console.log('removing...');
            let newServers = pref.favourites.servers.filter(i => i !== string);
            pref.favourites.servers = newServers;
        }
        else {
            pref.favourites.servers.push(string);
        }

        $preferences = pref;

        // force servers table to update, lol
        let serv = $servers;
        $servers = serv;
        //$selectedRow = {};
    }

    onDestroy(() => {
        $selectedRow = {};
    });
</script>

<Table selectedRow={selectedRow} data={servers} columns={[
    {
        type: 'display',
        id: 'has_identity',
        accessor: i => i,
        cell: ({ row }, { pluginStates }) => createRender(HasIdentity, {
            serverName: row.original.fullAddress
        }),
        plugins: {
            sort: {
                disable: true
            }
        }
    },
	{
        header: 'Ping',
        id: 'ping',
        accessor: (i) => ((i.ping || 0.9999) * 1000).toFixed(0),
        plugins: {
            sort: {
                getSortValue: (i) => Number(i)
            }
        }
	},
	{
        header: 'Players',
        id: 'player_count',
        accessor: (i) => i,
        cell: ({ value }) => createRender(PlayerCount, {
            clients: value?.clients,
            maxClients: value?.clients_max
        }),
        plugins: {
            sort: {
                getSortValue: (i) => i.clients
            },
            tableFilter: {
                getFilterValue: (i) => i.clients
            }
        }
	},
    {
        header: 'Name',
        accessor: 'name'
	},
	{
        header: 'Uptime',
        id: 'uptime',
        accessor: (i) => i,
        cell: ({ value }) => createRender(Time, {
            seconds: value.uptime
        }),
        plugins: {
            sort: {
                getSortValue: (i) => i.uptime
            },
            tableFilter: {
                getFilterValue: (i) => i.uptime
            }
        }
	}
]} />