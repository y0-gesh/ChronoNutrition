# ChronoNutrition — Deployment Plan

This step-by-step guide details how to deploy the **ChronoNutrition** full-stack application (Next.js frontend + FastAPI backend + database) to production.

---

## 1. Monorepo Architecture Analysis

### Should this remain a Monorepo?
**Yes, a monorepo is highly recommended for ChronoNutrition.** 

Here is why:
1. **Developer Experience (DX):** Having the `/frontend` and `/backend` code in a single repository makes it easy to run, test, and manage feature cycles together.
2. **Schema Synchronization:** As your Pydantic schemas (backend) and TypeScript interfaces (frontend) grow, keeping them in one repo ensures changes to APIs and types can be made in a single commit, reducing version mismatches.
3. **Deployment Simplicity:** Modern cloud platforms (Vercel, Render, Fly.io, Railway) natively support monorepos by allowing you to specify a "Root Directory" or "Base Path" for each service.

---

## 2. Environment Configurations

All sensitive parameters have been extracted from the codebase and parameterized. Ensure the following environment files are set up on your deployment hosts:

### Frontend Environment Variables
Set these variables on your frontend host (e.g., Vercel):
```env
NEXT_PUBLIC_API_URL=https://api.chrononutrition.com/api
```

### Backend Environment Variables
Set these variables on your backend host (e.g., Render, Fly.io, Railway):
```env
DATABASE_URL=postgresql://db_user:db_password@db_host:5432/db_name
ALLOWED_ORIGINS=https://chrononutrition.com,https://www.chrononutrition.com
```

---

## 3. Option A: Serverless/PaaS Deployment (Recommended)

This is the easiest and most cost-effective path, separating the frontend (static hosting) and backend (containerized hosting).

### Step 1: Set up a Managed PostgreSQL Database
Instead of SQLite (which has an ephemeral filesystem on PaaS platforms), use a managed PostgreSQL database.
- **Provider Options:** Supabase, Neon, or Render PostgreSQL.
- Create a database instance and copy the **PostgreSQL Connection URI** (`postgresql://...`).

### Step 2: Deploy FastAPI Backend (e.g., Render / Railway)
1. Sign in to **Render** (render.com) or **Railway** (railway.app).
2. Connect your GitHub repository.
3. Create a new **Web Service**.
4. Set the configuration details:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add the **Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL connection URI from Step 1.
   - `ALLOWED_ORIGINS`: The domain of your frontend (e.g., `https://chrononutrition.vercel.app` or custom domain).
6. Trigger seed data execution (once on initial deployment):
   - Access the service's SSH terminal or build shell and run `python seed.py`.

### Step 3: Deploy Next.js Frontend (e.g., Vercel)
1. Sign in to **Vercel** (vercel.com).
2. Create a **New Project** and import your GitHub repository.
3. In the project settings, configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
4. Add the **Environment Variable**:
   - `NEXT_PUBLIC_API_URL`: The production URL of your backend (e.g., `https://chrononutrition-api.onrender.com/api`).
5. Click **Deploy**. Vercel will build the frontend pages and host them globally on their edge network.

---

## 4. Option B: Self-Hosted Single VPS Deployment (AWS, DigitalOcean)

If you prefer hosting the entire stack on a single Virtual Private Server (VPS) using Docker and Nginx.

### Step 1: Set up Docker Compose
Create a `docker-compose.yml` file in the root of the project to orchestrate all services:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: chrononutrition-db
    restart: always
    environment:
      POSTGRES_USER: chrono_user
      POSTGRES_PASSWORD: chrono_secure_password
      POSTGRES_DB: chrononutrition
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: chrononutrition-backend
    restart: always
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://chrono_user:chrono_secure_password@db:5432/chrononutrition
      ALLOWED_ORIGINS: http://localhost,http://yourdomain.com
    ports:
      - "8000:8000"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: chrononutrition-frontend
    restart: always
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://yourdomain.com/api

volumes:
  pgdata:
```

### Step 2: Configure Dockerfiles

#### Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

#### Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 3: Set up Nginx Reverse Proxy
Deploy Nginx on the host to route public traffic and handle SSL certs (using Certbot):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Run `sudo certbot --nginx -d yourdomain.com` to provision free SSL.
