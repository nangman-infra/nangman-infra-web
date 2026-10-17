# Security overview

`GET /api/v1/security/overview?source=all|ids|firewall` returns sanitized OPNsense telemetry. It is registered in the existing backend through `SecurityModule`.

The page refreshes every ten seconds while visible. Concurrent requests share the same in-flight query and a ten-second memory cache. Each successful response replaces that source's snapshot; there is no database, event file, background collector, or accumulated history. Failed reads retain the last successful in-memory result with `stale: true`. A process restart clears it.

The overview cards describe both sources. The source selector filters country, category, port, and event exploration. IDS requests are bounded to 5,000 records and firewall responses to 1,000 records. Each source reports its actual oldest/newest timestamps and matched count. These are not daily or all-time totals. IPS blocks are a subset of IDS detections, and firewall policy blocks do not establish malicious intent.

Only public-origin inbound IDS events targeting private or explicitly protected addresses and inbound WAN firewall blocks are included. Raw IP addresses, payloads, interface addresses and credentials never enter the public response. Country lookup uses a local DB-IP Country Lite CSV or CSV.GZ file.

## Server configuration

Set these environment variables only on the backend:

| Variable | Purpose |
| --- | --- |
| `SECURITY_OPNSENSE_URL` | HTTPS management origin |
| `SECURITY_OPNSENSE_CREDENTIALS_FILE` | Absolute path to a `key=...` / `secret=...` file readable only by its owner and the backend account |
| `SECURITY_OPNSENSE_CA_FILE` | Absolute path to the trusted appliance certificate in PEM format |
| `SECURITY_OPNSENSE_CERT_SHA256` | Independently verified SHA-256 leaf certificate fingerprint |
| `SECURITY_WAN_INTERFACES` | Comma-separated physical WAN interfaces; otherwise discover interfaces named WAN |
| `SECURITY_PROTECTED_ADDRESSES` | Optional public destination addresses whose inbound IDS events are in scope |
| `SECURITY_SOURCE_UTC_OFFSET` | Offset for timezone-less firewall timestamps, default `+09:00` |
| `SECURITY_GEOIP_FILE` | Absolute path to a DB-IP Country Lite country database; without it, countries are unknown |

Use a dedicated read-only API account. Allowed requests are IDS `status`, `query_alerts`, `list_rulesets`, firewall `log`, and interface `get_interface_names`. Only `query_alerts` uses POST for a read operation. The client rejects other paths and all other POST payloads, requires a trusted certificate, and enforces the explicit certificate pin.

The frontend only uses the existing server-side `BACKEND_URL`; no OPNsense credentials belong in `NEXT_PUBLIC_*`. Production requires the configured files to be available at absolute container paths. Missing configuration leaves the page visibly unavailable.

### Docker deployment

The deployment environment file is `/home/seongwon/nangman-infra-web/.env`, with mode `0600`. Set `SECURITY_FILES_DIR=/home/seongwon/nangman-infra-web/.secrets/security` and place `api-key.txt`, `appliance.pem`, and `dbip-country-lite.csv.gz` in that directory. Keep the directory at mode `0750` and files at mode `0640`, with group `10001` so the backend's fixed UID/GID `10001` can read them. For a local process using its own account, mode `0600` is sufficient.

Compose mounts this directory read-only at `/run/secrets/nangman-security` and supplies the three absolute file paths to the backend. The directory, environment files, and API credentials are excluded from Git and Docker build contexts.

After changing server environment variables or mounts, recreate the backend through Compose. An image-only Watchtower update retains the container's previous environment and mounts. Main pushes run Jenkins validation; deployment continues through the existing approval flow.

## Local preview

Build the backend first. With the server variables supplied in the process environment, run:

```sh
cd /Volumes/WD/Developments/nangman-infra/backend
pnpm exec nest build
node /Volumes/WD/Developments/nangman-infra/backend/scripts/security-preview.cjs
```

This starts only the Security API on loopback port 3333 and avoids unrelated CMS synchronization jobs. The normal application still uses its existing entry point.

```sh
cd /Volumes/WD/Developments/nangman-infra/frontend
BACKEND_URL=http://127.0.0.1:3333 pnpm exec next dev --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000/ko/security` or `http://127.0.0.1:3000/en/security`.

Map geometry is derived from Natural Earth (public domain). Country lookup attribution: DB-IP Lite, CC BY 4.0.
