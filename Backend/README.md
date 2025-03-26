# SyntaxSucks Backend

FastAPI backend for the SyntaxSucks application that converts English to Python code.

## Local Development

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Start the development server:
   ```
   uvicorn main:app --reload
   ```

3. The API will be available at `http://localhost:8000`

## Deployment to Railway

### Prerequisites

1. Create a Railway account at [railway.app](https://railway.app/)
2. Install the Railway CLI:
   ```
   npm i -g @railway/cli
   ```

### Deployment Steps

1. Login to Railway:
   ```
   railway login
   ```

2. Initialize a new project (if you haven't already):
   ```
   railway init
   ```

3. Push to Railway:
   ```
   railway up
   ```

4. Set environment variables:
   ```
   railway vars set SUPABASE_URL=your_supabase_url SUPABASE_ANON_KEY=your_supabase_key
   ```

5. Open your deployed application:
   ```
   railway open
   ```

## Environment Variables

Create a `.env` file with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Endpoints

- `POST /convert`: Convert English instructions to Python code
- `POST /run`: Run Python code and return output
- `GET /history`: Get conversion history (requires authentication)
- `POST /auth/signup`: Create a new user account
- `POST /auth/login`: Authenticate user and get JWT token 