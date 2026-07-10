# Nexora

Nexora is a RESTful social media backend API built with Node.js and Express.js. It provides user authentication, post management, comments, likes, bookmarks, filtering, pagination, sorting, post status management, media uploads, centralized error handling, request validation, API documentation, and automated integration testing.

## Features

- User registration and authentication
- JWT-based route protection
- Create, retrieve, update, and delete posts
- Upload post images
- Retrieve posts belonging to the authenticated user
- Filter posts by caption
- Paginate post results
- Sort posts by creation date
- Sort posts by engagement
- Draft, publish, and archive posts
- Create, retrieve, update, and delete comments
- Paginate comments
- Like and unlike posts
- Retrieve likes for a post
- Create, retrieve, and delete bookmarks
- Strict request validation
- Unknown-field rejection
- Centralized error handling
- Structured application logging
- Development seed data
- OpenAPI documentation with Swagger UI
- Automated API integration and regression testing

## Tech Stack

- Node.js
- Express.js
- JavaScript
- ES Modules
- JSON Web Token (JWT)
- bcrypt
- Multer
- express-validator
- Pino
- Swagger UI Express
- OpenAPI 3.0.3
- Vitest
- Supertest

## Project Structure

```text
nexora/
├── src/
│   ├── config/
│   │   ├── env.config.js
│   │   ├── seed.js
│   │   └── swagger.config.js
│   │
│   ├── docs/
│   │   └── openapi.json
│   │
│   ├── modules/
│   │   ├── users/
│   │   ├── posts/
│   │   ├── comments/
│   │   ├── likes/
│   │   └── bookmarks/
│   │
│   ├── shared/
│   │   ├── errors/
│   │   ├── middlewares/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── tests/
│   │   ├── users/
│   │   ├── posts/
│   │   ├── comments/
│   │   ├── likes/
│   │   └── bookmarks/
│   │
│   └── app.js
│
├── uploads/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd nexora
```

Install dependencies:

```bash
npm install
```

## Environment Configuration

Create a `.env` file in the project root.

You can use `.env.example` as a reference.

Example:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

Do not commit the `.env` file to version control.

## Running the Application

Start the development server:

```bash
npm run dev
```

Start the application normally:

```bash
npm start
```

The API runs by default at:

```text
http://localhost:5000
```

## Development Seed Data

When the application runs in the development environment, predictable test data is automatically created.

### Primary User

```text
Email: primary@test.com
Password: Password123
```

### Secondary User

```text
Email: secondary@test.com
Password: Password123
```

The development seed also creates posts, comments, and likes for API testing.

IDs are generated dynamically and may change whenever the application restarts.

## Authentication

Protected API endpoints require a JWT access token.

Sign in using:

```text
POST /api/signin
```

A successful login returns an access token.

Send the token with protected requests using the following header:

```text
Authorization: Bearer <access-token>
```

## API Endpoints

### Authentication

| Method | Endpoint      | Description         |
| ------ | ------------- | ------------------- |
| POST   | `/api/signup` | Register a new user |
| POST   | `/api/signin` | Authenticate a user |

### Posts

| Method | Endpoint                | Description                         |
| ------ | ----------------------- | ----------------------------------- |
| GET    | `/api/posts/all`        | Retrieve published posts            |
| GET    | `/api/posts`            | Retrieve authenticated user's posts |
| GET    | `/api/posts/:id`        | Retrieve a post by ID               |
| POST   | `/api/posts`            | Create a post                       |
| PUT    | `/api/posts/:id`        | Update a post                       |
| PATCH  | `/api/posts/:id/status` | Update post status                  |
| DELETE | `/api/posts/:id`        | Delete a post                       |

### Comments

| Method | Endpoint            | Description                  |
| ------ | ------------------- | ---------------------------- |
| GET    | `/api/comments/:id` | Retrieve comments for a post |
| POST   | `/api/comments/:id` | Create a comment             |
| PUT    | `/api/comments/:id` | Update a comment             |
| DELETE | `/api/comments/:id` | Delete a comment             |

For `GET` and `POST`, `:id` represents a post ID.

For `PUT` and `DELETE`, `:id` represents a comment ID.

### Likes

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| GET    | `/api/likes/:postId`        | Retrieve likes for a post |
| GET    | `/api/likes/toggle/:postId` | Toggle like status        |

### Bookmarks

| Method | Endpoint             | Description                             |
| ------ | -------------------- | --------------------------------------- |
| GET    | `/api/bookmarks`     | Retrieve authenticated user's bookmarks |
| POST   | `/api/bookmarks/:id` | Bookmark a post                         |
| DELETE | `/api/bookmarks/:id` | Remove a bookmark                       |

## Post Filtering, Sorting, and Pagination

The following endpoint supports filtering, sorting, and pagination:

```text
GET /api/posts/all
```

### Supported Query Parameters

| Parameter | Description                      |
| --------- | -------------------------------- |
| `caption` | Filter posts by caption text     |
| `sort`    | Sort by `date` or `engagement`   |
| `page`    | Select the result page           |
| `limit`   | Set the number of posts per page |

Example:

```text
GET /api/posts/all?caption=first&sort=engagement&page=1&limit=10
```

Posts are sorted by creation date by default.

Engagement sorting is calculated using the number of likes and comments associated with each post.

## Post Status Management

Posts support the following statuses:

```text
published
draft
archived
```

Only published posts are returned by the public post retrieval endpoint.

Post owners can update post status using:

```text
PATCH /api/posts/:id/status
```

Example request body:

```json
{
  "status": "draft"
}
```

## File Uploads

Post images are uploaded using `multipart/form-data`.

Supported image formats:

- JPEG
- PNG
- WebP

Maximum file size:

```text
5 MB
```

Unsupported file types and oversized files are rejected.

## Request Validation

Nexora uses `express-validator` for request validation.

Validation includes:

- Required-field validation
- Data type validation
- Email validation and normalization
- UUID validation
- Pagination validation
- Post status validation
- Caption length validation
- Unknown-field rejection

Validation failures return:

```text
400 Bad Request
```

Example response:

```json
{
  "status": "fail",
  "message": "Request validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ]
}
```

## Error Handling

Nexora uses centralized error handling and custom application errors.

The API uses appropriate HTTP status codes, including:

| Status Code | Meaning                               |
| ----------- | ------------------------------------- |
| 200         | Successful request                    |
| 201         | Resource created successfully         |
| 400         | Invalid request or validation failure |
| 401         | Authentication failure                |
| 403         | Authorization failure                 |
| 404         | Resource not found                    |
| 409         | Resource conflict                     |
| 500         | Internal server error                 |

Example error response:

```json
{
  "status": "fail",
  "message": "Post not found"
}
```

## API Documentation

Interactive API documentation is available through Swagger UI.

After starting the application, open:

```text
http://localhost:5000/api-docs/
```

The documentation includes:

- Complete endpoint documentation
- Request parameters
- Request body schemas
- Response schemas
- HTTP status codes
- JWT authentication
- Multipart file uploads
- Reusable OpenAPI schemas

To test protected endpoints:

1. Sign in using `POST /api/signin`.
2. Copy the returned access token.
3. Click **Authorize** in Swagger UI.
4. Enter the JWT access token.
5. Execute protected API requests.

## Automated Testing

Nexora uses Vitest and Supertest for automated API integration and regression testing.

The test suite covers:

- Authentication
- Posts
- Comments
- Likes
- Bookmarks
- Request validation
- Authentication and authorization
- HTTP status codes
- Resource ownership
- Error handling
- Filtering
- Sorting
- Pagination
- Post status management
- File upload validation
- Cross-module behavior

Run the complete test suite:

```bash
npm test
```

Current regression test result:

```text
Test Files  5 passed (5)
Tests       159 passed (159)
```

## Architecture

Nexora follows a modular architecture with separation of concerns.

Each feature module separates responsibilities between:

- Routes
- Controllers
- Models
- Validation

Shared application concerns are organized separately, including:

- Authentication middleware
- Validation middleware
- Error handling
- Logging
- File uploads
- Token services
- Custom error classes

This structure improves maintainability, testability, and extensibility.

## Data Storage

The current implementation uses in-memory data storage as required for the project.

Application data is reset whenever the server process restarts.

Development seed data is initialized automatically when the application runs with:

```text
NODE_ENV=development
```

## Security Considerations

The application implements several security-related practices:

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Resource ownership authorization
- Strict request validation
- Unknown-field rejection
- File MIME type validation
- File size restrictions
- Generic authentication failure messages
- Passwords are excluded from API responses

## Future Improvements

Potential future enhancements include:

- PostgreSQL database integration
- Prisma ORM
- Refresh token authentication
- Role-based access control
- Rate limiting
- CORS configuration
- User profiles
- Follow and unfollow functionality
- Notifications
- Cloud-based media storage
- Docker containerization
- CI/CD integration

## Author

**nain333**
