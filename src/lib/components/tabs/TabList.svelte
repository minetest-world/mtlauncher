<script>
    import { setContext } from "svelte";
    import { writable, get } from "svelte/store";

    const activeTab = writable(1);
    let tabs = [];

    const tabsContext = setContext('tabs', {
        activeTab,
        addTab
    });

    function addTab(label) {
        const index = tabs.length + 1 | 0;
        tabs = [ ...tabs, {
            label, index
        } ];

        return index;
    }
</script>

<div class="text-md text-center text-copy">
	<ul class="flex flex-wrap -mb-px text-neutral-400">
		{#each tabs as {label, index, amount}}
			<li>
				<button on:click={() => {activeTab.set(index)}} class="inline-block p-4"
					class:font-bold={$activeTab === index}
					class:border-b-2={$activeTab === index}
					class:text-white={$activeTab === index}
				>
					{label}
				</button>
			</li>
		{/each}
	</ul>
</div>

<slot />