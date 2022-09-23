<script>
	import { selectedServer } from '$lib/stores.js';

	import { onMount } from 'svelte';

    import ServerListTable from '$lib/components/table/ServerListTable.svelte';
    import Tab from '$lib/components/tabs/Tab.svelte';
    import TabList from '$lib/components/tabs/TabList.svelte';

    import BlogList from '$lib/components/blog/BlogList.svelte';


    let status = 'downloading_zip';
    onMount(async() => {
        status = 'loaded';
	});
</script>

{#if 'loaded' === status}
	<!--<TabList>
		<Tab label="News">
			<BlogList />
		</Tab>
		<Tab label="Games">

		</Tab>
		<Tab label="Play Online">
			<ServerListTable selectedRow={selectedServer} />
		</Tab>
	</TabList>-->

{:else}
	Status: {status}
{/if}