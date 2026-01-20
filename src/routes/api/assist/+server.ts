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
CTIW documents start with =CTIW= and end with ==CTIW==

Basic elements:
- =title=Your Title= - Page title
- =text=Some words= - Regular text
- =button=Click Me= - A button
- =line= - Line break
- =password= - Password input
- =input= - Text input
- =img=picture.png= - Image
- =divide= ... =divide= - Container (like a box)

Properties:
- color=FF0000= - Colors use 6-letter hex codes
- id:name= - Give an element an ID
- outline=visible= - Show box outline
- in=middle= - Center alignment
- size=100= - Set size

Indentation uses dots:
=divide=
.. =text=This is inside!=
=divide=
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
			message: "CTIW stands for \"Clark's Alternative to HTML/CSS\"! It's a fun, easy way to build web pages. Instead of complicated HTML tags like <div>, you use simple commands like =divide=. It's designed to be easy to type and understand!"
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
