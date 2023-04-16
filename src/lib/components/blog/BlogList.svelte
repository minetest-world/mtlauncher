<script>
	import { getPosts } from '$lib/api/blog';
    import { onMount } from 'svelte';

    import FullLoader from '$lib/components/FullLoader.svelte';

    let posts = false;
    onMount(async() => {
        posts = await getPosts();
	});
</script>

{#if posts}
	{#each posts as post}
		<a class="pt-4 pb-12 w-1/2 flex flex-col items-center hover:bg-darkest hover:cursor-pointer" href={`${post.link}?ref=mtlauncher`} target="_blank">
			{#if post.image}
				<img src={post.image} class="w-3/4" />
			{/if}
			<h1 class="font-bold text-xl mt-4">{post.title}</h1>
			<span class="text-neutral-300">on {new Date(post.date).toLocaleDateString()}</span>
		</a>
	{/each}
{:else}
	<FullLoader />
{/if}