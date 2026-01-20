/**
 * CTIW Language Mode for CodeMirror 6
 *
 * Provides syntax highlighting for the CTIW language with bright,
 * kid-friendly colors!
 */

import { StreamLanguage, LanguageSupport, StringStream } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';

// State for the stream parser
interface CTIWState {
	inElement: boolean;
	afterEquals: boolean;
	expectingValue: boolean;
}

/**
 * Stream parser for CTIW language
 */
const ctiwStreamParser = {
	name: 'ctiw',

	startState(): CTIWState {
		return {
			inElement: false,
			afterEquals: false,
			expectingValue: false
		};
	},

	token(stream: StringStream, state: CTIWState): string | null {
		// Skip whitespace at start of token
		if (stream.eatSpace()) {
			return null;
		}

		// Comments (if we add them - lines starting with //)
		if (stream.match(/^\/\/.*/)) {
			return 'comment';
		}

		// Document markers: =CTIW= and ==CTIW==
		if (stream.match(/^==?CTIW==?/i)) {
			return 'keyword';
		}

		// Indentation dots at start of line content
		if (stream.match(/^\.+/)) {
			return 'punctuation';
		}

		// Line numbers at start (like "1 " or "42 ")
		if (stream.match(/^\d+\s+(?==)/)) {
			return 'lineNumber';
		}

		// Special elements: (time), (date), etc.
		if (stream.match(/^\([\w-]+\)/)) {
			return 'atom';
		}

		// Hex colors (6 characters that look like hex)
		// Match after = for values like color=FF0000=
		if (stream.match(/^[0-9A-Fa-f]{6}(?==|\s|$)/)) {
			return 'color';
		}

		// Element names after =
		const elementNames = [
			'title', 'text', 'line', 'button', 'password',
			'input', 'divide', 'img', 'link', 'list',
			'sound', 'video', 'game'
		];
		const elementPattern = new RegExp(`^(${elementNames.join('|')})(?==|\\s|$)`, 'i');
		if (stream.match(elementPattern)) {
			return 'typeName';
		}

		// Property names (before : or =)
		const propertyNames = [
			'id', 'color', 'outline', 'font-size', 'size',
			'in', 'language', 'visible', 'invisible',
			'left', 'right', 'middle', 'center'
		];
		const propertyPattern = new RegExp(`^(${propertyNames.join('|')})(?=[:=])`, 'i');
		if (stream.match(propertyPattern)) {
			return 'propertyName';
		}

		// Colon or equals as property delimiter
		if (stream.match(/^[:]/)) {
			state.expectingValue = true;
			return 'punctuation';
		}

		// Equals sign - main delimiter
		if (stream.match(/^=/)) {
			state.afterEquals = !state.afterEquals;
			return 'punctuation';
		}

		// Numbers
		if (stream.match(/^\d+/)) {
			return 'number';
		}

		// Values/strings - anything between = signs that isn't a keyword
		// Match word characters, spaces, hyphens, underscores, dots
		if (stream.match(/^[\w\s\-_.]+/)) {
			// Check if this looks like a known keyword/element
			const text = stream.current().trim().toLowerCase();
			if (elementNames.includes(text)) {
				return 'typeName';
			}
			if (propertyNames.includes(text)) {
				return 'propertyName';
			}
			// It's a value (like button text, file names, etc.)
			return 'string';
		}

		// Consume any other character
		stream.next();
		return null;
	}
};

/**
 * The CTIW StreamLanguage definition
 */
export const ctiwLang = StreamLanguage.define(ctiwStreamParser);

/**
 * Bright, fun highlight style for kids!
 * Uses vibrant colors that are easy to distinguish
 */
export const ctiwHighlightStyle = HighlightStyle.define([
	// Keywords (=CTIW=, ==CTIW==) - bright purple/pink
	{ tag: t.keyword, color: '#FF6BFF', fontWeight: 'bold' },

	// Element names (title, button, divide, etc.) - bright blue
	{ tag: t.typeName, color: '#00BFFF', fontWeight: 'bold' },

	// Property names (id, color, outline, etc.) - bright green
	{ tag: t.propertyName, color: '#7CFC00' },

	// Values/strings - orange
	{ tag: t.string, color: '#FFA500' },

	// Numbers - cyan
	{ tag: t.number, color: '#00FFFF' },

	// Special elements like (time) - bright cyan/teal
	{ tag: t.atom, color: '#00CED1', fontStyle: 'italic' },

	// Punctuation (=, :, dots) - light gray
	{ tag: t.punctuation, color: '#888888' },

	// Comments - gray italic
	{ tag: t.comment, color: '#808080', fontStyle: 'italic' },

	// Line numbers - dim
	{ tag: t.lineComment, color: '#666666' }
]);

/**
 * Theme extension for CTIW-specific token classes
 * This handles our custom token types like 'color'
 */
export const ctiwTheme = EditorView.theme({
	// Style for hex color tokens - we'll make them stand out
	'.cm-ctiw-color': {
		fontWeight: 'bold',
		textDecoration: 'underline',
		textDecorationStyle: 'dotted'
	},
	// Style for indentation dots - very dim
	'.cm-ctiw-dots': {
		color: '#444444'
	},
	// Make the editor background dark for contrast
	'&': {
		backgroundColor: '#1e1e2e'
	},
	'.cm-content': {
		caretColor: '#ffffff'
	},
	'.cm-cursor': {
		borderLeftColor: '#ffffff'
	},
	// Selection styling
	'.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
		backgroundColor: '#44475a'
	},
	// Active line highlight
	'.cm-activeLine': {
		backgroundColor: '#2d2d3d'
	},
	// Line numbers
	'.cm-gutters': {
		backgroundColor: '#1e1e2e',
		color: '#6272a4',
		border: 'none'
	},
	'.cm-activeLineGutter': {
		backgroundColor: '#2d2d3d'
	}
});

/**
 * Note: For dynamic hex color highlighting (showing colors in their actual color),
 * you would need to implement a ViewPlugin with decorations.
 * This is left as a future enhancement.
 */

/**
 * Get the complete CTIW language support extension
 * This is what you import and use in your CodeMirror setup
 *
 * @example
 * ```typescript
 * import { ctiwLanguage } from './ctiw-language';
 *
 * const editor = new EditorView({
 *   extensions: [
 *     ctiwLanguage(),
 *     // ... other extensions
 *   ],
 *   parent: document.getElementById('editor')
 * });
 * ```
 */
export function ctiwLanguage(): LanguageSupport {
	return new LanguageSupport(ctiwLang, [
		syntaxHighlighting(ctiwHighlightStyle),
		ctiwTheme
	]);
}

/**
 * Export individual pieces for custom configurations
 */
export { syntaxHighlighting } from '@codemirror/language';
