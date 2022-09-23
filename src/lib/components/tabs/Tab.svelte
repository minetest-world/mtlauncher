<script>
    import { getContext } from "svelte";
    import {writable} from "svelte/store";

    export let label;

    const { activeTab, addTab } = getContext('tabs');
    const index = addTab(label);
</script>

{#if $activeTab === index}
	<div class="px-16 xl:px-32 bg-slate-800 pt-8">
		<slot />
	</div>
{/if}