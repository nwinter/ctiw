import { describe, it, expect } from 'vitest';
import { parse } from '$lib/parser/parser';
import type { ParseResult } from '$lib/parser/parser';
import type { ElementNode, SpecialNode, PropertyNode } from '$lib/parser/ast';

describe('CTIW Parser', () => {
	describe('Document Structure', () => {
		it('parses an empty document with just delimiters', () => {
			const source = `==CTIW==
==CTIW==`;
			const result = parse(source);

			expect(result.document.type).toBe('Document');
			expect(result.document.children).toEqual([]);
			expect(result.errors).toEqual([]);
		});

		it('handles whitespace around delimiters', () => {
			const source = `  ==CTIW==
  ==CTIW==  `;
			const result = parse(source);

			expect(result.document.type).toBe('Document');
		});

		it('reports error for missing header', () => {
			const source = `=title=Hello=
==CTIW==`;
			const result = parse(source);

			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors[0].message).toContain('==CTIW==');
		});

		it('reports error for missing footer', () => {
			const source = `==CTIW==
=title=Hello=`;
			const result = parse(source);

			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors[0].message).toContain('==CTIW==');
		});
	});

	describe('Properties', () => {
		it('parses a title and stores in metadata', () => {
			const source = `==CTIW==
=title=Hello World=
==CTIW==`;
			const result = parse(source);

			expect(result.document.metadata.title).toBe('Hello World');
		});

		it('parses language property', () => {
			const source = `==CTIW==
=language=english=
==CTIW==`;
			const result = parse(source);

			expect(result.document.metadata.language).toBe('english');
		});

		it('parses font-size property as number', () => {
			const source = `==CTIW==
=font-size=20=
==CTIW==`;
			const result = parse(source);

			expect(result.document.metadata.fontSize).toBe(20);
		});

		it('parses multiple properties into metadata', () => {
			const source = `==CTIW==
=title=My Page=
=language=english=
=font-size=20=
==CTIW==`;
			const result = parse(source);

			expect(result.document.metadata.title).toBe('My Page');
			expect(result.document.metadata.language).toBe('english');
			expect(result.document.metadata.fontSize).toBe(20);
		});
	});

	describe('Simple Elements', () => {
		it('parses a button element with content', () => {
			const source = `==CTIW==
=button=Click Me=
==CTIW==`;
			const result = parse(source);

			expect(result.document.children.length).toBe(1);
			const button = result.document.children[0] as ElementNode;
			expect(button.elementType).toBe('button');
			expect(button.content).toBe('Click Me');
		});

		it('parses text element', () => {
			const source = `==CTIW==
==text==Hello World==
==CTIW==`;
			const result = parse(source);

			expect(result.document.children.length).toBe(1);
			const text = result.document.children[0] as ElementNode;
			expect(text.elementType).toBe('text');
			expect(text.content).toBe('Hello World');
		});

		it('parses img element with source', () => {
			const source = `==CTIW==
=img=cat.png=
==CTIW==`;
			const result = parse(source);

			const img = result.document.children[0] as ElementNode;
			expect(img.elementType).toBe('img');
			expect(img.content).toBe('cat.png');
		});

		it('parses line element (empty)', () => {
			const source = `==CTIW==
=line=
==CTIW==`;
			const result = parse(source);

			const line = result.document.children[0] as ElementNode;
			expect(line.elementType).toBe('line');
		});

		it('parses password input', () => {
			const source = `==CTIW==
=password=
==CTIW==`;
			const result = parse(source);

			const pwd = result.document.children[0] as ElementNode;
			expect(pwd.elementType).toBe('password');
		});

		it('parses input element', () => {
			const source = `==CTIW==
=input=
==CTIW==`;
			const result = parse(source);

			const input = result.document.children[0] as ElementNode;
			expect(input.elementType).toBe('input');
		});

		it('parses multiple elements', () => {
			const source = `==CTIW==
=title=Welcome=
==text==Some content=
=button=Click=
==CTIW==`;
			const result = parse(source);

			// Title creates an element too
			expect(result.document.children.length).toBe(3);
			expect((result.document.children[0] as ElementNode).elementType).toBe('title');
			expect((result.document.children[1] as ElementNode).elementType).toBe('text');
			expect((result.document.children[2] as ElementNode).elementType).toBe('button');
		});
	});

	describe('Element Properties', () => {
		it('parses element with id using colon syntax', () => {
			const source = `==CTIW==
=divide= id:main=
=divide=
==CTIW==`;
			const result = parse(source);

			const div = result.document.children[0] as ElementNode;
			expect(div.elementType).toBe('divide');
			expect(div.properties.id).toBe('main');
		});

		it('parses element with color property', () => {
			const source = `==CTIW==
=divide= color=FF0000=
=divide=
==CTIW==`;
			const result = parse(source);

			const div = result.document.children[0] as ElementNode;
			expect(div.properties.color).toBe('FF0000');
		});

		it('parses element with multiple properties', () => {
			const source = `==CTIW==
=divide= id:header= outline=visible= color=BAF2Y9=
=divide=
==CTIW==`;
			const result = parse(source);

			const div = result.document.children[0] as ElementNode;
			expect(div.properties.id).toBe('header');
			expect(div.properties.outline).toBe('visible');
			expect(div.properties.color).toBe('BAF2Y9');
		});

		it('parses button with content and properties', () => {
			const source = `==CTIW==
=button=Click Me= color=blue=
==CTIW==`;
			const result = parse(source);

			const btn = result.document.children[0] as ElementNode;
			expect(btn.elementType).toBe('button');
			expect(btn.content).toBe('Click Me');
			expect(btn.properties.color).toBe('blue');
		});

		it('parses in property for alignment', () => {
			const source = `==CTIW==
==text== in=middle=
==CTIW==`;
			const result = parse(source);

			const text = result.document.children[0] as ElementNode;
			expect(text.properties.in).toBe('middle');
		});
	});

	describe('Special Elements', () => {
		it('parses time special element', () => {
			const source = `==CTIW==
=(time)=
==CTIW==`;
			const result = parse(source);

			const time = result.document.children[0] as SpecialNode;
			expect(time.type).toBe('Special');
			expect(time.specialType).toBe('time');
		});
	});

	describe('Divide Containers', () => {
		it('parses empty divide', () => {
			const source = `==CTIW==
=divide=
=divide=
==CTIW==`;
			const result = parse(source);

			expect(result.document.children.length).toBe(1);
			const div = result.document.children[0] as ElementNode;
			expect(div.elementType).toBe('divide');
			expect(div.children).toEqual([]);
		});

		it('parses divide with simple child', () => {
			const source = `==CTIW==
=divide=
....==text==Hello inside!==
=divide=
==CTIW==`;
			const result = parse(source);

			expect(result.document.children.length).toBe(1);
			const div = result.document.children[0] as ElementNode;
			expect(div.elementType).toBe('divide');
			expect(div.children.length).toBe(1);
			const child = div.children[0] as ElementNode;
			expect(child.elementType).toBe('text');
			expect(child.content).toBe('Hello inside!');
		});

		it('parses divide with multiple children', () => {
			const source = `==CTIW==
=divide= id:header=
....=title=My Page=
....==text==Welcome!=
=divide=
==CTIW==`;
			const result = parse(source);

			const div = result.document.children[0] as ElementNode;
			expect(div.children.length).toBe(2);
			expect((div.children[0] as ElementNode).elementType).toBe('title');
			expect((div.children[1] as ElementNode).elementType).toBe('text');
		});

		it('parses multiple divides at top level', () => {
			const source = `==CTIW==
=divide= id:header=
....=title=Header=
=divide=

=divide= id:main=
....=button=Click=
=divide=
==CTIW==`;
			const result = parse(source);

			expect(result.document.children.length).toBe(2);
			expect((result.document.children[0] as ElementNode).properties.id).toBe('header');
			expect((result.document.children[1] as ElementNode).properties.id).toBe('main');
		});
	});

	describe('Nested Indentation', () => {
		it('parses two dots as one level of nesting', () => {
			const source = `==CTIW==
=divide=
....==text==Level 1=
=divide=
==CTIW==`;
			const result = parse(source);

			const div = result.document.children[0] as ElementNode;
			expect(div.children.length).toBe(1);
		});

		it('parses eight dots as two levels of nesting', () => {
			const source = `==CTIW==
=divide= id:parent=
....=divide= id:child=
........==text==Grandchild==
....=divide=
=divide=
==CTIW==`;
			const result = parse(source);

			const parent = result.document.children[0] as ElementNode;
			expect(parent.children.length).toBe(1);

			const child = parent.children[0] as ElementNode;
			expect(child.elementType).toBe('divide');
			expect(child.children.length).toBe(1);
			expect((child.children[0] as ElementNode).content).toBe('Grandchild');
		});

		it('handles sibling elements at same nesting level', () => {
			const source = `==CTIW==
=divide=
....==text==First=
....==text==Second=
....==text==Third=
=divide=
==CTIW==`;
			const result = parse(source);

			const div = result.document.children[0] as ElementNode;
			expect(div.children.length).toBe(3);
		});
	});

	describe('Complex Examples', () => {
		it('parses the complete example from the spec', () => {
			const source = `==CTIW==
=title=My First Page=
=language=english=
=font-size=20=

=divide= id:header= outline=visible= color=BAF2Y9=
....=title=Welcome!=
=divide=

=divide= id:main=
....==text==Enter your password:=
....=password=
....=line=
....=button=Login=
=divide=

=(time)=
==CTIW==`;
			const result = parse(source);

			// Check document metadata
			expect(result.document.metadata.title).toBe('My First Page');
			expect(result.document.metadata.language).toBe('english');

			// Check body structure (title element + 2 divides + time)
			expect(result.document.children.length).toBe(4);

			// Check header div
			const header = result.document.children[1] as ElementNode;
			expect(header.elementType).toBe('divide');
			expect(header.properties.id).toBe('header');
			expect(header.children.length).toBe(1);
			expect((header.children[0] as ElementNode).elementType).toBe('title');

			// Check main div
			const main = result.document.children[2] as ElementNode;
			expect(main.elementType).toBe('divide');
			expect(main.children.length).toBe(4);

			// Check time
			expect((result.document.children[3] as SpecialNode).specialType).toBe('time');
		});

		it('parses example from task description', () => {
			const source = `==CTIW==
=title=Hello=
=divide= id:main=
....=button=Click=
=divide=
==CTIW==`;
			const result = parse(source);

			expect(result.document.metadata.title).toBe('Hello');

			// Should have title element + divide
			expect(result.document.children.length).toBe(2);
			const div = result.document.children[1] as ElementNode;
			expect(div.elementType).toBe('divide');
			expect(div.properties.id).toBe('main');
			expect(div.children.length).toBe(1);
			expect((div.children[0] as ElementNode).elementType).toBe('button');
			expect((div.children[0] as ElementNode).content).toBe('Click');
		});
	});

	describe('Empty Lines and Whitespace', () => {
		it('ignores empty lines', () => {
			const source = `==CTIW==

==text==Hello=

==text==World=

==CTIW==`;
			const result = parse(source);

			expect(result.document.children.length).toBe(2);
		});
	});

	describe('Error Handling', () => {
		it('provides position info in errors', () => {
			const source = `==CTIW==
=unknownelement=
==CTIW==`;
			const result = parse(source);

			if (result.errors.length > 0) {
				expect(result.errors[0].line).toBeDefined();
			}
		});

		it('returns partial AST with errors for recoverable issues', () => {
			const source = `==CTIW==
==text==Valid Text=
=bad syntax here
==text==Still valid=
==CTIW==`;
			const result = parse(source);

			// Should still have parsed the valid parts
			expect(result.document.children.length).toBeGreaterThanOrEqual(1);
		});

		it('handles unmatched divide gracefully', () => {
			const source = `==CTIW==
=divide= id:start=
....==text==Inside=
==CTIW==`;
			const result = parse(source);

			// Should still parse, possibly with error about unclosed divide
			expect(result.document.children.length).toBeGreaterThanOrEqual(1);
		});
	});
});
