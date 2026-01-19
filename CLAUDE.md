# Claude Code Instructions for CTIW

**IMPORTANT**: This file contains Claude Code-specific settings. For shared agent instructions that apply to all coding agents (Claude, Codex, Gemini), see **AGENTS.md**.

## Claude-Specific Settings

Claude Code automatically reads both this file (CLAUDE.md) and AGENTS.md when starting a session.

### Commit Signature

Use this signature for all commits:
```
🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Shared Instructions

All workflow, testing, project structure, and git workflow instructions are in **AGENTS.md**. Please read that file for:

- Automated workflow (save prompts, test, build, commit, push)
- Development server configuration
- Testing commands
- Git workflow and commit conventions
- Project structure
- Key technologies

## Project Structure (Claude-specific paths)

- `/claude/` - Claude Code configuration
  - `settings.json` - Shared settings
  - `settings.local.json` - Local settings (pre-configured permissions)

## Command Permissions

This project has pre-configured command permissions in `claude/settings.local.json` to allow common development commands without asking permission each time. The following patterns are allowed:

- `npm *` - All npm commands
- `npx *` - All npx commands
- `git *` - All git commands
- File operations: `rm`, `mv`, `cp`, `chmod`, `mkdir`, `touch`
- Common utilities: `ls`, `cat`, `echo`, `rg`, `grep`, `find`, `pwd`, `which`, `ps`, `kill`, `head`, `tail`, `less`, `wc`, `sort`, `awk`, `sed`
- Project scripts: `node`, `curl`, `wget`

### Adding New Command Permissions

If you encounter "permission required" prompts for additional commands:

1. Edit `claude/settings.local.json`
2. Add new commands to the `permissions.allow` array using the pattern `"Bash(command:*)"`
3. Use wildcards (`*`) for broad command families
4. Commit the changes so future Claude sessions inherit the permissions

## Key Technologies

- SvelteKit 5 with TypeScript
- Tailwind CSS for styling
- CodeMirror 6 or Monaco for code editing
- Vitest for testing

## CTIW-Specific Guidelines

### Parser Development
- Keep the grammar simple and kid-friendly
- Provide clear, helpful error messages
- Support incremental parsing for live preview
- Write comprehensive tests for each grammar rule

### Kid-Friendly Considerations
- Use simple, encouraging language in errors
- Make the interface colorful and inviting
- Provide instant feedback
- Celebrate successes!
