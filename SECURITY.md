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

Gabay implements several layers of security to protect users:

- **Input Validation**: All user inputs are sanitized to prevent XSS and injection attacks.
- **Security Headers**: We use `helmet` to set secure HTTP headers.
- **Rate Limiting**: To prevent brute-force and DDoS attacks.
- **Environment Management**: Sensitive keys are managed via environment variables and never exposed to the client-side unless prefixed with `VITE_`.
- **Identity Protection**: Secure session management with encrypted JWTs and SQLite back-end storage.

## ⚠️ Third-Party Dependencies

We regularly audit our dependencies for known vulnerabilities. We recommend keeping your local installation up to date with the latest security patches from this repository.
