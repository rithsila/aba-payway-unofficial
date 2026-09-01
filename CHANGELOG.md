# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0]

### Added
- Support for the ABA Mobile deeplink flow end to end.

### Changed
- Style match header color and flag-tail notch to official KHQR branding.
- Redesigned card template to fix clip-path/transform bug.

### Fixed
- Preserved quickchart's viewBox so the QR fills the frame natively.
- Fixed the fetching of QR to fill the frame appropriately, not just to its native size.
- Corrected fabricated method names in the LLM agent guide.

### Documentation
- Documented `generateKHQR` in the agent guide's KHQR step.
- Broadened agent-guide stack detection beyond 5 JS frameworks.

## [1.1.0]

### Added
- Credential preflight and QR-viewing scripts, alongside a testing guide.

### Fixed
- Parsed ABA's v3 response envelope properly.
- Fixed `tsconfig` flag invalidation blocking the build.
- Fixed build by ordering types condition first and adding ignoreDeprecations.
- Corrected webhook secret and dropped unrelated app docs.

### Removed
- Removed `docs-site` after moving it to a separate repository.

## [1.0.0] - Initial Release

### Added
- Initial setup and scaffolding for `aba-payway-sdk-unofficial`.
- `ABAPayWay` client implementation with purchase, status check, and webhook verification.
- Configurable KHQR SVG generator.
- Utilities for transaction ID, timestamp, phone formatting, and QR expiration.
- HMAC-SHA512 hash generation for ABA API authentication.
- TypeScript type definitions.
- Sandbox integration tests, `env` example, and project documentation.
- Fumadocs documentation website and LLM agent integration guide.

### Fixed
- Corrected `req_time` timezone, items encoding, and non-JSON replies.
