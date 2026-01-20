/**
 * CTIW Code Generator
 *
 * Converts a CTIW AST into HTML and CSS.
 * This is the final step in the compilation pipeline:
 * CTIW Source -> Lexer -> Parser -> AST -> Code Generator -> HTML/CSS
 */

import type {
	DocumentNode,
	ElementNode,
	SpecialNode,
	CTIWNode,
	ElementProperties,
	CTIWElementType
} from './ast';
import { isElementNode, isSpecialNode, isCoreElementType } from './ast';

/**
 * Known CSS properties that CTIW properties map to.
 * Properties not in this map are passed through as-is.
 */
const CSS_PROPERTY_MAP: Record<string, string> = {
	// CTIW-specific mappings
	'color': 'background-color',
	'in': 'text-align',
	'size': 'width',
	// Direct CSS properties (pass through)
	'background': 'background',
	'background-color': 'background-color',
	'border': 'border',
	'border-radius': 'border-radius',
	'font-size': 'font-size',
	'font-family': 'font-family',
	'font-weight': 'font-weight',
	'text-align': 'text-align',
	'width': 'width',
	'height': 'height',
	'margin': 'margin',
	'margin-top': 'margin-top',
	'margin-bottom': 'margin-bottom',
	'margin-left': 'margin-left',
	'margin-right': 'margin-right',
	'padding': 'padding',
	'padding-top': 'padding-top',
	'padding-bottom': 'padding-bottom',
	'padding-left': 'padding-left',
	'padding-right': 'padding-right',
	'display': 'display',
	'flex': 'flex',
	'flex-direction': 'flex-direction',
	'justify-content': 'justify-content',
	'align-items': 'align-items',
	'gap': 'gap',
	'grid': 'grid',
	'position': 'position',
	'top': 'top',
	'left': 'left',
	'right': 'right',
	'bottom': 'bottom',
	'z-index': 'z-index',
	'opacity': 'opacity',
	'transform': 'transform',
	'transition': 'transition',
	'cursor': 'cursor',
	'overflow': 'overflow',
	'box-shadow': 'box-shadow',
	'text-decoration': 'text-decoration',
	'line-height': 'line-height',
	'letter-spacing': 'letter-spacing',
	'max-width': 'max-width',
	'min-width': 'min-width',
	'max-height': 'max-height',
	'min-height': 'min-height'
};

/**
 * Properties that are HTML attributes (not CSS)
 */
const HTML_ATTRIBUTES = new Set([
	'id', 'class', 'href', 'src', 'alt', 'title', 'type', 'name', 'value',
	'placeholder', 'disabled', 'readonly', 'checked', 'selected',
	'target', 'rel', 'download', 'data', 'role', 'aria-label',
	'width', 'height', // For img, video, etc.
	'autoplay', 'controls', 'loop', 'muted', 'poster', // Media elements
	'action', 'method', 'enctype', // Form elements
	'colspan', 'rowspan', 'scope', // Table elements
	'min', 'max', 'step', 'pattern', 'required', 'maxlength', 'minlength', // Input attributes
	'for', 'tabindex', 'autofocus', 'autocomplete'
]);

/**
 * Self-closing HTML elements (void elements)
 */
const SELF_CLOSING_ELEMENTS = new Set([
	'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
	'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

/**
 * CTIW element type to HTML tag mapping
 */
const ELEMENT_TAG_MAP: Record<string, string> = {
	'title': 'h1',
	'text': 'p',
	'divide': 'div',
	'line': 'br',
	'heading': 'h2',
	'subheading': 'h3'
};

/** Language code mappings */
const LANGUAGE_MAP: Record<string, string> = {
	english: 'en',
	spanish: 'es',
	french: 'fr',
	german: 'de',
	chinese: 'zh',
	japanese: 'ja',
	korean: 'ko',
	portuguese: 'pt',
	italian: 'it',
	russian: 'ru'
};

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHTML(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Check if a value looks like a hex color (6 characters, all hex digits)
 */
function isHexColor(value: string): boolean {
	return /^[0-9A-Fa-f]{6}$/.test(value);
}

/**
 * Format a CSS value, adding units or # prefix as needed
 */
function formatCSSValue(propName: string, value: string | number): string {
	const strValue = String(value);

	// Properties that expect colors
	if (propName.includes('color') || propName === 'background') {
		if (isHexColor(strValue)) {
			return `#${strValue}`;
		}
	}

	// Properties that expect pixel values
	const pixelProps = ['font-size', 'width', 'height', 'margin', 'padding', 'gap',
		'top', 'left', 'right', 'bottom', 'border-radius', 'size',
		'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
		'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
		'max-width', 'min-width', 'max-height', 'min-height'];
	if (pixelProps.includes(propName) && /^\d+$/.test(strValue)) {
		return `${strValue}px`;
	}

	return strValue;
}

/**
 * Generates CSS styles for a single element
 */
function generateElementCSS(element: ElementNode): string {
	const props = element.properties;
	const id = props.id;
	if (!id) return '';

	const styles: string[] = [];

	// Process each property
	for (const [key, value] of Object.entries(props)) {
		if (value === undefined || value === null) continue;
		if (HTML_ATTRIBUTES.has(key)) continue; // Skip HTML attributes

		// Special CTIW property handling
		if (key === 'color' && isHexColor(String(value))) {
			styles.push(`background-color: #${value}`);
			continue;
		}

		if (key === 'outline') {
			if (value === 'visible') {
				styles.push('border: 1px solid black');
			} else if (value === 'invisible') {
				styles.push('border: none');
			}
			continue;
		}

		if (key === 'in') {
			if (value === 'middle' || value === 'center') {
				styles.push('text-align: center');
			} else if (value === 'left') {
				styles.push('text-align: left');
			} else if (value === 'right') {
				styles.push('text-align: right');
			}
			continue;
		}

		// Map CTIW property to CSS property or pass through
		const cssProperty = CSS_PROPERTY_MAP[key] || key;

		// Only output if it looks like a valid CSS property (contains lowercase letters and hyphens)
		if (/^[a-z][a-z0-9-]*$/i.test(cssProperty)) {
			const formattedValue = formatCSSValue(key, value);
			styles.push(`${cssProperty}: ${formattedValue}`);
		}
	}

	if (styles.length === 0) return '';

	return `#${id} { ${styles.join('; ')}; }`;
}

/**
 * Generates CSS for multiple nodes (including nested children)
 */
export function generateCSS(nodes: CTIWNode[]): string {
	const cssRules: string[] = [];

	function processNode(node: CTIWNode) {
		if (isElementNode(node)) {
			const css = generateElementCSS(node);
			if (css) {
				cssRules.push(css);
			}
			// Process children recursively
			for (const child of node.children) {
				processNode(child);
			}
		}
	}

	for (const node of nodes) {
		processNode(node);
	}

	return cssRules.join('\n    ');
}

/**
 * Generates HTML attributes string from element properties
 */
function generateAttributes(props: ElementProperties): string {
	const attrs: string[] = [];

	for (const [key, value] of Object.entries(props)) {
		if (value === undefined || value === null) continue;

		// Only include known HTML attributes
		if (HTML_ATTRIBUTES.has(key)) {
			attrs.push(`${key}="${escapeHTML(String(value))}"`);
		}
	}

	return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}

/**
 * Generate inline styles for elements without IDs
 */
function generateInlineStyles(props: ElementProperties): string {
	const styles: string[] = [];

	for (const [key, value] of Object.entries(props)) {
		if (value === undefined || value === null) continue;
		if (HTML_ATTRIBUTES.has(key)) continue; // Skip HTML attributes

		// Special CTIW property handling
		if (key === 'color' && isHexColor(String(value))) {
			styles.push(`background-color: #${value}`);
			continue;
		}

		if (key === 'outline') {
			if (value === 'visible') {
				styles.push('border: 1px solid black');
			} else if (value === 'invisible') {
				styles.push('border: none');
			}
			continue;
		}

		if (key === 'in') {
			if (value === 'middle' || value === 'center') {
				styles.push('text-align: center');
			} else if (value === 'left') {
				styles.push('text-align: left');
			} else if (value === 'right') {
				styles.push('text-align: right');
			}
			continue;
		}

		// Map CTIW property to CSS property or pass through
		const cssProperty = CSS_PROPERTY_MAP[key] || key;

		// Only output if it looks like a valid CSS property
		if (/^[a-z][a-z0-9-]*$/i.test(cssProperty)) {
			const formattedValue = formatCSSValue(key, value);
			styles.push(`${cssProperty}: ${formattedValue}`);
		}
	}

	return styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
}

/**
 * Generates HTML for a special element
 */
function generateSpecialElement(node: SpecialNode): string {
	switch (node.specialType) {
		case 'time':
			return '<span class="ctiw-time"></span>';
		default:
			return `<!-- Unknown special: ${node.specialType} -->`;
	}
}

/**
 * Generates HTML for a single element
 */
export function generateElement(node: CTIWNode, indent: string = ''): string {
	if (isSpecialNode(node)) {
		return generateSpecialElement(node);
	}

	if (!isElementNode(node)) {
		return '';
	}

	const element = node;
	const attrs = generateAttributes(element.properties);
	const inlineStyles = !element.properties.id ? generateInlineStyles(element.properties) : '';
	const content = element.content ? escapeHTML(element.content) : '';
	const elementType = element.elementType;

	// Special CTIW-specific element handling
	switch (elementType) {
		case 'password': {
			const placeholder = content ? ` placeholder="${content}"` : '';
			const idAttr = element.properties.id ? ` id="${element.properties.id}"` : '';
			return `<input type="password"${idAttr}${placeholder}${inlineStyles}>`;
		}

		case 'input': {
			const placeholder = content ? ` placeholder="${content}"` : '';
			const idAttr = element.properties.id ? ` id="${element.properties.id}"` : '';
			return `<input type="text"${idAttr}${placeholder}${inlineStyles}>`;
		}

		case 'img': {
			const src = content || element.properties.src || '';
			const alt = element.properties.alt || '';
			const idAttr = element.properties.id ? ` id="${element.properties.id}"` : '';
			return `<img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}"${idAttr}${inlineStyles}>`;
		}

		case 'link': {
			const href = element.properties.href || '#';
			const idAttr = element.properties.id ? ` id="${element.properties.id}"` : '';
			return `<a href="${escapeHTML(href)}"${idAttr}${inlineStyles}>${content}</a>`;
		}
	}

	// Map CTIW element type to HTML tag, or use the type directly as a tag
	const tag = ELEMENT_TAG_MAP[elementType] || elementType;

	// Handle self-closing elements
	if (SELF_CLOSING_ELEMENTS.has(tag)) {
		return `<${tag}${attrs}${inlineStyles}>`;
	}

	// Handle elements with children (containers)
	const validChildren = element.children.filter(
		(child) => isElementNode(child) || isSpecialNode(child)
	);

	if (validChildren.length > 0) {
		const childrenHTML = validChildren
			.map((child) => generateElement(child, indent + '  '))
			.join('\n' + indent + '  ');
		return `<${tag}${attrs}${inlineStyles}>\n${indent}  ${childrenHTML}\n${indent}</${tag}>`;
	}

	// Simple element with content
	return `<${tag}${attrs}${inlineStyles}>${content}</${tag}>`;
}

/**
 * Checks if the document has any time elements
 */
function hasTimeElement(nodes: CTIWNode[]): boolean {
	for (const node of nodes) {
		if (isSpecialNode(node) && node.specialType === 'time') return true;
		if (isElementNode(node) && hasTimeElement(node.children)) return true;
	}
	return false;
}

/**
 * Generates the time update script
 */
function generateTimeScript(): string {
	return `
  <script>
    function updateTime() {
      const timeElements = document.querySelectorAll('.ctiw-time');
      const now = new Date().toLocaleTimeString();
      timeElements.forEach(el => el.textContent = now);
    }
    updateTime();
    setInterval(updateTime, 1000);
  </script>`;
}

/**
 * Main function: Generates complete HTML document from CTIW AST
 */
export function generateHTML(doc: DocumentNode): string {
	// Extract document-level metadata
	const meta = doc.metadata || {};
	const pageTitle = meta.title || 'CTIW Page';
	const language = meta.language ? LANGUAGE_MAP[meta.language.toLowerCase()] || meta.language : '';
	const fontSize = meta.fontSize ? `font-size: ${meta.fontSize}px;` : '';

	// Filter children to only Elements and Specials for body content
	const bodyNodes = doc.children.filter((child) => isElementNode(child) || isSpecialNode(child));

	// Generate CSS from elements
	const elementCSS = generateCSS(bodyNodes);

	// Generate body content
	const bodyContent = bodyNodes.map((node) => '  ' + generateElement(node, '  ')).join('\n');

	// Check if we need the time script
	const needsTimeScript = hasTimeElement(bodyNodes);

	// Build the HTML document
	const langAttr = language ? ` lang="${language}"` : '';

	const html = `<!DOCTYPE html>
<html${langAttr}>
<head>
  <meta charset="utf-8">
  <title>${escapeHTML(pageTitle)}</title>
  <style>
    body { font-family: sans-serif; padding: 20px;${fontSize ? ' ' + fontSize : ''} }
    ${elementCSS}
  </style>
</head>
<body>
${bodyContent}${needsTimeScript ? generateTimeScript() : ''}
</body>
</html>`;

	return html;
}
