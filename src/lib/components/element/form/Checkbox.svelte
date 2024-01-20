<script>
	export let checked = false;
    export let label;

    let slug;
    $: {
        slug = label.toLowerCase().replaceAll(' ', '-');
	}
</script>

<div class="flex items-center">
	<input bind:checked id={slug} type="checkbox" class="w-4 h-4 text-emerald-500 bg-slate-600 rounded border-slate-400" />
	<label for={slug} class="ml-2 text-sm text-white">{label}</label>
</div>