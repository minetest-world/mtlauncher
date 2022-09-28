<script>
	import { onMount } from 'svelte';

    import { getConfig, writeConfigFile, CONFIG_NODES } from '$lib/file/config';

    import TextBox from '$lib/components/element/form/TextBox.svelte';
    import Checkbox from '$lib/components/element/form/Checkbox.svelte';
    import Button from '$lib/components/element/form/Button.svelte';
    import Range from '$lib/components/element/form/Range.svelte';
    import Number from '$lib/components/element/form/Number.svelte';

    let config;
    let changes = false;
    let generated = false;
    onMount(async() => {
        config = await getConfig();

        // "clone" the config object, so we can press "save" to update!
        changes = $config;
        console.log(changes);
	});

    async function save() {
        console.log(changes);
		$config = changes;

        generated = writeConfigFile($config);
	}
</script>
<div class="px-16 pt-8 pb-8">
	{#if generated}
		<pre class="bg-gray-700 mb-8">{generated}</pre>
	{/if}
	<h1 class="text-4xl font-bold py-4">Minetest Settings</h1>
	<span class="pb-4">
		These settings get applied to <em>all</em> versions of Minetest.
	</span>
	{#if config}
		{#each Object.keys(CONFIG_NODES) as section}
			<h2 class="text-3xl font-bold pt-4 pb-0">{section}</h2>
			{#each Object.keys(CONFIG_NODES[section]) as key}
			<div class="flex flex-row justify-between py-4">
				<div class="flex flex-col">
					<span class="font-bold">{key}
						{#if changes.hasOwnProperty(key)}
						= {changes[key]}
						{/if}
					</span>
					<span>{CONFIG_NODES[section][key].description}</span>
				</div>
				<div>
					{#if ['float', 'int'].includes(CONFIG_NODES[section][key].type) && CONFIG_NODES[section][key].hasOwnProperty('range')}
						<Range bind:value={changes[key]} min={CONFIG_NODES[section][key].min} max={CONFIG_NODES[section][key].max} step={CONFIG_NODES[section][key].step} />
					{:else if 'int' === CONFIG_NODES[section][key].type}
						<Number bind:value={changes[key]} placeholder="100" min={CONFIG_NODES[section][key].min} max={CONFIG_NODES[section][key].max} />
					{:else if 'bool' === CONFIG_NODES[section][key].type}
						<Checkbox bind:checked={changes[key]} label="" />
					{:else}
						<TextBox bind:value={changes[key]} placeholder="0.1" />
					{/if}

				</div>
			</div>
			{/each}
		{/each}
		<Button on:click={async () => await save()} class="bg-emerald-500 hover:bg-emerald-400 p-4 font-bold text-white flex flex-col items-center">
			Save!
		</Button>
	{:else}
		Loading...
	{/if}
</div>
