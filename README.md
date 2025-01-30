# Node.js PostgreSQL API Project

A RESTful API built with Node.js, Express, and PostgreSQL using Sequelize ORM for user authentication and management.

## Features

- User registration (signup)
- User authentication (login)
- JWT token-based authentication
- Protected routes
- PostgreSQL database integration with Sequelize ORM
- Password encryption using bcrypt

## Prerequisites

Before running this project, make sure you have the following installed:
- Node.js (v14 or higher)
- PostgreSQL
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=your_database_name
PORT=3000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Project Structure

```
project-root/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── user.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   └── user.model.js
│   ├── routes/
│   │   └── index.js
│   └── app.js
├── .env
├── .gitignore
└── package.json
```

## API Endpoints

### Public Routes

#### User Registration
- **POST** `/api/v1/signup`
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "yourpassword123"
}
```

#### User Login
- **POST** `/api/v1/login`
```json
{
  "email": "john.doe@example.com",
  "password": "yourpassword123"
}
```

### Protected Routes

#### Get User Profile
- **GET** `/api/v1/getProfile`
- Requires Authorization header with Bearer token

## Authentication

The API uses JWT (JSON Web Token) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `200` - Success
- `201` - Resource created
- `400` - Bad request
- `401` - Unauthorized
- `500` - Server error

## Database

The project uses PostgreSQL with Sequelize ORM. The database schema includes:

### Users Table
- `id` (UUID, Primary Key)
- `first_name` (String)
- `last_name` (String)
- `email` (String, Unique)
- `password` (String, Encrypted)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Security Features

- Password hashing using bcrypt
- JWT token expiration
- Token expiration warnings
- Protected routes middleware
- Email validation
- Unique email constraint

## Development

```bash
# Run in development mode with nodemon
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details

## Author

Muskan Dev

