# 🤝 Brotherhood Connect

**A research-powered wellness and connection platform for Black and brown men.**

Built on 85+ years of evidence from the Harvard Study of Adult Development and 33 peer-reviewed academic studies. Created by **Rohan Jowallah**.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Vercel Postgres |
| Auth | JWT (jose) + bcryptjs password hashing |
| Email | Resend (free tier: 3,000/month) |
| Styling | Tailwind CSS |
| Hosting | Vercel |

---

## 🚀 Setup Guide (Step by Step)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR-USERNAME/brotherhood-connect.git
cd brotherhood-connect
npm install
```

### 2. Create a Vercel Postgres Database

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Storage** → **Create Database** → **Postgres**
3. Name it `brotherhood-connect-db`
4. Copy the connection details

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | How to get it |
|----------|--------------|
| `POSTGRES_URL` | Auto-provided by Vercel Postgres |
| `JWT_SECRET` | Run `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Your admin email (e.g., rohan@brotherhoodconnect.com) |
| `ADMIN_PASSWORD` | Choose a strong password |
| `RESEND_API_KEY` | Sign up at [resend.com](https://resend.com) (optional) |
| `EMAIL_FROM` | Your verified sending email |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for dev |

### 4. Create Database Tables

**Option A — Via Vercel Dashboard:**
1. Go to your Postgres database in Vercel
2. Click **Query** tab
3. Paste contents of `schema.sql` and run

**Option B — Via Command Line:**
```bash
npm run db:setup
```

### 5. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Link and deploy
vercel link
vercel env pull  # pulls DB credentials automatically
vercel --prod
```

Or push to GitHub and connect the repo in your Vercel dashboard for auto-deployment.

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| **Password Hashing** | bcryptjs with 12 salt rounds |
| **Session Tokens** | JWT (HS256) stored in httpOnly cookies |
| **Route Protection** | Next.js middleware validates JWT on every protected request |
| **Admin Auth** | Separate admin role with env-based credentials |
| **CSRF Protection** | httpOnly + sameSite cookies prevent cross-site attacks |
| **Input Validation** | Server-side validation on all API routes |

---

## 📧 Email Notifications

When configured with Resend, the app sends:

| Event | Recipient | Email |
|-------|-----------|-------|
| New registration | Admin | Name, email, referral source, reason |
| Registration received | User | Confirmation that request is being reviewed |
| Approved | User | Welcome message with login link |
| Denied | User | Polite notification |

**Without Resend:** Emails are logged to the server console (useful for development).

---

## 🗂️ Project Structure

```
brotherhood-connect/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js      # POST: Authenticate user
│   │   │   ├── register/route.js   # POST: Create new registration
│   │   │   ├── me/route.js         # GET: Current session user
│   │   │   ├── logout/route.js     # POST: Clear session
│   │   │   └── welcome-seen/route.js # POST: Mark welcome as seen
│   │   └── admin/
│   │       ├── users/route.js      # GET: List users, PATCH: Update status
│   │       └── codes/route.js      # GET/POST/DELETE: Manage invite codes
│   ├── components/
│   │   ├── Nav.js                  # Authenticated navigation bar
│   │   ├── Footer.js               # Site footer
│   │   └── WelcomeModal.js         # First-login welcome modal
│   ├── dashboard/page.js           # Main app: 7 pillars + detail views
│   ├── framework/page.js           # CONNECT framework page
│   ├── about/page.js               # About + credits
│   ├── admin/page.js               # Admin dashboard
│   ├── page.js                     # Login/Register (public)
│   ├── layout.js                   # Root layout
│   └── globals.css                 # Tailwind + custom styles
├── lib/
│   ├── db.js                       # Database queries (Vercel Postgres)
│   ├── auth.js                     # JWT, bcrypt, session management
│   ├── email.js                    # Resend email notifications
│   ├── content.js                  # 7 Pillars + CONNECT framework data
│   └── db-setup.js                 # Database schema setup script
├── middleware.js                    # Route protection (JWT validation)
├── schema.sql                      # Database table definitions
├── .env.example                    # Environment variables template
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── README.md
```

---

## 👤 User Flows

### New Member Registration
1. Visit the site → sees login screen
2. Click "Request Access"
3. Fill in name, email, password, invite code (optional), reason
4. Submit → status set to **pending**
5. Admin receives email notification
6. User receives confirmation email
7. Admin approves/denies in dashboard
8. User receives approval email with login link
9. First login → Welcome Modal appears (once)

### Admin Workflow
1. Log in with admin email + password from `.env`
2. Dashboard shows tabs: Pending, Approved, Denied, All, Invite Codes
3. Approve/deny/revoke users with one click
4. Generate invite codes → share with trusted referrers
5. Track which codes were used and by whom

---

## 📝 Content

All learning content is based on the research paper:
**"Brotherhood, Belonging, and Beyond: Why Men Need Social Groups More Than Ever"**
(Campbell-Patterson, 2026)

Each of the 7 Pillars includes:
- 📊 Key statistic with evidence source
- 📖 Research overview
- 🔬 Peer-reviewed findings with full citations
- ✅ Actionable practices (with checkboxes)
- 🪞 Reflection question

---

## 📄 License

Created by **Rohan Jowallah** — All rights reserved.

Senior Instructional Designer, UCF • AI Consultant, UTech Jamaica • Fellow, AAC&U & UK HEA
