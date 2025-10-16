# Troubleshooting Guide

This guide covers common issues you might encounter while developing or using the Agentic AI App Generator.

## Table of Contents

1. [Setup Issues](#setup-issues)
2. [API and Authentication Issues](#api-and-authentication-issues)
3. [Build and Development Issues](#build-and-development-issues)
4. [Runtime Issues](#runtime-issues)
5. [Agent Generation Issues](#agent-generation-issues)
6. [Browser and UI Issues](#browser-and-ui-issues)

---

## Setup Issues

### "node: command not found" or "npm: command not found"

**Problem:** Node.js or npm is not installed or not in your PATH.

**Solution:**
1. Install Node.js from [nodejs.org](https://nodejs.org/) (v18 or higher)
2. Verify installation: `node --version` and `npm --version`
3. Restart your terminal after installation

### "npm install" fails with permission errors

**Problem:** Insufficient permissions to install packages.

**Solution:**

On macOS/Linux:
```bash
# Don't use sudo with npm!
# Instead, fix npm permissions:
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

On Windows:
- Run your terminal as Administrator
- Or use nvm-windows to manage Node.js installations

### "Cannot find module" errors after installation

**Problem:** Dependencies not properly installed.

**Solution:**
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install
```

---

## API and Authentication Issues

### "GEMINI_API_KEY not found"

**Problem:** Environment variable not configured or not loaded.

**Solution:**

1. Ensure `.env.local` exists:
   ```bash
   cp .env.local.template .env.local
   ```

2. Edit `.env.local` and add your actual API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. Restart the development server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

4. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### "Invalid API key" or "API key authentication failed"

**Problem:** API key is incorrect or expired.

**Solution:**

1. Verify your API key is correct (no extra spaces or quotes)
2. Check if the API key has proper permissions
3. Generate a new API key if needed
4. Ensure no line breaks in the `.env.local` file

### "API rate limit exceeded"

**Problem:** Too many requests to the Gemini API.

**Solution:**

1. Wait a few minutes before trying again
2. Check your API quota in Google AI Studio
3. Consider upgrading your API plan for higher limits
4. Reduce the complexity of your prompts temporarily

### Supabase authentication not working

**Problem:** Cannot sign in or authentication errors.

**Solution:**

1. Check if Supabase credentials are configured (if using Supabase)
2. Verify network connectivity
3. Check browser console for specific error messages
4. Clear browser cookies and cache
5. Try in incognito/private browsing mode

---

## Build and Development Issues

### "Port 3000 is already in use"

**Problem:** Another application is using port 3000.

**Solution:**

Option 1 - Use automatic port selection:
```bash
# Vite will automatically use the next available port
npm run dev
# Check terminal output for the actual port
```

Option 2 - Stop the conflicting process:
```bash
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Option 3 - Change the port in `vite.config.ts`:
```typescript
server: {
  port: 3001, // Use a different port
  host: '0.0.0.0',
}
```

### "Failed to resolve module specifier" errors

**Problem:** Import path resolution issues.

**Solution:**

1. Check that the import path is correct
2. Verify the file exists at the specified location
3. Use the `@/` alias for root-level imports:
   ```typescript
   import { Agent } from '@/types';
   ```

### Build warnings about large chunk size

**Problem:** Bundle size is larger than recommended.

**Solution:**

This is a known issue and the app will still work. To reduce bundle size:

1. Use dynamic imports for large components:
   ```typescript
   const PreviewModal = lazy(() => import('./components/PreviewModal'));
   ```

2. Consider code-splitting strategies
3. Or increase the warning limit in `vite.config.ts`:
   ```typescript
   build: {
     chunkSizeWarningLimit: 1000,
   }
   ```

### TypeScript errors during development

**Problem:** Type checking errors.

**Solution:**

1. Ensure `tsconfig.json` is properly configured
2. Run type checking: `npx tsc --noEmit`
3. Install missing type definitions:
   ```bash
   npm install --save-dev @types/node
   ```

---

## Runtime Issues

### "Cannot read property of undefined" errors

**Problem:** Accessing properties on null/undefined objects.

**Solution:**

1. Check browser console for the exact error location
2. Add null checks in your code:
   ```typescript
   if (agent && agent.status) {
     // Safe to access agent.status
   }
   ```
3. Use optional chaining:
   ```typescript
   const status = agent?.status ?? 'pending';
   ```

### State not updating after actions

**Problem:** React state updates not reflecting in UI.

**Solution:**

1. Ensure you're using state setters correctly:
   ```typescript
   // Correct
   setAgents(prev => [...prev, newAgent]);
   
   // Incorrect
   agents.push(newAgent); // Don't mutate state directly
   ```

2. Check React DevTools to verify state changes
3. Ensure proper dependency arrays in useEffect hooks

### "Module is not defined" error in tailwind.config.js

**Problem:** Tailwind config trying to use CommonJS in ES module context.

**Solution:**

This is a known issue with the CDN version of Tailwind. It doesn't affect functionality. To suppress:

1. Use a local Tailwind installation instead of CDN
2. Or ignore the warning (app still works)

---

## Agent Generation Issues

### Agents stuck in "pending" or "running" state

**Problem:** Agent workflow not progressing.

**Solution:**

1. Check browser console for error messages
2. Verify API key is valid
3. Check network tab for failed API requests
4. Restart the generation process
5. Try a simpler prompt first

### Generated code is incomplete or malformed

**Problem:** Agent output is not valid HTML/CSS/JS.

**Solution:**

1. Use the refinement feature to improve output
2. Try a more specific or simpler prompt
3. Check the audit log for agent errors
4. Review the Reviewer agent's output for issues

### "Agent failed" errors

**Problem:** An agent encountered an error during execution.

**Solution:**

1. Read the error message in the agent card
2. Check the audit log for detailed information
3. Common causes:
   - API timeout - retry the operation
   - Invalid output format - use refinement
   - API rate limits - wait and retry
4. Use the recovery feature if available

### Preview shows blank page

**Problem:** Generated HTML doesn't render properly.

**Solution:**

1. Check browser console for JavaScript errors
2. View the generated code directly
3. Look for syntax errors in the code
4. Try refining with: "Fix any errors in the code"

---

## Browser and UI Issues

### CSS styles not loading or broken layout

**Problem:** Tailwind or custom styles not applying.

**Solution:**

1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for CSS loading errors
4. Verify CDN resources are accessible (may be blocked by ad blockers)

### Dark mode not working

**Problem:** Theme toggle doesn't change appearance.

**Solution:**

1. Check if dark mode classes are applied to the root element
2. Verify Tailwind's dark mode configuration
3. Clear browser local storage:
   ```javascript
   localStorage.clear();
   ```
4. Refresh the page

### Mobile navigation issues

**Problem:** Bottom navigation not working on mobile.

**Solution:**

1. Check viewport width (should be < 1024px for mobile view)
2. Verify JavaScript is enabled
3. Check browser console for errors
4. Try resizing browser window to trigger responsive layout

### Images or icons not loading

**Problem:** Visual assets not displaying.

**Solution:**

1. Check browser console for 404 errors
2. Verify image URLs are correct
3. Check if content blockers are interfering
4. Clear browser cache
5. For CDN resources, check network connectivity

---

## Still Having Issues?

If your issue isn't covered here:

1. **Check the logs:**
   - Browser console (F12 → Console)
   - Network tab (F12 → Network)
   - Audit log in the application

2. **Search existing issues:**
   - [GitHub Issues](https://github.com/robert2687/Agentic-AI-App-Generator-No.1/issues)
   - Look for similar problems

3. **Create a new issue:**
   - Include your environment details (OS, Node version, browser)
   - Provide error messages and screenshots
   - Describe steps to reproduce
   - Share relevant code if applicable

4. **Useful debugging commands:**
   ```bash
   # Check versions
   node --version
   npm --version
   
   # Verify environment
   npm run verify-setup
   
   # Clean build
   npm run build
   
   # Check for dependency issues
   npm ls
   ```

## Additional Resources

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contributing guidelines
- [Vite Documentation](https://vitejs.dev/guide/troubleshooting.html)
- [React Documentation](https://react.dev/learn/troubleshooting)
- [Google Gemini API Docs](https://ai.google.dev/docs)

---

## Preventive Tips

To avoid common issues:

1. ✅ Always use Node.js v18 or higher
2. ✅ Keep dependencies up to date: `npm update`
3. ✅ Use the setup verification script: `npm run verify-setup`
4. ✅ Commit your `.env.local.template` but never `.env.local`
5. ✅ Clear browser cache when testing UI changes
6. ✅ Use React DevTools for debugging component issues
7. ✅ Monitor API usage to avoid rate limits
8. ✅ Test in multiple browsers (Chrome, Firefox, Safari)
9. ✅ Keep your Gemini API key secure
10. ✅ Read error messages carefully - they often contain the solution
