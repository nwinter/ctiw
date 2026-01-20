/**
 * CTIW Lexer - Tokenizes CTIW source code
 *
 * This lexer converts CTIW source code into tokens for the parser.
 * It provides kid-friendly error messages and tracks line/column positions.
 */

/**
 * Token types for the CTIW language
 */
export enum TokenType {
	// Document markers
	CTIW_START = 'CTIW_START', // ==CTIW==
	CTIW_END = 'CTIW_END', // ==CTIW==

	// Double equals for text elements
	DOUBLE_EQUALS = 'DOUBLE_EQUALS', // ==

	// Delimiters
	EQUALS = 'EQUALS', // =
	COLON = 'COLON', // :
	DOT = 'DOT', // . (for indentation)
	LPAREN = 'LPAREN', // (
	RPAREN = 'RPAREN', // )

	// Values
	IDENTIFIER = 'IDENTIFIER', // names like title, divide, button
	NUMBER = 'NUMBER', // numeric values
	HEX_COLOR = 'HEX_COLOR', // 6 character hex color (no #)
	STRING = 'STRING', // text content between delimiters

	// Structure
	NEWLINE = 'NEWLINE', // line breaks
	EOF = 'EOF' // end of file
}

/**
 * Represents a single token in the source code
 */
export interface Token {
	type: TokenType;
	value: string;
	line: number;
	column: number;
}

/**
 * Represents a lexer error with position information
 */
export interface LexerError {
	message: string;
	line: number;
	column: number;
}

/**
 * CTIW Lexer class
 *
 * Converts source code into a stream of tokens.
 * Provides methods for both batch tokenization and streaming.
 */
export class Lexer {
	private source: string;
	private pos: number = 0;
	private line: number = 1;
	private column: number = 1;
	private tokens: Token[] = [];
	private errors: LexerError[] = [];

	// Track context for string parsing
	// This is set true only after the pattern: EQUALS, IDENTIFIER, EQUALS
	// (the primary element/property pattern like =title= or =divide=)
	// It is NOT set after attribute patterns like color= or id:
	private inValueContext: boolean = false;

	// Track if we're at the start of a statement (after newline/dots or at beginning)
	// This helps distinguish =element= from attr= patterns
	private atStatementStart: boolean = true;

	constructor(source: string) {
		this.source = source;
	}

	/**
	 * Tokenize the entire source and return all tokens
	 */
	tokenize(): Token[] {
		this.tokens = [];
		this.errors = [];
		this.pos = 0;
		this.line = 1;
		this.column = 1;
		this.inValueContext = false;
		this.atStatementStart = true;

		while (!this.isAtEndInternal()) {
			this.scanToken();
		}

		this.tokens.push({
			type: TokenType.EOF,
			value: '',
			line: this.line,
			column: this.column
		});

		return this.tokens;
	}

	/**
	 * Get the next token (for streaming/parser use)
	 */
	nextToken(): Token | null {
		if (this.tokens.length === 0) {
			this.tokenize();
		}

		if (this.tokens.length === 0) {
			return null;
		}

		return this.tokens.shift() || null;
	}

	/**
	 * Peek at the next token without consuming it
	 */
	peek(): Token | null {
		if (this.tokens.length === 0) {
			this.tokenize();
		}

		return this.tokens[0] || null;
	}

	/**
	 * Check if we've consumed all tokens
	 */
	isAtEnd(): boolean {
		if (this.tokens.length === 0) {
			this.tokenize();
		}

		return (
			this.tokens.length === 0 || (this.tokens.length === 1 && this.tokens[0].type === TokenType.EOF)
		);
	}

	/**
	 * Get any errors that occurred during tokenization
	 */
	getErrors(): LexerError[] {
		return this.errors;
	}

	/**
	 * Internal check if we've reached end of source
	 */
	private isAtEndInternal(): boolean {
		return this.pos >= this.source.length;
	}

	/**
	 * Get current character
	 */
	private current(): string {
		return this.source[this.pos] || '\0';
	}

	/**
	 * Look ahead n characters
	 */
	private lookAhead(n: number): string {
		return this.source[this.pos + n] || '\0';
	}

	/**
	 * Advance position and return current character
	 */
	private advance(): string {
		const char = this.current();
		this.pos++;
		this.column++;
		return char;
	}

	/**
	 * Check if current position matches a string
	 */
	private match(expected: string): boolean {
		if (this.pos + expected.length > this.source.length) {
			return false;
		}

		for (let i = 0; i < expected.length; i++) {
			if (this.source[this.pos + i] !== expected[i]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Consume a string and advance position
	 */
	private consume(str: string): void {
		for (let i = 0; i < str.length; i++) {
			this.advance();
		}
	}

	/**
	 * Add a token to the list
	 */
	private addToken(type: TokenType, value: string, startColumn: number): void {
		this.tokens.push({
			type,
			value,
			line: this.line,
			column: startColumn
		});
	}

	/**
	 * Add an error with a kid-friendly message
	 */
	private addError(message: string): void {
		this.errors.push({
			message,
			line: this.line,
			column: this.column
		});
	}

	/**
	 * Skip whitespace (but not newlines)
	 */
	private skipWhitespace(): void {
		while (!this.isAtEndInternal()) {
			const char = this.current();
			if (char === ' ' || char === '\t') {
				this.advance();
			} else if (char === '\r' && this.lookAhead(1) === '\n') {
				// Handle CRLF - skip the \r, let \n be handled as newline
				this.advance();
			} else {
				break;
			}
		}
	}

	/**
	 * Scan and emit the next token
	 */
	private scanToken(): void {
		this.skipWhitespace();

		if (this.isAtEndInternal()) {
			return;
		}

		const startColumn = this.column;
		const char = this.current();

		// Check for CTIW markers first (both start and end are ==CTIW==)
		if (this.match('==CTIW==')) {
			this.consume('==CTIW==');
			// Determine if this is start or end based on context
			const hasStart = this.tokens.some((t) => t.type === TokenType.CTIW_START);
			this.addToken(hasStart ? TokenType.CTIW_END : TokenType.CTIW_START, '==CTIW==', startColumn);
			this.inValueContext = false;
			this.atStatementStart = false;
			return;
		}

		// Check for double equals (text element marker)
		if (this.match('==') && !this.match('==CTIW==')) {
			this.consume('==');
			this.addToken(TokenType.DOUBLE_EQUALS, '==', startColumn);
			this.inValueContext = false;
			this.atStatementStart = false;
			return;
		}

		// Single character tokens
		switch (char) {
			case '=':
				this.advance();
				this.addToken(TokenType.EQUALS, '=', startColumn);
				// Track context: check if this is the PRIMARY pattern =identifier=
				this.updateValueContext();
				return;

			case ':':
				this.advance();
				this.addToken(TokenType.COLON, ':', startColumn);
				// After colon (attribute pattern like id:xxx), we're NOT in value context
				this.inValueContext = false;
				this.atStatementStart = false;
				return;

			case '.':
				this.advance();
				this.addToken(TokenType.DOT, '.', startColumn);
				this.inValueContext = false;
				// Dots are indentation, so we're still at "statement start"
				// (the actual element/property comes after dots)
				return;

			case '(':
				this.advance();
				this.addToken(TokenType.LPAREN, '(', startColumn);
				this.inValueContext = false;
				this.atStatementStart = false;
				return;

			case ')':
				this.advance();
				this.addToken(TokenType.RPAREN, ')', startColumn);
				this.inValueContext = false;
				this.atStatementStart = false;
				return;

			case '\n':
				this.advance();
				this.addToken(TokenType.NEWLINE, '\n', startColumn);
				this.line++;
				this.column = 1;
				this.inValueContext = false;
				this.atStatementStart = true; // New line = new statement
				return;
		}

		// Check if we should scan a string (content between = delimiters)
		if (this.shouldScanString()) {
			this.scanString(startColumn);
			return;
		}

		// Alphanumeric tokens (identifier, number, hex color)
		if (this.isAlpha(char)) {
			this.scanIdentifierOrHexColor(startColumn);
			return;
		}

		if (this.isDigit(char)) {
			this.scanNumberOrHexColor(startColumn);
			return;
		}

		// Unknown character - add friendly error and skip
		this.addError(`Oops! I found a character I don't understand: '${char}'. Try using letters, numbers, dots, or equals signs!`);
		this.advance();
	}

	/**
	 * Update context tracking for value parsing
	 *
	 * We enter "value context" only after the PRIMARY pattern: EQUALS, IDENTIFIER, EQUALS
	 * This is the pattern for element/property definitions like =title= or =divide=
	 *
	 * CRITICAL: This pattern only applies when the opening EQUALS was at the start
	 * of a statement. Attribute patterns like color= should NOT trigger value context.
	 */
	private updateValueContext(): void {
		// Check for the pattern: EQUALS, IDENTIFIER, EQUALS (current)
		// tokens[-1] is the EQUALS we just added
		// tokens[-2] should be IDENTIFIER
		// tokens[-3] should be EQUALS (the opening =)
		if (this.tokens.length >= 3) {
			const curr = this.tokens[this.tokens.length - 1]; // EQUALS (just added)
			const prev = this.tokens[this.tokens.length - 2]; // should be IDENTIFIER
			const prevPrev = this.tokens[this.tokens.length - 3]; // should be EQUALS

			if (
				curr.type === TokenType.EQUALS &&
				prev.type === TokenType.IDENTIFIER &&
				prevPrev.type === TokenType.EQUALS
			) {
				// Check if the opening EQUALS was at statement start
				// We need to look at what came before prevPrev
				if (this.tokens.length === 3) {
					// =identifier= at the very start - this is primary pattern
					this.inValueContext = true;
					this.atStatementStart = false;
					return;
				}

				// Check what's before the opening =
				const beforeOpening = this.tokens[this.tokens.length - 4];
				if (
					beforeOpening.type === TokenType.NEWLINE ||
					beforeOpening.type === TokenType.DOT ||
					beforeOpening.type === TokenType.CTIW_START
				) {
					// Opening = was at statement start - this is primary pattern
					this.inValueContext = true;
					this.atStatementStart = false;
					return;
				}

				// Otherwise this is an attribute pattern like color=
			}
		}
		this.inValueContext = false;
		this.atStatementStart = false;
	}

	/**
	 * Determine if we should scan a string value
	 *
	 * We only scan strings when in "value context" (after =identifier= pattern)
	 * AND when the content doesn't look like it starts with attributes.
	 */
	private shouldScanString(): boolean {
		if (!this.inValueContext) {
			return false;
		}

		const char = this.current();

		// If we immediately see =, there's no value (empty value case like =line=)
		if (char === '=') {
			return false;
		}

		// If we immediately see newline, no value
		if (char === '\n') {
			return false;
		}

		// If the first thing we see is an identifier, check if it's followed by : or =
		// If so, it's an attribute pattern, not a value
		if (this.isAlpha(char)) {
			return !this.looksLikeAttribute();
		}

		// If we see something else (like a digit or other char), it could be a value
		// Look for a closing = on this line
		let i = this.pos;
		while (i < this.source.length) {
			const c = this.source[i];
			if (c === '=') {
				return true;
			}
			if (c === '\n') {
				return false;
			}
			i++;
		}

		return false;
	}

	/**
	 * Check if current position looks like an attribute pattern
	 * (identifier followed by : or =VALUE=)
	 *
	 * The key distinction from a value is:
	 * - Attribute: identifier=VALUE= or identifier:VALUE (has content after the = or :)
	 * - Value: VALUE= (the = is just the closing delimiter)
	 */
	private looksLikeAttribute(): boolean {
		let i = this.pos;

		// Scan the identifier
		while (i < this.source.length && this.isAlphaNumericOrHyphen(this.source[i])) {
			i++;
		}

		// Check what follows
		if (i < this.source.length) {
			const next = this.source[i];

			if (next === ':') {
				// identifier:xxx is always an attribute pattern
				return true;
			}

			if (next === '=') {
				// identifier= could be either:
				// - An attribute like color=FF0000=
				// - A value like Hello=
				//
				// Check if there's content after the = (and before another = or newline)
				let j = i + 1;

				// Skip whitespace
				while (j < this.source.length && (this.source[j] === ' ' || this.source[j] === '\t')) {
					j++;
				}

				// If the next thing is =, newline, or end, this is a VALUE (closing =)
				if (j >= this.source.length || this.source[j] === '=' || this.source[j] === '\n') {
					return false;
				}

				// There's content after the =, so this is an attribute
				return true;
			}
		}

		return false;
	}

	/**
	 * Scan a string value (text content between delimiters)
	 *
	 * Reads content until we hit:
	 * - The closing = delimiter
	 * - A space followed by a REAL attribute pattern (id:xxx or attr=VALUE=)
	 * - End of line
	 */
	private scanString(startColumn: number): void {
		let value = '';

		while (!this.isAtEndInternal() && this.current() !== '\n') {
			const char = this.current();

			// Check for closing = that ends the value
			if (char === '=') {
				break;
			}

			// Check for attribute pattern after space
			if (char === ' ' || char === '\t') {
				// Look ahead to see if this is the start of a REAL attribute
				let j = this.pos + 1;
				while (j < this.source.length && (this.source[j] === ' ' || this.source[j] === '\t')) {
					j++;
				}
				if (j < this.source.length && this.isAlpha(this.source[j])) {
					// Scan potential identifier
					let k = j;
					while (k < this.source.length && this.isAlphaNumericOrHyphen(this.source[k])) {
						k++;
					}
					// Check if followed by : (always an attribute) or = with content after
					if (k < this.source.length) {
						if (this.source[k] === ':') {
							// id:xxx pattern - definitely an attribute
							break;
						}
						if (this.source[k] === '=') {
							// identifier= could be attr=VALUE= or just VALUE=
							// Check if there's content after the =
							let m = k + 1;
							while (
								m < this.source.length &&
								(this.source[m] === ' ' || this.source[m] === '\t')
							) {
								m++;
							}
							// If there's content (not = or newline or end), it's an attribute
							if (
								m < this.source.length &&
								this.source[m] !== '=' &&
								this.source[m] !== '\n'
							) {
								break;
							}
							// Otherwise, this is just part of the value (like "World=")
						}
					}
				}
			}

			value += this.advance();
		}

		// Trim trailing whitespace
		value = value.trim();

		if (value.length > 0) {
			this.addToken(TokenType.STRING, value, startColumn);
		}

		this.inValueContext = false;
	}

	/**
	 * Scan an identifier or hex color
	 */
	private scanIdentifierOrHexColor(startColumn: number): void {
		let value = '';

		while (!this.isAtEndInternal() && this.isAlphaNumericOrHyphen(this.current())) {
			value += this.advance();
		}

		// Check if it's a valid hex color (exactly 6 hex digits)
		if (value.length === 6 && this.isValidHexColor(value)) {
			this.addToken(TokenType.HEX_COLOR, value, startColumn);
		} else {
			this.addToken(TokenType.IDENTIFIER, value, startColumn);
		}

		this.inValueContext = false;
	}

	/**
	 * Scan a number or hex color
	 */
	private scanNumberOrHexColor(startColumn: number): void {
		let value = '';

		// Collect all alphanumeric characters (to handle hex colors like 00FF00)
		while (!this.isAtEndInternal() && this.isHexDigit(this.current())) {
			value += this.advance();
		}

		// Check if it's a valid hex color (exactly 6 hex digits)
		if (value.length === 6 && this.isValidHexColor(value)) {
			this.addToken(TokenType.HEX_COLOR, value, startColumn);
		} else {
			this.addToken(TokenType.NUMBER, value, startColumn);
		}

		this.inValueContext = false;
	}

	/**
	 * Check if a string is a valid hex color
	 */
	private isValidHexColor(str: string): boolean {
		if (str.length !== 6) return false;
		return /^[0-9A-Fa-f]{6}$/.test(str);
	}

	/**
	 * Check if character is a letter
	 */
	private isAlpha(char: string): boolean {
		return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
	}

	/**
	 * Check if character is a digit
	 */
	private isDigit(char: string): boolean {
		return char >= '0' && char <= '9';
	}

	/**
	 * Check if character is a hex digit
	 */
	private isHexDigit(char: string): boolean {
		return (
			this.isDigit(char) ||
			(char >= 'a' && char <= 'f') ||
			(char >= 'A' && char <= 'F')
		);
	}

	/**
	 * Check if character is alphanumeric or hyphen/underscore
	 */
	private isAlphaNumericOrHyphen(char: string): boolean {
		return this.isAlpha(char) || this.isDigit(char) || char === '-' || char === '_';
	}
}

/**
 * Helper function to tokenize source code
 */
export function tokenize(source: string): { tokens: Token[]; errors: LexerError[] } {
	const lexer = new Lexer(source);
	const tokens = lexer.tokenize();
	return { tokens, errors: lexer.getErrors() };
}
