<script>
	import { onMount } from 'svelte';

    import { getConfig, CONFIG_NODES } from '$lib/file/config';

    import TextBox from '$lib/components/element/form/TextBox.svelte';
    import Button from '$lib/components/element/form/Button.svelte';

    let config;
    let changes = false;
    onMount(async() => {
        config = await getConfig();

        // "clone" the config object, so we can press "save" to update!
        // changes = $config;
	});

    async function save() {

	}
</script>

{#if config}
	<Button on:click={async () => await save()}>
		Save!
	</Button>
	{#each Object.keys(CONFIG_NODES) as key}
		<div class="flex flex-col">
			<span>{key}</span>
			<span>{CONFIG_NODES[key].description}</span>
			<!--<TextBox bind:value={changes[key]} placeholder="0.1" />-->
		</div>
	{/each}
{:else}
	Loading...
{/if}