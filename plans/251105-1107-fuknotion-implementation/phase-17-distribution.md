# Phase 17: Packaging & Distribution

**Phase:** 17/17 | **Duration:** 2 days | **Priority:** High | **Status:** Pending

## Context

**Parent:** `plan.md` | **Dependencies:** Phase 16 | **Next:** Release!

## Overview

Package for Windows/macOS/Linux, installers, auto-update, distribution.

## Requirements

- Windows installer (MSI)
- macOS DMG + app bundle
- Linux AppImage/deb/rpm
- Auto-update
- Code signing

## Architecture

```bash
wails build -platform windows/amd64
wails build -platform darwin/amd64,darwin/arm64
wails build -platform linux/amd64
```

## Related Files

**Create:**
- `build/darwin/Info.plist`
- `build/windows/installer.nsi`
- `build/linux/fuknotion.desktop`

## Implementation Steps

1. Configure build targets
2. Windows installer
3. macOS DMG
4. Linux packages
5. Code signing
6. Auto-update
7. CI/CD pipeline
8. Release notes

## Todo List

- [ ] Windows MSI
- [ ] macOS DMG + signing
- [ ] Linux AppImage
- [ ] Auto-update
- [ ] Code signing
- [ ] CI/CD
- [ ] Distribution
- [ ] Release notes

## Success Criteria

- Installers work
- Auto-update functional
- Code signed
- App size < 20MB
- Ready for release

## Next Steps

Public release!
