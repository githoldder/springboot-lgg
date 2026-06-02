# Security Rules

1. Never commit real OSS, WeChat, database, JWT, or tunnel secrets.
2. Replace demo credentials with placeholders before final handoff.
3. Keep `.env*` files out of commits unless they contain only safe demo defaults.
4. Do not print tokens or secret values in final reports.
5. Do not commit generated uploads, runtime logs, database dumps with private data, or PM2 logs.
6. If a secret is already present in source, mark it as a cleanup task instead of copying it into more files.
