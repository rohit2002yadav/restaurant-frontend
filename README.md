# QueueEat Frontend

A modern React frontend for the **Restaurant Queue Management System**, allowing customers to join restaurant queues virtually and track their waiting status in real time.

## Features

- Customer Registration & Login
- JWT Authentication
- Restaurant Selection
- Join Virtual Queue
- Live Queue Status
- Leave Queue
- Responsive UI
- Dark Theme

## Tech Stack

- React.js
- React Router
- Axios
- CSS3
- JWT Authentication

## Project Structure

```
src/
│
├── api/
├── components/
├── context/
├── pages/
│   ├── auth/
│   ├── customer/
│   └── admin/
├── utils/
└── App.js
```

## Getting Started

### Clone the repository

```bash
git clone https://github.com/rohit2002yadav/restaurant-frontend.git
cd restaurant-frontend
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm start
```

The application will run at:

```
http://localhost:3000
```

## Backend Repository

The frontend communicates with the Django REST backend.

Backend Repository:

https://github.com/rohit2002yadav/restaurant-queue-management

## Main Customer Flow

1. Register/Login
2. Select a Restaurant
3. View Restaurant Details
4. Join Queue
5. Receive Queue Token
6. Track Queue Status
7. Leave Queue (optional)

## Admin Features

- Restaurant Dashboard
- View Queue
- Call Next Customer
- Assign Tables
- Clear Tables
- Monitor Queue Statistics

## Screenshots

(Add screenshots here)

## Future Improvements

- QR Code based restaurant selection
- Real-time queue updates using WebSockets
- Push notifications
- Online table reservation
- Analytics Dashboard

## Author

**Rohit Yadav**

M.Sc. Computer Science

```
