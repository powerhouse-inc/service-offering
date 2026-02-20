# Deployment Reference

Complete reference for publishing packages, deploying servers, and managing production environments in the Powerhouse/Vetra ecosystem.

---

## Package Publishing

### 5-Step Workflow

1. **Quality checks**:
   ```bash
   npm run tsc          # TypeScript type checking
   npm run lint:fix     # ESLint with auto-fix
   pnpm run test        # Run tests
   ```

2. **Build the package**:
   ```bash
   pnpm build
   ```

3. **Verify package.json**:
   ```json
   {
     "name": "@your-org/your-package",
     "version": "1.0.0",
     "type": "module",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "files": ["dist", "powerhouse.manifest.json"]
   }
   ```

4. **Verify manifest** (`powerhouse.manifest.json`):
   ```json
   {
     "name": "@your-org/your-package",
     "documentModels": ["document-models/*/index.ts"],
     "editors": ["editors/index.ts"],
     "processors": [],
     "subgraphs": []
   }
   ```

5. **Publish**:
   ```bash
   npm publish --access public
   ```

### Post-Publish

After publishing, other projects can install your package:

```bash
ph use @your-org/your-package
```

---

## Production Server Deployment

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm package manager
- Docker (optional, for containerized deployment)

### Server Setup (DigitalOcean / AWS / VPS)

1. **Install dependencies**:
   ```bash
   # Install Node.js (using nvm)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18

   # Install pnpm
   npm install -g pnpm

   # Install Powerhouse CLI
   pnpm install -g ph-cmd
   ```

2. **Clone and set up your project**:
   ```bash
   git clone <your-repo-url>
   cd <your-project>
   pnpm install
   pnpm build
   ```

3. **Start the Switchboard**:
   ```bash
   ph switchboard
   ```

4. **Start the Reactor** (if needed):
   ```bash
   ph reactor start
   ```

---

## Service Management

### Using systemd (Linux)

Create a service file for auto-restart:

```ini
# /etc/systemd/system/powerhouse-switchboard.service
[Unit]
Description=Powerhouse Switchboard
After=network.target

[Service]
Type=simple
User=powerhouse
WorkingDirectory=/opt/powerhouse/your-project
ExecStart=/usr/bin/ph switchboard
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable powerhouse-switchboard
sudo systemctl start powerhouse-switchboard
sudo systemctl status powerhouse-switchboard
```

### Using PM2

```bash
npm install -g pm2
pm2 start "ph switchboard" --name powerhouse-switchboard
pm2 save
pm2 startup
```

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

# Install pnpm and ph-cmd
RUN npm install -g pnpm ph-cmd

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .
RUN pnpm build

EXPOSE 4001

CMD ["ph", "switchboard"]
```

### Docker Compose

```yaml
version: "3.8"
services:
  switchboard:
    build: .
    ports:
      - "4001:4001"
    environment:
      - NODE_ENV=production
    restart: always
    volumes:
      - switchboard-data:/app/data

volumes:
  switchboard-data:
```

```bash
docker-compose up -d
```

---

## Environment Configuration

### Network Endpoints

| Service | Default Port | URL |
|---------|-------------|-----|
| Connect Studio | 3000 | `http://localhost:3000` |
| Switchboard | 4001 | `http://localhost:4001` |
| Reactor API | 4001 | `http://localhost:4001/api/v1` |

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Switchboard port | `4001` |

---

## Maintenance

### Backups

- Back up the document data directory regularly
- Use the reactor's built-in export functionality for document snapshots
- Consider automated backup scripts with cron

### Monitoring

- Monitor the Switchboard health endpoint
- Set up log aggregation for production servers
- Track document operation throughput

### Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Server won't start | Port in use | Check for existing processes on the port |
| Documents not syncing | Network issues | Check connectivity between reactors |
| Build failures | Dependency issues | Run `pnpm install --frozen-lockfile` |
| Type errors after publish | Missing build step | Run `pnpm build` before publishing |

---

## Security Considerations

1. **Use HTTPS** in production (reverse proxy with nginx/caddy)
2. **Set up authentication** via Renown (Ethereum wallet signatures)
3. **Configure CORS** appropriately for your domain
4. **Keep dependencies updated** for security patches
5. **Use environment variables** for secrets, never commit them

---

## Version History

### v5.3.0 (Current)
- Auto-generated subgraph schemas and resolvers
- Improved code generation pipeline
- Enhanced MCP server capabilities

### v5.0.0
- New Vetra development platform
- Reactor-MCP integration
- PGlite relational database support
- Enhanced editor hooks API

### v4.0.0
- PHDocument migration
- New document format
- Breaking changes from v3 (migration tool available via `ph migrate`)

---

## PHDocument Migration (v4.0.0)

If migrating from v3 to v4:

```bash
ph migrate
```

Key changes:
| v3 | v4 |
|----|-----|
| Legacy document format | PHDocument format |
| Old reducer patterns | Mutative-wrapped reducers |
| Manual type definitions | Auto-generated TypeScript types |
| Custom sync protocol | DocSync protocol |
