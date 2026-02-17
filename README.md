# SMGS Server

This is a minimal Express backend that uses MongoDB (Atlas) for data and provides auth + CRUD endpoints used by the frontend.

Environment variables (create a `.env` file in `server/`):

- `MONGODB_URI` - MongoDB connection string (atlas)
- `MONGODB_DB` - database name (default: `smgs`)
- `JWT_SECRET` - secret for signing JWT tokens
- `PORT` - optional server port (default 4000)

Available endpoints (examples):

- `POST /api/auth/signup` { email, password, fullName, role }
- `POST /api/auth/signin` { email, password }
- `GET /api/auth/session` Authorization: Bearer <token>
- `GET /api/profiles?user_id=`
- `GET /api/students?profile_id=`
- `GET /api/attendance?student_id=&month=&year=`
- `POST /api/attendance` { records: [...] }
- `DELETE /api/attendance?date=`

Run server (install deps first):

```bash
cd server
npm install
npm run dev
```
