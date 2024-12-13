# Bill Splitter Application

> This project was developed with the assistance of AI technology (Codeium), showcasing the potential of human-AI collaboration in modern software development.

A web application that helps groups of friends split bills based on receipt items. Users can upload receipt images, automatically recognize items through OCR, and split costs based on individual consumption.

## Features

- Receipt image upload with OCR recognition
- Create and manage bill splitting sessions
- Individual product selection for each person
- Automatic calculation of individual amounts
- Track overall bill status and remaining balance

## Tech Stack

- Frontend: Angular
- Backend: Node.js with Express
- OCR: Tesseract.js
- Database: MongoDB

## Project Structure

```
bill-splitter/
├── frontend/         # Angular application
└── backend/          # Node.js server
```

## Prerequisites

- Node.js (v14 or higher)
- Angular CLI
- MongoDB

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file with your configuration

3. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Angular development server:
   ```bash
   ng serve
   ```

The application will be available at `http://localhost:4200`
