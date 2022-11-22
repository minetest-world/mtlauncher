<script>
	import { getPosts } from '$lib/api/blog';
	import { onMount } from 'svelte';

	import FullLoader from '$lib/components/FullLoader.svelte';
	import Link from '$lib/components/text/Link.svelte';

	let posts = false;
	onMount(async() => {
		posts = await getPosts();
	});
</script>

{#if posts}
	{#each posts as post}
		<div class="pt-4 pb-12">
			<Link href={post.link}>
				{#if post.image}
					<img src={post.image} alt="Image for {post.title}" class="w-1/2" />
				{/if}
				<h1 class="font-bold text-xl mt-4">{post.title}</h1>
				<span class="text-neutral-300">on {new Date(post.date).toLocaleDateString()}</span>
			</Link>
		</div>
	{/each}
{:else}
	<FullLoader />
{/if}