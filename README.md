# CashGrid — Cash Management & Reconciliation System

A full-stack fintech application tracking the complete lifecycle of collected cash:
**Customer → Field Agent → Branch → Bank → Settlement**

---

## 🌐 Live Demo
**Live App**: [https://cashgrid-5cfd4.web.app/](https://cashgrid-5cfd4.web.app/)

---

## Test Credentials

| Role | Username | Password |
|---|---|---|
| **Super Admin** | `superadmin` | `123456789` |
| **Branch Admin** | `admin` | `123456789` |
| **Field Agent** | `agent` | `123456789` |
| **Customer** | `user` | `123456789` |

> Login at the app root. Role-specific dashboards load automatically.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5 |
| Backend | Python 3.11, Django 5, Django REST Framework |
| Auth | JWT (SimpleJWT) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Hosting | Firebase Hosting (frontend) |

---

## Firebase Deployment

### Prerequisites
```bash
npm install -g firebase-tools
firebase login
```

### Deploy Frontend
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

> Update `.firebaserc` with your actual Firebase Project ID before deploying.

### Backend Deployment
Deploy Django to any WSGI host (Railway, Render, Heroku). Set these environment variables:

```
DJANGO_SECRET_KEY=<your-secret-key>
DEBUG=False
ALLOWED_HOSTS=your-backend-domain.com
DATABASE_URL=postgres://user:pass@host:5432/cashgrid_db
```

Update the API base URL in `frontend/src/` to point to your deployed backend.

---

## Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/`
- Django Admin: `http://localhost:8000/admin/`
