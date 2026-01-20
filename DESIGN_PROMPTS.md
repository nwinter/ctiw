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
