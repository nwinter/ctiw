<script lang="ts">
	let isOpen = $state(false);
</script>

<div class="syntax-legend">
	<button
		class="legend-toggle"
		onclick={() => isOpen = !isOpen}
		aria-expanded={isOpen}
	>
		<span class="toggle-icon">{isOpen ? '▼' : '▶'}</span>
		<span>CTIW Syntax Reference</span>
	</button>

	{#if isOpen}
		<div class="legend-content">
			<section>
				<h4>Document Structure</h4>
				<code>=CTIW=</code> Start your page<br/>
				<code>==CTIW==</code> End your page
			</section>

			<section>
				<h4>Elements</h4>
				<code>=title=Hello!=</code> Big heading<br/>
				<code>=text=Hello!=</code> Paragraph<br/>
				<code>=button=Click!=</code> Button<br/>
				<code>=line=</code> Line break<br/>
				<code>=input=</code> Text box<br/>
				<code>=password=</code> Password box<br/>
				<code>=img=pic.png=</code> Image<br/>
				<code>=(time)=</code> Show time
			</section>

			<section>
				<h4>Containers (Boxes)</h4>
				<code>=divide=</code> Start box<br/>
				<code>=divide=</code> End box<br/>
				<span class="hint">Put content between them!</span>
			</section>

			<section>
				<h4>Properties</h4>
				<code>color=FF0000=</code> Red color<br/>
				<code>color=00FF00=</code> Green color<br/>
				<code>color=0000FF=</code> Blue color<br/>
				<code>id:name=</code> Give ID<br/>
				<code>outline=visible=</code> Show border<br/>
				<code>in=middle=</code> Center it
			</section>

			<section>
				<h4>Indentation</h4>
				<code>.. </code> Inside a box (2 dots)<br/>
				<code>.... </code> Nested deeper (4 dots)
			</section>

			<section class="example">
				<h4>Example</h4>
				<pre>=divide= color=FFD700=
.. =title=Golden Box=
.. =text=Hello!=
=divide=</pre>
			</section>
		</div>
	{/if}
</div>

<style>
	.syntax-legend {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.legend-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		background: linear-gradient(135deg, #f0f4ff 0%, #fdf2f8 100%);
		border: none;
		font-size: 14px;
		font-weight: 600;
		color: #6b21a8;
		cursor: pointer;
		transition: background 0.2s;
		text-align: left;
	}

	.legend-toggle:hover {
		background: linear-gradient(135deg, #e8edff 0%, #fce7f3 100%);
	}

	.toggle-icon {
		font-size: 10px;
		width: 16px;
	}

	.legend-content {
		padding: 16px;
		font-size: 13px;
		color: #374151;
		max-height: 300px;
		overflow-y: auto;
	}

	section {
		margin-bottom: 14px;
	}

	section:last-child {
		margin-bottom: 0;
	}

	h4 {
		font-size: 12px;
		font-weight: 700;
		color: #7c3aed;
		margin: 0 0 6px 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	code {
		background: #1a1b26;
		color: #c0caf5;
		padding: 2px 6px;
		border-radius: 4px;
		font-family: 'Fira Code', 'JetBrains Mono', Consolas, monospace;
		font-size: 12px;
	}

	.hint {
		font-size: 11px;
		color: #9ca3af;
		font-style: italic;
	}

	.example pre {
		background: #1a1b26;
		color: #c0caf5;
		padding: 10px;
		border-radius: 8px;
		font-family: 'Fira Code', 'JetBrains Mono', Consolas, monospace;
		font-size: 11px;
		line-height: 1.5;
		margin: 6px 0 0 0;
		white-space: pre-wrap;
	}
</style>
