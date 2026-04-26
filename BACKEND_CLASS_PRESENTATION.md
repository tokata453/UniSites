# UniSites Backend Presentation

## Slide 1: Title

**UniSites Backend System**

- Course: Web Backend
- Project type: Full-stack university and organization discovery platform
- Focus: API design, database architecture, authentication, and real-time messaging

Speaker note:
UniSites is not just a university listing website. It is a backend-driven platform that supports multiple user roles, content management, opportunities, moderation, and inbox communication.

## Slide 2: Project Overview

**What UniSites Does**

- Helps students discover universities, majors, organizations, and opportunities in Cambodia
- Supports different user roles with different permissions
- Provides dashboards for students, university owners, organizations, and admins
- Includes public content, protected APIs, and real-time inbox features

Speaker note:
The backend is responsible for handling business logic, access control, data storage, authentication, and communication between users and institutions.

## Slide 3: Backend Technology Stack

**Core Stack**

- Runtime: Node.js
- Framework: Express
- Database: PostgreSQL
- ORM: Sequelize
- Authentication: Passport + JWT
- Real-time communication: Socket.IO
- Media upload: Cloudinary

Why this stack:

- Express keeps the API simple and modular
- Sequelize helps model relationships and manage migrations
- PostgreSQL is reliable for relational data
- JWT is useful for frontend-backend auth in SPAs
- Socket.IO supports live inbox updates and presence

## Slide 4: High-Level Backend Architecture

**Architecture Flow**

1. Frontend sends requests to `/api`
2. Express routes map requests to controllers
3. Controllers validate input and apply business logic
4. Sequelize models read/write PostgreSQL data
5. Responses return JSON back to the frontend
6. Socket.IO handles live events such as typing and online presence

Important backend entry points:

- `backend/server.js`
- `backend/app.js`
- `backend/routes/index.js`

Speaker note:
This project follows a common backend architecture: routes, controllers, models, middleware, and utilities.

## Slide 5: API Modules

**Main API Domains**

- Auth
- Universities
- Organizations
- Opportunities
- Majors
- Feed
- Inbox
- Analytics
- Upload
- Admin

Why modular routing matters:

- Easier to maintain
- Easier to test
- Easier to scale when features grow
- Cleaner separation of responsibilities

## Slide 6: Authentication and Authorization

**Authentication Features**

- Local login with email and password
- Google OAuth
- Facebook OAuth
- JWT token generation after login

**Authorization Features**

- Role-based access for `student`, `owner`, `organization`, and `admin`
- Middleware protects sensitive routes
- Account status and publishing state are handled separately

Important design detail:

- User access is controlled by account status
- Institution visibility is controlled by approval and publish flags

Speaker note:
This separation is important because a user can exist in the system while their institution content is still under moderation.

## Slide 7: Database Design

**Database Approach**

- Relational database using PostgreSQL
- Sequelize models represent entities and relationships
- Migrations track schema changes over time
- Seeders generate development data

Main entities:

- Users
- Roles
- Universities
- Organizations
- Opportunities
- Reviews
- Feed items
- Conversations
- Messages
- Notifications

Why a relational design works well here:

- Strong relationships between users and institutions
- Clear ownership rules
- Easier querying for dashboards and moderation
- Structured data consistency

## Slide 8: Real-Time Features

**Socket.IO in UniSites**

- Tracks online users
- Supports joining user rooms
- Supports joining conversation threads
- Sends typing indicators
- Broadcasts presence updates

Use case:

- When a user opens the inbox, they can see live presence and typing status without refreshing the page

Speaker note:
This makes the backend more than a standard REST API. It also supports event-based communication.

## Slide 9: Security and Middleware

**Security / Request Handling**

- `helmet` for security headers
- `cors` for controlled frontend access
- `express-rate-limit` for API rate limiting
- `passport` for auth strategies
- Global error handling middleware
- Input validation utilities

Why this matters:

- Protects the API from misuse
- Creates consistent error responses
- Reduces security risks in production

## Slide 10: Example Request Flow

**Example: User Login**

1. User submits email and password
2. Express route sends request to auth controller
3. Passport local strategy checks credentials
4. Backend verifies password and account status
5. Backend generates JWT token
6. Frontend receives token and stores auth state

Possible extension:

- The same auth system also supports social login using Google and Facebook

## Slide 11: Strengths of This Backend

**What Is Good About This Design**

- Clear modular structure
- Supports multiple business domains in one platform
- Good separation between public content and protected management features
- Combines REST API design with real-time communication
- Designed for role-based workflows and moderation

## Slide 12: Challenges and Improvements

**Current Challenges**

- Growing feature scope increases backend complexity
- Many related domains require careful permission checks
- Real-time messaging adds extra state management
- Migration consistency becomes more important as the schema grows

**Possible Improvements**

- Add more automated integration tests
- Add Swagger or OpenAPI documentation
- Add request-level validation with a dedicated schema library
- Improve background job handling for heavy async tasks
- Add caching for frequently requested public data

## Slide 13: What I Learned

**Backend Lessons From UniSites**

- Good backend design is not only about CRUD operations
- Role and permission design is a major part of backend architecture
- Database structure affects feature quality and scalability
- Real-time systems require different thinking than normal HTTP APIs
- Clean project structure makes future maintenance easier

## Slide 14: Conclusion

**Conclusion**

- UniSites is a real-world style backend project with authentication, authorization, REST APIs, PostgreSQL modeling, and real-time messaging
- The backend supports discovery, management, moderation, and communication features in one system
- This project demonstrates how backend engineering connects business rules, data design, and user experience

## Short Version For a 5-Minute Presentation

If you only need a short presentation, use this 6-slide version:

1. Title and project overview
2. Backend stack
3. Architecture flow
4. Authentication and roles
5. Database and real-time inbox
6. Challenges, lessons, and conclusion

## Demo Talking Points

If your teacher asks what makes this project a backend project, mention:

- Multiple API modules
- Database schema with migrations
- Role-based authorization
- JWT and OAuth authentication
- Real-time messaging with Socket.IO
- Admin and moderation workflows

## Suggested Final Line

"UniSites shows that backend development is not only about storing data. It is about designing secure APIs, modeling relationships, controlling permissions, and supporting real user workflows."
