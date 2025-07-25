# Change Log

All notable changes to the "forgot-content-type-json-header" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.0.2] - 2025-07-25

### Added
- Automatic diagnostic cleanup when files are deleted to prevent stale entries in Problems panel
- Comprehensive test suite for extension event listeners (30 tests total)
- Test coverage for file deletion cleanup functionality
- Test coverage for document change and editor change listeners
- Test coverage for diagnostic collection management

### Changed
- Improved VS Code compatibility by supporting older engine versions (^1.102.0)
- Updated dependencies and lock file for better stability

### Fixed
- Extension now properly cleans up diagnostics when files with warnings are deleted
- Prevents accumulation of stale diagnostic entries

## [0.0.1] - 2025-07-25

### Added
- Initial release of VS Code extension
- Real-time detection of `fetch()` calls using `JSON.stringify()` without proper `Content-Type: application/json` header
- Support for JavaScript, TypeScript, JSX, and TSX files
- Yellow squiggly warnings under problematic `JSON.stringify()` calls
- Diagnostic integration with VS Code Problems panel
- Automatic checking on file open, text changes, and editor switches
- Modular architecture with separate fetch detection and diagnostics modules
- Comprehensive README with usage examples and troubleshooting
- MIT License
- Extension icon and marketplace metadata
