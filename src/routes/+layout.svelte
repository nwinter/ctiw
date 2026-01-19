<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>CTIW - Clark's Alternative to HTML/CSS</title>
</svelte:head>

{@render children()}
