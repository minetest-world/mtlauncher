<script>

	import { onMount, onDestroy } from 'svelte';

	import { getUserdata } from '$lib/userdata';
	export let serverName;

    import Key from '$lib/icon/Key.svelte';

    let hasIdentity = false;
    let userdata;
    let unsubscribe;
    onMount(async() => {
        userdata = await getUserdata('');

        unsubscribe = userdata.subscribe(val => {
            hasIdentity = Object.keys(val.server_identities).includes(serverName);
		});
	});

    onDestroy(() => unsubscribe());
</script>

{#if hasIdentity}
	<Key />
{/if}