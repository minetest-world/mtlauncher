<script>
	import Spinner from '$lib/icon/Spinner.svelte';
	import { _ } from 'svelte-i18n';
</script>

<div class="w-full h-full flex items-center justify-center">
	<div class="flex flex-col items-center">
		<div class="h-16 w-16">
			<Spinner />
		</div>
		<div class="text-2xl font-bold">
			{$_('general.loading')}
		</div>
	</div>
</div>