import { describe, it, expect } from 'vitest';
import {
	Lexer,
	TokenType,
	type Token,
	type LexerError
} from '$lib/parser/lexer';

describe('Lexer', () => {
	describe('Token Types', () => {
		it('should tokenize CTIW_START marker', () => {
			const lexer = new Lexer('=CTIW=');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.CTIW_START,
				value: '=CTIW=',
				line: 1,
				column: 1
			});
		});

		it('should tokenize CTIW_END marker', () => {
			const lexer = new Lexer('==CTIW==');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.CTIW_END,
				value: '==CTIW==',
				line: 1,
				column: 1
			});
		});

		it('should tokenize EQUALS sign', () => {
			const lexer = new Lexer('=');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.EQUALS,
				value: '=',
				line: 1,
				column: 1
			});
		});

		it('should tokenize IDENTIFIER', () => {
			const lexer = new Lexer('title');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.IDENTIFIER,
				value: 'title',
				line: 1,
				column: 1
			});
		});

		it('should tokenize IDENTIFIER with hyphens and underscores', () => {
			const lexer = new Lexer('font-size my_var');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.IDENTIFIER,
				value: 'font-size'
			});
			expect(tokens[1]).toMatchObject({
				type: TokenType.IDENTIFIER,
				value: 'my_var'
			});
		});

		it('should tokenize COLON', () => {
			const lexer = new Lexer(':');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.COLON,
				value: ':',
				line: 1,
				column: 1
			});
		});

		it('should tokenize NUMBER', () => {
			const lexer = new Lexer('123');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.NUMBER,
				value: '123',
				line: 1,
				column: 1
			});
		});

		it('should tokenize HEX_COLOR (6 hex digits)', () => {
			const lexer = new Lexer('FF0000');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.HEX_COLOR,
				value: 'FF0000',
				line: 1,
				column: 1
			});
		});

		it('should tokenize lowercase hex colors', () => {
			const lexer = new Lexer('ff00aa');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.HEX_COLOR,
				value: 'ff00aa'
			});
		});

		it('should tokenize mixed case hex colors', () => {
			const lexer = new Lexer('BAF2Y9');
			const tokens = lexer.tokenize();

			// BAF2Y9 has Y which is not hex, so this should be an IDENTIFIER
			expect(tokens[0]).toMatchObject({
				type: TokenType.IDENTIFIER,
				value: 'BAF2Y9'
			});
		});

		it('should tokenize valid hex color AbCdEf', () => {
			const lexer = new Lexer('AbCdEf');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.HEX_COLOR,
				value: 'AbCdEf'
			});
		});

		it('should tokenize DOT for indentation', () => {
			const lexer = new Lexer('.');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.DOT,
				value: '.',
				line: 1,
				column: 1
			});
		});

		it('should tokenize multiple DOTs', () => {
			const lexer = new Lexer('..');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({ type: TokenType.DOT, value: '.' });
			expect(tokens[1]).toMatchObject({ type: TokenType.DOT, value: '.' });
		});

		it('should tokenize LPAREN', () => {
			const lexer = new Lexer('(');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.LPAREN,
				value: '(',
				line: 1,
				column: 1
			});
		});

		it('should tokenize RPAREN', () => {
			const lexer = new Lexer(')');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.RPAREN,
				value: ')',
				line: 1,
				column: 1
			});
		});

		it('should tokenize NEWLINE', () => {
			const lexer = new Lexer('\n');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.NEWLINE,
				value: '\n',
				line: 1,
				column: 1
			});
		});

		it('should tokenize EOF at end', () => {
			const lexer = new Lexer('');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({
				type: TokenType.EOF,
				value: '',
				line: 1,
				column: 1
			});
		});
	});

	describe('Whitespace handling', () => {
		it('should skip spaces between tokens', () => {
			const lexer = new Lexer('title   button');
			const tokens = lexer.tokenize();

			expect(tokens).toHaveLength(3); // title, button, EOF
			expect(tokens[0]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'title' });
			expect(tokens[1]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'button' });
		});

		it('should skip tabs between tokens', () => {
			const lexer = new Lexer('title\t\tbutton');
			const tokens = lexer.tokenize();

			expect(tokens).toHaveLength(3);
			expect(tokens[0]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'title' });
			expect(tokens[1]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'button' });
		});

		it('should not skip newlines', () => {
			const lexer = new Lexer('title\nbutton');
			const tokens = lexer.tokenize();

			expect(tokens).toHaveLength(4); // title, newline, button, EOF
			expect(tokens[1]).toMatchObject({ type: TokenType.NEWLINE });
		});
	});

	describe('String content (text between equals)', () => {
		it('should tokenize string content with spaces', () => {
			// In context like =title=Hello World=
			// We need to handle "Hello World" as string content
			const lexer = new Lexer('=title=Hello World=');
			const tokens = lexer.tokenize();

			// =title= then Hello World then =
			expect(tokens).toContainEqual(
				expect.objectContaining({
					type: TokenType.STRING,
					value: 'Hello World'
				})
			);
		});

		it('should handle empty values', () => {
			const lexer = new Lexer('=line=');
			const tokens = lexer.tokenize();

			// Should have: EQUALS, IDENTIFIER(line), EQUALS, EOF
			const types = tokens.map((t) => t.type);
			expect(types).toContain(TokenType.EQUALS);
			expect(types).toContain(TokenType.IDENTIFIER);
		});
	});

	describe('Line and column tracking', () => {
		it('should track line numbers across newlines', () => {
			const lexer = new Lexer('title\nbutton\ntext');
			const tokens = lexer.tokenize();

			expect(tokens[0].line).toBe(1); // title
			expect(tokens[2].line).toBe(2); // button
			expect(tokens[4].line).toBe(3); // text
		});

		it('should track column numbers', () => {
			const lexer = new Lexer('ab cd');
			const tokens = lexer.tokenize();

			expect(tokens[0].column).toBe(1); // ab starts at column 1
			expect(tokens[1].column).toBe(4); // cd starts at column 4
		});

		it('should reset column on new line', () => {
			const lexer = new Lexer('abc\nxyz');
			const tokens = lexer.tokenize();

			expect(tokens[0].column).toBe(1); // abc
			expect(tokens[2].column).toBe(1); // xyz (after newline)
		});
	});

	describe('Complex expressions', () => {
		it('should tokenize property assignment =name=value=', () => {
			const lexer = new Lexer('=title=Hello=');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({ type: TokenType.EQUALS });
			expect(tokens[1]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'title' });
			expect(tokens[2]).toMatchObject({ type: TokenType.EQUALS });
			expect(tokens[3]).toMatchObject({ type: TokenType.STRING, value: 'Hello' });
			expect(tokens[4]).toMatchObject({ type: TokenType.EQUALS });
		});

		it('should tokenize element with id attribute', () => {
			const lexer = new Lexer('=divide= id:main=');
			const tokens = lexer.tokenize();

			expect(tokens).toContainEqual(
				expect.objectContaining({ type: TokenType.IDENTIFIER, value: 'divide' })
			);
			expect(tokens).toContainEqual(expect.objectContaining({ type: TokenType.COLON }));
			expect(tokens).toContainEqual(
				expect.objectContaining({ type: TokenType.IDENTIFIER, value: 'main' })
			);
		});

		it('should tokenize element with color attribute', () => {
			const lexer = new Lexer('=divide= color=FF0000=');
			const tokens = lexer.tokenize();

			expect(tokens).toContainEqual(
				expect.objectContaining({ type: TokenType.IDENTIFIER, value: 'color' })
			);
			expect(tokens).toContainEqual(
				expect.objectContaining({ type: TokenType.HEX_COLOR, value: 'FF0000' })
			);
		});

		it('should tokenize indented content', () => {
			const lexer = new Lexer('.. =text=Hello=');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({ type: TokenType.DOT });
			expect(tokens[1]).toMatchObject({ type: TokenType.DOT });
			expect(tokens[2]).toMatchObject({ type: TokenType.EQUALS });
			expect(tokens[3]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'text' });
		});

		it('should tokenize special element (time)', () => {
			const lexer = new Lexer('=(time)=');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({ type: TokenType.EQUALS });
			expect(tokens[1]).toMatchObject({ type: TokenType.LPAREN });
			expect(tokens[2]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'time' });
			expect(tokens[3]).toMatchObject({ type: TokenType.RPAREN });
			expect(tokens[4]).toMatchObject({ type: TokenType.EQUALS });
		});
	});

	describe('Full document tokenization', () => {
		it('should tokenize a complete CTIW document', () => {
			const code = `=CTIW=
=title=Hello=
=divide= id:main=
.. =text=Welcome!=
=divide=
==CTIW==`;
			const lexer = new Lexer(code);
			const tokens = lexer.tokenize();

			// Check key tokens exist
			expect(tokens[0]).toMatchObject({ type: TokenType.CTIW_START });

			// Find CTIW_END token
			const endToken = tokens.find((t) => t.type === TokenType.CTIW_END);
			expect(endToken).toBeDefined();

			// Check EOF is last
			expect(tokens[tokens.length - 1]).toMatchObject({ type: TokenType.EOF });
		});

		it('should handle multiple lines with attributes', () => {
			const code = `=CTIW=
=divide= id:header= outline=visible= color=BAF200=
.. =title=Welcome!=
=divide=
==CTIW==`;
			const lexer = new Lexer(code);
			const tokens = lexer.tokenize();

			// Should find multiple attributes on one line
			const idTokenIndex = tokens.findIndex(
				(t) => t.type === TokenType.IDENTIFIER && t.value === 'id'
			);
			expect(idTokenIndex).toBeGreaterThan(-1);

			const outlineTokenIndex = tokens.findIndex(
				(t) => t.type === TokenType.IDENTIFIER && t.value === 'outline'
			);
			expect(outlineTokenIndex).toBeGreaterThan(-1);
		});
	});

	describe('Error handling', () => {
		it('should provide errors array for invalid characters', () => {
			const lexer = new Lexer('title $ button');
			const tokens = lexer.tokenize();
			const errors = lexer.getErrors();

			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].message).toBeDefined();
			expect(errors[0].line).toBe(1);
		});

		it('should have kid-friendly error messages', () => {
			const lexer = new Lexer('title $ button');
			lexer.tokenize();
			const errors = lexer.getErrors();

			// Error message should be encouraging, not scary
			expect(errors[0].message).not.toMatch(/error|invalid|illegal/i);
		});

		it('should continue tokenizing after error', () => {
			const lexer = new Lexer('title $ button');
			const tokens = lexer.tokenize();

			// Should still have title and button tokens
			expect(tokens).toContainEqual(
				expect.objectContaining({ type: TokenType.IDENTIFIER, value: 'title' })
			);
			expect(tokens).toContainEqual(
				expect.objectContaining({ type: TokenType.IDENTIFIER, value: 'button' })
			);
		});

		it('should track error column position', () => {
			const lexer = new Lexer('ab $ cd');
			lexer.tokenize();
			const errors = lexer.getErrors();

			expect(errors[0].column).toBe(4); // $ is at column 4
		});
	});

	describe('Edge cases', () => {
		it('should handle empty input', () => {
			const lexer = new Lexer('');
			const tokens = lexer.tokenize();

			expect(tokens).toHaveLength(1);
			expect(tokens[0].type).toBe(TokenType.EOF);
		});

		it('should handle only whitespace', () => {
			const lexer = new Lexer('   \t  ');
			const tokens = lexer.tokenize();

			expect(tokens).toHaveLength(1);
			expect(tokens[0].type).toBe(TokenType.EOF);
		});

		it('should handle only newlines', () => {
			const lexer = new Lexer('\n\n\n');
			const tokens = lexer.tokenize();

			const newlineCount = tokens.filter((t) => t.type === TokenType.NEWLINE).length;
			expect(newlineCount).toBe(3);
		});

		it('should handle consecutive equals signs distinctly', () => {
			// == should be two EQUALS, not something else (unless at start with CTIW)
			const lexer = new Lexer('==');
			const tokens = lexer.tokenize();

			// Could be 2 EQUALS or the start of ==CTIW==
			// Since there's no CTIW, should be 2 EQUALS
			expect(tokens[0]).toMatchObject({ type: TokenType.EQUALS });
			expect(tokens[1]).toMatchObject({ type: TokenType.EQUALS });
		});

		it('should handle numbers in identifiers', () => {
			const lexer = new Lexer('div2 header1');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'div2' });
			expect(tokens[1]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'header1' });
		});

		it('should differentiate number from hex color', () => {
			// 123456 could be a number or hex color
			// If it's 6 chars and all hex, treat as color
			const lexer = new Lexer('123456');
			const tokens = lexer.tokenize();

			// 123456 is valid hex, so should be HEX_COLOR
			expect(tokens[0]).toMatchObject({ type: TokenType.HEX_COLOR, value: '123456' });
		});

		it('should handle short numbers as NUMBER not HEX_COLOR', () => {
			const lexer = new Lexer('12345');
			const tokens = lexer.tokenize();

			// 12345 is only 5 digits, should be NUMBER
			expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '12345' });
		});

		it('should handle 7+ digit numbers as NUMBER', () => {
			const lexer = new Lexer('1234567');
			const tokens = lexer.tokenize();

			expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '1234567' });
		});

		it('should handle CRLF line endings', () => {
			const lexer = new Lexer('title\r\nbutton');
			const tokens = lexer.tokenize();

			// Should treat \r\n as single newline
			expect(tokens[0]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'title' });
			expect(tokens[1]).toMatchObject({ type: TokenType.NEWLINE });
			expect(tokens[2]).toMatchObject({ type: TokenType.IDENTIFIER, value: 'button' });
		});
	});

	describe('Token helper methods', () => {
		it('should peek at next token without consuming', () => {
			const lexer = new Lexer('title button');

			const first = lexer.peek();
			const second = lexer.peek();

			expect(first).toEqual(second);
			expect(first?.value).toBe('title');
		});

		it('should advance to next token', () => {
			const lexer = new Lexer('title button');

			const first = lexer.nextToken();
			const second = lexer.nextToken();

			expect(first?.value).toBe('title');
			expect(second?.value).toBe('button');
		});

		it('should check if at end', () => {
			const lexer = new Lexer('a');

			expect(lexer.isAtEnd()).toBe(false);
			lexer.nextToken(); // a
			expect(lexer.isAtEnd()).toBe(true);
		});
	});
});
