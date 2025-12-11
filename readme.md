# FosholBari Backend

**FosholBari** is an innovative agricultural investment platform that enables secure investments in farming projects with profitable returns upon completion.

## Project Description

ফসল বাড়ি একটি কৃষি বিনিয়োগ প্ল্যাটফর্ম, যেখানে আপনি নিরাপদভাবে কৃষি প্রকল্পে বিনিয়োগ করতে পারেন এবং নির্দিষ্ট সময় শেষে লাভ অর্জন করতে পারেন।

(Translation: Foshol Bari is an agricultural investment platform where you can safely invest in agricultural projects and earn profits at the end of a specific time.)

This repository contains the **backend** part of the project, providing RESTful APIs, real-time features, and AI integration to support the frontend application.

## Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.io (for chat and notifications)
- **AI Integration**: OpenRouter (for the AI chatbot)
- **PDF Generation**: Dedicated endpoint for certificates and receipts
- **Other Tools**: Middleware for authentication/authorization, validation, error handling, etc.


## API Structure

The backend exposes APIs under the base path **`/api/v1`**.

### Module Routes

| Path                  | Description                          | Route File            |
|-----------------------|--------------------------------------|-----------------------|
| `/user`               | User management and authentication   | userRoute            |
| `/project`            | Project creation, updates, and listing | projectRoute        |
| `/payment-method`     | Manage payment methods               | paymentMethodRoute   |
| `/payments`           | Handle payments and approvals        | paymentRoute         |
| `/investment`         | Investment processing                | investmentRoute      |
| `/kyc`                | KYC requests and approvals           | kycRoute             |
| `/chat`               | Real-time chat (integrated with Socket.io) | chatRoute          |
| `/notifications`      | Notification management              | NotificationRouter   |
| `/review`             | Project reviews/comments             | ReviewRoute          |
| `/ai`                 | AI chatbot integration (via OpenRouter) | chatbotRoute       |
| `/download/pdf`       | Generate and download PDFs (certificates/receipts) | pdfRoute          |

```typescript
const moduleRoute = [
    { path: "/user", route: userRoute },
    { path: "/project", route: projectRoute },
    { path: "/payment-method", route: paymentMethodRoute },
    { path: "/payments", route: paymentRoute },
    { path: "/investment", route: investmentRoute },
    { path: "/kyc", route: kycRoute },
    { path: "/chat", route: chatRoute },
    { path: "/notifications", route: NotificationRouter },
    { path: "/review", route: ReviewRoute },
    { path: "/ai", route: chatbotRoute },
    { path: "/download/pdf", route: pdfRoute }
];

app.use('/api/v1', router);
```

## Key Features Supported

The backend powers all features described in the frontend, including:

- **Role-Based Access**: Admin and Investor roles enforced via JWT middleware.
- **Project Management**: CRUD operations, progress updates.
- **Payment System**: Integration with methods, payment processing, approvals.
- **Investment Handling**: Secure investment recording and tracking.
- **KYC Verification**: Upload and approval workflow.
- **Real-Time Chat & Notifications**: Socket.io for live admin-investor communication.
- **Reviews/Comments**: Moderation and management.
- **AI Chatbot**: 24/7 support using OpenRouter API.
- **PDF Downloads**: Generate investment certificates and payment receipts.

## Installation

1. **Clone the Repository**:
   ```
   git clone https://github.com/mohibbullah247/fosholbari-backend.git
   cd fosholbari-backend
   ```

2. **Install Dependencies**:
   ```
   npm install
   # or
   yarn install
   ```

3. **Database Setup**:
   - Install and run PostgreSQL.
   - Create a database (e.g., `fosholbari_db`).
   - Update Prisma configuration in `prisma/schema.prisma`.

4. **Environment Variables**:
   - Create a `.env` file:
     ```
     DATABASE_URL="postgresql://user:password@localhost:5432/fosholbari_db"
     JWT_SECRET=your_jwt_secret
     OPENROUTER_API_KEY=your_openrouter_key
     # Add other keys (e.g., payment gateways, Socket.io config)
     ```

5. **Migrate Database**:
   ```
   npx prisma migrate dev --name init
   ```

6. **Run the Server**:
   ```
   npm run dev
   # or for production
   npm run build
   npm start
   ```

   Server runs on `http://localhost:5000` (or configured port).

## Real-Time Features

- Socket.io server integrated for:
  - Live chat between admins and investors.
  - Push notifications.
- Connect from frontend using the same server endpoint.

## Contributing

Contributions are welcome! Fork the repo, create a feature branch, commit changes, and open a Pull Request.



*Empowering sustainable agriculture through technology.* 🌱