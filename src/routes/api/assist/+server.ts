import { json, type RequestHandler } from '@sveltejs/kit';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import Anthropic from '@anthropic-ai/sdk';

interface AssistRequest {
	message: string;
	code: string;
	action?: string;
}

interface AssistResponse {
	message: string;
	codeSnippet?: string;
	thinking?: string;
}

// Initialize Anthropic client
const anthropic = new Anthropic({
	apiKey: ANTHROPIC_API_KEY
});

// CTIW Language comprehensive reference
const CTIW_REFERENCE = `
# CTIW Language Reference
CTIW = Clark's Text for Instructing Webpages

## Document Structure
Every CTIW document starts with ==CTIW== and ends with ==CTIW== (same marker for both!)

## Elements
Elements are the building blocks.
- Most elements use single equals: =element=content=
- Text elements use DOUBLE equals: ==text==content== or just ==content==

### Text Elements (use double ==)
- ==text==Paragraph text== - Creates a <p> paragraph
- ==Hello world!== - Shorthand for ==text==Hello world!==
- =title=Big Title= - Creates an <h1> heading (single = is OK for title)
- =heading=Section Header= - Creates an <h2> heading
- =subheading=Smaller Header= - Creates an <h3> heading

### Interactive Elements
- =button=Click Me= - Creates a <button>
- =link=Click here= href:url= - Creates an <a> link
- =input= - Creates a text input <input type="text">
- =password= - Creates a password input <input type="password">

### Media Elements
- =img=filename.png= - Creates an <img> tag
- =video=movie.mp4= - Creates a <video> tag
- =audio=sound.mp3= - Creates an <audio> tag

### Layout Elements
- =line= - Creates a line break <br>
- =divide= ... =divide= - Creates a container <div> (must be closed!)
- =hr= - Horizontal rule (line across the page)

### Special Elements
- =(time)= - Shows current time, updates live

### Generic HTML Elements
CTIW supports ANY HTML element! Just use the element name:
- =span=inline text= - Creates <span>
- =section= ... =section= - Creates <section> container
- =header= ... =header= - Creates <header> container
- =footer= ... =footer= - Creates <footer> container
- =nav= ... =nav= - Creates <nav> container
- =article= ... =article= - Creates <article> container
- =aside= ... =aside= - Creates <aside> container
- =ul= ... =ul= - Creates unordered list
- =li=Item= - Creates list item
- =ol= ... =ol= - Creates ordered list

## Properties
Properties customize elements. Add them after the content:
=text=Hello= color=FF0000= size=24=

### Common Properties
- color=RRGGBB= - Set background color (hex, 6 chars)
- background=RRGGBB= - Set background color
- id:name= - Give element an ID
- class:classname= - Add a CSS class
- outline=visible= - Show border around element
- in=middle= or in=left= or in=right= - Text alignment
- margin=number= - Set margin in pixels
- padding=number= - Set padding in pixels

### CSS Properties (pass-through)
ANY CSS property works! Examples:
- font-size=24= - Font size (24px)
- font-weight=bold= - Bold text
- width=200= - Width (200px)
- height=100= - Height (100px)
- border-radius=10= - Rounded corners
- display=flex= - Flexbox layout
- gap=10= - Gap between flex items
- opacity=0.5= - Transparency
- transform=rotate(45deg)= - Transforms

### Color Examples
FF0000=Red, 00FF00=Green, 0000FF=Blue, FFFF00=Yellow,
FF00FF=Pink, 00FFFF=Cyan, FFA500=Orange, 800080=Purple

## Indentation (Nesting)
Use dots (FOUR per level) to put elements inside containers:

=divide= color=ADD8E6=
.... ==Inside the box!==
.... =divide= color=FFD700=
........ ==Nested deeper!==
.... =divide=
=divide=

## Common Patterns

### Centered Content
=divide= in=middle=
.... =title=Centered Title=
=divide=

### Colorful Box
=divide= color=E6E6FA= outline=visible= padding=20=
.... ==Content here==
=divide=

### Navigation with Header
=header= color=333333=
.... =nav=
........ =link=Home= href:#home=
........ =link=About= href:#about=
.... =nav=
=header=

### List
=ul=
.... =li=First item=
.... =li=Second item=
.... =li=Third item=
=ul=

### Form
=divide= id:form=
.... ==Enter your name:==
.... =input=
.... =line=
.... ==Password:==
.... =password=
.... =line=
.... =button=Submit=
=divide=

### Styled Section
=section= padding=20= border-radius=10= color=F0F0F0=
.... =heading=About Us=
.... ==We make cool stuff!==
=section=

## Remember
1. Start and end with ==CTIW==
2. Text uses double equals: ==text==hello== or just ==hello==
3. Other elements use single equals: =button=Click Me!=
4. Use .... (4 dots) for each level of nesting inside containers
5. Every opening container needs a matching closing element
6. Properties go AFTER the content, before the closing =
7. Any HTML element works - just use its name!
8. Any CSS property works - just use its name!
`;

// Simple fallback responses for quick actions
const QUICK_RESPONSES: Record<string, AssistResponse> = {
	button: {
		message: "Here's a button you can customize:",
		codeSnippet: '=button=Click Me!='
	},
	color: {
		message: "Here's a colorful example with different colors:",
		codeSnippet: `=divide= color=FF6B6B= outline=visible= padding=10=
.... ==Coral red box!==
=divide=

=divide= color=4ECDC4= outline=visible= padding=10=
.... ==Teal box!==
=divide=

=divide= color=FFE66D= outline=visible= padding=10=
.... ==Yellow box!==
=divide=`
	}
};

// Generate response using Claude Opus 4.5 with extended thinking
async function generateClaudeResponse(request: AssistRequest): Promise<AssistResponse> {
	const { message, code, action } = request;

	// Handle quick actions with preset responses (faster)
	if (action && QUICK_RESPONSES[action]) {
		return QUICK_RESPONSES[action];
	}

	// Build the system prompt
	const systemPrompt = `You are a friendly, encouraging AI helper for CTIW (Clark's Text for Instructing Webpages), a kid-friendly programming language for building web pages. Your job is to help an 8-year-old learn CTIW and build cool web pages.

${CTIW_REFERENCE}

## Your Personality
- Be enthusiastic and encouraging! Use phrases like "Great question!" and "Nice work!"
- Keep explanations simple and clear - you're talking to a kid
- Use emojis sparingly but appropriately
- If you suggest code, make it fun and colorful
- Celebrate successes!

## Response Format
Your response MUST be valid JSON with these fields:
- "message": Your friendly explanation (required)
- "codeSnippet": CTIW code to share (optional, only if relevant)

Example: {"message": "Here's how to add a title!", "codeSnippet": "=title=My Cool Page="}

## Important Rules
1. ONLY output valid JSON - no other text
2. Code snippets should be CTIW code ONLY (not full documents unless requested)
3. If fixing code, include the FULL corrected document
4. Be concise but helpful`;

	// Build the user message based on action or free text
	let userMessage = '';
	if (action === 'fix') {
		userMessage = `Please review and fix any issues in my CTIW code. If there are problems, provide the corrected full document. If it looks good, just say so encouragingly!

My current code:
\`\`\`
${code}
\`\`\``;
	} else if (action === 'explain') {
		userMessage = `Please explain how CTIW works in a fun, simple way that an 8-year-old can understand. Reference my current code if helpful:
\`\`\`
${code}
\`\`\``;
	} else {
		userMessage = `${message}

My current CTIW code:
\`\`\`
${code}
\`\`\``;
	}

	try {
		// Use streaming to handle long-running requests
		const stream = anthropic.messages.stream({
			model: 'claude-opus-4-5',
			max_tokens: 16000,
			thinking: {
				type: 'enabled',
				budget_tokens: 10000
			},
			system: systemPrompt,
			messages: [
				{ role: 'user', content: userMessage }
			]
		});

		// Collect the full response
		const response = await stream.finalMessage();

		// Extract thinking and response text
		let thinkingText = '';
		let responseText = '';

		for (const block of response.content) {
			if (block.type === 'thinking') {
				thinkingText = block.thinking;
			} else if (block.type === 'text') {
				responseText = block.text;
			}
		}

		// Parse the JSON response
		try {
			// Try to extract JSON from the response
			const jsonMatch = responseText.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				const parsed = JSON.parse(jsonMatch[0]);
				return {
					message: parsed.message || "I'm here to help!",
					codeSnippet: parsed.codeSnippet,
					thinking: thinkingText
				};
			}
		} catch {
			// If JSON parsing fails, use the raw text
		}

		// Fallback: use the response text directly
		return {
			message: responseText || "I'm here to help with CTIW!",
			thinking: thinkingText
		};

	} catch (error) {
		console.error('Claude API error:', error);
		// Return a helpful fallback
		return {
			message: "I'm having a little trouble thinking right now, but I'm still here to help! Try asking me about how to add a button, make colorful boxes, or explain what CTIW is."
		};
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json() as AssistRequest;
		const response = await generateClaudeResponse(body);
		return json(response);
	} catch (error) {
		console.error('API error:', error);
		return json({
			message: "Oops! Something went wrong. Let's try that again!"
		}, { status: 500 });
	}
};
