<script>
	//TODO: rewrite this component to separate "favourite" servers from server list
	//this is so we can use it more fluidly in other components - eg: game page
	import Table from '$lib/components/table/Table.svelte';

    import { getPreferences } from '$lib/preferences.js';

    import PlayerCount from '$lib/components/table/renderer/PlayerCount.svelte';
    import Time from '$lib/components/table/renderer/Time.svelte';
    import Favourite from '$lib/components/table/renderer/Favourite.svelte';
    import HasIdentity from '$lib/components/table/renderer/HasIdentity.svelte';
    import FullLoader from '$lib/components/FullLoader.svelte';

    import { getServers } from '$lib/api/servers.js';
	import { writable } from 'svelte/store';
    import { onMount, onDestroy } from 'svelte';
    import {createRender} from "svelte-headless-table";

    let servers = writable([]);
    let favouriteServers = writable([]);
    let preferences;

    let loading = true;
    let prefSubscription = false;
    onMount(async() => {
        $servers = await getServers();
        preferences = await getPreferences();

        prefSubscription = preferences.subscribe(val => $favouriteServers = $servers.filter(i => val.favourites.servers.includes(`${i.address}:${i.port || 30000}`)));
        loading = false;
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

    export let selectedRow = writable({});
    export let showFavourites = true;

    onDestroy(() => {
        $selectedRow = {};
        if (prefSubscription !== false) {
            prefSubscription();
		}
    });
</script>
{#if loading}
	<FullLoader />
{:else}
	{#if showFavourites && $favouriteServers.length}
	<h2 class="text-xl font-bold md:px-8">Favourite Servers</h2>
	<Table selectedRow={selectedRow} data={favouriteServers} columns={[
    {
        type: 'display',
        id: 'fave',
        accessor: i => i,
        cell: ({ row }, { pluginStates }) => createRender(Favourite, {
            toggled: true,
            onFavourite: async() => favouriteServer(row.original)
        }),
        plugins: {
            sort: {
                disable: true
            }
        }
    },
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
	{/if}

	<h2 class="text-xl font-bold md:px-8">All Servers</h2>
	<Table selectedRow={selectedRow} data={servers} columns={[
    {
        type: 'display',
        id: 'fave',
        accessor: i => i,
        cell: ({ row }, { pluginStates }) => createRender(Favourite, {
            toggled: $favouriteServers.filter(serv => `${serv.address}:${serv.port || 30000}` === `${row.original.address}:${row.original.port || 30000}`).length,
            onFavourite: async() => favouriteServer(row.original)
        }),
        plugins: {
            sort: {
                disable: true
            }
        }
    },
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
{/if}
