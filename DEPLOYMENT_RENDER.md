# LifeLine Cloud Deployment Guide (Render + MongoDB Atlas)

This guide walks you through deploying the complete **LifeLine Intelligence Platform** to **Render** for free.

---

## 🌟 Architecture Overview

LifeLine can be deployed as a single full-stack web service on Render's free tier:
- **Backend (Node.js/Express + Socket.IO)**: Serves REST APIs and real-time WebSockets.
- **Frontend (React 19 + Vite)**: Built into static production assets served directly by the Express backend.
- **Database**: Free cloud MongoDB Atlas database (free 512MB cluster forever).

---

## Part 1: Set Up Free Cloud MongoDB (MongoDB Atlas)

Since Render is a stateless host, you should connect to a free MongoDB Atlas cloud database:

1. **Sign Up / Log In**:
   - Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. **Create a Free Cluster**:
   - Select the **M0 Free** cluster tier (Shared).
   - Select your preferred cloud provider and closest region (e.g., AWS / Mumbai, Singapore, or Frankfurt).
   - Click **Create Deployment**.
3. **Set Up Database User**:
   - Username: `lifeline_admin`
   - Password: Choose a strong password (e.g., `LifeLineSecurePass2026`) and copy it down.
   - Click **Create Database User**.
4. **Configure IP Access**:
   - In "Where would you like to connect from?", choose **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Add IP Address**.
5. **Get Your Connection String**:
   - Click **Connect** -> **Drivers** (Node.js).
   - Copy the connection string. It looks like:
     ```
     mongodb+srv://lifeline_admin:<password>@cluster0.abcde.mongodb.net/lifeline?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password and ensure `/lifeline` is in the path.

---

## Part 2: Deploy to Render (Step-by-Step)

### Option A: Using Render Blueprints (Recommended - 1 Click)

1. Push this project to your GitHub account (see Part 3 below).
2. Log in to [https://render.com](https://render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository: `lifeline`.
5. Render will automatically detect [`render.yaml`](file:///c:/Users/bindu/OneDrive/Desktop/lifeline-backend/lifeline/render.yaml).
6. Under Environment Variables, enter your `MONGO_URI` from MongoDB Atlas.
7. Click **Apply**. Render will install, build the React frontend, and launch the server!

---

### Option B: Manual Web Service Setup

If you prefer to configure manually in Render:

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `lifeline-platform`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Region**: Closest to you (e.g., Singapore or Frankfurt)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Add **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `10000` | Port assigned by Render |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | *(32+ char random string)* | e.g. `lifeline_super_secure_jwt_token_2026_render` |
   | `CLIENT_URL` | `*` | Or leave blank to allow all |
   | `ADMIN_NAME` | `LifeLine Admin` | Seed administrator name |
   | `ADMIN_EMAIL` | `admin@example.com` | Seed administrator login email |
   | `ADMIN_PASSWORD`| `AdminPass123` | Seed administrator password |
5. Click **Create Web Service**.
6. Once deployed, Render gives you a live URL:
   `https://lifeline-platform.onrender.com`

---

## Part 3: Seed Demo Intelligence Data on Render

To populate your live Render deployment with the digital twin, hospitals, risk zones, and crisis scenarios:

1. In your Render Dashboard, open your deployed `lifeline` Web Service.
2. Click on the **Shell** tab on the left.
3. Run the following command:
   ```bash
   npm run seed
   ```
4. You will see:
   ```text
   Connected to MongoDB for Intelligence seeding...
   Seeding Facilities & Hospital Beds...
   Seeding Predictive Risk Zones...
   Seeding Crisis Simulation Scenarios...
   LifeLine Intelligence Layer successfully seeded!
   ```
5. You can now open your live URL, go to `/login`, click "Admin Demo", and explore all workspaces live on the internet!

---

## ⚡ Frequently Asked Questions

**Q: Render Free Tier spins down after 15 minutes of inactivity. Is that normal?**
A: Yes! On Render's free plan, services sleep when idle. The first request after sleep takes 30-50 seconds to wake up (cold start). Once awake, it runs at full speed.

**Q: Can I use custom domain on Render?**
A: Yes, Render provides free custom domain mapping with automatic SSL certificates under the **Settings** tab.
