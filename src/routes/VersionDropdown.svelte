<script>
	import { getVersions } from '$lib/api/versions';
    import { selectedVersion } from '$lib/stores';
	import { onMount } from 'svelte';

    import Dropdown from '$lib/components/element/Dropdown.svelte';
    import Option from '$lib/components/element/dropdown/Option.svelte';

    import Chevron from '$lib/icon/Chevron.svelte';

	let versions = [];
    onMount(async() => {
        versions = await getVersions();
	});
</script>

<div class="bg-slate-600">
	<Dropdown align="right" let:toggled>
		<div slot="button" class="hover:cursor-pointer w-full flex justify-between px-4 items-center py-2">
			{$selectedVersion.name}
			<div class="w-2">
				<Chevron direction={toggled ? 'up' : 'down'} />
			</div>
		</div>
		<div slot="options" class="bottom-0 max-h-64 overflow-y-scroll">
			{#each versions as version}
				<Option on:click={() => {
                                $selectedVersion = version;
                                toggled = false;
                            }}>
					{version.name}
					{#if version.installed}
						(installed)
					{/if}
				</Option>
			{/each}
		</div>
	</Dropdown>
</div>