# Agent Instructions for simple-message-encrypt

## Project Overview
This is a browser-based message encryption tool using XChaCha20-Poly1305AEAD with scrypt key derivation. Built with Vite, Preact, and TypeScript.

## Build/Lint/Test Commands

### Development
```bash
npm run dev          # Start Vite dev server with hot reload
npm run preview      # Preview production build locally
```

### Production Build
```bash
npm run build        # Type-check with tsc, then build with Vite
```

### Type Checking
```bash
npx tsc -b           # Run TypeScript compiler in build mode (references)
npx tsc --noEmit     # Type-check without emitting files
```

### Single File/Component Testing
Since this project has no test framework, test new code by:
1. Create a temporary HTML file importing the component
2. Use the dev server to verify functionality
3. Manual testing in browser devtools

## Code Style Guidelines

### TypeScript Conventions
- **Strict mode enabled**: All strict checks are enforced
- Use explicit types for function parameters and return types
- Prefer `async/await` over raw Promises
- Use `Uint8Array` for binary data (encryption keys, nonces, salts)
- Use `Promise<T>` for functions that may fail

### Naming Conventions
- **Components**: PascalCase (e.g., `App`, `EncryptionPanel`)
- **Functions/Hooks**: camelCase (e.g., `encryptMessage`, `updateSalt`)
- **State variables**: camelCase with descriptive names (e.g., `saltError`, `encryptedMessage`)
- **Constants**: camelCase for module-level, UPPER_SNAKE for truly immutable values
- **CSS classes**: kebab-case (e.g., `encrypted-output`)

### Import Organization
1. External libraries (preact, libsodium, etc.)
2. Relative imports (local modules)
3. Type imports (use `import type` when only importing types)
4. CSS/style imports

```typescript
import { useState } from 'preact/hooks'
import sodium from 'libsodium-wrappers-sumo'
import scrypt from 'scrypt-js'
import type { SomeType } from './types'
import './app.css'
```

### JSX/Preact Patterns
- Self-close components when they have no children: `<InputField />`
- Use `class` attribute for CSS classes (Preact uses DOM property names)
- Destructure props in function signature when possible
- Use explicit `onInput` and `onClick` handlers

### Error Handling
- Validate all user inputs before processing
- Display validation errors inline near the relevant input
- Use descriptive error messages (e.g., "Too short (32 bytes required)")
- Always await async operations or handle Promises explicitly

### Crypto-Specific Guidelines
- Always wait for `sodium.ready` before using sodium functions
- Use `sodium.from_string()` and `sodium.to_string()` for text encoding
- Use `sodium.to_base64()` for displaying binary data to users
- Validate byte lengths match crypto constants (e.g., `crypto_aead_xchacha20poly1305_ietf_NPUBBYTES`)
- Never log sensitive data (keys, passphrases, decrypted messages)

### TypeScript Compiler Options (from tsconfig.app.json)
- Target: ES2022
- Module: ESNext (bundler mode)
- Strict: true
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- `verbatimModuleSyntax`: true (use `import type` for type-only imports)

### File Structure
```
src/
  main.tsx        # Entry point, renders App
  app.tsx         # Main App component
  app.css         # App-specific styles
  index.css       # Global/base styles
  assets/         # Static assets
```

### Component Structure
```typescript
// Prefer named exports for components
export function App() {
  // Hooks at top
  const [state, setState] = useState(initialValue)
  
  // Helper functions
  const handleInput = () => { ... }
  
  // Async operations
  const processData = async () => { ... }
  
  // Return JSX
  return (...)
}
```

### CSS Guidelines
- Use simple CSS (no preprocessors needed)
- Scope styles to specific components with unique class names
- Use CSS custom properties (variables) for theming if needed
- Keep styles minimal - this is a functional tool, not a design showcase

## Known Issues / Gotchas

1. **Sodium initialization**: Always use `await sodium.ready` before any sodium operations
2. **scrypt-js Promise handling**: `scrypt()` returns a Promise - use `.then()` or `await`
3. **Base64 encoding**: User-facing binary data should be Base64 encoded
4. **Preact compatibility**: React aliases are set in tsconfig, so React imports work but Preact is actually used
5. **Built-in types**: libsodium-wrappers-sumo and scrypt-js include their own TypeScript definitions - no @types packages needed
