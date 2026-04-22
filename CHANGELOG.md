# Changelog

## [Deployment & Infrastructure] - 2026-04-22

### Added

#### Production Environment (Render)
- **Web Service deployed**: `https://cinema-booking-system-fh3m.onrender.com`
- **Environment variables configured** for production:
  - `NODE_ENV=production`
  - `DB_HOST_PROD`, `DB_USER_PROD`, `DB_PASSWORD_PROD`, `DB_NAME_PROD`, `DB_PORT_PROD` for Aiven MySQL
  - `PORT=5000` for Express server
- **Conditional database configuration** in `db.js`:
  - Uses `DB_HOST_PROD` presence to detect production environment (no hard dependency on `NODE_ENV`)
  - Enables SSL with `{ rejectUnauthorized: false }` for Aiven MySQL
  - Falls back to local configuration when `DB_HOST_PROD` is not present

#### Database Hosting (Aiven)
- **MySQL instance** provisioned at `mysql-3759141c-cinema-api-db.h.aivencloud.com:16787`
- Database name: `cinema_db`
- SSL required for all connections
- Connection tested and verified working with production API

#### Documentation & Monitoring
- **Swagger UI available at**: `https://cinema-booking-system-fh3m.onrender.com/api-docs`
- **Health check endpoint**: `GET /health` returns `200 OK` with `{ message: 'main router working' }`
- **Cron-job.org configured** to ping `/health` every 5 minutes to prevent Render free tier sleep/snooze mode

#### Swagger Server Configuration
- Production server URL added as first option in `swagger.js` servers list:
  - `https://cinema-booking-system-fh3m.onrender.com` (selected by default)
  - `http://localhost:5000` (local development fallback)
- Ensures that API examples in Swagger UI point to live production endpoints by default

### Technical Decisions
- **No `NODE_ENV` dependency**: Database configuration uses `if (process.env.DB_HOST_PROD)` instead of `NODE_ENV === 'production'` for greater reliability
- **Separate environment variables**: Local (`_LOCAL` suffix) and production (`_PROD` suffix) variables coexist in `.env` without interfering
- **SSL enabled** for production database connections (required by Aiven)
- **Health endpoint intentionally simple**: No database queries, no heavy logic — only returns `200 OK` to minimize resource usage

### Deployment Notes
- Render build command: `npm install`
- Render start command: `npm start`
- Free tier spins down after 15 minutes of inactivity
- Cron-job prevents spin-down by hitting `/health` every 5 minutes
- Database connection uses `dateStrings: true` to prevent `mysql2` from converting DATETIME to UTC

### Error Resolution
- **`ECONNREFUSED` on initial deploy**: Caused by missing `_PROD` environment variables in Render
- **Fix**: Added all `_PROD` variables to Render environment configuration
- **Verification**: Confirmed working via Swagger UI and direct endpoint access

### Next Steps
- [ ] Configure custom domain (optional)
- [ ] Add rate limiting for production endpoints
- [ ] Implement pagination for list endpoints
- [ ] Add automated tests before production deployment

### Notes
- Production database (Aiven) and local database (localhost) are completely separate
- Demo reset endpoint (`PATCH /demo/reset`) works in production and clears all data while preserving seed data
- All 27 documented endpoints tested and verified working in production environment
- Swagger UI examples now point to production server by default (no localhost confusion for recruiters/tech leads)

## [Demo & Maintenance] - 2026-04-21

### Added

#### Health Check Endpoint
- **GET /health** (`src/routes/mainRouter.js`)
  - Simple endpoint to keep server alive
  - Returns `{ message: 'main router working' }` with 200 status
  - Designed for cron-job integration to prevent Render sleep/snooze mode
  - Tagged as `🔧 Mantenimiento` in Swagger

#### Database Reset Endpoint
- **PATCH /demo/reset** (`src/handlers/demoHandlers/reset.js`)
  - Truncates all tables (shows, rooms, movies, cinemas) in correct order
  - Disables foreign key checks before truncation (avoids constraint errors)
  - Re-initializes database with seed data via `initializeDatabase()`
  - Returns success message with timestamp
  - Tagged as `🔁 Reset` in Swagger (intentionally different from health tag for organization)

#### Toggle Endpoints (Soft Delete Consistency)
- **PATCH /rooms/{id}/toggle** (`src/handlers/roomsHandlers/updateRoom.js`)
  - Flips `is_active` value for rooms (0 ↔ 1)
  - Removed `is_active` from standard PATCH endpoint (cleaner separation)

- **PATCH /shows/{id}/toggle** (`src/handlers/showsHandlers/updateShow.js`)
  - Flips `is_active` value for shows
  - Removed `is_active` from standard PATCH endpoint

### Infrastructure Updates

#### Database Schema
- Added `updated_at` column to `rooms` table (auto-updates on change)
- Added `updated_at` column to `shows` table (auto-updates on change)
- All tables now have complete audit trail (`created_at` + `updated_at`)

#### Query Builders
- Removed `is_active` from `updateRoomQuery` (now only toggle handles status)
- Removed `is_active` from `updateShowQuery` (now only toggle handles status)

#### Seed Data
- Added fixed shows seed data (3 shows with IDs 1, 2, 3)
- Uses `ON DUPLICATE KEY UPDATE` for idempotent seeding
- Fixed datetime format in movies seed (added missing comma before `fixedDateTime`)

### Swagger Documentation (all modules updated)

#### Demo Section
- `GET /health` documented with maintenance tag
- `PATCH /demo/reset` documented with reset tag and success/error responses

#### Cinemas Module
- Added `GET /cinemas/search` with query parameters (name, city, is_active)
- Added toggle endpoint documentation
- Improved examples with emojis (✔, ✖, ⚠)

#### Movies Module
- Added `GET /movies/search` with query parameters
- Added toggle endpoint documentation
- Consistent example formatting

#### Rooms Module
- Added `GET /rooms/search` with query parameters (cinema_id, capacity, is_active)
- Added toggle endpoint documentation
- Removed `is_active` from PATCH examples

#### Shows Module
- Complete CRUD documentation with nested objects example
- Search endpoint with query parameters
- Toggle endpoint documentation
- Examples for success, missing fields, invalid IDs, extra data

### Technical Decisions
- Reset endpoint truncates tables in reverse dependency order (shows → rooms → movies → cinemas)
- `SET FOREIGN_KEY_CHECKS = 0/1` prevents constraint errors during reset
- Health endpoint separated from demo endpoints (different tags for Swagger organization)
- Toggle endpoints use same validation as other endpoints (`validateIntegerId`)

### Error Handling
- Reset endpoint: 500 on any database error during truncation or reseeding
- Health endpoint: always 200 (no error cases)
- Toggle endpoints: same error codes as standard endpoints (400, 404, 500)

### Notes
- `GET /health` is intentionally simple (no database query, no heavy logic)
- Reset endpoint is destructive by design (clears all user-generated data)
- Toggle endpoints now the **only** way to change `is_active` status
- All Swagger examples use realistic data (IDs, dates, prices)

### Next Steps
- [ ] Pagination for all list endpoints (`/cinemas`, `/movies`, `/rooms`, `/shows`)
- [ ] JWT authentication for admin routes (optional, not in scope)
- [ ] Unit tests for reset and toggle endpoints
- [ ] Deploy to Render with cron-job for health endpoint

## [Shows Module] - 2026-04-21

### Schema
- `id INT PRIMARY KEY AUTO_INCREMENT`
- `movie_id INT NOT NULL` (FK to movies.id, ON DELETE RESTRICT)
- `room_id INT NOT NULL` (FK to rooms.id, ON DELETE RESTRICT)
- `show_time DATETIME NOT NULL`
- `price DECIMAL(10,2) NOT NULL`
- `is_active BOOLEAN DEFAULT TRUE`
- `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

### Added

#### Core endpoints
- **POST /shows** (`src/handlers/showsHandlers/postShow.js`)
  - Mandatory: `movie_id`, `room_id`, `show_time`, `price`
  - Optional: `is_active` (defaults to TRUE)
  - Validates movie exists before insert (404 if not found)
  - Validates room exists before insert (404 if not found)
  - Returns created show with generated ID

- **GET /shows** (`src/handlers/showsHandlers/getShows.js`)
  - Returns all shows with basic fields (id, movie_id, room_id, show_time, price, is_active)

- **GET /shows/search** (`src/handlers/showsHandlers/getShows.js`)
  - Dynamic search with query parameters
  - Allowed filters: `movie_id`, `room_id`, `show_time`, `price`
  - Returns array of shows matching all provided filters
  - 400 if no valid filters provided

- **GET /shows/{id}** (`src/handlers/showsHandlers/getShows.js`)
  - Returns show with related movie and room as nested objects
  - Uses three separate queries (compatible with PostgreSQL, SQLite, etc.)
  - 404 if show not found

- **PATCH /shows/{id}** (`src/handlers/showsHandlers/updateShow.js`)
  - Updates allowed fields: `movie_id`, `room_id`, `show_time`, `price`, `is_active`
  - Uses `updateShowQuery` builder with whitelist validation
  - Returns updated show
  - 400 if no valid fields to update
  - 404 if show not found

- **DELETE /shows/{id}** (`src/handlers/showsHandlers/deleteShow.js`)
  - Hard delete (physical removal)
  - Validates integer ID format before query
  - Returns 204 No Content on success
  - 400 if ID invalid or show not found

#### Query Builders
- **`postShowQuery`** (`src/utils/queryBuilder.js`)
  - Mandatory: `movie_id`, `room_id`, `show_time`, `price`
  - Optional: `is_active`
  - Uses `checkMandatoryColumns` for validation

- **`updateShowQuery`** (`src/utils/queryBuilder.js`)
  - Built from `updateQueryBuilder(['movie_id', 'room_id', 'show_time', 'price', 'is_active'])`
  - Returns `{ conditions, values }` for UPDATE query

- **`searchShowsQuery`** (`src/utils/queryBuilder.js`)
  - Built from `getByQueryBuilder(['movie_id', 'room_id', 'show_time', 'price'])`
  - Returns `{ filters, values }` for dynamic WHERE clause
  - Throws `NO_VALID_FILTERS_TO_SEARCH` if no valid filters provided

### Error Handling
- `400 NO_VALID_FILTERS_TO_SEARCH` → search with no valid query parameters
- `400 COULDNT_DELETE_SHOW` → DELETE affected 0 rows (show doesn't exist)
- `400 INVALID_ID_FORMAT` → ID is not a valid integer
- `400 SHOW_CREATION_FAILED` → insert didn't generate insertId (should be 500, fixed)
- `404 MOVIE_NOT_FOUND` → referenced movie doesn't exist
- `404 ROOM_NOT_FOUND` → referenced room doesn't exist
- `404 SHOW_NOT_FOUND` → show ID doesn't exist

### Technical Decisions
- Foreign key validation before insert (clean 404 errors instead of MySQL FK errors)
- Three separate queries for `GET /shows/{id}` (compatible with all SQL databases)
- `dateStrings: true` in DB config to prevent mysql2 from converting DATETIME to UTC
- Hard delete for shows (acceptable for demo, no historical dependencies)
- Search returns 200 with empty array if no matches (not 404)
- Show time uses `YYYY-MM-DD HH:MM:SS` format in Swagger examples (MySQL DATETIME compatible)

### Swagger Documentation
- OpenAPI spec for all show endpoints
- Examples: success, missing mandatory fields, invalid movie/room IDs, extra data ignored
- Query parameters with examples for search endpoint
- Response schemas with nested movie and room objects for `GET /shows/{id}`

### Notes
- `show_time` format in examples uses space instead of `T` to match MySQL DATETIME
- `dateStrings: true` in `db.js` ensures DATETIME values return as strings, not Date objects
- `GET /shows/{id}` returns `{ id, show_time, price, is_active, movie: {...}, room: {...} }`
- All queries use parameterized placeholders (SQL injection safe)

### Next Steps
- [ ] Pagination for `GET /shows` and `GET /shows/search`
- [ ] Soft delete for shows (optional)
- [ ] Seat reservation system (future feature)

## [Rooms Module] - 2026-04-20

### Added

#### Core endpoints (completed)
- **GET /rooms/search** (`src/handlers/roomsHandlers/getRooms.js`)
  - Dynamic search with query parameters
  - Allowed filters: `cinema_id`, `capacity`, `is_active`
  - Returns array of rooms matching all provided filters
  - 400 if no valid filters provided

- **PATCH /rooms/{id}** (`src/handlers/roomsHandlers/updateRoom.js`)
  - Updates allowed fields: `capacity`, `is_active`
  - Uses `updateRoomQuery` builder with whitelist validation
  - Returns updated room
  - 400 if no valid fields to update
  - 404 if room not found

- **DELETE /rooms/{id}** (`src/handlers/roomsHandlers/deleteRoom.js`)
  - Hard delete (physical removal)
  - Validates integer ID format before query
  - Returns 204 No Content on success
  - 400 if ID invalid or room not found

#### Query Builders
- **`searchRoomsQuery`** (`src/utils/queryBuilder.js`)
  - Built from `getByQueryBuilder(['cinema_id', 'capacity', 'is_active'])`
  - Returns `{ filters, values }` for dynamic WHERE clause
  - Throws `NO_VALID_FILTERS_TO_SEARCH` if no valid filters provided

- **`updateRoomQuery`** (`src/utils/queryBuilder.js`)
  - Built from `updateQueryBuilder(['capacity', 'is_active'])`
  - Returns `{ conditions, values }` for UPDATE query
  - Reuses existing `updateQueryBuilder` currying pattern

#### Validations
- **`validateIntegerId`** (`src/utils/validations.js`)
  - Validates that ID is a valid integer (not NaN, finite)
  - Used for rooms and movies (INT primary keys)
  - Throws `INVALID_ID_FORMAT` with 400 status

### Error Handling (new)
- `400 NO_VALID_FILTERS_TO_SEARCH` → search with no valid query parameters
- `400 COULDNT_DELETE_ROOM` → DELETE affected 0 rows (room doesn't exist)
- `400 INVALID_ID_FORMAT` → ID is not a valid integer (from `validateIntegerId`)

### Swagger Documentation (updated)
- Added `GET /rooms/search` with query parameter examples
  - `cinema_id` (string, UUID example)
  - `capacity` (integer, example: 33)
  - `is_active` (boolean, example: false)
- Added `PATCH /rooms/{id}` with examples:
  - Change single property
  - Change multiple properties
  - Mixed valid/invalid fields (ignores invalid)
  - Only invalid fields (400 response)
  - Empty body (400 response)
- Added `DELETE /rooms/{id}` with 204 response example

### Technical Decisions
- Search uses `GET` with query params (RESTful, cacheable, bookmarkable)
- Hard delete for rooms (acceptable since rooms without shows can be deleted)
- `validateIntegerId` separated from UUID validation (different resources, different ID types)
- Search returns 200 with empty array if no matches (not 404)

### Notes
- `GET /rooms/{id}` includes both stats and active shows (practical for frontend)
- Search endpoint uses `AND` logic (all filters must match)
- `validateIntegerId` used for rooms and movies (consistent INT validation)
- PATCH supports partial updates (only send what you want to change)

### Next Steps
- [ ] Shows module implementation (CRUD + schedules)
- [ ] Pagination for `GET /rooms` and `GET /rooms/search`
- [ ] Soft delete for rooms (optional, toggle pattern)

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