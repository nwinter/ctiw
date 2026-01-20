import { describe, it, expect } from 'vitest';
import { generateHTML, generateCSS, generateElement } from '$lib/parser/codegen';
import {
	createElement,
	createDocument,
	createSpecial,
	type DocumentNode,
	type ElementNode,
	type CTIWNode
} from '$lib/parser/ast';

describe('CTIW Code Generator', () => {
	describe('generateHTML - Basic Document Structure', () => {
		it('generates a complete HTML document with DOCTYPE', () => {
			const doc = createDocument();
			const html = generateHTML(doc);

			expect(html).toContain('<!DOCTYPE html>');
			expect(html).toContain('<html>');
			expect(html).toContain('</html>');
			expect(html).toContain('<head>');
			expect(html).toContain('</head>');
			expect(html).toContain('<body>');
			expect(html).toContain('</body>');
		});

		it('includes meta charset in head', () => {
			const doc = createDocument();
			const html = generateHTML(doc);

			expect(html).toContain('<meta charset="utf-8">');
		});

		it('includes default body styles', () => {
			const doc = createDocument();
			const html = generateHTML(doc);

			expect(html).toContain('<style>');
			expect(html).toContain('body {');
			expect(html).toContain('font-family: sans-serif');
		});
	});

	describe('generateHTML - Document Properties', () => {
		it('sets the page title from metadata', () => {
			const doc = createDocument([], { title: 'My Cool Page' });
			const html = generateHTML(doc);

			expect(html).toContain('<title>My Cool Page</title>');
		});

		it('applies document font-size to body style', () => {
			const doc = createDocument([], { fontSize: 20 });
			const html = generateHTML(doc);

			expect(html).toContain('font-size: 20px');
		});

		it('sets language attribute on html element', () => {
			const doc = createDocument([], { language: 'english' });
			const html = generateHTML(doc);

			expect(html).toContain('<html lang="en">');
		});

		it('maps spanish language correctly', () => {
			const doc = createDocument([], { language: 'spanish' });
			const html = generateHTML(doc);

			expect(html).toContain('<html lang="es">');
		});
	});

	describe('generateElement - Title Element', () => {
		it('generates h1 for title element', () => {
			const element = createElement('title', { content: 'Hello World' });
			const html = generateElement(element);

			expect(html).toBe('<h1>Hello World</h1>');
		});

		it('generates h1 with id attribute', () => {
			const element = createElement('title', {
				content: 'Welcome',
				properties: { id: 'main-title' }
			});
			const html = generateElement(element);

			expect(html).toBe('<h1 id="main-title">Welcome</h1>');
		});

		it('escapes HTML entities in title content', () => {
			const element = createElement('title', { content: '<script>alert("xss")</script>' });
			const html = generateElement(element);

			expect(html).toContain('&lt;script&gt;');
			expect(html).not.toContain('<script>');
		});
	});

	describe('generateElement - Text Element', () => {
		it('generates p for text element', () => {
			const element = createElement('text', { content: 'Some paragraph text' });
			const html = generateElement(element);

			expect(html).toBe('<p>Some paragraph text</p>');
		});

		it('generates p with id attribute', () => {
			const element = createElement('text', {
				content: 'Hello',
				properties: { id: 'greeting' }
			});
			const html = generateElement(element);

			expect(html).toBe('<p id="greeting">Hello</p>');
		});
	});

	describe('generateElement - Divide (Container) Element', () => {
		it('generates div for divide element', () => {
			const element = createElement('divide');
			const html = generateElement(element);

			expect(html).toBe('<div></div>');
		});

		it('generates div with id', () => {
			const element = createElement('divide', { properties: { id: 'header' } });
			const html = generateElement(element);

			expect(html).toBe('<div id="header"></div>');
		});

		it('generates div with nested children', () => {
			const child1 = createElement('text', { content: 'First paragraph' });
			const child2 = createElement('text', { content: 'Second paragraph' });
			const parent = createElement('divide', { children: [child1, child2] });
			const html = generateElement(parent);

			expect(html).toContain('<div>');
			expect(html).toContain('<p>First paragraph</p>');
			expect(html).toContain('<p>Second paragraph</p>');
			expect(html).toContain('</div>');
		});

		it('generates deeply nested structures', () => {
			const innerText = createElement('text', { content: 'Deep inside' });
			const innerDiv = createElement('divide', {
				properties: { id: 'inner' },
				children: [innerText]
			});
			const outerDiv = createElement('divide', {
				properties: { id: 'outer' },
				children: [innerDiv]
			});
			const html = generateElement(outerDiv);

			expect(html).toContain('<div id="outer">');
			expect(html).toContain('<div id="inner">');
			expect(html).toContain('<p>Deep inside</p>');
		});
	});

	describe('generateElement - Button Element', () => {
		it('generates button element', () => {
			const element = createElement('button', { content: 'Click Me' });
			const html = generateElement(element);

			expect(html).toBe('<button>Click Me</button>');
		});

		it('generates button with id', () => {
			const element = createElement('button', {
				content: 'Submit',
				properties: { id: 'submit-btn' }
			});
			const html = generateElement(element);

			expect(html).toBe('<button id="submit-btn">Submit</button>');
		});

		it('generates empty button when no content', () => {
			const element = createElement('button');
			const html = generateElement(element);

			expect(html).toBe('<button></button>');
		});
	});

	describe('generateElement - Password Input', () => {
		it('generates password input', () => {
			const element = createElement('password');
			const html = generateElement(element);

			expect(html).toBe('<input type="password">');
		});

		it('generates password input with id', () => {
			const element = createElement('password', { properties: { id: 'pwd' } });
			const html = generateElement(element);

			expect(html).toBe('<input type="password" id="pwd">');
		});

		it('generates password input with placeholder', () => {
			const element = createElement('password', { content: 'Enter password' });
			const html = generateElement(element);

			expect(html).toBe('<input type="password" placeholder="Enter password">');
		});
	});

	describe('generateElement - Text Input', () => {
		it('generates text input', () => {
			const element = createElement('input');
			const html = generateElement(element);

			expect(html).toBe('<input type="text">');
		});

		it('generates text input with placeholder', () => {
			const element = createElement('input', { content: 'Type here...' });
			const html = generateElement(element);

			expect(html).toBe('<input type="text" placeholder="Type here...">');
		});
	});

	describe('generateElement - Image Element', () => {
		it('generates img with src', () => {
			const element = createElement('img', { content: 'cat.png' });
			const html = generateElement(element);

			expect(html).toBe('<img src="cat.png" alt="">');
		});

		it('generates img with id', () => {
			const element = createElement('img', {
				content: 'photo.jpg',
				properties: { id: 'main-photo' }
			});
			const html = generateElement(element);

			expect(html).toBe('<img src="photo.jpg" alt="" id="main-photo">');
		});

		it('handles empty img gracefully', () => {
			const element = createElement('img');
			const html = generateElement(element);

			expect(html).toBe('<img src="" alt="">');
		});
	});

	describe('generateElement - Line Element', () => {
		it('generates br for line element', () => {
			const element = createElement('line');
			const html = generateElement(element);

			expect(html).toBe('<br>');
		});
	});

	describe('generateElement - Link Element', () => {
		it('generates anchor with href', () => {
			const element = createElement('link', {
				content: 'Click here',
				properties: { href: 'https://example.com' }
			});
			const html = generateElement(element);

			expect(html).toBe('<a href="https://example.com">Click here</a>');
		});

		it('generates anchor without href defaults to #', () => {
			const element = createElement('link', { content: 'Click here' });
			const html = generateElement(element);

			expect(html).toBe('<a href="#">Click here</a>');
		});
	});

	describe('generateElement - Time Element', () => {
		it('generates time element with JavaScript', () => {
			const element = createSpecial('time');
			const html = generateElement(element);

			expect(html).toContain('<span');
			expect(html).toContain('class="ctiw-time"');
			expect(html).toContain('</span>');
		});
	});

	describe('generateCSS - Color Property', () => {
		it('generates background-color from color property', () => {
			const element = createElement('divide', {
				properties: { id: 'box', color: 'FF0000' }
			});
			const css = generateCSS([element]);

			expect(css).toContain('#box');
			expect(css).toContain('background-color: #FF0000');
		});

		it('generates background-color with lowercase hex', () => {
			const element = createElement('divide', {
				properties: { id: 'box', color: 'ff0000' }
			});
			const css = generateCSS([element]);

			expect(css).toContain('background-color: #ff0000');
		});
	});

	describe('generateCSS - Outline Property', () => {
		it('generates border for outline=visible', () => {
			const element = createElement('divide', {
				properties: { id: 'bordered', outline: 'visible' }
			});
			const css = generateCSS([element]);

			expect(css).toContain('#bordered');
			expect(css).toContain('border: 1px solid black');
		});

		it('generates no border for outline=invisible', () => {
			const element = createElement('divide', {
				properties: { id: 'no-border', outline: 'invisible' }
			});
			const css = generateCSS([element]);

			expect(css).toContain('#no-border');
			expect(css).toContain('border: none');
		});
	});

	describe('generateCSS - Alignment Property', () => {
		it('generates text-align center for in=middle', () => {
			const element = createElement('text', {
				content: 'Centered',
				properties: { id: 'centered', in: 'middle' }
			});
			const css = generateCSS([element]);

			expect(css).toContain('#centered');
			expect(css).toContain('text-align: center');
		});

		it('generates text-align left for in=left', () => {
			const element = createElement('text', {
				content: 'Left',
				properties: { id: 'left-aligned', in: 'left' }
			});
			const css = generateCSS([element]);

			expect(css).toContain('#left-aligned');
			expect(css).toContain('text-align: left');
		});

		it('generates text-align right for in=right', () => {
			const element = createElement('text', {
				content: 'Right',
				properties: { id: 'right-aligned', in: 'right' }
			});
			const css = generateCSS([element]);

			expect(css).toContain('#right-aligned');
			expect(css).toContain('text-align: right');
		});
	});

	describe('generateCSS - Font Size Property', () => {
		it('generates font-size from element property', () => {
			const element = createElement('text', {
				content: 'Big text',
				properties: { id: 'big', 'font-size': 24 }
			});
			const css = generateCSS([element]);

			expect(css).toContain('#big');
			expect(css).toContain('font-size: 24px');
		});
	});

	describe('generateCSS - Size Property', () => {
		it('generates width from size property', () => {
			const element = createElement('divide', {
				properties: { id: 'sized', size: 100 }
			});
			const css = generateCSS([element]);

			expect(css).toContain('#sized');
			expect(css).toContain('width: 100px');
		});
	});

	describe('generateCSS - Multiple Properties', () => {
		it('combines multiple CSS properties', () => {
			const element = createElement('divide', {
				properties: {
					id: 'styled',
					color: 'BAF2E9',
					outline: 'visible',
					size: 200
				}
			});
			const css = generateCSS([element]);

			expect(css).toContain('#styled {');
			expect(css).toContain('background-color: #BAF2E9');
			expect(css).toContain('border: 1px solid black');
			expect(css).toContain('width: 200px');
		});
	});

	describe('generateCSS - Nested Elements', () => {
		it('generates CSS for nested elements', () => {
			const child = createElement('text', {
				content: 'Hello',
				properties: { id: 'inner-text', color: '00FF00' }
			});
			const parent = createElement('divide', {
				properties: { id: 'outer-box', color: 'FF0000' },
				children: [child]
			});
			const css = generateCSS([parent]);

			expect(css).toContain('#outer-box');
			expect(css).toContain('background-color: #FF0000');
			expect(css).toContain('#inner-text');
			expect(css).toContain('background-color: #00FF00');
		});
	});

	describe('generateHTML - Full Document Integration', () => {
		it('generates complete page with title and body', () => {
			const titleElement = createElement('title', { content: 'Hello' });
			const doc = createDocument([titleElement], { title: 'Hello' });
			const html = generateHTML(doc);

			expect(html).toContain('<!DOCTYPE html>');
			expect(html).toContain('<title>Hello</title>');
			expect(html).toContain('<h1>Hello</h1>');
		});

		it('generates page with styled elements', () => {
			const textElement = createElement('text', { content: 'Red box!' });
			const divElement = createElement('divide', {
				properties: { id: 'box', color: 'FF0000' },
				children: [textElement]
			});
			const doc = createDocument([divElement], { title: 'Styled Page' });
			const html = generateHTML(doc);

			expect(html).toContain('<title>Styled Page</title>');
			expect(html).toContain('<div id="box">');
			expect(html).toContain('<p>Red box!</p>');
			expect(html).toContain('#box {');
			expect(html).toContain('background-color: #FF0000');
		});

		it('generates time element with script', () => {
			const timeElement = createSpecial('time');
			const doc = createDocument([timeElement]);
			const html = generateHTML(doc);

			expect(html).toContain('class="ctiw-time"');
			expect(html).toContain('<script>');
			expect(html).toContain('toLocaleTimeString');
		});

		it('matches example from language spec', () => {
			// From LANGUAGE_SPEC.md:
			// =CTIW=
			// =title=Hello=
			// =divide= id:box= color=FF0000=
			// .. =text=Red box!=
			// =divide=
			// ==CTIW==
			const textElement = createElement('text', { content: 'Red box!' });
			const divElement = createElement('divide', {
				properties: { id: 'box', color: 'FF0000' },
				children: [textElement]
			});
			const doc = createDocument([divElement], { title: 'Hello' });
			const html = generateHTML(doc);

			expect(html).toContain('<title>Hello</title>');
			expect(html).toContain('<div id="box">');
			expect(html).toContain('<p>Red box!</p>');
			expect(html).toContain('#box { background-color: #FF0000; }');
		});
	});

	describe('generateHTML - Complete Example from Spec', () => {
		it('generates complete page from full CTIW example', () => {
			// Complete example from LANGUAGE_SPEC.md
			const welcomeTitle = createElement('title', { content: 'Welcome!' });
			const headerDiv = createElement('divide', {
				properties: { id: 'header', outline: 'visible', color: 'BAF2E9' },
				children: [welcomeTitle]
			});

			const passwordText = createElement('text', { content: 'Enter your password:' });
			const passwordInput = createElement('password');
			const lineBreak = createElement('line');
			const loginButton = createElement('button', { content: 'Login' });
			const mainDiv = createElement('divide', {
				properties: { id: 'main' },
				children: [passwordText, passwordInput, lineBreak, loginButton]
			});

			const timeElement = createSpecial('time');

			const doc = createDocument([headerDiv, mainDiv, timeElement], {
				title: 'My First Page',
				language: 'english',
				fontSize: 20
			});
			const html = generateHTML(doc);

			// Check document structure
			expect(html).toContain('<!DOCTYPE html>');
			expect(html).toContain('<html lang="en">');
			expect(html).toContain('<title>My First Page</title>');
			expect(html).toContain('font-size: 20px');

			// Check header section
			expect(html).toContain('<div id="header">');
			expect(html).toContain('<h1>Welcome!</h1>');
			expect(html).toContain('#header {');
			expect(html).toContain('border: 1px solid black');
			expect(html).toContain('background-color: #BAF2E9');

			// Check main section
			expect(html).toContain('<div id="main">');
			expect(html).toContain('<p>Enter your password:</p>');
			expect(html).toContain('<input type="password">');
			expect(html).toContain('<br>');
			expect(html).toContain('<button>Login</button>');

			// Check time element
			expect(html).toContain('class="ctiw-time"');
		});
	});

	describe('Edge Cases', () => {
		it('handles empty document', () => {
			const doc = createDocument();
			const html = generateHTML(doc);

			expect(html).toContain('<!DOCTYPE html>');
			expect(html).toContain('<body>');
			expect(html).toContain('</body>');
		});

		it('handles elements without id (no CSS generated)', () => {
			const element = createElement('divide', {
				properties: { color: 'FF0000' }
			});
			const css = generateCSS([element]);

			// Without an ID, we can't target it with CSS selector
			// The element should still work but CSS won't be applied via ID
			expect(css).toBe('');
		});

		it('handles special characters in content', () => {
			const element = createElement('text', { content: 'Hello & goodbye < friends >' });
			const html = generateElement(element);

			expect(html).toContain('&amp;');
			expect(html).toContain('&lt;');
			expect(html).toContain('&gt;');
		});

		it('handles unicode content', () => {
			const element = createElement('text', { content: 'Hello World!' });
			const html = generateElement(element);

			expect(html).toContain('Hello World!');
		});
	});

	describe('Generic HTML Elements', () => {
		it('generates span element', () => {
			const element = createElement('span', { content: 'inline text' });
			const html = generateElement(element);

			expect(html).toBe('<span>inline text</span>');
		});

		it('generates section element with children', () => {
			const child = createElement('text', { content: 'Section content' });
			const element = createElement('section', {
				properties: { id: 'main-section' },
				children: [child]
			});
			const html = generateElement(element);

			expect(html).toContain('<section id="main-section">');
			expect(html).toContain('<p>Section content</p>');
			expect(html).toContain('</section>');
		});

		it('generates header element', () => {
			const title = createElement('title', { content: 'Site Title' });
			const element = createElement('header', {
				children: [title]
			});
			const html = generateElement(element);

			expect(html).toContain('<header>');
			expect(html).toContain('<h1>Site Title</h1>');
			expect(html).toContain('</header>');
		});

		it('generates footer element', () => {
			const text = createElement('text', { content: 'Copyright 2024' });
			const element = createElement('footer', {
				children: [text]
			});
			const html = generateElement(element);

			expect(html).toContain('<footer>');
			expect(html).toContain('<p>Copyright 2024</p>');
			expect(html).toContain('</footer>');
		});

		it('generates nav element with links', () => {
			const link = createElement('link', {
				content: 'Home',
				properties: { href: '/home' }
			});
			const element = createElement('nav', {
				children: [link]
			});
			const html = generateElement(element);

			expect(html).toContain('<nav>');
			expect(html).toContain('<a href="/home">Home</a>');
			expect(html).toContain('</nav>');
		});

		it('generates ul and li elements', () => {
			const li1 = createElement('li', { content: 'Item 1' });
			const li2 = createElement('li', { content: 'Item 2' });
			const ul = createElement('ul', {
				children: [li1, li2]
			});
			const html = generateElement(ul);

			expect(html).toContain('<ul>');
			expect(html).toContain('<li>Item 1</li>');
			expect(html).toContain('<li>Item 2</li>');
			expect(html).toContain('</ul>');
		});

		it('generates self-closing hr element', () => {
			const element = createElement('hr');
			const html = generateElement(element);

			expect(html).toBe('<hr>');
		});

		it('applies inline styles to elements without id', () => {
			const element = createElement('section', {
				properties: { color: 'FF0000', outline: 'visible' }
			});
			const html = generateElement(element);

			expect(html).toContain('style="');
			expect(html).toContain('background-color: #FF0000');
			expect(html).toContain('border: 1px solid black');
		});

		it('generates article element', () => {
			const element = createElement('article', {
				properties: { id: 'post-1' }
			});
			const html = generateElement(element);

			expect(html).toContain('<article id="post-1">');
			expect(html).toContain('</article>');
		});

		it('generates aside element', () => {
			const element = createElement('aside', { content: 'Sidebar content' });
			const html = generateElement(element);

			expect(html).toBe('<aside>Sidebar content</aside>');
		});

		it('passes through CSS properties as inline styles', () => {
			const element = createElement('span', {
				properties: { 'font-size': 24, 'font-weight': 'bold' }
			});
			const html = generateElement(element);

			expect(html).toContain('style="');
			expect(html).toContain('font-size: 24px');
			expect(html).toContain('font-weight: bold');
		});

		it('handles heading element mapped to h2', () => {
			const element = createElement('heading', { content: 'Section Title' });
			const html = generateElement(element);

			expect(html).toBe('<h2>Section Title</h2>');
		});

		it('handles subheading element mapped to h3', () => {
			const element = createElement('subheading', { content: 'Sub Section' });
			const html = generateElement(element);

			expect(html).toBe('<h3>Sub Section</h3>');
		});
	});
});
