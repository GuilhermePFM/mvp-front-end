# Docker Build System with Git Hash Cache Busting

This project uses an intelligent cache busting system that only rebuilds Docker images when the remote git repositories have new commits.

## How It Works

Instead of using timestamps (which rebuild every time), the build scripts fetch the latest commit hash from the remote git repositories. Docker only invalidates the cache and re-clones when the hash changes, meaning:

- ✅ **Automatic detection** of new commits in remote repositories
- ✅ **Efficient caching** - only rebuilds when code actually changes
- ✅ **Independent tracking** - each service uses its own git hash (backend change won't rebuild embedding)
- ✅ **No manual intervention** - no need to use `--no-cache`
- ✅ **Faster builds** - preserves system dependency layers (apt-get, pip)

## Build Scripts

### Linux/macOS/WSL

**Build both services:**
```bash
./build.sh
```

**Build only backend-api:**
```bash
./build-backend.sh
```

**Build only embedding-api:**
```bash
./build-embedding.sh
```

### Windows (Command Prompt/PowerShell)

**Build both services:**
```cmd
build.bat
```

**Build individual services:**
```cmd
REM For backend only
for /f "tokens=1" %i in ('git ls-remote https://github.com/GuilhermePFM/mvp-api.git main') do set BACKEND_CACHEBUST=%i
docker-compose build backend-api

REM For embedding only
for /f "tokens=1" %i in ('git ls-remote https://github.com/GuilhermePFM/mvp-embedding.git main') do set EMBEDDING_CACHEBUST=%i
docker-compose build embedding-api
```

## Manual Build (Without Scripts)

You can still build manually by fetching the git hash yourself:

**Linux/macOS/WSL:**
```bash
# Backend
BACKEND_CACHEBUST=$(git ls-remote https://github.com/GuilhermePFM/mvp-api.git main | cut -f1)
docker-compose build backend-api

# Embedding
EMBEDDING_CACHEBUST=$(git ls-remote https://github.com/GuilhermePFM/mvp-embedding.git main | cut -f1)
docker-compose build embedding-api
```

**Windows PowerShell:**
```powershell
# Backend
$env:BACKEND_CACHEBUST = (git ls-remote https://github.com/GuilhermePFM/mvp-api.git main).Split()[0]
docker-compose build backend-api

# Embedding
$env:EMBEDDING_CACHEBUST = (git ls-remote https://github.com/GuilhermePFM/mvp-embedding.git main).Split()[0]
docker-compose build embedding-api
```

## Force Rebuild (Ignore Cache)

If you need to force a complete rebuild regardless of git hashes:

```bash
docker-compose build --no-cache backend-api embedding-api
```

## How the Cache Busting Works

1. **Build script** fetches the latest commit hash from the remote repository using `git ls-remote`
2. **Git hash** is passed as a service-specific build argument (`BACKEND_CACHEBUST` or `EMBEDDING_CACHEBUST`) to Docker
3. **Dockerfile** includes the appropriate `ARG` before the git clone operation
4. **Docker** compares the new hash with the cached layer's hash
5. **If different**, Docker invalidates cache and re-clones the repository for that specific service only
6. **If same**, Docker uses cached layers (fast build)

### Independent Service Tracking

Each service tracks its own repository independently:
- `backend-api` uses `BACKEND_CACHEBUST` → only rebuilds when `mvp-api` repo changes
- `embedding-api` uses `EMBEDDING_CACHEBUST` → only rebuilds when `mvp-embedding` repo changes

This means if you only change the backend code, the embedding service won't rebuild unnecessarily!

## Technical Details

### Repositories

- **Backend API**: `https://github.com/GuilhermePFM/mvp-api.git` (branch: main)
- **Embedding API**: `https://github.com/GuilhermePFM/mvp-embedding.git` (branch: main)

### Modified Files

- `Dockerfile.backend` - Added `ARG BACKEND_CACHEBUST` before git clone
- `Dockerfile.embedding` - Added `ARG EMBEDDING_CACHEBUST` before git clone
- `docker-compose.yml` - Added service-specific build args
- Build scripts - Fetch git hashes and pass to docker-compose

### Docker Compose Configuration

```yaml
backend-api:
  build:
    context: .
    dockerfile: Dockerfile.backend
    args:
      - BACKEND_CACHEBUST=${BACKEND_CACHEBUST:-1}

embedding-api:
  build:
    context: .
    dockerfile: Dockerfile.embedding
    args:
      - EMBEDDING_CACHEBUST=${EMBEDDING_CACHEBUST:-1}
```

## Troubleshooting

**Problem**: Build scripts fail to fetch git hash
- **Solution**: Check internet connection and GitHub accessibility
- **Workaround**: Use `docker-compose build --no-cache [service]`

**Problem**: Build still uses old code after new commits
- **Solution**: Verify the commit was pushed to the `main` branch
- **Check**: Run `git ls-remote [repo-url] main` to see the latest hash

**Problem**: Want to use a specific branch instead of main
- **Solution**: Modify the Dockerfile git clone command to use your branch
- Update build scripts to fetch hash from your branch: `git ls-remote [url] [branch]`

