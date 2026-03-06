# SMGS Server

This is a minimal Express backend that uses MongoDB (Atlas) for data and provides auth + CRUD endpoints used by the frontend.

Environment variables (create a `.env` file in `server/`):

- `MONGODB_URI` - MongoDB connection string (atlas)
- `MONGODB_DB` - database name (default: `smgs`)
- `JWT_SECRET` - secret for signing JWT tokens
- `PORT` - optional server port (default 5000)
- `CORS_ORIGIN` - optional CORS origin (default: `*`)

## Setup (First Time)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create super admin account:
   ```bash
   npm run seed:admin
   ```
   This creates an admin account with:
   - Email: `admin@smgs.com`
   - Password: `Admin@123456`
   - ⚠️ Change this password in production!

3. (Optional) Seed subjects data for testing:
   ```bash
   npm run seed:subjects
   ```
   The script clears the `subjects` collection and inserts the predefined list used by the client UI.
   Run it anytime you need a fresh set of subjects on your local database.

## Run Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Student registration (students only)
  - Body: `{ email, password, full_name }`
  - Faculty signup is **disabled**; only admins can create faculty accounts

- `POST /api/auth/signin` - Login for all roles
  - Students: `{ roll_number, password, role: "student" }`
  - Faculty/Admin: `{ email, password }`

- `POST /api/auth/admin/create-faculty` - Create faculty account (admin only)
  - Body: `{ email, password, full_name, admin_email, admin_password }`
  - Requires valid admin credentials to authenticate
  - Returns: Created faculty profile

- `GET /api/auth/session` - Check current session
  - Returns: logged-in user or null

### Data Management

- `GET /api/profiles?user_id=` - Get user profile
- `GET /api/students?profile_id=` - Get student info
- `GET /api/attendance?student_id=&month=&year=` - Get attendance
- `POST /api/attendance` - Record attendance
- `DELETE /api/attendance?date=` - Delete attendance
- `GET /api/subjects` - List all subjects
- `POST /api/marks` - Record marks
- `GET /api/marks?student_id=` - Get student marks

### Health Check

- `GET /health` - Returns `{"status":"OK"}`

## Environment Setup

Create a local `.env` safely:

1. From PowerShell (Windows):

```powershell
cd server
.\scripts\generate-env.ps1
# Then edit .env in the server folder and fill values
```

2. From macOS/Linux:

```bash
cd server
./scripts/generate-env.sh
# Then edit .env in the server folder and fill values
```

**Important:** Do NOT commit `server/.env`. The repository includes `.env.example` as a template.

## Admin Setup & Faculty Management

- Super admin is created via `npm run seed:admin` (see above)
- Admins log in via the UI and access the admin dashboard at `/admin`
- Faculty accounts are created by admins through the dashboard UI
- Faculty cannot register themselves; prevents unauthorized faculty signup
- Admin must provide their own password when creating faculty (verification)
