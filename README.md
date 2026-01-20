# CTIW

**Clark's Alternative to HTML/CSS** - A programming language for building web pages, designed by an 8-year-old.

## What is CTIW?

CTIW is a kid-friendly programming language that compiles to HTML and CSS. It's designed to be:

- **Easy to learn** - Simpler syntax than HTML/CSS
- **Fun to use** - Instant visual feedback
- **Forgiving** - Helpful error messages
- **Powerful** - Can build real web pages

## Features

- 🎨 **Browser IDE** - Write code and see results instantly
- 🔤 **Syntax Highlighting** - Color-coded CTIW syntax
- ✨ **Autocomplete** - Smart code suggestions
- 🤖 **AI Assist** - Get help writing CTIW code
- 📱 **Responsive Preview** - See how pages look on different devices

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
ctiw/
├── src/
│   ├── routes/          # SvelteKit pages
│   ├── lib/
│   │   ├── components/  # UI components
│   │   ├── parser/      # CTIW parser/transpiler
│   │   └── utils/       # Utilities
│   └── app.css          # Global styles
├── tests/               # Test files
├── AGENTS.md           # AI agent instructions
├── CLAUDE.md           # Claude-specific settings
└── DESIGN_PROMPTS.md   # Development log
```

## The CTIW Language

See the full [Language Specification](./docs/LANGUAGE_SPEC.md) for details.

### Quick Example

```ctiw
=CTIW=
=title=My Page=

=divide= id:header= color=BAF2Y9=
.. =text=Welcome!=
=divide=

=divide= id:main=
.. =password=
.. =button=Login=
=divide=

==CTIW==
```

### Key Features

- **`=` delimiters** - Easy to type, visually clear
- **Dots for nesting** - `.....` shows indentation you can see!
- **Simple elements** - `=title=`, `=button=`, `=divide=`
- **Hex colors** - `color=FF0000=` (no # needed)

## For AI Agents

See [AGENTS.md](./AGENTS.md) for development instructions.

## License

MIT
