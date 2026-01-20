/**
 * CTIW Abstract Syntax Tree (AST) Types
 *
 * This module defines the TypeScript types for the CTIW language AST.
 * The AST is designed to be:
 * - Type-safe using discriminated unions
 * - Visitor pattern friendly for easy traversal
 * - Complete with source location info for error reporting
 *
 * @module parser/ast
 */

// =============================================================================
// Source Location
// =============================================================================

/**
 * Represents a position in the source code.
 * Line and column are 1-indexed (first line is 1, first column is 1).
 */
export interface SourcePosition {
	/** Line number (1-indexed) */
	line: number;
	/** Column number (1-indexed) */
	column: number;
}

/**
 * Represents a range in the source code from start to end.
 * Used for precise error messages and source mapping.
 */
export interface SourceLocation {
	/** Starting position of the node */
	start: SourcePosition;
	/** Ending position of the node */
	end: SourcePosition;
	/** Optional: the original source text for this node */
	source?: string;
}

// =============================================================================
// Base Node
// =============================================================================

/**
 * Base interface for all AST nodes.
 * Every node has a type discriminator and location information.
 */
export interface BaseNode {
	/** Discriminator for the node type */
	type: string;
	/** Source location for error reporting */
	location: SourceLocation;
}

// =============================================================================
// Element Types
// =============================================================================

/**
 * All valid CTIW element types.
 * These map to HTML elements during code generation.
 */
export type CTIWElementType =
	| 'title' // Page or section title -> <h1>, <title>
	| 'text' // Regular text -> <p>, <span>
	| 'line' // Line break -> <br> or <hr>
	| 'button' // Clickable button -> <button>
	| 'password' // Password input -> <input type="password">
	| 'input' // Text input -> <input type="text">
	| 'divide' // Container -> <div>
	| 'img' // Image -> <img>
	| 'link'; // Hyperlink -> <a>

/**
 * Position/alignment values for the 'in' property.
 */
export type PositionValue = 'left' | 'middle' | 'center' | 'right';

/**
 * Visibility values for the 'outline' property.
 */
export type VisibilityValue = 'visible' | 'invisible';

// =============================================================================
// Property Values
// =============================================================================

/**
 * Represents a property value which can be various types.
 */
export type PropertyValue = string | number | boolean | null;

/**
 * Common element properties that can appear on any element.
 */
export interface ElementProperties {
	/** Element ID (from id:name syntax) */
	id?: string;
	/** Color value (6-character hex without #) */
	color?: string;
	/** Outline visibility */
	outline?: VisibilityValue;
	/** Size value */
	size?: number;
	/** Position/alignment */
	in?: PositionValue;
	/** Additional arbitrary properties */
	[key: string]: PropertyValue | undefined;
}

// =============================================================================
// AST Node Types
// =============================================================================

/**
 * Document node - the root of every CTIW AST.
 *
 * @example
 * // For: =CTIW= ... ==CTIW==
 * {
 *   type: 'Document',
 *   children: [...],
 *   metadata: { title: 'My Page', language: 'english', fontSize: 20 }
 * }
 */
export interface DocumentNode extends BaseNode {
	type: 'Document';
	/** Child nodes (elements, properties at root level) */
	children: CTIWNode[];
	/** Document-level metadata extracted from top-level properties */
	metadata: DocumentMetadata;
}

/**
 * Document metadata extracted from top-level properties.
 */
export interface DocumentMetadata {
	/** Document title from =title=...= at root level */
	title?: string;
	/** Language setting from =language=...= */
	language?: string;
	/** Font size from =font-size=...= */
	fontSize?: number;
}

/**
 * Property node - represents a =name=value= property declaration.
 *
 * @example
 * // For: =font-size=20=
 * {
 *   type: 'Property',
 *   name: 'font-size',
 *   value: 20
 * }
 */
export interface PropertyNode extends BaseNode {
	type: 'Property';
	/** Property name (e.g., 'title', 'language', 'font-size') */
	name: string;
	/** Property value (string, number, or null if empty) */
	value: PropertyValue;
}

/**
 * Element node - represents a CTIW element like divide, button, text, etc.
 *
 * @example
 * // For: =divide= id:main= color=FF0000=
 * {
 *   type: 'Element',
 *   elementType: 'divide',
 *   properties: { id: 'main', color: 'FF0000' },
 *   children: [],
 *   content: null
 * }
 *
 * @example
 * // For: =text=Hello World!=
 * {
 *   type: 'Element',
 *   elementType: 'text',
 *   properties: {},
 *   children: [],
 *   content: 'Hello World!'
 * }
 */
export interface ElementNode extends BaseNode {
	type: 'Element';
	/** The type of element (divide, button, text, etc.) */
	elementType: CTIWElementType;
	/** Element properties (id, color, outline, etc.) */
	properties: ElementProperties;
	/** Child nodes (only for container elements like divide) */
	children: CTIWNode[];
	/** Text content for elements like text, title, button */
	content: string | null;
	/** Indentation level (number of dots) */
	indent: number;
	/** Whether this is a closing tag (for divide) */
	isClosing?: boolean;
}

/**
 * Special node - represents special elements like (time).
 *
 * @example
 * // For: =(time)=
 * {
 *   type: 'Special',
 *   specialType: 'time'
 * }
 */
export interface SpecialNode extends BaseNode {
	type: 'Special';
	/** The type of special element */
	specialType: SpecialElementType;
}

/**
 * Valid special element types.
 */
export type SpecialElementType = 'time';

/**
 * Comment node - for future support of comments in CTIW.
 * Not currently in the spec but useful for extensibility.
 */
export interface CommentNode extends BaseNode {
	type: 'Comment';
	/** Comment text */
	text: string;
}

/**
 * Error node - represents a parse error in the AST.
 * Allows partial parsing to continue even with errors.
 */
export interface ErrorNode extends BaseNode {
	type: 'Error';
	/** Error message */
	message: string;
	/** The problematic source text */
	sourceText: string;
}

// =============================================================================
// Union Types
// =============================================================================

/**
 * Union of all valid CTIW AST node types.
 * Uses discriminated union on the 'type' field.
 */
export type CTIWNode =
	| DocumentNode
	| PropertyNode
	| ElementNode
	| SpecialNode
	| CommentNode
	| ErrorNode;

/**
 * Nodes that can appear as children of a document or element.
 */
export type CTIWChildNode = PropertyNode | ElementNode | SpecialNode | CommentNode | ErrorNode;

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard for DocumentNode.
 */
export function isDocumentNode(node: CTIWNode): node is DocumentNode {
	return node.type === 'Document';
}

/**
 * Type guard for PropertyNode.
 */
export function isPropertyNode(node: CTIWNode): node is PropertyNode {
	return node.type === 'Property';
}

/**
 * Type guard for ElementNode.
 */
export function isElementNode(node: CTIWNode): node is ElementNode {
	return node.type === 'Element';
}

/**
 * Type guard for SpecialNode.
 */
export function isSpecialNode(node: CTIWNode): node is SpecialNode {
	return node.type === 'Special';
}

/**
 * Type guard for CommentNode.
 */
export function isCommentNode(node: CTIWNode): node is CommentNode {
	return node.type === 'Comment';
}

/**
 * Type guard for ErrorNode.
 */
export function isErrorNode(node: CTIWNode): node is ErrorNode {
	return node.type === 'Error';
}

/**
 * Check if an element type is a container (can have children).
 */
export function isContainerElement(elementType: CTIWElementType): boolean {
	return elementType === 'divide';
}

/**
 * Check if an element type accepts text content.
 */
export function isTextElement(elementType: CTIWElementType): boolean {
	const textElements: CTIWElementType[] = ['title', 'text', 'button', 'link'];
	return textElements.indexOf(elementType) !== -1;
}

// =============================================================================
// Visitor Pattern Support
// =============================================================================

/**
 * Visitor interface for traversing the AST.
 * Implement this interface to create custom AST traversals.
 *
 * @example
 * const myVisitor: CTIWVisitor = {
 *   visitDocument(node) { console.log('Document:', node); },
 *   visitElement(node) { console.log('Element:', node.elementType); },
 *   // ... other visit methods
 * };
 */
export interface CTIWVisitor<T = void> {
	visitDocument?(node: DocumentNode): T;
	visitProperty?(node: PropertyNode): T;
	visitElement?(node: ElementNode): T;
	visitSpecial?(node: SpecialNode): T;
	visitComment?(node: CommentNode): T;
	visitError?(node: ErrorNode): T;
}

/**
 * Walk the AST and call the appropriate visitor method for each node.
 *
 * @param node - The node to visit
 * @param visitor - The visitor object with visit methods
 * @returns The result of the visit method, if any
 */
export function visit<T>(node: CTIWNode, visitor: CTIWVisitor<T>): T | undefined {
	switch (node.type) {
		case 'Document':
			return visitor.visitDocument?.(node);
		case 'Property':
			return visitor.visitProperty?.(node);
		case 'Element':
			return visitor.visitElement?.(node);
		case 'Special':
			return visitor.visitSpecial?.(node);
		case 'Comment':
			return visitor.visitComment?.(node);
		case 'Error':
			return visitor.visitError?.(node);
	}
}

/**
 * Walk the entire AST tree, visiting all nodes depth-first.
 *
 * @param node - The root node to start from
 * @param visitor - The visitor object with visit methods
 */
export function walkTree(node: CTIWNode, visitor: CTIWVisitor): void {
	visit(node, visitor);

	// Visit children if this node has them
	if (isDocumentNode(node) || isElementNode(node)) {
		for (const child of node.children) {
			walkTree(child, visitor);
		}
	}
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create a default source location (useful for generated nodes).
 */
export function createDefaultLocation(): SourceLocation {
	return {
		start: { line: 0, column: 0 },
		end: { line: 0, column: 0 }
	};
}

/**
 * Create a source location from line/column values.
 */
export function createLocation(
	startLine: number,
	startColumn: number,
	endLine: number,
	endColumn: number
): SourceLocation {
	return {
		start: { line: startLine, column: startColumn },
		end: { line: endLine, column: endColumn }
	};
}

/**
 * Create a DocumentNode with defaults.
 */
export function createDocument(
	children: CTIWNode[] = [],
	metadata: DocumentMetadata = {},
	location: SourceLocation = createDefaultLocation()
): DocumentNode {
	return {
		type: 'Document',
		children,
		metadata,
		location
	};
}

/**
 * Create a PropertyNode.
 */
export function createProperty(
	name: string,
	value: PropertyValue,
	location: SourceLocation = createDefaultLocation()
): PropertyNode {
	return {
		type: 'Property',
		name,
		value,
		location
	};
}

/**
 * Create an ElementNode.
 */
export function createElement(
	elementType: CTIWElementType,
	options: {
		properties?: ElementProperties;
		children?: CTIWNode[];
		content?: string | null;
		indent?: number;
		isClosing?: boolean;
		location?: SourceLocation;
	} = {}
): ElementNode {
	return {
		type: 'Element',
		elementType,
		properties: options.properties ?? {},
		children: options.children ?? [],
		content: options.content ?? null,
		indent: options.indent ?? 0,
		isClosing: options.isClosing,
		location: options.location ?? createDefaultLocation()
	};
}

/**
 * Create a SpecialNode.
 */
export function createSpecial(
	specialType: SpecialElementType,
	location: SourceLocation = createDefaultLocation()
): SpecialNode {
	return {
		type: 'Special',
		specialType,
		location
	};
}

/**
 * Create a CommentNode.
 */
export function createComment(
	text: string,
	location: SourceLocation = createDefaultLocation()
): CommentNode {
	return {
		type: 'Comment',
		text,
		location
	};
}

/**
 * Create an ErrorNode for parse errors.
 */
export function createError(
	message: string,
	sourceText: string,
	location: SourceLocation = createDefaultLocation()
): ErrorNode {
	return {
		type: 'Error',
		message,
		sourceText,
		location
	};
}

// =============================================================================
// Constants
// =============================================================================

/**
 * All valid element type names.
 */
export const ELEMENT_TYPES: readonly CTIWElementType[] = [
	'title',
	'text',
	'line',
	'button',
	'password',
	'input',
	'divide',
	'img',
	'link'
] as const;

/**
 * All valid special element type names.
 */
export const SPECIAL_TYPES: readonly SpecialElementType[] = ['time'] as const;

/**
 * Check if a string is a valid element type.
 */
export function isValidElementType(name: string): name is CTIWElementType {
	return (ELEMENT_TYPES as readonly string[]).indexOf(name) !== -1;
}

/**
 * Check if a string is a valid special type.
 */
export function isValidSpecialType(name: string): name is SpecialElementType {
	return (SPECIAL_TYPES as readonly string[]).indexOf(name) !== -1;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get all errors from an AST.
 * Useful for collecting all parse errors for display.
 */
export function collectErrors(node: CTIWNode): ErrorNode[] {
	const errors: ErrorNode[] = [];

	walkTree(node, {
		visitError(errorNode) {
			errors.push(errorNode);
		}
	});

	return errors;
}

/**
 * Check if an AST has any errors.
 */
export function hasErrors(node: CTIWNode): boolean {
	return collectErrors(node).length > 0;
}

/**
 * Pretty-print an AST node for debugging.
 */
export function astToString(node: CTIWNode, indent = 0): string {
	const spaces = '  ';
	let pad = '';
	for (let i = 0; i < indent; i++) {
		pad += spaces;
	}

	switch (node.type) {
		case 'Document':
			return (
				`${pad}Document {\n` +
				`${pad}  metadata: ${JSON.stringify(node.metadata)}\n` +
				`${pad}  children: [\n` +
				node.children.map((c) => astToString(c, indent + 2)).join('\n') +
				`\n${pad}  ]\n` +
				`${pad}}`
			);

		case 'Element':
			return (
				`${pad}Element<${node.elementType}> {\n` +
				(node.content ? `${pad}  content: "${node.content}"\n` : '') +
				`${pad}  properties: ${JSON.stringify(node.properties)}\n` +
				`${pad}  indent: ${node.indent}\n` +
				(node.children.length > 0
					? `${pad}  children: [\n` +
						node.children.map((c) => astToString(c, indent + 2)).join('\n') +
						`\n${pad}  ]\n`
					: '') +
				`${pad}}`
			);

		case 'Property':
			return `${pad}Property { name: "${node.name}", value: ${JSON.stringify(node.value)} }`;

		case 'Special':
			return `${pad}Special<${node.specialType}>`;

		case 'Comment':
			return `${pad}Comment { text: "${node.text}" }`;

		case 'Error':
			return `${pad}Error { message: "${node.message}", source: "${node.sourceText}" }`;

		default:
			return `${pad}Unknown`;
	}
}

// =============================================================================
// Backward Compatibility Type Aliases
// =============================================================================

/**
 * @deprecated Use CTIWElementType instead
 * Legacy element type alias for backward compatibility with parser.ts
 */
export type ElementType = CTIWElementType | 'time';

/**
 * @deprecated Use ElementProperties instead
 * Legacy property type for backward compatibility with codegen.ts
 */
export interface Property {
	name: string;
	value: string | number | boolean;
}

/**
 * @deprecated Use ElementNode instead
 * Legacy element type alias for backward compatibility with codegen.ts
 */
export interface CTIWElement {
	type: 'element';
	elementType: CTIWElementType | 'time';
	content?: string;
	properties: Property[];
	children: CTIWElement[];
	line?: number;
	column?: number;
}

/**
 * @deprecated Use PropertyNode instead
 * Legacy document property type for backward compatibility with codegen.ts
 */
export interface CTIWProperty {
	type: 'property';
	name: string;
	value: string | number;
	line?: number;
	column?: number;
}

/**
 * @deprecated Use DocumentNode instead
 * Legacy document type alias for backward compatibility with codegen.ts
 */
export interface CTIWDocument {
	type: 'document';
	properties: CTIWProperty[];
	body: CTIWElement[];
}

/**
 * Convert a new-style ElementNode to legacy CTIWElement format.
 * Useful during migration from old AST to new AST.
 */
export function toLegacyElement(node: ElementNode): CTIWElement {
	const properties: Property[] = [];

	// Convert ElementProperties to Property[]
	for (const [key, value] of Object.entries(node.properties)) {
		if (value !== undefined && value !== null) {
			properties.push({ name: key, value: value as string | number | boolean });
		}
	}

	return {
		type: 'element',
		elementType: node.elementType,
		content: node.content ?? undefined,
		properties,
		children: node.children.filter(isElementNode).map(toLegacyElement)
	};
}

/**
 * Convert a new-style DocumentNode to legacy CTIWDocument format.
 * Useful during migration from old AST to new AST.
 */
export function toLegacyDocument(doc: DocumentNode): CTIWDocument {
	const properties: CTIWProperty[] = [];
	const body: CTIWElement[] = [];

	// Extract metadata as properties
	if (doc.metadata.title) {
		properties.push({ type: 'property', name: 'title', value: doc.metadata.title });
	}
	if (doc.metadata.language) {
		properties.push({ type: 'property', name: 'language', value: doc.metadata.language });
	}
	if (doc.metadata.fontSize) {
		properties.push({ type: 'property', name: 'font-size', value: doc.metadata.fontSize });
	}

	// Convert children
	for (const child of doc.children) {
		if (isPropertyNode(child)) {
			properties.push({
				type: 'property',
				name: child.name,
				value: child.value as string | number
			});
		} else if (isElementNode(child)) {
			body.push(toLegacyElement(child));
		} else if (isSpecialNode(child)) {
			// Convert special nodes to elements for legacy format
			body.push({
				type: 'element',
				elementType: child.specialType as 'time',
				properties: [],
				children: []
			});
		}
	}

	return {
		type: 'document',
		properties,
		body
	};
}

// =============================================================================
// Legacy Factory Functions (for parser.ts compatibility)
// =============================================================================

/**
 * @deprecated Use createProperty instead
 * Legacy factory for document properties used by parser.ts
 */
export function createDocProperty(name: string, value: string | number): CTIWProperty {
	return {
		type: 'property',
		name,
		value
	};
}

/**
 * @deprecated Use createElement with options instead
 * Legacy factory for creating elements in old format used by parser.ts
 *
 * This overloaded function supports both the new signature:
 *   createElement(elementType, options?)
 * And the legacy signature:
 *   createElement(elementType, content?, properties?, children?)
 */
export function createLegacyElement(
	elementType: ElementType,
	content?: string,
	properties: Property[] = [],
	children: CTIWElement[] = []
): CTIWElement {
	return {
		type: 'element',
		elementType,
		content,
		properties,
		children
	};
}

/**
 * @deprecated Use createDocument with new signature instead
 * Legacy factory for creating documents in old format used by parser.ts
 */
export function createLegacyDocument(
	properties: CTIWProperty[] = [],
	body: CTIWElement[] = []
): CTIWDocument {
	return {
		type: 'document',
		properties,
		body
	};
}
