# MERN Task Management System

A complete MERN-based task management system where users can create, update, and delete tasks.

## Features

- Create tasks with title, description, and status.
- View all tasks from MongoDB.
- Update existing tasks.
- Delete tasks.
- Frontend integrated with backend REST API.
- Ready-to-deploy architecture using MongoDB Atlas + Render + Netlify/Vercel.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas (hosted)

## Project Structure

```
Student Records/
  backend/
    src/
      config/
      models/
      routes/
      server.js
  frontend/
    src/
      App.jsx
      main.jsx
      styles.css
  README.md
```

## 1) Local Setup

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas account (recommended) or local MongoDB

### Backend Setup

1. Navigate to backend folder:

```bash
cd backend
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update `.env` values:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
```

4. Install and start backend:

```bash
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

### Frontend Setup

1. Open a new terminal and navigate:

```bash
cd frontend
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Ensure API URL in `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Install and start frontend:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## 2) API Endpoints

Base URL: `/api/tasks`

- `GET /api/tasks` - Fetch all tasks
- `POST /api/tasks` - Create a task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

Sample request body for create/update:

```json
{
  "title": "Finish assignment",
  "description": "Submit MERN project",
  "status": "in-progress"
}
```

## 3) Deployment Guide

### Step A: Host Database on MongoDB Atlas

1. Create a free cluster in MongoDB Atlas.
2. Create a database user.
3. Add IP access rule:
   - For testing: allow `0.0.0.0/0`
   - For production: restrict to known IPs.
4. Copy connection string and set:
   - `MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/<dbName>?retryWrites=true&w=majority`

### Step B: Deploy Backend on Render

1. Push project to GitHub.
2. In Render, choose **New + Web Service**.
3. Select your repository.
4. Set Root Directory to `backend`.
5. Build Command:

```bash
npm install
```

6. Start Command:

```bash
npm start
```

7. Add Environment Variables:

- `PORT=5000`
- `MONGODB_URI=<your atlas uri>`
- `FRONTEND_URL=<your frontend deployed url>`

8. Deploy and copy backend URL, e.g.:

`https://your-backend.onrender.com`

Health check URL:

`https://your-backend.onrender.com/api/health`

### Step C: Deploy Frontend (Netlify or Vercel)

#### Option 1: Netlify

1. Create a new site from GitHub repo.
2. Set Base directory to `frontend`.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable:

- `VITE_API_URL=https://your-backend.onrender.com/api`

6. Deploy and get frontend URL.

#### Option 2: Vercel

1. Import repo in Vercel.
2. Set Root Directory to `frontend`.
3. Framework preset: Vite.
4. Add environment variable:

- `VITE_API_URL=https://your-backend.onrender.com/api`

5. Deploy.

### Step D: Update CORS for Production

In Render backend environment variables, set:

```env
FRONTEND_URL=https://your-frontend-domain.com
```

Redeploy backend after updating this value.

## 4) Final Deployment Verification Checklist

- Frontend opens successfully.
- Create task works and saves to Atlas.
- Update task works.
- Delete task works.
- No CORS errors in browser console.
- Backend health endpoint returns success.

## 5) Assignment Submission Tips

- Include screenshots:
  - Task list view
  - Create/update/delete flows
  - MongoDB Atlas collection with task documents
- Include deployed URLs for frontend and backend.
- Mention this architecture:
  - React frontend -> Express API -> MongoDB Atlas

---

If you want, I can also add:

- Docker setup (`Dockerfile` + `docker-compose.yml`)
- Authentication (JWT login/register)
- Task filtering and search
