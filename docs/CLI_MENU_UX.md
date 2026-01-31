# CLI Menu Interface: Readability & Usability

Reference for designing terminal menus that are easy to read and use.

**This project uses [@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js):** `select` for the main menu (Scan / Delete / Quit) and `checkbox` for choosing delete targets, with arrow keys and visual selection. See `src/cli.js`.

---

## Problems with Numeric-Only Menus

- **Counting mistakes**: Users miscount or type the wrong number under pressure.
- **No visual feedback**: Current selection is not highlighted; users must remember what they chose.
- **Error-prone input**: Typing "1 3 5" or "all" is fragile (typos, spaces, invalid numbers).
- **Poor discoverability**: What keys do what is not obvious without reading the prompt.

*Ref: "Stop Using Crappy Bash Menus" – arrow keys + visual selection are better than numeric input.*

---

## Best Practices (from clig.dev & others)

### Human-first design

- If the command is used mainly by humans, design for humans first.
- Prefer **interactive prompts** when `stdin` is a TTY; use flags/args when not (e.g. scripts).
- Support `--no-input` (or similar) to disable prompts and require flags.

### Ease of discovery

- Lay out options clearly so users can see what’s possible without memorizing.
- Use **arrow keys + Enter** for selection so users don’t have to type numbers.
- Show **current selection** (e.g. `>` or highlight) and short hints (e.g. “↑↓ move, space select”).

### Conversation as the norm

- Multi-step flows are normal; guide the user step by step.
- After an action (e.g. scan or delete), **return to the menu** so the next step is obvious.
- **Confirm before destructive actions** (e.g. “Delete selected? (y/N)”).

### Robustness & feedback

- **Progress** for long operations (e.g. “Scanning…” with a spinner or progress line).
- **Handle Ctrl+C** cleanly (e.g. catch exit prompt errors, print “Bye.” and exit).
- **Validate input** and show clear errors; suggest what to do next.

### Output

- Use **color sparingly** (e.g. errors, highlights); disable when not a TTY or when `NO_COLOR` is set.
- Prefer **brief, clear messages**; avoid walls of text unless the user asked for detail.

---

## Recommended: Interactive Prompts Library

Using a library that supports **arrow keys + visual selection** improves both readability and usability.

### @inquirer/prompts (Node.js)

- **select**: Single choice; ↑↓ to move, Enter to confirm. Shows `>` on current option.
- **checkbox**: Multiple choice; ↑↓ to move, Space to toggle, Enter to confirm. Shows `◉` / `◯`.
- **confirm**: Yes/No with clear default (e.g. `(y/N)`); no typing “y” or “yes” by mistake.

Benefits:

- No numeric typing: fewer mistakes and no “1 3 5” vs “1, 3, 5” parsing.
- Clear current selection and hints.
- Handles TTY, raw mode, and Ctrl+C (e.g. `ExitPromptError`) so you can exit gracefully.
- Consistent look and behavior across prompts.

### Example flow

1. **Main menu**: `select` → “Scan”, “Delete”, “Quit”. User moves with arrows, Enter to choose.
2. **Scan**: Run scan, show results, then show main menu again.
3. **Delete**: Run scan → show `checkbox` list of deletable items (name + size) → user selects with Space/arrows → `confirm` “Delete N selected? (y/N)” → delete → show main menu again.
4. **Quit**: Exit with a short message (e.g. “Bye.”).

Optional: If `stdin` is not a TTY, skip the menu and show help or require a flag (e.g. `--scan-only`, `--delete`).

---

## References

- [Command Line Interface Guidelines (clig.dev)](https://clig.dev/) – philosophy, help, output, errors, interactivity
- [@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js) – select, checkbox, confirm, and other prompts
- “Stop Using Crappy Bash Menus” – why arrow-key menus beat numeric input
