# QuickServe

QuickServe is a full-stack service booking web application. Customers browse home services (cleaning, plumbing, electrical, appliance repair and more) and book appointments. An admin manages services and customer bookings from a single dashboard.

## Features

**Customer**
- Browse services with search and category filters
- View service details and pricing
- Register and log in (JWT authentication)
- Book a service by choosing a date, time slot, phone number and address
- View booking history and check booking status
- Cancel a booking while it is still pending

**Admin**
- Secure login (the admin account is created from environment variables, never through public registration)
- Dashboard statistics: total, pending, approved and completed bookings
- Add, edit and delete services
- View all bookings, search them and filter by status
- Approve or reject pending bookings, and mark approved bookings as completed

**Security**
- BCrypt password hashing
- Stateless JWT authentication
- Role-based authorization (`CUSTOMER`, `ADMIN`) at both URL level and method level
- Customers can only see and cancel their own bookings
- Passwords are never returned by the API

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS 4, React Router, Axios, Lucide React |
| Backend | Java 17, Spring Boot 3.3, Spring Web, Spring Data JPA, Spring Security, JWT (jjwt), Bean Validation, Maven |
| Database | PostgreSQL |
| Testing | JUnit 5, Mockito |

## Folder Structure

```
quickserve/
├── backend/
│   ├── pom.xml
│   ├── .env.example
│   ├── run-dev.ps1                  # loads .env and starts the API (Windows)
│   ├── seed/sample-services.sql     # optional sample data
│   └── src/
│       ├── main/java/com/quickserve/
│       │   ├── config/              # security config, admin seed
│       │   ├── controller/          # REST controllers
│       │   ├── dto/                 # request/response records
│       │   ├── entity/              # JPA entities and enums
│       │   ├── exception/           # custom exceptions, global handler
│       │   ├── repository/          # Spring Data repositories
│       │   ├── security/            # JWT service, filter, handlers
│       │   └── service/             # business logic
│       ├── main/resources/application.properties
│       └── test/                    # unit tests
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── .env.example
    └── src/
        ├── api/                     # Axios instance and token storage
        ├── context/                 # AuthContext
        ├── components/              # Navbar, Footer, ServiceCard, BookingForm, ...
        │   └── admin/               # ServiceManager, BookingManager
        ├── hooks/
        ├── pages/
        └── utils/
```

## Prerequisites

- Java 17
- Maven 3.9+
- Node.js 20.19+ (or 22+)
- PostgreSQL 15+

## PostgreSQL Setup

```powershell
psql -U postgres
```

```sql
CREATE DATABASE quickserve_db;
\q
```

Tables are created automatically by Hibernate on the first backend start (`spring.jpa.hibernate.ddl-auto=update`).

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in the values. The `.env` file is git-ignored.

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `quickserve_db` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | none (required) |
| `JWT_SECRET` | Base64 secret, at least 32 bytes | none (required) |
| `JWT_EXPIRATION_MS` | Token lifetime in milliseconds | `86400000` (24 h) |
| `ADMIN_NAME` | Name of the first admin | `QuickServe Admin` |
| `ADMIN_EMAIL` | Email of the first admin | none |
| `ADMIN_PASSWORD` | Password of the first admin (min 8 characters) | none |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins | `http://localhost:5173` |

Generate a JWT secret in PowerShell:

```powershell
$b = New-Object byte[] 48; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
```

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8080/api` |

## Running the Backend

```powershell
cd backend
copy .env.example .env
notepad .env
powershell -ExecutionPolicy Bypass -File .\run-dev.ps1
```

The API runs at http://localhost:8080. Check it with `curl.exe http://localhost:8080/api/health`.

Run the unit tests with `mvn test`.

## Running the Frontend

The `package.json` contains only the scripts, so install the dependencies once (this pins the current versions):

```powershell
cd frontend
copy .env.example .env
npm install react react-dom react-router-dom axios lucide-react
npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite
npm run dev
```

The app runs at http://localhost:5173. The dev server uses a fixed port because the backend's CORS setting allows that origin.

Create a production build with `npm run build`. After the first install, `npm install` alone is enough.

## Creating the First Admin

Public registration always creates `CUSTOMER` accounts, and no endpoint can create an admin. The first admin is created at backend startup from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`:

- If no user with that email exists, an `ADMIN` is created with a BCrypt-hashed password.
- If the user already exists, nothing changes, so restarts are safe and no existing account is ever promoted or overwritten.
- After the first successful start you can remove `ADMIN_PASSWORD` from `.env`.

## Sample Data

```powershell
psql -U postgres -d quickserve_db -f backend\seed\sample-services.sql
```

The script is idempotent. It skips services whose name already exists. Edit the image URLs in the admin dashboard if any photo fails to load. The UI shows a fallback in that case.

## Booking Status Workflow

```
PENDING  ──(admin)──> APPROVED ──(admin)──> COMPLETED
   │  └───(admin)──> REJECTED
   └──(customer)──> CANCELLED
```

The backend enforces these rules. Any other transition returns `400 Bad Request`.

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Register a customer, returns a JWT |
| POST | `/api/auth/login` | Public | Log in, returns a JWT |
| GET | `/api/services` | Public | List active services (`?search=` and `?category=`) |
| GET | `/api/services/{id}` | Public | Service details |
| POST | `/api/services` | Admin | Create a service |
| PUT | `/api/services/{id}` | Admin | Update a service |
| DELETE | `/api/services/{id}` | Admin | Delete a service (hidden instead if it has bookings) |
| POST | `/api/bookings` | Customer | Create a booking |
| GET | `/api/bookings/my` | Customer | The caller's bookings |
| PATCH | `/api/bookings/{id}/cancel` | Customer | Cancel own pending booking |
| GET | `/api/bookings` | Admin | All bookings (`?status=` and `?search=`) |
| GET | `/api/bookings/stats` | Admin | Dashboard statistics |
| PATCH | `/api/bookings/{id}/status` | Admin | Approve, reject or complete a booking |

Protected requests send `Authorization: Bearer <token>`.

**Error format**

```json
{
  "timestamp": "2026-11-21T10:15:30",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "fieldErrors": { "email": "Enter a valid email address" }
}
```

| Code | Meaning |
|---|---|
| 200 / 201 / 204 | Success / created / deleted |
| 400 | Validation error or illegal status change |
| 401 | Missing, invalid or expired token, or wrong credentials |
| 403 | Authenticated but not allowed |
| 404 | Not found (also returned for other users' bookings) |
| 409 | Email already registered |

## Known Limitations

- The same time slot can be booked more than once, and there is no provider scheduling.
- Lists are not paginated.
- The JWT is stored in `localStorage`, and there is no refresh token flow.
- No rate limiting on login.
- Schema is managed by Hibernate `ddl-auto=update`. A production deployment should use a migration tool such as Flyway.

## License

Built as a learning and portfolio project.
