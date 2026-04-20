<div align="center">

# 🎬 **Cinema Booking API** 
### *REST API with professional OpenAPI/Swagger documentation*

![Status](https://img.shields.io/badge/status-in--development-yellow)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D)
![MySQL](https://img.shields.io/badge/MySQL-raw--queries-4479A1)
![Node](https://img.shields.io/badge/Node.js-Express-339933)

**⚡ 3 modules | 📚 15+ documented endpoints | 🧪 Swagger UI interactive**

</div>

---

> **🎯 Objetivo principal de este proyecto:**  
> Demostrar manejo profesional de **Swagger/OpenAPI 3.0** en una API REST funcional.  
> Documentación clara, ejemplos de éxito y error, casos mixtos, y esquemas detallados.

## 🧪 ¿Qué es este proyecto?

Una API REST para gestión de cines, películas, salas y (próximamente) funciones.

**El foco NO es la complejidad del negocio, sino la calidad de la documentación.**

### Lo que SÍ tiene (y está documentado):
- ✅ CRUD completo de cinemas, movies y rooms
- ✅ Relaciones entre entidades (cinemas → rooms, próximamente rooms → shows)
- ✅ Validación de integridad referencial (FK checks antes de insertar)
- ✅ Documentación interactiva con Swagger UI
- ✅ Ejemplos de éxito, error y casos mixtos por endpoint
- ✅ Query builders reutilizables con currying
- ✅ Código limpio y separado por capas

### Lo que está en camino (y también se documentará):
- 🔄 Módulo Shows (con room_id, movie_id, is_active)
- 🔄 Eventos en cascada (ON DELETE CASCADE / RESTRICT)
- 🔄 Soft delete y hard delete según corresponda
- 🔄 Paginación en listados

### Lo que NO tiene (ni va a tener):
- ❌ JWT / autenticación (no es el objetivo)
- ❌ Roles de usuario
- ❌ Tests automatizados (por ahora)
- ❌ Integración con servicios externos

**Para qué sirve este proyecto:**  
Demostrar que sé documentar una API como se espera en un entorno profesional.  
El código es funcional y limpio, pero el verdadero valor está en la documentación.

---

## 🚀 Tecnologías utilizadas

- Node.js + Express
- MySQL (mysql2/promise)
- Swagger UI + OpenAPI 3.0
- dotenv
- Nodemon (desarrollo)

---

### Project Structure
```
src/
├── config/
│   ├── db.js              # MySQL connection pool with mysql2/promise
│   ├── server.js          # Express app, middleware, Swagger mount
│   ├── swagger.js         # OpenAPI 3.0 config (swagger-jsdoc)
│   └── init-db.js         # Schema creation + seed data (UPSERT, fixed IDs)
├── handlers/
│   ├── cinemasHandlers/
│   │   ├── getCinemas.js      # GET all, GET by id, GET by id with rooms
│   │   ├── postCinema.js      # POST create (UUID auto-generated)
│   │   ├── updateCinema.js    # PATCH update, PATCH toggle active
│   │   └── deleteCinema.js    # DELETE hard delete
│   ├── moviesHandlers/
│   │   ├── getMovies.js       # GET all, GET by id
│   │   ├── postMovie.js       # POST create (mandatory: title, duration, genre)
│   │   ├── updateMovie.js     # PATCH update (partial)
│   │   └── deleteMovie.js     # DELETE hard delete
│   └── roomsHandlers/
│       ├── getRooms.js        # GET all, GET by id (with show counters), GET by status
│       ├── postRoom.js        # POST create (validates cinema_id exists)
│       └── updateRoom.js      # PATCH update, DELETE hard delete
├── routes/
│   ├── cinemasRouter.js   # Swagger docs + route definitions
│   ├── moviesRouter.js    # Swagger docs + route definitions
│   └── roomsRouter.js     # Swagger docs + route definitions
├── utils/
│   ├── queryBuilder.js    # postQueryBuilder, updateQueryBuilder, checkMandatoryColumns
│   └── validations.js     # validateId (UUID), isNaN for INT ids
└── server.js              # Entry point (starts server, connects DB, runs init-db)
```


---

## 📌 Arquitectura

**Routes → Handlers → Utils → Database**

- Separación de responsabilidades
- Lógica reutilizable en query builders
- Código limpio y testeable
- Documentación centralizada con Swagger

---

## ✅ Validación de datos

- `validateId()` para UUIDs (cinemas)
- Validación de IDs enteros (movies, rooms)
- `checkMandatoryColumns()` para campos obligatorios
- Whitelist de columnas permitidas

---

## 🧠 Lógica de negocio destacada

### Contadores agregados (sin N+1)
- `GET /rooms/:id` devuelve estadísticas de shows relacionados
- Una sola query con `SUM(is_active = TRUE/FALSE)`

### Integridad referencial explícita
- Validación de `cinema_id` antes de crear una sala
- Error `404 CINEMA_NOT_FOUND` en lugar de error genérico de FK

### Query builders con currying
- `postQueryBuilder(allowedParams)` → preconfiguración para INSERT
- `updateQueryBuilder(allowedParams)` → preconfiguración para UPDATE
- `checkMandatoryColumns()` reusable

---

## 📌 Endpoints

### 🏢 Cinemas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/cinemas` | Crear cine (UUID automático) |
| `GET` | `/cinemas` | Listar todos |
| `GET` | `/cinemas/:id` | Obtener cine + sus salas |
| `PATCH` | `/cinemas/:id` | Actualizar nombre/ciudad/estado |
| `PATCH` | `/cinemas/:id/toggle` | Activar/desactivar (soft delete) |
| `DELETE` | `/cinemas/:id` | Eliminar físicamente |

### 🎬 Películas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/movies` | Crear película (title, duration, genre requeridos) |
| `GET` | `/movies` | Listar todas |
| `GET` | `/movies/:id` | Obtener por ID |
| `PATCH` | `/movies/:id` | Actualizar datos |
| `DELETE` | `/movies/:id` | Eliminar físicamente |

### 🪑 Salas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/rooms` | Crear sala (cinema_id, capacity requeridos) |
| `GET` | `/rooms` | Listar todas |
| `GET` | `/rooms/:id` | Obtener sala + contadores de shows + shows activos |
| `GET` | `/rooms/search?cinema_id=&capacity=&is_active=` | Buscar por filtros dinámicos |
| `PATCH` | `/rooms/:id` | Actualizar capacidad o estado |
| `DELETE` | `/rooms/:id` | Eliminar físicamente |

### 🎟️ Shows (próximamente)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/shows` | Crear función (movie_id, room_id, show_time, price) |
| `GET` | `/shows` | Listar funciones |
| `GET` | `/shows/:id` | Obtener función por ID |
| `PATCH` | `/shows/:id` | Actualizar función |
| `DELETE` | `/shows/:id` | Eliminar función |

---

## 📖 Documentación interactiva

Una vez que el servidor esté corriendo:
```
http://localhost:5000/api-docs
```

**Swagger UI incluye:**
- Ejemplos de requests exitosos
- Ejemplos de errores (campos faltantes, IDs inválidos)
- Parámetros de query con dropdown (active/inactive)
- Respuestas con schemas detallados
- Casos mixtos (datos válidos e inválidos en el mismo request)

---

## ⚙️ Instalación y ejecución

```bash
git clone https://github.com/DarioFGonzalez/cinema-booking-system.git
cd cinema-booking-system
npm install
cp .env.example .env
# Configurar DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
npm run dev
```
El servidor arrancará en `http://localhost:5000`

## 🔄 Próximos pasos (en este proyecto)

- [ ] Módulo Shows (funciones por sala)
- [ ] Relaciones con ON DELETE CASCADE / RESTRICT
- [ ] Paginación en listados
- [ ] Soft delete consistente

## 📊 Progreso actual

| Módulo | Estado | Documentación |
|--------|--------|---------------|
| Cinemas CRUD | ✅ | ✅ Swagger |
| Movies CRUD | ✅ | ✅ Swagger |
| Rooms CRUD | ✅ | ✅ Swagger |
| Shows CRUD | ⏳ | 📅 Pendiente |
| Relaciones FK avanzadas | 📅 | 📅 Pendiente |

## 👨‍💻 Autor

Dario Fernando Gonzalez

[GitHub](https://github.com/DarioFGonzalez) | [LinkedIn](https://linkedin.com/in/dario-gonzalez-dev)