# SyntaxSucks - English to Python Converter

SyntaxSucks is an application that converts English instructions to Python code using AI. It features user authentication with Supabase for secure storage of user credentials and history.

## Features

- Convert English instructions to Python code
- Execute Python code and view output
- Save conversion history
- User authentication with Supabase
- Rate limiting based on authentication status

## Setup

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Supabase account

### Supabase Setup

1. Create a new project in Supabase
2. Go to SQL Editor and run the SQL commands in `Backend/supabase_schema.sql`
3. Go to Settings > API and copy your project URL and anon key
4. Update the `.env` files in both Frontend and Backend directories with your Supabase credentials

### Backend Setup

```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd FrontEnd
npm install
npm run dev
```

## Environment Variables

### Frontend (.env)

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Backend (.env)

```
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-anon-key
```

## Authentication Flow

1. Users can sign up with email, password, and username
2. User credentials are securely stored in Supabase Auth
3. Additional user data is stored in the profiles table
4. Authenticated users get higher rate limits and can save their conversion history
5. Row Level Security (RLS) ensures users can only access their own data

## Database Schema

### Profiles Table

- id: UUID (references auth.users)
- username: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### History Table

- id: UUID
- user_id: UUID (references auth.users)
- instructions: TEXT
- python_code: TEXT
- output: TEXT (optional)
- error: TEXT (optional)
- created_at: TIMESTAMP

## Security

- User passwords are securely hashed and stored by Supabase Auth
- Row Level Security (RLS) policies ensure data isolation
- JWT tokens are used for API authentication
- Rate limiting protects against abuse