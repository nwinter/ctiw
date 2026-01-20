/**
 * CTIW Autocomplete Provider for CodeMirror 6
 *
 * Provides context-aware completions for the CTIW language,
 * making it easy and fun to write CTIW code!
 */

import {
	autocompletion,
	type CompletionContext,
	type CompletionResult,
	type Completion
} from '@codemirror/autocomplete';

// =============================================================================
// Element Completions
// =============================================================================

const elementCompletions: Completion[] = [
	{
		label: '=title=',
		type: 'keyword',
		detail: 'Text element',
		info: '📝 Big text for page titles or section headers'
	},
	{
		label: '=text=',
		type: 'keyword',
		detail: 'Text element',
		info: '✏️ Regular text - write whatever you want!'
	},
	{
		label: '=line=',
		type: 'keyword',
		detail: 'Layout element',
		info: '↵ Adds a line break - like pressing Enter!'
	},
	{
		label: '=button=',
		type: 'keyword',
		detail: 'Interactive element',
		info: '🔘 A clickable button - add text inside!'
	},
	{
		label: '=password=',
		type: 'keyword',
		detail: 'Input element',
		info: '🔒 A secret input box - text shows as dots!'
	},
	{
		label: '=input=',
		type: 'keyword',
		detail: 'Input element',
		info: '⌨️ A text box where users can type'
	},
	{
		label: '=divide=',
		type: 'keyword',
		detail: 'Container element',
		info: '📦 Groups other elements together, like a box'
	},
	{
		label: '=img=',
		type: 'keyword',
		detail: 'Media element',
		info: '🖼️ Shows a picture - add the filename!'
	},
	{
		label: '=link=',
		type: 'keyword',
		detail: 'Interactive element',
		info: '🔗 A clickable link to go somewhere else'
	}
];

// =============================================================================
// Special Element Completions
// =============================================================================

const specialCompletions: Completion[] = [
	{
		label: '=(time)=',
		type: 'keyword',
		detail: 'Special element',
		info: '⏰ Shows the current time - updates automatically!'
	}
];

// =============================================================================
// Document Structure Completions
// =============================================================================

const structureCompletions: Completion[] = [
	{
		label: '=CTIW=',
		type: 'keyword',
		detail: 'Document start',
		info: '🚀 Start your CTIW document with this!',
		boost: 10 // Prioritize at beginning
	},
	{
		label: '==CTIW==',
		type: 'keyword',
		detail: 'Document end',
		info: '🏁 End your CTIW document with this!'
	}
];

// =============================================================================
// Property Completions
// =============================================================================

const propertyCompletions: Completion[] = [
	{
		label: 'id:',
		type: 'property',
		detail: 'Element ID',
		info: '🏷️ Give your element a unique name'
	},
	{
		label: 'color=',
		type: 'property',
		detail: 'Color property',
		info: '🎨 Set the color (use 6 hex characters like FF0000)'
	},
	{
		label: 'outline=',
		type: 'property',
		detail: 'Visibility property',
		info: '👁️ Show or hide the element outline'
	},
	{
		label: 'font-size=',
		type: 'property',
		detail: 'Size property',
		info: '📏 Set how big the text is (use a number)'
	},
	{
		label: 'in=',
		type: 'property',
		detail: 'Position property',
		info: '📍 Position the element (left, middle, or right)'
	},
	{
		label: 'size=',
		type: 'property',
		detail: 'Size property',
		info: '📐 Set the size of an element'
	}
];

// =============================================================================
// Property Value Completions
// =============================================================================

const outlineValues: Completion[] = [
	{
		label: 'visible',
		type: 'constant',
		detail: 'Outline visible',
		info: '👁️ Show the element outline'
	},
	{
		label: 'invisible',
		type: 'constant',
		detail: 'Outline hidden',
		info: '🙈 Hide the element outline'
	}
];

const positionValues: Completion[] = [
	{
		label: 'left',
		type: 'constant',
		detail: 'Left position',
		info: '⬅️ Align to the left side'
	},
	{
		label: 'middle',
		type: 'constant',
		detail: 'Center position',
		info: '↔️ Align to the center'
	},
	{
		label: 'right',
		type: 'constant',
		detail: 'Right position',
		info: '➡️ Align to the right side'
	}
];

const colorCompletions: Completion[] = [
	{
		label: 'FF0000',
		type: 'constant',
		detail: 'Red',
		info: '🔴 Bright red color'
	},
	{
		label: '00FF00',
		type: 'constant',
		detail: 'Green',
		info: '🟢 Bright green color'
	},
	{
		label: '0000FF',
		type: 'constant',
		detail: 'Blue',
		info: '🔵 Bright blue color'
	},
	{
		label: 'FFFF00',
		type: 'constant',
		detail: 'Yellow',
		info: '🟡 Bright yellow color'
	},
	{
		label: 'FF00FF',
		type: 'constant',
		detail: 'Magenta/Pink',
		info: '🟣 Bright pink/magenta color'
	},
	{
		label: '00FFFF',
		type: 'constant',
		detail: 'Cyan',
		info: '🩵 Bright cyan/aqua color'
	},
	{
		label: 'FFFFFF',
		type: 'constant',
		detail: 'White',
		info: '⬜ Pure white color'
	},
	{
		label: '000000',
		type: 'constant',
		detail: 'Black',
		info: '⬛ Pure black color'
	},
	{
		label: 'FFA500',
		type: 'constant',
		detail: 'Orange',
		info: '🟠 Bright orange color'
	},
	{
		label: '800080',
		type: 'constant',
		detail: 'Purple',
		info: '💜 Purple color'
	},
	{
		label: 'FFC0CB',
		type: 'constant',
		detail: 'Pink',
		info: '💗 Light pink color'
	},
	{
		label: 'A52A2A',
		type: 'constant',
		detail: 'Brown',
		info: '🟤 Brown color'
	},
	{
		label: '808080',
		type: 'constant',
		detail: 'Gray',
		info: '🩶 Gray color'
	},
	{
		label: 'BAF2Y9',
		type: 'constant',
		detail: 'CTIW Mint',
		info: '🌿 Special CTIW mint green color!'
	}
];

const languageCompletions: Completion[] = [
	{
		label: 'english',
		type: 'constant',
		detail: 'English language',
		info: '🇬🇧 Set language to English'
	},
	{
		label: 'spanish',
		type: 'constant',
		detail: 'Spanish language',
		info: '🇪🇸 Set language to Spanish'
	},
	{
		label: 'french',
		type: 'constant',
		detail: 'French language',
		info: '🇫🇷 Set language to French'
	}
];

// =============================================================================
// Global Properties (document-level)
// =============================================================================

const globalPropertyCompletions: Completion[] = [
	{
		label: '=title=',
		type: 'keyword',
		detail: 'Page title',
		info: '📝 Set the title of your page'
	},
	{
		label: '=language=',
		type: 'keyword',
		detail: 'Document language',
		info: '🌍 Set the language of your page'
	},
	{
		label: '=font-size=',
		type: 'keyword',
		detail: 'Default font size',
		info: '📏 Set the default text size for your page'
	}
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the text before the cursor on the current line
 */
function getLineBefore(context: CompletionContext): string {
	const line = context.state.doc.lineAt(context.pos);
	return context.state.sliceDoc(line.from, context.pos);
}

/**
 * Check if we're at the beginning of a line (ignoring dots for indentation)
 */
function isAtLineStart(lineBefore: string): boolean {
	return /^\.{0,}$/.test(lineBefore);
}

/**
 * Check if we're after an equals sign (starting an element)
 */
function isAfterEquals(lineBefore: string): boolean {
	return /=\s*$/.test(lineBefore);
}

/**
 * Check if we're after a property name
 */
function getPropertyContext(lineBefore: string): string | null {
	// Check for color=
	if (/color=\s*$/.test(lineBefore)) return 'color';
	// Check for outline=
	if (/outline=\s*$/.test(lineBefore)) return 'outline';
	// Check for in=
	if (/in=\s*$/.test(lineBefore)) return 'in';
	// Check for language=
	if (/language=\s*$/.test(lineBefore)) return 'language';
	// Check for id: (user should type their own)
	if (/id:\s*$/.test(lineBefore)) return 'id';
	return null;
}

/**
 * Check if we're in an element context (after an element, before closing =)
 */
function isInElementContext(lineBefore: string): boolean {
	// Match lines like "=button=Click Me= " or "=divide= "
	// where we might want to add properties
	return /=\w+=[^=]*=\s+$/.test(lineBefore) || /=\w+=\s+$/.test(lineBefore);
}

/**
 * Check if the document is empty or just started
 */
function isDocumentStart(context: CompletionContext): boolean {
	const doc = context.state.doc.toString();
	return doc.trim() === '' || !doc.includes('=CTIW=');
}

// =============================================================================
// Main Completion Function
// =============================================================================

function ctiwCompletions(context: CompletionContext): CompletionResult | null {
	const lineBefore = getLineBefore(context);

	// Check property context first (most specific)
	const propContext = getPropertyContext(lineBefore);
	if (propContext) {
		switch (propContext) {
			case 'color':
				return {
					from: context.pos,
					options: colorCompletions,
					validFor: /^[A-Fa-f0-9]*$/
				};
			case 'outline':
				return {
					from: context.pos,
					options: outlineValues,
					validFor: /^[a-z]*$/i
				};
			case 'in':
				return {
					from: context.pos,
					options: positionValues,
					validFor: /^[a-z]*$/i
				};
			case 'language':
				return {
					from: context.pos,
					options: languageCompletions,
					validFor: /^[a-z]*$/i
				};
			case 'id':
				// User should type their own ID, no suggestions
				return null;
		}
	}

	// Check if we're in an element context (adding properties)
	if (isInElementContext(lineBefore)) {
		return {
			from: context.pos,
			options: propertyCompletions,
			validFor: /^[a-z-]*$/i
		};
	}

	// Check if we're after an equals sign (element name context)
	if (isAfterEquals(lineBefore)) {
		// Don't trigger on the closing = of an element value
		const equalsBefore = (lineBefore.match(/=/g) || []).length;
		if (equalsBefore >= 2) {
			// Likely in value context or closing, suggest nothing
			return null;
		}

		// Combine all possible element completions
		const allElements = [
			...elementCompletions,
			...specialCompletions.map((c) => ({
				...c,
				label: c.label.slice(1) // Remove leading = since user typed it
			}))
		].map((c) => ({
			...c,
			label: c.label.startsWith('=') ? c.label.slice(1) : c.label // Remove leading =
		}));

		return {
			from: context.pos,
			options: allElements,
			validFor: /^[a-zA-Z()]*$/
		};
	}

	// Check if we're at line start (or just dots)
	if (isAtLineStart(lineBefore)) {
		// At document start, prioritize =CTIW=
		if (isDocumentStart(context)) {
			return {
				from: context.pos,
				options: [...structureCompletions, ...globalPropertyCompletions, ...elementCompletions],
				validFor: /^=?[a-zA-Z]*=?$/
			};
		}

		// Regular line start - offer elements, structure, and properties
		return {
			from: context.pos,
			options: [
				...elementCompletions,
				...specialCompletions,
				...structureCompletions,
				...globalPropertyCompletions
			],
			validFor: /^=?[a-zA-Z()]*=?$/
		};
	}

	// Check for partial matches (user started typing)
	const wordMatch = lineBefore.match(/=([a-zA-Z()]*)$/);
	if (wordMatch) {
		const typed = wordMatch[1];
		const allOptions = [
			...elementCompletions,
			...specialCompletions,
			...structureCompletions,
			...globalPropertyCompletions
		].map((c) => ({
			...c,
			label: c.label.startsWith('=') ? c.label.slice(1) : c.label
		}));

		return {
			from: context.pos - typed.length,
			options: allOptions,
			validFor: /^[a-zA-Z()]*$/
		};
	}

	// Check for property partial matches
	const propMatch = lineBefore.match(/\s([a-z-]*)$/);
	if (propMatch && isInElementContext(lineBefore.slice(0, -propMatch[1].length))) {
		return {
			from: context.pos - propMatch[1].length,
			options: propertyCompletions,
			validFor: /^[a-z-]*$/i
		};
	}

	// Default: no completions
	return null;
}

// =============================================================================
// Export
// =============================================================================

/**
 * Creates a CodeMirror extension that provides CTIW-specific autocompletions.
 *
 * Usage:
 * ```typescript
 * import { ctiwAutocomplete } from '$lib/editor/ctiw-autocomplete';
 *
 * const extensions = [
 *   // ... other extensions
 *   ctiwAutocomplete()
 * ];
 * ```
 */
export function ctiwAutocomplete() {
	return autocompletion({
		override: [ctiwCompletions],
		defaultKeymap: true,
		icons: true
	});
}

// Also export the individual completion functions for testing
export { ctiwCompletions };
