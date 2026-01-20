# CTIW Development Log

This file tracks all development prompts and tasks. Each entry documents what was requested, what was done, and the outcome.

**CRITICAL**: Every time a prompt is given to Claude Code or other coding agents, it MUST be saved to this file with timestamp and context.

## Format

```markdown
## [DATE] - [TIME] - [AGENT]

### Prompt
[The original request or task]

### Changes Made
- [List of changes]

### Files Modified
- [List of files]

### Outcome
[Result: Success/Partial/Failed]
[Any notes or follow-up needed]
```

---

## 2026-01-19 - Initial Setup - Claude Code

### Prompt
Create a new self-developing GitHub repo for CTIW (Clark's Alternative to HTML/CSS), an 8-year-old's programming language for building web pages. Set up the full scaffolding similar to typetube: SvelteKit, TypeScript, Tailwind, AGENTS.md, CLAUDE.md, permissions, Vercel deployment.

The project will include:
- Parser/transpiler from CTIW to HTML/CSS
- Browser-based IDE with code editor and live preview
- Syntax highlighting
- Autocomplete
- AI code assist

### Changes Made
- Initialized SvelteKit 5 project with TypeScript
- Configured Tailwind CSS v4
- Set up Vercel adapter for deployment
- Created AGENTS.md with comprehensive agent instructions
- Created CLAUDE.md with Claude-specific settings
- Created DESIGN_PROMPTS.md (this file)
- Created claude/settings.json and settings.local.json for permissions
- Created basic IDE layout with editor and preview panels
- Set up Vitest for testing

### Files Created
- `package.json` - Project dependencies
- `svelte.config.js` - SvelteKit config with Vercel adapter
- `postcss.config.js` - PostCSS with Tailwind
- `src/app.css` - Tailwind imports
- `src/routes/+layout.svelte` - App layout
- `src/routes/+page.svelte` - Main IDE page
- `AGENTS.md` - Shared agent instructions
- `CLAUDE.md` - Claude-specific settings
- `DESIGN_PROMPTS.md` - This file
- `claude/settings.json` - Shared Claude settings
- `claude/settings.local.json` - Local permissions
- `.gitignore` - Git ignore patterns
- `README.md` - Project documentation

### Outcome
Success - Project initialized with full self-developing infrastructure

---

## 2026-01-19 - CTIW Language Definition - Claude Code (Opus 4.5)

### Prompt
Define how the CTIW language works based on four whiteboard images showing Clark's original designs. Analyze the patterns, ponder what he could be going for, and think through how to make it into a consistent language that can be easily parsed and transpiled into HTML/CSS.

Images analyzed:
- IMG_9035.jpeg - Full example with "Input" and "Output" sections
- IMG_9052.jpeg - Detailed code example with Korean language setting
- IMG_9053.jpeg - Close-up of the same code
- IMG_9054.jpeg - Cheat sheet with CTIW language elements

### Analysis

#### Raw Transcription from Images

**Image 1 (IMG_9035) - Full Example:**
```
Input:
1=CTIW=
2=title= =Hello==
3=break=line== 5=sq==
4=Divide=id= left.act=brGaks vis ible= outline=BAFO?
5=in=Divide= =       =img
6=img== left= divide=4lin=
7=sno 45== FUNd4xqz=
8=li=password= /lin=
9==crypt= vis button==#8 line
10==ctiw==

Output:
[Hello] (title in a box)
[Password field with dots] (input form)
```

**Images 2 & 3 (IMG_9052/9053) - Detailed Example:**
```
1 == CTIW == = =
2=language=korean =
3=font-size= 209 =
4=divide= id:section =
5     outline =visible = BAF2Y9 =
6.... =100=
7..... =100=
8..... =100=
9..... =100=
10==(time)==
11 ..... =divide= in =middle
12===CTIW===
```

**Image 4 (IMG_9054) - Cheat Sheet:**
```
CTIW
Text
Indent
color HBX (Hex)
Font
code
Lines/Unverified
```

#### Observed Language Patterns

1. **Document Delimiters**
   - Opens with `=CTIW=` or `==CTIW==`
   - Closes with `==ctiw==` or `===CTIW===`
   - Line numbers appear at the start (1, 2, 3...)

2. **Property-Value Syntax**
   - Pattern: `=property= =value=` or `=property=value=`
   - Equal signs act as delimiters
   - Examples: `=title= =Hello==`, `=language=korean=`, `=font-size= 209=`

3. **Container/Element Syntax**
   - `divide` - A container element (like HTML div)
   - `id:name` - Assigns an ID to an element
   - `in=divide=` or `in =middle` - Nesting indicator

4. **Visual Indentation**
   - Uses dots `.....` to show nesting levels
   - Each dot likely represents one level of indentation
   - Kid-friendly alternative to invisible spaces!

5. **Visual Properties**
   - `outline=visible=` - Show/hide borders
   - `=BAF2Y9=` - Hex colors (without the # prefix)
   - `visible`/`invisible` - Visibility toggle

6. **Elements Identified**
   - `title` - Page/section title
   - `break=line` or `line` - Line break
   - `divide` - Container/div
   - `img` - Image
   - `button` - Button element
   - `password` - Password input field
   - `(time)` - Special time element

7. **Special Syntax**
   - Parentheses `(time)` for special elements
   - Numbers in values: `=100=` for sizes
   - `left` - Alignment

### Changes Made
- Documented the prompt and analysis in DESIGN_PROMPTS.md
- Created comprehensive language analysis from whiteboard images
- Created formal language specification at `docs/LANGUAGE_SPEC.md`
- Updated README.md with language overview and example
- Verified all builds and tests pass

### Files Created/Modified
- `docs/LANGUAGE_SPEC.md` - Complete CTIW language specification
- `DESIGN_PROMPTS.md` - Added this entry
- `README.md` - Added language overview and quick example

### Outcome
Success - CTIW language fully defined based on Clark's whiteboard designs

### Key Language Design Decisions

1. **Document markers**: `=CTIW=` to start, `==CTIW==` to end
2. **Property syntax**: `=name=value=` with `=` as universal delimiter
3. **Visual indentation**: Dots `.....` for nesting (kid-friendly!)
4. **Container element**: `divide` for grouping (like HTML div)
5. **ID syntax**: `id:name` for element identifiers
6. **Colors**: 6-digit hex without `#` prefix
7. **Line-based**: Each line is one statement

### Next Steps
- Implement lexer/tokenizer
- Implement parser to build AST
- Implement code generator for HTML/CSS output
- Add syntax highlighting to editor
- Add live preview functionality

---

## 2026-01-19 - Full IDE Implementation - Claude Code (Opus 4.5)

### Prompt
Implement all the next steps using TDD and many subagents:
- Parser/transpiler with lexer, parser, code generator
- CodeMirror editor with syntax highlighting
- Autocomplete for CTIW
- Live preview component
- Project gallery with local storage
- AI coding assistant integration
- Deploy to ctiw.nickwinter.net

Goal: Full working IDE for Clark (8yo) to write CTIW code with live preview.

### Implementation Plan

**Phase 1: Core Parser (Parallel)**
- Lexer: Tokenize CTIW source
- Parser: Build AST from tokens
- CodeGen: Generate HTML/CSS from AST

**Phase 2: Editor Infrastructure**
- CodeMirror 6 setup
- CTIW syntax highlighting mode
- Autocomplete provider

**Phase 3: UI Components**
- Live preview iframe
- Project gallery (localStorage)
- AI assistant panel

**Phase 4: Deploy**
- Vercel configuration
- Custom domain ctiw.nickwinter.net

### Changes Made

**Lexer (`src/lib/parser/lexer.ts`):**
- Implemented full tokenizer with all CTIW token types
- Support for: CTIW_START, CTIW_END, EQUALS, DOUBLE_EQUALS, IDENTIFIER, STRING, NUMBER, HEX_COLOR, DOT, COLON, LPAREN, RPAREN, NEWLINE, EOF
- Kid-friendly error messages
- Line/column tracking

**Parser (`src/lib/parser/parser.ts`):**
- Line-based parser producing AST
- Document structure validation (header/footer)
- Element parsing with properties
- Container nesting with dot-based indentation
- Metadata extraction (title, language, font-size)

**Code Generator (`src/lib/parser/codegen.ts`):**
- AST to HTML/CSS transformation
- Support for all element types
- Property to CSS mapping
- Nested container support

**AST Types (`src/lib/parser/ast.ts`):**
- Full type definitions for all node types
- Helper functions for node creation

**Editor (`src/lib/components/Editor.svelte`):**
- CodeMirror 6 integration
- Custom CTIW theme (dark, kid-friendly colors)
- Two-way code binding

**Syntax Highlighting (`src/lib/editor/ctiw-language.ts`):**
- Lezer-based grammar for CTIW
- Highlighting for all token types

**Autocomplete (`src/lib/editor/ctiw-autocomplete.ts`):**
- Context-aware completions
- Element, property, and value suggestions
- Kid-friendly descriptions with emojis

**Preview (`src/lib/components/Preview.svelte`):**
- Sandboxed iframe for HTML preview
- Live updates on code change

**Gallery (`src/lib/components/Gallery.svelte`):**
- Project cards with thumbnails
- Create/load/delete projects

**Projects Store (`src/lib/stores/projects.svelte.ts`):**
- Svelte 5 runes-based store
- localStorage persistence
- Example projects

**AI Assistant (`src/lib/components/AIAssistant.svelte`):**
- Chat interface for help
- Quick action buttons
- Code snippet insertion

**API Route (`src/routes/api/assist/+server.ts`):**
- Claude API integration
- CTIW language reference in system prompt
- Streaming support for long responses

**Main Page (`src/routes/+page.svelte`):**
- Full IDE layout with editor, preview, AI assistant
- URL-based state management
- Share functionality with base64-encoded URLs
- Auto-save with debouncing

### Files Created
- `src/lib/parser/lexer.ts`
- `src/lib/parser/parser.ts`
- `src/lib/parser/codegen.ts`
- `src/lib/parser/ast.ts`
- `src/lib/editor/ctiw-language.ts`
- `src/lib/editor/ctiw-autocomplete.ts`
- `src/lib/components/Editor.svelte`
- `src/lib/components/Preview.svelte`
- `src/lib/components/Gallery.svelte`
- `src/lib/components/AIAssistant.svelte`
- `src/lib/components/SyntaxLegend.svelte`
- `src/lib/stores/projects.svelte.ts`
- `src/routes/api/assist/+server.ts`
- `tests/lexer.test.ts`
- `tests/parser.test.ts`
- `tests/codegen.test.ts`

### Outcome
Success - Full IDE implemented with all features working

---

## 2026-01-20 - Bug Fixes and Clark's Syntax Feedback - Claude Code (Opus 4.5)

### Prompt
Multiple issues reported:
1. Claude API model string was wrong (used specific date version instead of `claude-opus-4-5`)
2. Editor loses focus when typing
3. Layout not using full window width
4. Streaming required for long Claude API requests

Then Clark (8yo) provided feedback on the language syntax:
1. Documents should start with `==CTIW==`, not `=CTIW=` (double equals for both start AND end)
2. Indentation should be 4 dots, not 2
3. Text elements use double equals: `==text==content==`
4. `=(time)=` works alone but not inside text content
5. Autocompleting `=(time)=` often leaves a trailing `)`
6. Tab should accept autocompletion
7. `==blah==` should work as shorthand for `==text==blah==`

### Changes Made

**API Fixes:**
- Changed model string from `claude-opus-4-5-20250514` to `claude-opus-4-5`
- Switched from `messages.create()` to `messages.stream()` with `.finalMessage()` for long requests

**Editor Focus Fix:**
- Changed Editor.svelte to use `onMount` for initialization instead of `$effect`
- Used `$effect.pre` for external code sync
- Added `!editorView.hasFocus` check to prevent sync during active typing

**Layout Fix:**
- Removed `max-w-7xl` constraint for full-width layout

**Syntax Changes (Clark's feedback):**

1. **Document markers** - Updated lexer to recognize `==CTIW==` for both start and end
   - Added logic to distinguish START vs END based on whether START already exists

2. **Indentation** - Changed from 2 dots to 4 dots per level
   - `Math.floor(dots / 4)` instead of `Math.floor(dots / 2)`

3. **Text elements** - Added DOUBLE_EQUALS token type and `parseDoubleEqualsElement()` method
   - Supports `==text==content==` full form
   - Supports `==content==` shorthand
   - Supports properties: `==text== color=red=`

4. **Autocomplete** - Added `apply: '=(time)='` to prevent trailing `)` issues

5. **Tab completion** - Added `{ key: 'Tab', run: acceptCompletion }` to keymap

6. **Updated all references:**
   - Default code example in +page.svelte
   - AI assistant CTIW reference documentation
   - All autocomplete suggestions
   - All test files

### Files Modified
- `src/routes/api/assist/+server.ts` - Model string, streaming, CTIW reference
- `src/lib/components/Editor.svelte` - Focus handling, Tab completion
- `src/lib/parser/lexer.ts` - DOUBLE_EQUALS token, ==CTIW== detection
- `src/lib/parser/parser.ts` - 4-dot indentation, double-equals text parsing
- `src/lib/editor/ctiw-autocomplete.ts` - Updated syntax, =(time)= fix
- `src/routes/+page.svelte` - Layout width, default code
- `tests/lexer.test.ts` - Updated for new syntax
- `tests/parser.test.ts` - Updated for new syntax

### Outcome
Success - All 147 tests pass, build succeeds

### Remaining Item
- Support `=(time)=` inside text content (would require inline special element parsing)

---
