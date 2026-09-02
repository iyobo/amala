# Security policy

## Supported versions

Security fixes are applied to the current major release. Older majors are not routinely maintained; users should upgrade before requesting a backport.

| Version | Security updates |
| --- | --- |
| 10.x | Supported |
| 9.x and earlier | Not routinely supported |

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability.

Use **Security → Report a vulnerability** on the [Amala GitHub repository](https://github.com/iyobo/amala/security) when private vulnerability reporting is available. Include:

- the affected Amala and Node.js versions;
- a minimal reproduction or proof of concept;
- the expected and observed behavior;
- the likely impact and any known mitigations; and
- whether the report or reproduction may be shared with other maintainers.

If private reporting is unavailable, contact the maintainer through their GitHub profile before sending sensitive details. You can expect an acknowledgement after the report is reviewed, followed by coordinated disclosure details when the issue is confirmed.

## Security boundaries

Amala provides routing, request-data injection, validation integration, error handling, and optional HTTP headers, CORS, body parsing, and API documentation. It does not provide authentication, authorization, rate limiting, CSRF protection for cookie-authenticated applications, secret management, TLS termination, or upload-content scanning.

Controller classes and controller glob paths are startup configuration and must be trusted. Loading a controller executes that module. Amala also maintains decorator metadata at process scope; applications with mutually untrusted tenants or API modules should isolate them in separate processes.

See the [production security guide](https://amalajs.com/docs/security) for deployment guidance.
