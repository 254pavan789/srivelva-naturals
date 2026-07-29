# Sri Velva Naturals — Deployment Guide

## Architecture

```
Frontend (React/Vite)    ─────→  Vercel  (free static hosting)
Backend  (Spring Boot)   ─────→  Render / Railway / VPS
Database (MySQL)         ─────→  PlanetScale / Railway MySQL / your VPS
```

## Frontend — Vercel (already works ✅)

1. Push the `SriVelvaNaturals-Miri` folder to a GitHub repo
2. Import repo in [vercel.com](https://vercel.com)
3. Set **Root Directory** = `frontend`
4. Add environment variable in Vercel dashboard:
   - Key:   `VITE_API_BASE_URL`
   - Value: `https://your-backend-url.com`  ← your Spring Boot backend URL
5. Deploy → done

> **Without a backend:** All 26 products are visible from built-in static data.
> Cart, checkout and orders require the backend to be running.

## Backend — Render.com (free tier)

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`
4. Add environment variables:
   ```
   DB_URL=jdbc:mysql://your-db-host:3306/srivelva
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   ADMIN_PASSWORD=your_admin_password
   SPRING_PROFILES_ACTIVE=prod
   ```
5. Deploy

## Backend — Railway.app (alternative)

1. New project → Deploy from GitHub
2. Select the `backend` folder
3. Add the same environment variables above
4. Railway auto-detects Maven and deploys

## Database — Railway MySQL (easiest)

1. In Railway: New → Database → MySQL
2. Copy the connection string into your backend's `DB_URL`

## Local Development

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env   # fill in MySQL credentials
mvn spring-boot:run

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev            # opens http://localhost:3000
```

The Vite dev server proxies `/api` → `localhost:8080` automatically.
