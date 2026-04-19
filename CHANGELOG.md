# Changelog

## [Cinema API v1.0] - 2026-04-19

### Final Status
- **Cinemas Module**: Full CRUD + UUID + soft delete (toggle) + hard delete + Swagger documentation
- **Movies Module**: Full CRUD + mandatory fields validation + Swagger documentation
- **Rooms Module**: Full CRUD + foreign key validation + show counters (active/inactive/total) + Swagger documentation
- **Shows Module**: Schema defined (pending implementation)
- **Swagger/OpenAPI**: Interactive documentation for all implemented endpoints

### Technical Highlights
- No ORM: pure SQL queries with parameterized placeholders
- Query builders with currying pattern (`postQueryBuilder`, `updateQueryBuilder`)
- Mandatory columns validation with `checkMandatoryColumns` helper
- UPSERT for seed data (`ON DUPLICATE KEY UPDATE`)
- Fixed IDs for demo data (cinema: UUID, movies: 1,2,3, rooms: 1,2,3)
- Stats aggregation with `SUM(condition)` for counters
- `req.pool` injection middleware for database access

### Pending
- Shows module (CRUD + schedules)
- Pagination for list endpoints
- JWT authentication
- Role-based access (admin/client)
- Jest tests
- Structured logging (winston/pino)

---

## [Rooms Module] - 2026-04-19

### Schema
- `id INT PRIMARY KEY AUTO_INCREMENT`
- `cinema_id CHAR(36) NOT NULL` (FK to cinemas.id, ON DELETE CASCADE)
- `capacity INT NOT NULL`
- `is_active BOOLEAN DEFAULT TRUE`
- `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`

### Added

#### Core endpoints
- **POST /rooms** (`src/handlers/roomsHandlers/postRoom.js`)
  - Mandatory: `cinema_id`, `capacity`
  - Optional: `is_active` (defaults to TRUE)
  - Validates cinema exists before insert (404 if not found)
  - Returns created room with generated ID

- **GET /rooms** (`src/handlers/roomsHandlers/getRooms.js`)
  - Returns all rooms (id, cinema_id, capacity, is_active)

- **GET /rooms/{id}** (`src/handlers/roomsHandlers/getRooms.js`)
  - Returns room data + show counters (active_shows, inactive_shows, total_shows)
  - Uses single `SUM(condition)` query for stats
  - 404 if room not found

- **GET /rooms/{id}/status** (`src/handlers/roomsHandlers/getRooms.js`)
  - Query param `status` (active | inactive)
  - Returns filtered shows for the room
  - Validates status value (400 if invalid)
  - 404 if room not found

#### Query Builders
- **`postRoomQuery`** (`src/utils/queryBuilder.js`)
  - Mandatory: `cinema_id`, `capacity`
  - Optional: `is_active`
  - Uses `checkMandatoryColumns` for validation

### Error Handling
- `400 NO_ID_RECEIVED` → ID not provided in params
- `400 MISSING_SEARCH_PARAMETERS` → status query param missing
- `400 INVALID_SEARCH_PARAMETER` → status not 'active' or 'inactive'
- `404 CINEMA_NOT_FOUND` → referenced cinema doesn't exist
- `404 ROOM_NOT_FOUND` → room ID doesn't exist
- `500 ROOM_CREATION_FAILED` → insert didn't generate insertId

### Technical Decisions
- Cinema existence validation prevents ugly FOREIGN KEY constraint errors
- Stats in single query: `SUM(is_active = TRUE/FALSE)` instead of two COUNT queries
- INT for room ID (simpler for URL params, AUTO_INCREMENT)

### Swagger Documentation
- OpenAPI spec for all room endpoints
- Examples: success, missing mandatory fields, invalid cinema_id, extra data
- Query parameter with `enum: [active, inactive]` (dropdown in Swagger UI)
- Response schemas with stats object

### Notes
- `is_active` defaults to TRUE in DB, optional in POST
- Room ID is INT, cinema_id is UUID (mixed types)
- Show counters use `SUM(condition)` because `is_active` is never NULL

### Next Steps
- [ ] Shows module (CRUD + schedule management)
- [ ] Pagination for `/rooms/{id}/status`
- [ ] Pagination for `GET /rooms`

---

## [Movies Module] - 2026-04-18

### Schema
- `id INT PRIMARY KEY AUTO_INCREMENT`
- `title VARCHAR(255) NOT NULL`
- `duration INT NOT NULL`
- `genre VARCHAR(255) NOT NULL`
- `release_date DATE NULL`
- `added_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

### Added

#### Core endpoints
- **POST /movies** (`src/handlers/moviesHandlers/postMovie.js`)
  - Mandatory: `title`, `duration`, `genre`
  - Optional: `release_date`
  - Returns created movie with generated ID

- **GET /movies** (`src/handlers/moviesHandlers/getMovies.js`)
  - Returns all movies

- **GET /movies/{id}** (`src/handlers/moviesHandlers/getMovies.js`)
  - Returns single movie by ID
  - 404 if not found

- **PATCH /movies/{id}** (`src/handlers/moviesHandlers/updateMovie.js`)
  - Updates allowed: `title`, `duration`, `genre`, `release_date`
  - Returns updated movie

- **DELETE /movies/{id}** (`src/handlers/moviesHandlers/deleteMovie.js`)
  - Hard delete
  - Returns 204 No Content on success

#### Query Builders
- **`postMovieQuery`** (`src/utils/queryBuilder.js`)
  - Mandatory: `title`, `duration`, `genre`
  - Optional: `release_date`

- **`updateMoviesQuery`** (`src/utils/queryBuilder.js`)
  - Allowed: `title`, `duration`, `genre`, `release_date`
  - No mandatory fields (partial updates allowed)

### Error Handling
- `400 MISSING_REQUIRED_FIELDS` → missing title, duration, or genre
- `400 NO_VALID_CONDITIONS_TO_UPDATE` → update with no valid fields
- `404 MOVIE_NOT_FOUND` → movie ID doesn't exist
- `500 MOVIE_CREATION_FAILED` → insert didn't generate insertId

### Technical Decisions
- Hard delete for movies (no historical dependency)
- INT AUTO_INCREMENT for ID (simpler, movies don't need UUID)
- `release_date` as DATE with ISO format (YYYY-MM-DD)

### Swagger Documentation
- OpenAPI spec for all movie endpoints
- Examples: success, missing mandatory fields, extra data ignored, mixed valid/invalid fields
- Error responses with `missingFields` array

### Notes
- `added_at` is automatic (creation timestamp)
- `updated_at` auto-updates on any change
- No soft delete for movies

### Next Steps
- [ ] Pagination for `GET /movies`
- [ ] Filter by genre or release_date range

---

## [Cinemas Module] - 2026-04-17

### Schema
- `id CHAR(36) PRIMARY KEY DEFAULT (UUID())`
- `name VARCHAR(255) NOT NULL`
- `city VARCHAR(255) NOT NULL`
- `is_active BOOLEAN DEFAULT TRUE`
- `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

### Added

#### Core endpoints
- **POST /cinemas** (`src/handlers/cinemasHandlers/postCinema.js`)
  - Mandatory: `name`, `city`
  - Optional: `is_active`
  - UUID generated by MySQL `DEFAULT (UUID())`
  - Returns created cinema with generated UUID

- **GET /cinemas** (`src/handlers/cinemasHandlers/getCinemas.js`)
  - Returns all cinemas

- **GET /cinemas/{id}** (`src/handlers/cinemasHandlers/getCinemas.js`)
  - Returns cinema with related rooms array
  - 404 if not found

- **PATCH /cinemas/{id}** (`src/handlers/cinemasHandlers/updateCinema.js`)
  - Updates allowed: `name`, `city`, `is_active`
  - Returns updated cinema

- **PATCH /cinemas/{id}/toggle** (`src/handlers/cinemasHandlers/updateCinema.js`)
  - Flips `is_active` value (soft delete)
  - Returns new status

- **DELETE /cinemas/{id}** (`src/handlers/cinemasHandlers/deleteCinema.js`)
  - Hard delete
  - Returns 204 No Content on success

#### Query Builders
- **`postCinemaQuery`** (`src/utils/queryBuilder.js`)
  - Mandatory: `name`, `city`
  - Optional: `is_active`

- **`updateCinemaQuery`** (`src/utils/queryBuilder.js`)
  - Allowed: `name`, `city`, `is_active`

### Seed Data
- Fixed cinema ID: `11111111-1111-1111-1111-111111111111`
- Business name: 'Cinema de Prueba', City: 'CABA'
- Inserted on database initialization (UPSERT)

### Error Handling
- `400 MISSING_REQUIRED_FIELDS` → missing name or city
- `400 NO_VALID_CONDITIONS_TO_UPDATE` → update with no valid fields
- `404 CINEMA_NOT_FOUND` → cinema ID doesn't exist
- `409 CINEMA_ALREADY_EXISTS` → duplicate name (if UNIQUE index added)

### Technical Decisions
- UUID for cinemas (external reference, not sequential)
- Soft delete via toggle (preserves historical data)
- Hard delete available for demo cleanup

### Swagger Documentation
- OpenAPI spec for all cinema endpoints
- Examples: success, missing mandatory fields, extra data ignored, invalid ID
- Path parameter with example UUID

### Notes
- `POST /cinemas` generates UUID automatically (no client-side generation needed)
- `GET /cinemas/{id}` includes related rooms array
- Toggle endpoint is a PATCH (semantically correct for state change)

### Next Steps
- [ ] Pagination for `GET /cinemas`
- [ ] Filter by city

---

## [Infrastructure] - 2026-04-16

### Added

#### Database Configuration (`src/config/db.js`)
- MySQL connection pool with `mysql2/promise`
- Environment variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Pool options: `waitForConnections: true`, `connectionLimit: 10`, `queueLimit: 0`

#### Database Initialization (`src/config/init-db.js`)
- `CREATE TABLE IF NOT EXISTS` for all schemas (cinemas, movies, rooms, shows)
- Seed data with UPSERT (`ON DUPLICATE KEY UPDATE`)
- Fixed IDs for demo data (cinema UUID, movies 1/2/3, rooms 1/2/3)
- Runs on server startup (idempotent, no duplicate errors)

#### Server Configuration (`src/config/server.js`)
- Express app with CORS and JSON middleware
- `req.pool` injection middleware (adds database pool to every request)
- Swagger UI mounted at `/api-docs`
- JSON spec endpoint at `/api-docs.json`

#### Swagger/OpenAPI (`src/config/swagger.js`)
- `swagger-jsdoc` configuration
- OpenAPI 3.0.0 specification
- `apis: ['./src/routes/**/*.js']` (scans all route files)

#### Query Builders (`src/utils/queryBuilder.js`)
- `postQueryBuilder(allowedParams)` → currying for INSERT queries
- `updateQueryBuilder(allowedParams)` → currying for UPDATE queries
- `checkMandatoryColumns(mandatoryColumns, queries)` → reusable validation
- Preconfigured builders: `postCinemaQuery`, `postMovieQuery`, `postRoomQuery`
- Preconfigured builders: `updateCinemaQuery`, `updateMoviesQuery`

#### Validations (`src/utils/validations.js`)
- `validateId(id)` → UUID format validation for cinemas
- `isNaN(parseInt(id))` → INT validation for movies/rooms (optional, not strictly required)

### Technical Decisions
- Raw MySQL queries only (no ORM, full control)
- Connection pool for performance
- `req.pool` injection avoids importing pool in every handler
- Currying for query builders (preconfigure once, reuse everywhere)
- UPSERT for seeds (idempotent initialization)

### Notes
- All queries use parameterized placeholders (SQL injection safe)
- Database initialization runs on every server start (checks `IF NOT EXISTS`)
- Seed data does not throw errors if already exists (`ON DUPLICATE KEY UPDATE`)
- `init-db.js` is idempotent (can run multiple times safely)

### Next Steps
- [ ] Shows module implementation
- [ ] Pagination middleware
- [ ] Jest tests for all handlers
- [ ] Winston logger
- [ ] Rate limiting middleware