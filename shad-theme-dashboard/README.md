# Southern Apparels ERP System

Full-stack ERP system for Ready Made Garments (RMG) industry.

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** FastAPI, Python 3.11, SQLAlchemy 2.0
- **Database:** PostgreSQL 15
- **Deployment:** Docker, Docker Compose

## Quick Start

```bash
# Start all services
docker-compose up -d

# Access the application
Frontend: http://localhost:2222
Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs
```

## Default Credentials

- **Username:** admin
- **Password:** admin

## Production Deployment

```bash
docker-compose -f docker-compose.production.yml up -d
```
