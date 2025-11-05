# Research Report: Wails (React + Go) Best Practices

**From:** researcher-wails
**To:** planner
**Date:** 2025-11-05
**Topic:** Best practices for building desktop apps with Wails framework

## Executive Summary

Wails v3 provides lightweight desktop app framework using React + Go with native webview (no Chromium). Apps are 90% smaller than Electron, with native performance and better resource management.

## Core Architecture

**Binding System:**
- Go methods auto-exposed to JS with TypeScript bindings
- All frontend calls are async (return Promise)
- Methods must be exported (capitalized) in Go
- Automatic struct-to-TS model generation

**Project Structure:**
```
app/
├── frontend/          # React app
├── backend/           # Go code
├── build/             # Build configs
└── wails.json         # Project config
```

## Best Practices (2025)

### Performance Optimization

1. **Minimize Go-JS Bridge Calls**
   - Batch operations when possible
   - Reduce round-trips between frontend/backend
   - Use efficient data structures

2. **Frontend Bundle Optimization**
   - Code splitting for large apps
   - Lazy load routes/components
   - Tree-shake unused code

3. **Go Backend Efficiency**
   - Use appropriate Go types (avoid reflection-heavy patterns)
   - Leverage goroutines for async ops
   - Cache frequently accessed data

### Common Pitfalls & Solutions

**Missing Dependencies:**
- Run `wails doctor` to check system requirements
- Install platform-specific webview libs

**Frontend Build Failures:**
- Verify Node.js version compatibility
- Clear npm cache: `npm cache clean --force`
- Check package-lock.json for conflicts

**Go Methods Not Available:**
- Ensure method names are exported (capitalized)
- Regenerate bindings: `wails dev -s`
- Check method signatures match expected types

**Cookie Limitation:**
- Native webview doesn't support standard cookies
- Workaround: use localStorage or global window variables
- Consider custom storage layer in Go backend

### Development Workflow

1. **Setup:**
   ```bash
   wails init -n myapp -t react-ts
   cd myapp
   wails dev
   ```

2. **Development:**
   - Use `wails dev` for hot reload
   - Frontend changes auto-reload
   - Backend changes require restart

3. **Building:**
   ```bash
   wails build              # Current platform
   wails build -platform darwin/amd64  # Cross-compile
   ```

### Architecture Patterns

**Recommended Structure:**
```go
// app.go - Main application struct
type App struct {
    ctx context.Context
    db  *Database
}

// NewApp - Constructor
func NewApp() *App {
    return &App{}
}

// startup - Lifecycle hook
func (a *App) startup(ctx context.Context) {
    a.ctx = ctx
    // Initialize services
}

// Exported methods callable from frontend
func (a *App) GetData() string {
    return "data"
}
```

**State Management:**
- Use React state/context for UI state
- Call Go backend for persistent data
- Implement event system for backend-to-frontend updates

### Desktop App Considerations

**File System Access:**
- Use Go's file I/O (more reliable than browser APIs)
- Implement proper path handling for cross-platform
- Use `wails.json` to configure app directories

**Native Features:**
- System tray: Use Wails runtime APIs
- Notifications: Platform-specific via Go
- Menu bar: Configure in `wails.json`

**Security:**
- Validate all frontend inputs in backend
- Use HTTPS for external API calls
- Implement proper auth storage (OS keychain)

## Key Advantages

1. **Size:** 90% smaller than Electron (~10MB vs ~100MB)
2. **Performance:** Native webview = lower memory/CPU
3. **Developer Experience:** TypeScript bindings auto-generated
4. **Cross-platform:** Single codebase for Win/Mac/Linux
5. **Go Ecosystem:** Access to Go's powerful stdlib

## Limitations

1. **No Cookie Support:** Native webview restriction
2. **Webview Differences:** Behavior varies by OS
3. **Limited Node Modules:** Some npm packages may not work
4. **Smaller Ecosystem:** Less mature than Electron

## Recommendations for Fuknotion

1. Use Wails v3 (latest stable)
2. Implement custom storage layer in Go (SQLite)
3. Use localStorage for session management
4. Leverage Go for file I/O and sync operations
5. Keep UI logic in React, data logic in Go
6. Test on all target platforms early

## References

- Wails Official Docs: https://wails.io/docs/introduction/
- GitHub: https://github.com/wailsapp/wails
- Community examples: https://github.com/wailsapp/awesome-wails

## Unresolved Questions

None - Wails is well-documented and battle-tested for this use case.
