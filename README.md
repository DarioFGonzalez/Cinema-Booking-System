<div align="center">

# 🎬 **Cinema Booking API** 
### *REST API for cinema management (theaters, movies, rooms, shows)*

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![MySQL](https://img.shields.io/badge/MySQL-raw--queries-4479A1)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D)
![Node](https://img.shields.io/badge/Node.js-Express-339933)

**⚡ 15+ endpoints | 🎯 CRUD cinemas/movies/rooms | 📊 Show counters | 🔄 Swagger UI**

</div>

---

# 🏢 Cinema Booking System (Raw SQL)

API REST para gestión de cines, películas, salas y funciones.  
Sistema completo con validación de integridad referencial, contadores agregados y documentación interactiva.  
**Sin ORM - queries SQL puras.**

## 🎯 ¿Qué problema resuelve este proyecto?

**Los sistemas de gestión de cines** necesitan:
- ✅ CRUD completo de cines, películas y salas
- ✅ Validación de que una sala pertenezca a un cine existente
- ✅ Contadores de shows activos/inactivos por sala (sin N+1 queries)
- ✅ Documentación clara para que cualquier desarrollador pueda usarla

**Este proyecto implementa exactamente eso, con SQL puro y documentación Swagger.**

---

## 🚀 Tecnologías utilizadas

- Node.js + Express
- MySQL (mysql2/promise)
- Swagger UI + OpenAPI 3.0
- dotenv
- Nodemon (desarrollo)

---

## 📂 Estructura del proyecto
```
src/
├── handlers/ # Controladores (req/res)
│ ├── cinemasHandlers/
│ ├── moviesHandlers/
│ └── roomsHandlers/
├── utils/ # Query builders, validaciones
├── config/ # DB pool, Swagger, server, init-db
├── routes/ # Definición de endpoints
└── server.js # Entry point
```


---

## 📌 La aplicación sigue una arquitectura:

**Routes → Handlers → Utils → Database**

### Esto permite:
- Separar responsabilidades
- Reutilizar lógica (query builders)
- Mantener el código limpio y testeable
- Documentación centralizada con Swagger

---

## ✅ Validación de datos

- `validateId()` para UUIDs (cinemas)
- Validación de IDs enteros para movies/rooms
- `checkMandatoryColumns()` para campos obligatorios en POST
- Whitelist de columnas permitidas en query builders

---

## 🧠 Lógica de negocio clave

### Contadores agregados (sin N+1)
- `GET /rooms/:id` devuelve la sala + estadísticas de shows
- Una sola query con `SUM(is_active = TRUE/FALSE)`
- Escala sin importar la cantidad de shows

### Integridad referencial
- Validación de `cinema_id` antes de crear una sala
- Error `404 CINEMA_NOT_FOUND` en lugar de error genérico de FK

### Query builders con currying
- `postQueryBuilder(allowedParams)` → preconfiguración para INSERT
- `updateQueryBuilder(allowedParams)` → preconfiguración para UPDATE
- `checkMandatoryColumns()` reusable para validaciones

---

## 📌 Endpoints

### 🏢 Cinemas

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| `POST` | `/cinemas` | Crear cine (UUID automático) | Público |
| `GET` | `/cinemas` | Listar todos los cines | Público |
| `GET` | `/cinemas/:id` | Obtener cine + sus salas | Público |
| `PATCH` | `/cinemas/:id` | Actualizar nombre/ciudad/estado | Público |
| `PATCH` | `/cinemas/:id/toggle` | Activar/desactivar cine (soft delete) | Público |
| `DELETE` | `/cinemas/:id` | Eliminar físicamente (hard delete) | Público |

### 🎬 Películas

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| `POST` | `/movies` | Crear película (title, duration, genre requeridos) | Público |
| `GET` | `/movies` | Listar todas las películas | Público |
| `GET` | `/movies/:id` | Obtener película por ID | Público |
| `PATCH` | `/movies/:id` | Actualizar datos de película | Público |
| `DELETE` | `/movies/:id` | Eliminar físicamente (hard delete) | Público |

### 🪑 Salas

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| `POST` | `/rooms` | Crear sala (cinema_id, capacity requeridos) | Público |
| `GET` | `/rooms` | Listar todas las salas | Público |
| `GET` | `/rooms/:id` | Obtener sala + contadores de shows | Público |
| `GET` | `/rooms/:id/status?status=active` | Filtrar shows por estado | Público |
| `PATCH` | `/rooms/:id` | ⏳ Pendiente | - |
| `DELETE` | `/rooms/:id` | ⏳ Pendiente | - |

---

## 🧠 Conceptos aplicados

- Arquitectura en capas
- Queries SQL puras (sin ORM)
- Placeholders parametrizados (SQL injection safe)
- UUID para cinemas, INT AUTO_INCREMENT para movies/rooms
- Currying para query builders reutilizables
- Validación de integridad referencial antes de INSERT
- Contadores agregados con `SUM(condition)`
- Soft delete (toggle) y hard delete
- Documentación interactiva con Swagger UI

---

## 📖 Documentación interactiva

Una vez que el servidor esté corriendo, podés explorar y probar la API desde:
```
http://localhost:5000/api-docs
```

**Swagger UI incluye:**
- Ejemplos de requests exitosos
- Ejemplos de errores (campos faltantes, IDs inválidos)
- Parámetros de query con dropdown (active/inactive)
- Respuestas con schemas detallados

---

## ⚙️ Instalación y ejecución

```bash
git clone https://github.com/DarioFGonzalez/cinema-booking-system.git
cd cinema-booking-system
npm install
cp .env.example .env
# Configurar variables de entorno (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
npm run dev
```
El servidor arrancará en `http://localhost:5000`

## 🔒 Mejoras futuras

- Módulo de Shows (CRUD de funciones por sala)
- PATCH /rooms (actualizar capacidad o estado)
- DELETE /rooms (hard delete)
- Paginación en listados
- JWT authentication
- Role-based access (admin / client)
- Tests unitarios y de integración
- Logging estructurado (winston)

## 📊 Progreso actual

| Módulo | Estado |
|--------|--------|
| Cinemas CRUD + toggle + delete | ✅ Completado |
| Movies CRUD | ✅ Completado |
| Rooms POST, GET all, GET by id, GET by status | ✅ Completado |
| Rooms PATCH + DELETE | ⏳ Pendiente |
| Shows module | ⏳ Pendiente (schema definido) |
| Swagger documentation | ✅ Completado |
| Paginación | 📅 Próximo |
| JWT + roles | 📅 Próximo |

## 👨‍💻 Autor

Dario Fernando Gonzalez

[GitHub](https://github.com/DarioFGonzalez) | [LinkedIn](https://linkedin.com/in/dario-gonzalez-dev)