# BuildLedger

BuildLedger is a simple construction expense management application designed to keep track of money spent during house construction.

It allows users to record expenses, manage vendors and people, organize expenses by category, and track payment methods such as Cash, PhonePe, and Pending.

## Features

* User registration and login
* JWT-based authentication
* Password hashing
* Add and manage vendors
* Add and manage expense categories
* Add construction expenses
* Assign expenses to vendors
* Categorize expenses
* Track payment method

  * Cash
  * PhonePe
  * Pending
* Edit expenses
* Delete expenses
* Filter expenses by category
* View expense totals
* Dashboard metric cards

  * Total Amount Till Date
  * Total PhonePe
  * Total Cash
  * Total Pending
  * Total Petrol
  * Category-wise Total
* Simple web interface

## Technology Stack

### Backend

* Python
* FastAPI
* SQLAlchemy
* MySQL
* Pydantic
* JWT Authentication
* Password Hashing

### Frontend

* HTML
* CSS
* JavaScript

### Development Tools

* Git
* VS Code
* Swagger / OpenAPI

## Project Structure

```text
BuildLedger/
│
├── backend/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   ├── database.py
│   ├── dependencies.py
│   └── main.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

## Main Modules

### Authentication

Users can register and log in securely.

JWT tokens are used to authenticate requests to protected API endpoints.

### Vendors

Users can create vendors or people involved in construction expenses.

Each vendor can contain:

* Name
* Phone number
* Description

### Categories

Users can create expense categories such as:

* Petrol
* Materials
* Labour
* Food
* Transport
* Other

Categories are linked to expenses and can be used for filtering and dashboard calculations.

### Expenses

Each expense contains information such as:

* Date
* Category
* Description
* Vendor
* Amount
* Payment method

Expenses can be:

* Created
* Viewed
* Edited
* Deleted
* Filtered by category

## Dashboard

The dashboard provides an overview of construction spending.

The metric cards display:

1. Total Amount Till Date
2. Total PhonePe
3. Total Cash
4. Total Pending
5. Total Petrol
6. Category-wise Total

The category metric allows the user to select a category and view the total amount spent for that category.

## API

The FastAPI backend provides REST API endpoints for:

* Authentication
* Users
* Vendors
* Categories
* Expenses

The API can be explored using Swagger UI.

When running locally, open:

```text
http://127.0.0.1:8000/docs
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Eshaa21/BuildLedger.git
cd BuildLedger
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file based on `.env.example`.

Add the required database and authentication configuration.

### 5. Start the FastAPI server

```bash
uvicorn backend.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

## Frontend

The frontend is located inside the `frontend` directory.

The application uses JavaScript to communicate with the FastAPI backend.

The frontend includes:

* Login
* Dashboard
* Vendor management
* Category management
* Expense management
* Expense filtering
* Expense editing and deletion
* Dashboard metrics

## Authentication

Protected API requests use a JWT access token.

The frontend stores the authentication token in browser `localStorage` and sends it with API requests using:

```text
Authorization: Bearer <token>
```

## Database

BuildLedger uses MySQL through SQLAlchemy.

The database stores information related to:

* Users
* Vendors
* Categories
* Expenses

The application uses SQLAlchemy models and relationships to connect these entities.

## Project Goal

BuildLedger was created as a simple and practical expense ledger for construction projects.

The main goal is to make it easy to answer:

* How much money has been spent?
* Where was the money spent?
* Which category consumed the most money?
* How much was paid through Cash?
* How much was paid through PhonePe?
* How much is still Pending?
* Who was the money paid to?
