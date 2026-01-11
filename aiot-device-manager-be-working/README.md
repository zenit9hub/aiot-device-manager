## AIoT Device Manager – Backend (Education Track)

This backend pairs with the frontend project to demonstrate how Firebase-authenticated clients can persist sensor data to a custom API and relational database.

### What You Get
- Express + TypeScript API with a single `/api/sensors/data` endpoint
- Firebase Admin token verification middleware
- MySQL schema for users, devices, and sensor readings
- OpenAPI doc (`src/docs/openapi.yaml`) describing the contract
- Docker Compose helper to launch MySQL with the provided schema

### Architecture Snapshot (DDD + SoC)
- **Presentation**: HTTP routes/controllers/validators (`src/presentation/http`)
- **Application**: Use-cases (`src/application`)
- **Domain**: Entities + ports (`src/domain`)
- **Infrastructure**: DB + external integrations (`src/infrastructure`)
- **Shared**: cross-cutting utilities (`src/shared`)

### Prerequisites
- Node.js 18.17+
- npm 9+
- Firebase service-account credentials (for Admin SDK)

### Getting Started
1. Copy `.env.example` to `.env` and fill in Firebase & DB values.
2. Start MySQL: `docker compose up -d`.
3. Install dependencies: `npm install`.
4. Run the API: `npm run dev`.
5. Send a request from the frontend including the Firebase ID token in the `Authorization: Bearer <token>` header.

The `/health` route is unauthenticated for quick readiness checks. Use `/health/auth` to verify Firebase tokens during FE ↔ BE linkage.

### Request Example
```http
POST /api/sensors/data
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "deviceId": "temp-sensor-01",
  "deviceName": "Greenhouse Temp Sensor",
  "payload": {
    "temperature": 24.5,
    "unit": "celsius"
  }
}
```

### Database Schema
- `users`: Firebase identity linkage.
- `devices`: one-to-many devices per user with `last_seen_at`.
- `sensor_readings`: append-only log storing JSON payloads.

Extend by adding new endpoints or analytic queries; the single-endpoint layout keeps the learning curve gentle while showcasing separation of concerns.

### Helpful Commands
- `docker compose down --volumes` — clean database state.
- `npm run build` then `npm start` — production build/run path.

### Notes for the Classroom
- Use the OpenAPI spec to discuss request/response contracts.
- Encourage students to add analytics endpoints or background processing as stretch tasks.
- Demonstrate replacing Firebase with another auth provider by dropping in a different middleware.
