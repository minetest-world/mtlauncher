<script>
	import { convertFileSrc } from '@tauri-apps/api/tauri';
	
	export let src, alt;
</script>
	
<img src={convertFileSrc(src)} alt={alt} />