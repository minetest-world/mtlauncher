<script>
	import { page } from '$app/stores';
    import { goto } from '$app/navigation';

	export let href;
    export let label;

    let isActive = false;
    $: isActive = '/' === href ? $page.url.pathname === href : $page.url.pathname.startsWith(href);
</script>

<li>
	<button on:click={goto(href)} class="inline-block p-4" class:hover:text-white={!isActive} class:font-bold={isActive} class:border-b-2={isActive} class:border-green={isActive} class:text-green={isActive}>
		<slot>{label}</slot>
	</button>
</li>
