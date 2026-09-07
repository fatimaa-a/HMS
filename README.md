# Hospital Management System (HMS)

A backend system for managing hospital operations, including users, doctors, patients, departments, appointments, medical records, prescriptions, and billing.

The project is built with **FastAPI**, **SQLAlchemy**, **PostgreSQL**, and **Alembic**, with JWT-based authentication and role-based access control.

---

## Tech Stack

* **Python**
* **FastAPI** — REST API framework
* **PostgreSQL** — Relational database
* **SQLAlchemy** — ORM
* **Alembic** — Database migrations
* **Pydantic** — Data validation and schemas
* **JWT** — Authentication
* **Argon2** — Password hashing
* **Uvicorn** — ASGI server
* **uv** — Python package and project management

---

## Features

### User Management

* Patient registration
* User login
* JWT authentication
* Current-user endpoint
* Admin-created internal accounts
* Password hashing with Argon2

### Role-Based Access Control

The system supports four roles:

| Role      | Description                 |
| --------- | --------------------------- |
| `admin`   | Full system administration  |
| `doctor`  | Clinical operations         |
| `staff`   | Hospital operations         |
| `patient` | Patient-specific operations |

Access to protected endpoints is controlled through FastAPI dependencies.

### Hospital Management

* Department management
* Doctor management
* Patient management
* Appointment management
* Medical records
* Prescriptions
* Billing

### Data Validation

The API validates:

* Required fields
* Related database records
* Doctor/department relationships
* Patient/doctor/appointment relationships
* Duplicate billing records
* User uniqueness
* Role permissions

---

## Project Structure

```text
HMS/
│
├── alembic/
│   ├── versions/
│   ├── env.py
│   ├── README
│   └── script.py.mako
│
├── app/
│   ├── core/
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   └── security.py
│   │
│   ├── database/
│   │   ├── base.py
│   │   └── database.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── doctor.py
│   │   ├── patient.py
│   │   ├── department.py
│   │   ├── appointment.py
│   │   ├── medical_record.py
│   │   ├── prescription.py
│   │   └── billing.py
│   │
│   ├── routers/
│   │   ├── user.py
│   │   ├── doctor.py
│   │   ├── patient.py
│   │   ├── department.py
│   │   ├── appointment.py
│   │   ├── medical_record.py
│   │   ├── prescription.py
│   │   └── billing.py
│   │
│   ├── schemas/
│   └── main.py
│
├── scripts/
│   └── seed_admin.py
│
├── .env
├── .gitignore
├── pyproject.toml
├── uv.lock
└── README.md
```

---

## Database Design

The system uses PostgreSQL with the following main entities:

* **Users**
* **Doctors**
* **Patients**
* **Departments**
* **Appointments**
* **Medical Records**
* **Prescriptions**
* **Billing**

Relationships between entities are enforced using foreign keys.

For example:

```text
User
 ├── Doctor
 └── Patient

Department
 └── Doctor

Patient
 └── Appointment

Doctor
 └── Appointment

Appointment
 ├── Medical Record
 └── Billing

Medical Record
 └── Prescription
```

---

## Authentication

Authentication uses JWT access tokens.

### Login Flow

```text
User Login
    ↓
Verify Password
    ↓
Create JWT
    ↓
Return Access Token
    ↓
Bearer Token
    ↓
Protected API Endpoint
```

Passwords are never stored as plain text. They are hashed using **Argon2** before being stored in the database.

JWT tokens contain the authenticated user's ID and role and have an expiration time.

---

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/HMS
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Do **not** commit the `.env` file to Git.

---

## Installation

Make sure Python, PostgreSQL, and `uv` are installed.

Clone the repository and move into the project directory.

Create the virtual environment:

```bash
uv venv
```

Install the project dependencies:

```bash
uv sync
```

Configure the `.env` file with your PostgreSQL credentials and JWT settings.

---

## Database Migrations

Apply all existing migrations:

```bash
uv run alembic upgrade head
```

Check whether the database schema is synchronized with the SQLAlchemy models:

```bash
uv run alembic check
```

Create a new migration after changing database models:

```bash
uv run alembic revision --autogenerate -m "description of changes"
```

Then apply it:

```bash
uv run alembic upgrade head
```

---

## Creating the First Admin

The first administrator can be created using the bootstrap script:

```bash
$env:PYTHONPATH="."
uv run python scripts/seed_admin.py
```

The admin account can then be used to create internal users such as doctors and staff through the protected admin endpoint.

---

## Running the Application

Start the development server with:

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

---

## API Documentation

FastAPI automatically provides interactive API documentation.

### Swagger UI

```text
http://127.0.0.1:8000/docs
```

### ReDoc

```text
http://127.0.0.1:8000/redoc
```

Use the **Authorize** button in Swagger UI to authenticate using the JWT access token.

---

## API Modules

### Users

```text
POST   /register
POST   /login
GET    /me
POST   /admin/users
```

### Departments

Department CRUD operations.

### Doctors

Doctor CRUD operations.

### Patients

Patient CRUD operations.

### Appointments

Appointment creation and management with doctor, patient, and department validation.

### Medical Records

Medical record creation and management connected to patients, doctors, and appointments.

### Prescriptions

Prescription management connected to medical records, patients, and doctors.

### Billing

Billing management connected to appointments.

---

## Security

The application implements several security measures:

* JWT authentication
* Role-based authorization
* Argon2 password hashing
* Protected API endpoints
* Server-side role assignment
* Database foreign-key relationships
* Duplicate record prevention
* Relationship consistency validation
* Environment-based secret configuration

Public patient registration cannot assign privileged roles. Internal roles such as `admin`, `doctor`, and `staff` are created through authorized administrative functionality.

---

## Development

The project follows a layered FastAPI structure:

```text
Request
   ↓
Router
   ↓
Pydantic Schema
   ↓
Business Logic
   ↓
SQLAlchemy ORM
   ↓
PostgreSQL
```

Reusable authentication, database, and authorization logic is handled through FastAPI dependencies.

---

## Current Status

The backend currently includes:

* [x] PostgreSQL database
* [x] SQLAlchemy ORM
* [x] Alembic migrations
* [x] User authentication
* [x] JWT authorization
* [x] Role-based access control
* [x] User management
* [x] Department management
* [x] Doctor management
* [x] Patient management
* [x] Appointment management
* [x] Medical records
* [x] Prescriptions
* [x] Billing
* [x] API documentation
* [x] Database schema synchronized with models

### Next Phase

The next phase of the project is the **frontend implementation**, which will consume the FastAPI REST APIs.
