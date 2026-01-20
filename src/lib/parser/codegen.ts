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
import { isElementNode, isSpecialNode } from './ast';

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
 * Generates CSS styles for a single element
 */
function generateElementCSS(element: ElementNode): string {
	const props = element.properties;
	const id = props.id;
	if (!id) return '';

	const styles: string[] = [];

	// Process each property that maps to CSS
	if (props.color) {
		styles.push(`background-color: #${props.color}`);
	}

	if (props.outline === 'visible') {
		styles.push('border: 1px solid black');
	} else if (props.outline === 'invisible') {
		styles.push('border: none');
	}

	if (props.in) {
		if (props.in === 'middle' || props.in === 'center') {
			styles.push('text-align: center');
		} else if (props.in === 'left') {
			styles.push('text-align: left');
		} else if (props.in === 'right') {
			styles.push('text-align: right');
		}
	}

	if (props['font-size'] !== undefined) {
		styles.push(`font-size: ${props['font-size']}px`);
	}

	if (props.size !== undefined) {
		styles.push(`width: ${props.size}px`);
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

	if (props.id) {
		attrs.push(`id="${props.id}"`);
	}

	return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
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
	const content = element.content ? escapeHTML(element.content) : '';

	switch (element.elementType) {
		case 'title':
			return `<h1${attrs}>${content}</h1>`;

		case 'text':
			return `<p${attrs}>${content}</p>`;

		case 'divide': {
			// Filter children to only Elements and Specials (skip Properties, Errors, etc.)
			const validChildren = element.children.filter(
				(child) => isElementNode(child) || isSpecialNode(child)
			);
			const childrenHTML = validChildren
				.map((child) => generateElement(child, indent + '  '))
				.join('\n' + indent + '  ');
			if (childrenHTML) {
				return `<div${attrs}>\n${indent}  ${childrenHTML}\n${indent}</div>`;
			}
			return `<div${attrs}></div>`;
		}

		case 'button':
			return `<button${attrs}>${content}</button>`;

		case 'password': {
			const placeholder = content ? ` placeholder="${content}"` : '';
			const idAttr = element.properties.id ? ` id="${element.properties.id}"` : '';
			return `<input type="password"${idAttr}${placeholder}>`;
		}

		case 'input': {
			const placeholder = content ? ` placeholder="${content}"` : '';
			const idAttr = element.properties.id ? ` id="${element.properties.id}"` : '';
			return `<input type="text"${idAttr}${placeholder}>`;
		}

		case 'img': {
			const src = content || '';
			const idAttr = element.properties.id ? ` id="${element.properties.id}"` : '';
			return `<img src="${src}" alt=""${idAttr}>`;
		}

		case 'line':
			return '<br>';

		case 'link': {
			const href = element.properties.href || '#';
			const idAttr = element.properties.id ? ` id="${element.properties.id}"` : '';
			return `<a href="${href}"${idAttr}>${content}</a>`;
		}

		default:
			return `<!-- Unknown element: ${element.elementType} -->`;
	}
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
