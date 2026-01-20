<script lang="ts">
	import { EditorState, type Extension } from '@codemirror/state';
	import { EditorView, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, keymap } from '@codemirror/view';
	import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
	import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
	import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
	import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';

	let { code = $bindable('') }: { code: string } = $props();

	let editorRef: HTMLDivElement;
	let editorView: EditorView | undefined;

	// Track whether code changes originated from the editor itself
	// to prevent feedback loops that kill focus and undo history
	let isInternalChange = false;

	// Kid-friendly dark theme with bright, fun colors
	const ctiwTheme = EditorView.theme({
		'&': {
			height: '100%',
			fontSize: '16px',
			backgroundColor: '#1a1b26',
			borderRadius: '12px'
		},
		'.cm-content': {
			fontFamily: '"Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
			padding: '16px',
			caretColor: '#7dcfff'
		},
		'.cm-cursor': {
			borderLeftColor: '#7dcfff',
			borderLeftWidth: '3px'
		},
		'.cm-selectionBackground': {
			backgroundColor: '#364a82 !important'
		},
		'&.cm-focused .cm-selectionBackground': {
			backgroundColor: '#364a82 !important'
		},
		'.cm-gutters': {
			backgroundColor: '#1a1b26',
			color: '#565f89',
			border: 'none',
			borderRight: '1px solid #24283b',
			paddingRight: '8px'
		},
		'.cm-lineNumbers .cm-gutterElement': {
			padding: '0 8px 0 16px',
			minWidth: '40px'
		},
		'.cm-activeLineGutter': {
			backgroundColor: '#24283b',
			color: '#9ece6a'
		},
		'.cm-activeLine': {
			backgroundColor: '#1f2335'
		},
		'.cm-matchingBracket': {
			backgroundColor: '#3d59a1',
			color: '#c0caf5 !important',
			outline: '1px solid #7aa2f7'
		},
		'.cm-foldGutter': {
			color: '#565f89'
		},
		'.cm-foldPlaceholder': {
			backgroundColor: '#3d59a1',
			color: '#c0caf5',
			border: 'none'
		},
		// Syntax highlighting colors (will be used when we add CTIW language support)
		'.cm-line': {
			color: '#c0caf5'
		}
	}, { dark: true });

	// Base extensions for the editor
	const baseExtensions: Extension[] = [
		lineNumbers(),
		highlightActiveLineGutter(),
		highlightSpecialChars(),
		history(),
		foldGutter(),
		drawSelection(),
		dropCursor(),
		EditorState.allowMultipleSelections.of(true),
		indentOnInput(),
		bracketMatching(),
		closeBrackets(),
		rectangularSelection(),
		crosshairCursor(),
		highlightActiveLine(),
		highlightSelectionMatches(),
		keymap.of([
			...closeBracketsKeymap,
			...defaultKeymap,
			...searchKeymap,
			...historyKeymap,
			indentWithTab
		]),
		ctiwTheme,
		EditorView.lineWrapping,
		// Listen for changes and update the code prop
		EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				isInternalChange = true;
				code = update.state.doc.toString();
			}
		})
	];

	$effect(() => {
		if (editorRef && !editorView) {
			const state = EditorState.create({
				doc: code,
				extensions: baseExtensions
			});

			editorView = new EditorView({
				state,
				parent: editorRef
			});
		}

		return () => {
			if (editorView) {
				editorView.destroy();
				editorView = undefined;
			}
		};
	});

	// Sync external code changes to the editor (from AI assistant, project load, etc.)
	$effect(() => {
		if (editorView) {
			// Skip if this change came from the editor itself
			if (isInternalChange) {
				isInternalChange = false;
				return;
			}

			const currentContent = editorView.state.doc.toString();
			if (code !== currentContent) {
				editorView.dispatch({
					changes: {
						from: 0,
						to: currentContent.length,
						insert: code
					}
				});
			}
		}
	});
</script>

<div class="editor-container" bind:this={editorRef}></div>

<style>
	.editor-container {
		width: 100%;
		height: 100%;
		min-height: 400px;
		border-radius: 12px;
		overflow: hidden;
	}

	.editor-container :global(.cm-editor) {
		height: 100%;
	}

	.editor-container :global(.cm-scroller) {
		overflow: auto;
	}
</style>
