# CTIW Agent Instructions

This file contains instructions for all AI coding agents (Claude Code, GitHub Copilot, Cursor, Codex, Gemini, etc.) working on the CTIW project.

## Project Overview

**CTIW** (Clark's Alternative to HTML/CSS) is a programming language and development environment created by an 8-year-old. This project implements:

1. **Parser/Transpiler** - Converts CTIW syntax to HTML/CSS
2. **Browser IDE** - Side-by-side editor with live preview
3. **Syntax Highlighting** - Full CTIW language support
4. **Autocomplete** - Context-aware code completion
5. **AI Code Assist** - Help writing CTIW code

### Language Goals

- Kid-friendly syntax that's easier than HTML/CSS
- Immediate visual feedback
- Clear error messages
- Fun to write!

## Automated Workflow

**CRITICAL**: Every coding task MUST follow this complete workflow. Never skip steps!

### 1. Save Development Prompts
Before making changes, document the task:
```bash
# Add entry to DESIGN_PROMPTS.md with:
# - Date and time
# - The prompt/task description
# - Expected outcome
```

### 2. Implement Changes
Make your code changes following the project patterns.

### 3. Test (TDD Preferred)
```bash
npm test              # Run all tests - MUST PASS
npm test -- --watch   # Watch mode during development
```
Write tests BEFORE implementation when possible (Test-Driven Development).

### 4. Type Check
```bash
npm run check         # MUST PASS with no errors
```

### 5. Build
```bash
npm run build         # MUST succeed
```

### 6. Update Documentation
- Update README.md if adding user-facing features
- Update docs/LANGUAGE_SPEC.md if changing language features
- Update DESIGN_PROMPTS.md with outcome

### 7. Commit and Push
**ALWAYS commit and push after every completed task:**
```bash
git add -A
git commit -m "feat/fix/chore: description"
git push origin $(git branch --show-current)
```

### Workflow Summary
```
Prompt → Log → Implement → Test → Check → Build → Document → Commit → Push
```

**Never leave uncommitted work!** Each task should result in a pushed commit.

## Development Server

```bash
npm run dev          # Dashboard at http://localhost:5173
```

## Project Structure

```
ctiw/
├── src/
│   ├── routes/              # SvelteKit routes
│   │   ├── +page.svelte     # Main IDE page
│   │   └── +layout.svelte   # App layout
│   ├── lib/
│   │   ├── components/      # Svelte components
│   │   │   ├── Editor.svelte      # Code editor component
│   │   │   └── Preview.svelte     # HTML preview component
│   │   ├── parser/          # CTIW parser/transpiler
│   │   │   ├── lexer.ts           # Tokenizer
│   │   │   ├── parser.ts          # AST parser
│   │   │   └── codegen.ts         # HTML/CSS code generator
│   │   ├── utils/           # Utilities
│   │   └── stores/          # Svelte stores
│   └── app.css              # Global styles
├── tests/                   # Test files
├── AGENTS.md               # This file
├── CLAUDE.md               # Claude-specific settings
├── DESIGN_PROMPTS.md       # Development log
└── README.md               # Project documentation
```

## Key Technologies

- **SvelteKit 5** - Web framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **CodeMirror 6** or **Monaco** - Code editor
- **Vitest** - Unit testing

## Git Workflow

### Commit Message Format
```
type(scope): description

🤖 Generated with [AI Agent Name]

Co-Authored-By: Agent <agent@example.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Before Every Commit
1. Run `npm run check` - must pass
2. Run `npm run build` - must succeed
3. Run `npm test` - all tests must pass
4. Review changes with `git diff`

## Testing Guidelines

### Unit Tests
```typescript
import { describe, it, expect } from 'vitest';
import { parse } from '$lib/parser/parser';

describe('CTIW Parser', () => {
  it('parses a simple element', () => {
    const ast = parse('box { }');
    expect(ast.type).toBe('Element');
  });
});
```

### Running Tests
```bash
npm test           # Run all tests
npm test -- --watch  # Watch mode
```

## Code Style

### TypeScript
- Use explicit types, avoid `any`
- Prefer interfaces over types for objects
- Use `$state()` and `$derived()` runes in Svelte 5

### Svelte Components
```svelte
<script lang="ts">
  interface Props {
    code: string;
    onUpdate: (code: string) => void;
  }

  let { code, onUpdate }: Props = $props();
</script>
```

### CSS
- Use Tailwind utility classes
- Custom CSS in component `<style>` blocks when needed

## Parser Implementation Notes

The CTIW language grammar will be defined based on Clark's original design. Key considerations:

- Parse CTIW syntax into an AST
- Transform AST to HTML/CSS
- Provide helpful error messages for kids
- Support incremental parsing for live preview

## Error Handling

- Log errors with context
- Show user-friendly messages (kid-friendly!)
- Provide suggestions for fixing common mistakes
- Never show scary stack traces

---

## Quick Reference

### Common Commands
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run check            # Type check
npm test                 # Run tests
```

### Development Checklist
- [ ] Read AGENTS.md before starting
- [ ] Document task in DESIGN_PROMPTS.md
- [ ] Follow code style guidelines
- [ ] Run all checks before committing
- [ ] Write meaningful commit messages
