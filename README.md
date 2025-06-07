# Reservation System

This is a reservation system that allows users to make reservations and administrators to manage those reservations.

## Project Structure

```
reservation-system
├── src
│   ├── admin
│   │   ├── controllers
│   │   │   └── adminController.ts
│   │   ├── routes
│   │   │   └── adminRoutes.ts
│   │   └── views
│   │       └── adminDashboard.tsx
│   ├── user
│   │   ├── controllers
│   │   │   └── userController.ts
│   │   ├── routes
│   │   │   └── userRoutes.ts
│   │   └── views
│   │       └── reservationPage.tsx
│   ├── models
│   │   └── reservation.ts
│   ├── services
│   │   └── reservationService.ts
│   ├── app.ts
│   └── types
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Features

- **User Side:**
  - Users can create reservations.
  - Users can view their reservations.

- **Admin Side:**
  - Admins can create, update, and delete reservations.
  - Admin dashboard for managing reservations.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd reservation-system
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run:
```
npm start
```

## License

This project is licensed under the MIT License.