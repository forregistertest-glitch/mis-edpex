---
description: how to safely work while npm dev server is running
---

# Resource-Safe Workflow

This project runs on a machine with limited RAM/CPU. Follow these rules strictly to avoid system hangs.

## Rules

1. **NEVER run terminal commands while `npm run dev` is active.**
   - Use `view_file`, `grep_search`, `find_by_name`, `list_dir`, `view_file_outline` instead.
   - These file-based tools do NOT use terminal and are safe to use anytime.

2. **NEVER run more than 2 terminal commands in parallel.**
   - Even when dev server is stopped, limit to 1-2 commands at a time.

3. **To run build checks:**
   // turbo
   - Stop dev server first: `taskkill /F /IM node.exe`
   // turbo
   - Run build: `npx next build`
   // turbo
   - Restart dev server: `npm run dev`

4. **To run seed scripts or data tasks:**
   - Create a browser-based page (e.g., `/seed`) instead of running Node.js scripts via terminal.
   - The dev server must be running for browser-based tools.

5. **If the system hangs:**
   - Stop all work immediately.
   - Tell the user to run: `taskkill /F /IM node.exe`
   - Then restart VS Code.
