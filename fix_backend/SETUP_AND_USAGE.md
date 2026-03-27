# FitTracker — Setup & Usage Guide

## Quick Start

### 1. Backend Setup

```bash
cd final_backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# → Edit .env with your MongoDB URI, JWT secret, Razorpay keys, Cloudinary keys

# Start server
npm start
# Server runs on http://localhost:3333
```

### 2. Frontend Setup

```bash
cd final_frontend

# Install dependencies
npm install

# Create .env file (optional — defaults to http://localhost:3333)
cp .env.example .env

# Start dev server
npm run dev
# Opens at http://localhost:5173
```

---

## Environment Variables

### Backend `.env`

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ Yes | Secret for JWT tokens (any long random string) |
| `PORT` | No | Server port (default: 3333) |
| `RAZORPAY_KEY_ID` | For payments | From Razorpay Dashboard → API Keys |
| `RAZORPAY_KEY_SECRET` | For payments | From Razorpay Dashboard → API Keys |
| `CLOUDINARY_CLOUD_NAME` | For video upload | From Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | For video upload | From Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | For video upload | From Cloudinary Dashboard |

### Frontend `.env`

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3333` | Backend URL |

---

## Usage Flow

### Step 1 — First User (Auto-Admin)

The **first user to register** automatically becomes **Admin**.

1. Go to `/register`
2. Fill in name, email, password
3. The role will be set to **Admin** automatically (regardless of what you select)
4. You'll be logged in immediately

---

### Step 2 — Register a Trainer

1. **Log out** of Admin account
2. Go to `/register`
3. Select role: **Trainer**
4. Fill in details and register
5. Log back in as Trainer
6. Go to **Trainers** page → Click **"+ Create My Profile"**
7. Fill in specialization, experience, bio → Save

> 💡 Trainer profile must be created separately after registration. Registration creates the user account; the Trainer page creates the professional profile.

---

### Step 3 — Register Clients

1. Log out, go to `/register`
2. Select role: **Client** (or leave default)
3. Register — a Client profile is auto-created
4. Clients appear in the **Clients** page as **Pending** until approved

---

### Step 4 — Approve Clients (Admin/Trainer)

1. Log in as Admin or Trainer
2. Go to **Clients**
3. Find the pending client → Click **✓ Approve**
4. Client status changes to **Approved / Active**

---

### Step 5 — Create Workout Plans (Trainer/Admin)

1. Go to **Workout Plans** → Click **"+ Add Workout Plan"**
2. Enter title, dates, assign to a client (optional)
3. Add exercises:
   - Name, sets, reps, rest time
   - Optionally paste a video URL or **upload a video clip** (requires Cloudinary config)
4. Click **Create**

Clients can view their assigned workout plans when logged in.

---

### Step 6 — Create Diet Plans (Trainer/Admin)

1. Go to **Diets** → Click **"+ Add Diet Plan"**
2. Enter plan name, assign to client, add meals with food items
3. Save

---

### Step 7 — Track Progress (Trainer/Admin)

1. Go to **Progress** → Click **"+ Log Progress"**
2. Select client, enter weight, body fat, measurements, notes
3. Save

Clients can view their own progress history.

---

### Step 8 — Create Subscriptions (Trainer/Admin)

Before collecting payment, create a subscription plan:

1. Go to **Subscriptions** → Click **"+ Create Subscription"**
2. Enter plan name, duration (months), price, assign to client
3. Save

---

### Step 9 — Collect Payments

#### Option A: Client pays themselves (via Razorpay)
1. Client logs in → goes to **My Payments** → **"💳 Pay Now"**
2. Selects their subscription
3. Clicks **"📱 Pay via UPI"** (Google Pay, PhonePe, Paytm) or **"💳 Pay via Card"**
4. Razorpay checkout opens — all methods available

#### Option B: Trainer/Admin collects payment
1. Go to **Payments** → **"+ Record Payment"**
2. Select subscription and client
3. Choose payment method:
   - **📱 Collect via UPI (Razorpay)** — opens Razorpay, UPI shown first
   - **💳 Collect via Card (Razorpay)** — opens Razorpay, cards shown first
   - **Record Manual (Cash/Offline)** — records without Razorpay

> ⚠️ Razorpay requires `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`

---

## Razorpay Setup

1. Create account at [razorpay.com](https://razorpay.com)
2. Go to **Dashboard → Settings → API Keys**
3. Generate Test API Keys
4. Copy `Key ID` and `Key Secret` to your `.env`
5. For **live payments**: generate Live API Keys (requires KYC)

**Supported payment methods** (all enabled by default):
- UPI: Google Pay, PhonePe, Paytm, BHIM, any UPI app
- Cards: Visa, Mastercard, RuPay, Amex
- Netbanking: All major banks
- Wallets: Mobikwik, Freecharge, etc.

---

## Cloudinary Setup (for workout video clips)

1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Go to **Dashboard** → copy Cloud Name, API Key, API Secret
3. Add to `.env`
4. Videos upload to the `fitness_tracker` folder automatically
5. Max file size: 100MB per video

Without Cloudinary configured, the video upload button will show an error. You can still manually paste video URLs (YouTube, Vimeo, etc.) into the video URL field.

---

## Role Permissions Summary

| Feature | Admin | Trainer | Client |
|---|---|---|---|
| View all trainers | ✅ | ✅ | ✅ |
| Create trainer profile | ✅ | ✅ (own) | ❌ |
| View all clients | ✅ | ✅ | ❌ |
| Approve clients | ✅ | ✅ | ❌ |
| Create workout plans | ✅ | ✅ | ❌ |
| View workout plans | ✅ | ✅ | ✅ (own) |
| Create diet plans | ✅ | ✅ | ❌ |
| Log progress | ✅ | ✅ | ❌ |
| View progress | ✅ | ✅ | ✅ (own) |
| Create subscriptions | ✅ | ✅ | ❌ |
| Record payments | ✅ | ✅ | ❌ |
| Pay via Razorpay | ✅ | ✅ | ✅ |
| Upload workout videos | ✅ | ✅ | ❌ |
| Delete anything | ✅ | Partial | ❌ |

---

## API Endpoints Reference

### Auth
- `POST /user/register` — Register user
- `POST /user/login` — Login
- `GET /user/account` — Get current user (requires token)

### Trainers
- `GET /trainer/list` — List all trainers
- `POST /trainer/create` — Create trainer profile (Trainer/Admin)
- `PUT /trainer/:id` — Update trainer
- `DELETE /trainer/:id` — Delete trainer

### Clients
- `GET /client/list` — List all clients (Admin/Trainer)
- `GET /client/me` — Get own client profile
- `POST /client/:id/approve` — Approve client
- `DELETE /client/:id` — Delete client (Admin)

### Workouts
- `POST /workout/create` — Create plan (Trainer/Admin)
- `GET /workout/list` — List all plans
- `GET /workout/client/:clientId` — Client's plans
- `PUT /workout/:id` — Update plan
- `DELETE /workout/:id` — Delete plan

### Diets
- Same pattern as workouts at `/diet/*`

### Progress
- `POST /progress/create` — Log progress
- `GET /progress/client/:clientId` — Client's progress
- `DELETE /progress/:id`

### Subscriptions
- `POST /subscription/create`
- `GET /subscription/list`
- `GET /subscription/client/:clientId`

### Payments
- `POST /payment/create` — Record payment (all roles after Razorpay verify)
- `GET /payment/list` — All payments (Admin/Trainer)
- `GET /payment/client/:clientId` — Client's payments
- `DELETE /payment/:id`

### Razorpay
- `POST /razorpay/create-order` — Create order (all authenticated users)
- `POST /razorpay/verify` — Verify payment signature

### Uploads (Cloudinary)
- `POST /upload/video` — Upload workout video (Trainer/Admin)
- `POST /upload/image` — Upload image (any authenticated user)

---

## Troubleshooting

**"Failed to create trainer" — already exists**
→ One trainer profile per user account. If you registered as Trainer, a basic profile is auto-created. Go to Trainers page to see and update it.

**Clients not showing in dropdowns**
→ Clients must register themselves on the Register page. After registration, approve them on the Clients page.

**Razorpay shows only cards, no UPI**
→ UPI only works in production with live keys. In test mode, use test UPI IDs: `success@razorpay` for success, `failure@razorpay` for failure.

**Video upload fails**
→ Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are set in `.env` and the server was restarted after adding them.

**CORS errors**
→ Ensure backend is running on the port specified in frontend's `VITE_API_URL`. Default is `http://localhost:3333`.

**"Client profile not found" for logged-in client**
→ Client profile is auto-created on registration. If it's missing, re-register or have an Admin create it manually via the API.
