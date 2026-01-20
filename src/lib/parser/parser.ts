/**
 * CTIW Parser
 *
 * Parses CTIW source code into an AST (Abstract Syntax Tree).
 * Uses a simple line-based parsing approach suitable for the CTIW language.
 */

import type {
	DocumentNode,
	ElementNode,
	PropertyNode,
	SpecialNode,
	CTIWNode,
	CTIWElementType,
	DocumentMetadata,
	ElementProperties
} from './ast';
import {
	createDocument,
	createProperty,
	createElement,
	createSpecial,
	createError,
	createLocation,
	isValidElementType,
	ELEMENT_TYPES
} from './ast';

/** Error information for parse errors */
export interface ParseError {
	message: string;
	line: number;
	column?: number;
}

/** Extended document type that includes errors */
export interface ParseResult {
	document: DocumentNode;
	errors: ParseError[];
}

/** Document-level properties (go in metadata, not body) */
const DOC_PROPERTIES: Set<string> = new Set(['language', 'font-size']);

/**
 * Parse CTIW source code into an AST
 * @param source The CTIW source code
 * @returns The parsed document AST and any errors
 */
export function parse(source: string): ParseResult {
	const parser = new Parser(source);
	return parser.parse();
}

/**
 * Internal parser class
 */
class Parser {
	private lines: string[];
	private currentLine: number = 0;
	private errors: ParseError[] = [];
	private metadata: DocumentMetadata = {};
	private body: CTIWNode[] = [];

	constructor(source: string) {
		// Split into lines, preserving empty lines for line number tracking
		this.lines = source.split('\n');
	}

	/**
	 * Main parse entry point
	 */
	parse(): ParseResult {
		// Parse header
		if (!this.parseHeader()) {
			this.addError("Oops! Your CTIW code needs to start with =CTIW=");
		}

		// Parse body content
		this.parseBody();

		// Parse footer
		if (!this.parseFooter()) {
			this.addError("Don't forget to end your code with ==CTIW==");
		}

		const document = createDocument(
			this.body,
			this.metadata,
			createLocation(1, 1, this.lines.length, 1)
		);

		return {
			document,
			errors: this.errors
		};
	}

	/**
	 * Parse the =CTIW= header
	 */
	private parseHeader(): boolean {
		// Skip empty lines at the start
		this.skipEmptyLines();

		if (this.currentLine >= this.lines.length) {
			return false;
		}

		const line = this.lines[this.currentLine].trim();
		if (line === '=CTIW=') {
			this.currentLine++;
			return true;
		}
		return false;
	}

	/**
	 * Parse the ==CTIW== footer
	 */
	private parseFooter(): boolean {
		// Skip empty lines
		this.skipEmptyLines();

		if (this.currentLine >= this.lines.length) {
			return false;
		}

		const line = this.lines[this.currentLine].trim();
		if (line === '==CTIW==') {
			this.currentLine++;
			return true;
		}
		return false;
	}

	/**
	 * Parse the body content between header and footer
	 */
	private parseBody(): void {
		// Stack to track open containers and their indentation levels
		const containerStack: { element: ElementNode; indent: number }[] = [];

		while (this.currentLine < this.lines.length) {
			const rawLine = this.lines[this.currentLine];
			const trimmedLine = rawLine.trim();

			// Check for footer
			if (trimmedLine === '==CTIW==') {
				break;
			}

			// Skip empty lines
			if (trimmedLine === '') {
				this.currentLine++;
				continue;
			}

			// Parse indentation (count leading dots)
			const { indent, content } = this.parseIndentation(rawLine);

			// Check for closing divide (bare =divide= at same or lower indent level)
			// A closing divide is one without any attributes/content
			if (content === '=divide=' && containerStack.length > 0) {
				// This is a closing divide - pop the most recent container
				containerStack.pop();
				this.currentLine++;
				continue;
			}

			// Try to parse as a statement
			const parsed = this.parseStatement(content, this.currentLine + 1);

			if (parsed) {
				// Find the appropriate parent based on indentation
				while (
					containerStack.length > 0 &&
					containerStack[containerStack.length - 1].indent >= indent
				) {
					// If we're at same or lower indent, pop containers
					// But only pop if it's truly closed (for divides this happens with =divide=)
					if (containerStack[containerStack.length - 1].element.elementType !== 'divide') {
						containerStack.pop();
					} else {
						break;
					}
				}

				if (parsed.type === 'Property') {
					// Document-level property - store in metadata
					const prop = parsed as PropertyNode;
					if (prop.name === 'language') {
						this.metadata.language = String(prop.value);
					} else if (prop.name === 'font-size') {
						this.metadata.fontSize = Number(prop.value);
					} else if (prop.name === 'title') {
						this.metadata.title = String(prop.value);
					}
				} else if (parsed.type === 'Element' || parsed.type === 'Special') {
					// Add to appropriate parent
					if (containerStack.length > 0 && indent > 0) {
						const parent = containerStack[containerStack.length - 1].element;
						parent.children.push(parsed);
					} else {
						this.body.push(parsed);
					}

					// If this is a container (divide), push it onto the stack
					if (parsed.type === 'Element' && parsed.elementType === 'divide') {
						containerStack.push({ element: parsed as ElementNode, indent });
					}
				}
			}

			this.currentLine++;
		}
	}

	/**
	 * Parse indentation dots from a line
	 */
	private parseIndentation(line: string): { indent: number; content: string } {
		// First trim leading spaces
		const spaceTrimmed = line.trimStart();

		// Count leading dots
		let dots = 0;
		while (dots < spaceTrimmed.length && spaceTrimmed[dots] === '.') {
			dots++;
		}

		// Each pair of dots is one level
		const indent = Math.floor(dots / 2);
		const content = spaceTrimmed.slice(dots).trim();

		return { indent, content };
	}

	/**
	 * Parse a single statement (property or element)
	 */
	private parseStatement(
		line: string,
		lineNumber: number
	): PropertyNode | ElementNode | SpecialNode | null {
		if (!line.startsWith('=')) {
			// Not a valid statement
			this.addError(`Hmm, I don't understand this line. Lines should start with =`, lineNumber);
			return null;
		}

		// Check for special element like =(time)=
		if (line.startsWith('=(') && line.includes(')=')) {
			return this.parseSpecialElement(line, lineNumber);
		}

		// Parse as property or element
		return this.parsePropertyOrElement(line, lineNumber);
	}

	/**
	 * Parse a special element like =(time)=
	 */
	private parseSpecialElement(line: string, lineNumber: number): SpecialNode | null {
		const match = line.match(/^=\((\w+)\)=$/);
		if (match) {
			const specialType = match[1].toLowerCase();
			if (specialType === 'time') {
				return createSpecial('time', createLocation(lineNumber, 1, lineNumber, line.length));
			}
		}
		this.addError(`I don't know this special element`, lineNumber);
		return null;
	}

	/**
	 * Parse a property or element line
	 */
	private parsePropertyOrElement(
		line: string,
		lineNumber: number
	): PropertyNode | ElementNode | null {
		// Remove leading =
		const rest = line.slice(1);

		// Find the element/property name (up to next =)
		const nameEnd = rest.indexOf('=');
		if (nameEnd === -1) {
			this.addError(`Expected = after the name`, lineNumber);
			return null;
		}

		const name = rest.slice(0, nameEnd).trim().toLowerCase();
		const remaining = rest.slice(nameEnd + 1);

		// Check if this is a document property (not title - that's both)
		if (DOC_PROPERTIES.has(name)) {
			return this.parseDocProperty(name, remaining, lineNumber);
		}

		// Title is special - it can be both an element and a doc property
		// Store in metadata (only if not already set - first title wins) AND create a title element
		if (name === 'title') {
			// Extract the content value for metadata (only set if not already set)
			if (!this.metadata.title) {
				const valueEnd = remaining.indexOf('=');
				const value = valueEnd !== -1 ? remaining.slice(0, valueEnd).trim() : remaining.trim();
				this.metadata.title = value;
			}

			// Also create a title element
			return this.parseElement('title', remaining, lineNumber);
		}

		// Check if this is a known element type
		if (isValidElementType(name)) {
			return this.parseElement(name as CTIWElementType, remaining, lineNumber);
		}

		// Unknown element/property
		this.addError(`Hmm, I don't know what '${name}' is. Try: ${ELEMENT_TYPES.join(', ')}`, lineNumber);
		return null;
	}

	/**
	 * Parse a document-level property
	 */
	private parseDocProperty(name: string, remaining: string, lineNumber: number): PropertyNode {
		// Find the value (up to the closing =)
		let value: string | number = '';
		const valueEnd = remaining.indexOf('=');
		if (valueEnd !== -1) {
			value = remaining.slice(0, valueEnd).trim();
		} else {
			value = remaining.trim();
		}

		// Try to parse as number
		const numVal = Number(value);
		if (!isNaN(numVal) && value !== '') {
			value = numVal;
		}

		return createProperty(name, value, createLocation(lineNumber, 1, lineNumber, remaining.length));
	}

	/**
	 * Parse an element
	 */
	private parseElement(
		elementType: CTIWElementType,
		remaining: string,
		lineNumber: number
	): ElementNode {
		let content: string | null = null;
		const properties: ElementProperties = {};

		// Parse the remaining part of the line
		if (remaining === '') {
			// Just =element=, no content or properties
			return createElement(elementType, {
				properties,
				content,
				indent: 0,
				location: createLocation(lineNumber, 1, lineNumber, 1)
			});
		}

		// The format can be:
		// 1. " id:main=" - no content, properties only (starts with space)
		// 2. "content=" - content only, ends with =
		// 3. "content= id:main=" - content followed by properties

		// If remaining starts with space, there's no content - just properties
		if (remaining.startsWith(' ')) {
			const propsStr = remaining.trim();
			if (propsStr) {
				const propParts = this.tokenizeElementLine(propsStr);
				for (const part of propParts) {
					const [propName, propValue] = this.parseAttribute(part);
					if (propName) {
						properties[propName] = propValue;
					}
				}
			}
			return createElement(elementType, {
				properties,
				content: null,
				indent: 0,
				location: createLocation(lineNumber, 1, lineNumber, remaining.length)
			});
		}

		// There's content - find where it ends (first = followed by space or end)
		let contentEnd = -1;
		for (let i = 0; i < remaining.length; i++) {
			if (remaining[i] === '=') {
				// Check if this = is followed by a space or is at end
				if (i === remaining.length - 1 || remaining[i + 1] === ' ') {
					contentEnd = i;
					break;
				}
			}
		}

		if (contentEnd !== -1) {
			content = remaining.slice(0, contentEnd).trim();
			// Get the part after the content (properties)
			const propsStr = remaining.slice(contentEnd + 1).trim();

			if (propsStr) {
				// Parse properties - they're space-separated
				const propParts = this.tokenizeElementLine(propsStr);
				for (const part of propParts) {
					const [propName, propValue] = this.parseAttribute(part);
					if (propName) {
						properties[propName] = propValue;
					}
				}
			}
		} else {
			// No = found - the whole thing is content without closing =
			content = remaining.trim();
		}

		// Handle empty content
		if (content === '') {
			content = '';
		}

		return createElement(elementType, {
			properties,
			content,
			indent: 0,
			location: createLocation(lineNumber, 1, lineNumber, remaining.length)
		});
	}

	/**
	 * Tokenize the element line into parts
	 */
	private tokenizeElementLine(line: string): string[] {
		const parts: string[] = [];
		let current = '';
		let i = 0;

		while (i < line.length) {
			const char = line[i];

			if (char === ' ') {
				if (current.trim()) {
					parts.push(current.trim());
				}
				current = '';
				i++;
				continue;
			}

			current += char;
			i++;
		}

		if (current.trim()) {
			parts.push(current.trim());
		}

		return parts;
	}

	/**
	 * Parse an attribute like id:name or color=FF0000
	 */
	private parseAttribute(part: string): [string | null, string] {
		// Remove trailing = if present
		if (part.endsWith('=')) {
			part = part.slice(0, -1);
		}

		// Check for colon syntax (id:name)
		if (part.includes(':')) {
			const [name, value] = part.split(':', 2);
			return [name.trim(), value.trim()];
		}

		// Check for equals syntax (color=FF0000)
		if (part.includes('=')) {
			const [name, value] = part.split('=', 2);
			return [name.trim(), value.trim()];
		}

		return [null, ''];
	}

	/**
	 * Skip empty lines
	 */
	private skipEmptyLines(): void {
		while (this.currentLine < this.lines.length && this.lines[this.currentLine].trim() === '') {
			this.currentLine++;
		}
	}

	/**
	 * Add an error
	 */
	private addError(message: string, line?: number): void {
		this.errors.push({
			message,
			line: line ?? this.currentLine + 1
		});
	}
}
