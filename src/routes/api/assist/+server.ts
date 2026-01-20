import { json, type RequestHandler } from '@sveltejs/kit';

interface AssistRequest {
	message: string;
	code: string;
	action?: string;
}

interface AssistResponse {
	message: string;
	codeSnippet?: string;
}

// CTIW Language quick reference for generating helpful responses
const CTIW_BASICS = `
CTIW = Clark's Text for Instructing Webpages

CTIW is a kid-friendly programming language for building web pages.
Every CTIW page starts with =CTIW= and ends with ==CTIW==

ELEMENTS (what you can put on the page):
- =title=Your Title= - Big heading at the top
- =text=Some words= - Regular paragraph text
- =button=Click Me= - A clickable button
- =line= - Adds a line break (new line)
- =password= - Password input box (hides what you type)
- =input= - Text input box for typing
- =img=picture.png= - Shows an image
- =divide= ... =divide= - Container/box for grouping things together
- =(time)= - Special: shows the current time

PROPERTIES (how to customize elements):
Put properties AFTER the content, separated by spaces:
=text=Hello!= color=FF0000=

- color=RRGGBB= - Set colors using hex codes (6 characters)
  Examples: FF0000=Red, 00FF00=Green, 0000FF=Blue, FFFF00=Yellow, FF00FF=Pink
- id:name= - Give an element a name/ID
- outline=visible= - Show a border around containers
- in=middle= - Center the content
- size=100= - Set the size

CONTAINERS (divide):
Use =divide= to create boxes that hold other elements.
Always close with another =divide=

INDENTATION (putting things inside boxes):
Use dots (two per level) at the start of lines to show nesting:
=divide= color=ADD8E6=
.. =text=This is inside the blue box!=
.. =button=A button in the box!=
=divide=

You can nest boxes inside boxes:
=divide= color=FFD700=
.. =divide= color=98FB98=
.... =text=Nested twice!=
.. =divide=
=divide=

COMPLETE EXAMPLE:
=CTIW=
=title=Welcome to My Page=

=text=This is a paragraph of text.=

=divide= color=E6E6FA= outline=visible=
.. =title=A Purple Box=
.. =text=Boxes can contain multiple elements!=
.. =button=Click here!=
=divide=

=text=More text outside the box.=
=(time)=
==CTIW==
`;

// Check for common issues in CTIW code
function analyzeCode(code: string): { issues: string[]; suggestions: string[] } {
	const issues: string[] = [];
	const suggestions: string[] = [];

	// Check for CTIW markers
	if (!code.includes('=CTIW=')) {
		issues.push('Missing =CTIW= at the start');
		suggestions.push('Add =CTIW= at the very beginning of your code');
	}

	if (!code.includes('==CTIW==')) {
		issues.push('Missing ==CTIW== at the end');
		suggestions.push('Add ==CTIW== at the very end of your code');
	}

	// Check for unclosed divides
	const divideOpens = (code.match(/=divide=/g) || []).length;
	if (divideOpens % 2 !== 0) {
		issues.push('Unmatched divide - you have an odd number of =divide= tags');
		suggestions.push('Each =divide= needs a closing =divide=');
	}

	// Check for common syntax issues
	if (code.includes('= =') || code.includes('==') && !code.includes('==CTIW==')) {
		issues.push('Possible spacing issue with = signs');
	}

	return { issues, suggestions };
}

// Mock responses based on action or message content
function generateResponse(request: AssistRequest): AssistResponse {
	const { message, code, action } = request;
	const lowercaseMsg = (message || '').toLowerCase();
	const analysis = analyzeCode(code);

	// Handle quick actions
	if (action === 'fix') {
		if (analysis.issues.length > 0) {
			let fixMessage = "I found some things to fix in your code:\n\n";
			analysis.issues.forEach((issue, i) => {
				fixMessage += `${i + 1}. ${issue}\n`;
			});
			fixMessage += "\nHere's how your code should look:";

			// Generate a fixed version
			let fixedCode = code;
			if (!code.includes('=CTIW=')) {
				fixedCode = '=CTIW=\n' + fixedCode;
			}
			if (!code.includes('==CTIW==')) {
				fixedCode = fixedCode.trim() + '\n==CTIW==';
			}

			return {
				message: fixMessage,
				codeSnippet: fixedCode
			};
		}
		return {
			message: "Great job! Your code looks good to me. Keep up the awesome work!"
		};
	}

	if (action === 'explain') {
		return {
			message: "Let me explain how CTIW works!\n\nCTIW is a simple language for making web pages. Every CTIW page starts with =CTIW= and ends with ==CTIW==.\n\nInside, you can add elements like:\n- =title= for headings\n- =text= for paragraphs\n- =button= for clickable buttons\n- =divide= for boxes that hold other things\n\nYou can add colors with color=FF0000= (that's red!) and organize things with dots for indentation."
		};
	}

	if (action === 'button') {
		return {
			message: "Here's how to add a button to your page! You can change the text inside to say whatever you want.",
			codeSnippet: '=button=Click Me!='
		};
	}

	if (action === 'color') {
		return {
			message: "Let's make your page colorful! Colors in CTIW use 6-letter codes called hex codes.\n\nHere are some fun colors:\n- FF0000 = Red\n- 00FF00 = Green\n- 0000FF = Blue\n- FFFF00 = Yellow\n- FF00FF = Pink\n- 00FFFF = Cyan\n\nHere's a colorful box:",
			codeSnippet: '=divide= color=FF6B6B= outline=visible=\n.. =text=This box is coral red!=\n=divide=\n\n=divide= color=4ECDC4= outline=visible=\n.. =text=This box is teal!=\n=divide='
		};
	}

	// Handle natural language questions
	if (lowercaseMsg.includes('how') && lowercaseMsg.includes('title')) {
		return {
			message: "Great question! To add a title, use the =title= element. The text between the = signs will be your title!",
			codeSnippet: '=title=My Awesome Page='
		};
	}

	if (lowercaseMsg.includes('how') && lowercaseMsg.includes('image') || lowercaseMsg.includes('picture')) {
		return {
			message: "To add an image, use the =img= element with the image file name!",
			codeSnippet: '=img=my-picture.png='
		};
	}

	if (lowercaseMsg.includes('how') && lowercaseMsg.includes('box') || lowercaseMsg.includes('container')) {
		return {
			message: "To create a box (container), use =divide=. Put things inside by using dots for indentation, then close it with another =divide=!",
			codeSnippet: '=divide= color=BAF2Y9= outline=visible=\n.. =title=Inside the box!=\n.. =text=This text is in the box too!=\n=divide='
		};
	}

	if (lowercaseMsg.includes('what') && lowercaseMsg.includes('ctiw')) {
		return {
			message: "CTIW stands for \"Clark's Text for Instructing Webpages\"! It's a fun, easy way to build web pages. Instead of complicated HTML tags like <div>, you use simple commands like =divide=. Everything uses = signs, which makes it easy to type and understand!\n\nEvery CTIW page starts with =CTIW= and ends with ==CTIW==. Inside, you add elements like =title=, =text=, =button=, and more!"
		};
	}

	if (lowercaseMsg.includes('help') || lowercaseMsg.includes('start') || lowercaseMsg.includes('begin')) {
		return {
			message: "Welcome to CTIW! Here's a simple page to get you started. It has a title, some text, and a button!",
			codeSnippet: '=CTIW=\n=title=My First Page=\n\n=text=Hello, world!=\n\n=button=Click Me!=\n==CTIW=='
		};
	}

	if (lowercaseMsg.includes('password') || lowercaseMsg.includes('login') || lowercaseMsg.includes('form')) {
		return {
			message: "Here's how to make a simple login form with a password field!",
			codeSnippet: '=divide= id:login-form=\n.. =text=Enter your password:=\n.. =password=\n.. =line=\n.. =button=Login=\n=divide='
		};
	}

	if (lowercaseMsg.includes('center') || lowercaseMsg.includes('middle')) {
		return {
			message: "To center something, use the in=middle= property!",
			codeSnippet: '=divide= in=middle=\n.. =text=This is centered!=\n=divide='
		};
	}

	if (lowercaseMsg.includes('time') || lowercaseMsg.includes('clock')) {
		return {
			message: "You can show the current time with the special =(time)= element!",
			codeSnippet: '=(time)='
		};
	}

	// Default helpful response
	return {
		message: "I'm not sure about that, but I'm here to help! You can ask me:\n\n- \"How do I add a button?\"\n- \"How do I make a colorful box?\"\n- \"What is CTIW?\"\n- \"Help me get started\"\n\nOr try the quick action buttons above!"
	};
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json() as AssistRequest;
		const response = generateResponse(body);
		return json(response);
	} catch (error) {
		return json({
			message: "Oops! Something went wrong. Let's try that again!"
		}, { status: 500 });
	}
};
