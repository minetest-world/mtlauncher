<script>
	import { selectedServer } from '$lib/stores';

    import ServerListTable from '$lib/components/table/ServerListTable.svelte';
</script>

<div class="pt-8">
	<ServerListTable selectedRow={selectedServer} />
</div>
