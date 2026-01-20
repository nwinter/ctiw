<script lang="ts">
	interface Props {
		html?: string;
	}

	const defaultHtml = `<!DOCTYPE html>
<html>
<head><title>Preview</title></head>
<body style="font-family: sans-serif; padding: 20px;">
  <p style="color: #888;">Write some CTIW code to see it here!</p>
</body>
</html>`;

	let { html = defaultHtml }: Props = $props();

	let key = $state(0);
	let deviceSize = $state<'phone' | 'tablet' | 'desktop'>('desktop');

	function refresh() {
		key++;
	}

	const deviceWidths = {
		phone: '375px',
		tablet: '768px',
		desktop: '100%'
	};
</script>

<div class="flex flex-col h-full">
	<!-- Toolbar -->
	<div class="flex items-center justify-between bg-gray-100 border-b border-gray-200 px-4 py-2 rounded-t-xl">
		<span class="text-sm font-medium text-gray-700">Preview</span>
		<div class="flex items-center gap-2">
			<!-- Device size toggles -->
			<div class="flex items-center gap-1 mr-2">
				<button
					onclick={() => (deviceSize = 'phone')}
					class="p-1.5 rounded transition-colors {deviceSize === 'phone'
						? 'bg-purple-100 text-purple-600'
						: 'text-gray-500 hover:bg-gray-200'}"
					title="Phone view"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<rect x="7" y="2" width="10" height="20" rx="2" stroke-width="2" />
						<line x1="12" y1="18" x2="12" y2="18" stroke-width="3" stroke-linecap="round" />
					</svg>
				</button>
				<button
					onclick={() => (deviceSize = 'tablet')}
					class="p-1.5 rounded transition-colors {deviceSize === 'tablet'
						? 'bg-purple-100 text-purple-600'
						: 'text-gray-500 hover:bg-gray-200'}"
					title="Tablet view"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<rect x="4" y="3" width="16" height="18" rx="2" stroke-width="2" />
						<line x1="12" y1="17" x2="12" y2="17" stroke-width="3" stroke-linecap="round" />
					</svg>
				</button>
				<button
					onclick={() => (deviceSize = 'desktop')}
					class="p-1.5 rounded transition-colors {deviceSize === 'desktop'
						? 'bg-purple-100 text-purple-600'
						: 'text-gray-500 hover:bg-gray-200'}"
					title="Desktop view"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<rect x="2" y="4" width="20" height="12" rx="1" stroke-width="2" />
						<line x1="8" y1="20" x2="16" y2="20" stroke-width="2" stroke-linecap="round" />
						<line x1="12" y1="16" x2="12" y2="20" stroke-width="2" />
					</svg>
				</button>
			</div>
			<!-- Refresh button -->
			<button
				onclick={refresh}
				class="p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
				title="Refresh preview"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
			</button>
		</div>
	</div>

	<!-- Preview iframe container -->
	<div
		class="flex-1 bg-gray-50 rounded-b-xl p-4 overflow-auto flex justify-center"
	>
		<div
			class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 h-full"
			style="width: {deviceWidths[deviceSize]}; max-width: 100%;"
		>
			{#key key}
				<iframe
					srcdoc={html || defaultHtml}
					sandbox="allow-scripts"
					title="CTIW Preview"
					class="w-full h-full border-0"
				></iframe>
			{/key}
		</div>
	</div>
</div>

<style>
	iframe {
		min-height: 300px;
	}
</style>
