# Security Policy 🛡️

## 🔒 Reporting a Vulnerability

We value the security community and are committed to maintaining a secure environment for our users. If you discover a security vulnerability within this project, please follow the steps below:

1. **Internal Disclosure**: Do not disclose the vulnerability publicly until it has been addressed.
2. **Contact**: Send a detailed report to the maintainers or via the platform's reporting tool.
3. **Details**: Include as much information as possible:
   - Type of issue (e.g., XSS, SQLi, Auth bypass)
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

## 🛡️ Our Security Posture

Gabay implements a multi-layered security architecture (Gabay Security Protocol) to ensure data integrity and user privacy:

- **Identity & Access Management (IAM)**:
  - **Google OAuth 2.0**: Secure authentication using Google's identity provider.
  - **JWT Session Management**: Signed and encrypted JSON Web Tokens (JWT) for stateless, secure session handling.
  - **Role-Based Access Control (RBAC)**: Strict separation of privileges between `USER` and `ADMIN` roles.
  - **Developer Login Protection**: A configurable bypass for development that can be strictly disabled via `VITE_DISABLE_DEV_AUTH`.

- **Data Protection & Encryption**:
  - **AES-256-CBC Field Encryption**: Sensitive data (emails, names, OAuth tokens, and translations) is encrypted at rest within the SQLite database.
  - **AES-256-GCM Backup Encryption**: Database snapshots are protected with industry-standard authenticated encryption.
  - **Kernel Secrets**: Cryptographic keys are derived from high-entropy environment variables (`KERNEL_SECRET`, `SESSION_SECRET`).

- **Infrastructure & Network Security**:
  - **HTTP Security Headers**: Powered by `helmet`, implementing strict Content Security Policy (CSP), HSTS, and Frame Protection.
  - **Rate Limiting**: Intelligent request throttling to mitigate brute-force and Denial of Service (DoS) attempts.
  - **Payload Constraints**: Strict limits on request body sizes (15kb) to prevent resource exhaustion.

- **Threat Mitigation**:
  - **Input Sanitization**: Native protection against Cross-Site Scripting (XSS) via `xss-clean`.
  - **Parameter Pollution Guard**: Mitigation against HTTP Parameter Pollution (HPP) attacks.
  - **System Telemetry**: Comprehensive security logging of all critical administrative actions and system events.
  - **SQLite Local Storage**: Self-contained, local data persistence reducing external attack surface.

## ⚠️ Third-Party Dependencies

We regularly audit our dependencies for known vulnerabilities. We recommend keeping your local installation up to date with the latest security patches from this repository.

## 🛫 On-Device AI Privacy
Gabay supports "Airport Learning Mode" using the experimental **Web Prompt API**.

- **On-Device Processing**: When Local AI is enabled, your learning data and prompts are processed directly on your device's hardware (e.g., Google Chrome's built-in Gemini Nano).
- **Privacy Benefit**: Local roleplay and sentence generation do not send your prompt text to the cloud when this mode is active.
- **Selective Cloud Fallback**: Features requiring internet (like YouTube integration or TTS) will clearly notify you when they need to reach the server.
