# Local Demo Smoke Test

Use this workflow before claiming demo readiness.

1. Start services through PM2:

```bash
./start-all-services.sh
```

2. Confirm process ownership:

```bash
pm2 list
```

Required apps:

- `lgg-ruoyi-backend`
- `lgg-ruoyi-frontend`

3. Confirm backend health:

```bash
curl --noproxy '*' -sS http://127.0.0.1:8081/captchaImage
```

4. Confirm frontend health:

```bash
curl --noproxy '*' -sS http://127.0.0.1:8082/
```

5. Confirm business smoke path:

```bash
curl --noproxy '*' -sS -H 'Content-Type: application/json' -d '{"code":"demo"}' http://127.0.0.1:8081/user/user/login
```

Then call a token-protected user API with the returned token.

6. Check logs:

```bash
pm2 logs lgg-ruoyi-backend --lines 80 --nostream
pm2 logs lgg-ruoyi-frontend --lines 80 --nostream
```

No claim of readiness is allowed while unmanaged `java` or `node` processes own ports `8081` or `8082`.
