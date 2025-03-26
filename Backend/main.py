from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import io
import sys
import contextlib
import uuid
from datetime import datetime, timedelta
import jwt
import os
from dotenv import load_dotenv
from GeminiAPI import convert_to_python
import time
from collections import defaultdict
from supabase_client import sign_up_user, sign_in_user, get_user_by_id, get_user_by_email

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="SyntaxSucks API", description="Convert English to Python code")

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Secret key for JWT token generation
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-for-jwt-tokens")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Model definitions
class ConvertRequest(BaseModel):
    instructions: str

class ConvertResponse(BaseModel):
    python_code: str
    instructions: str

class RunRequest(BaseModel):
    python_code: str

class RunResponse(BaseModel):
    output: str
    error: Optional[str] = None

class HistoryItem(BaseModel):
    id: str
    instructions: str
    python_code: str
    created_at: str
    output: Optional[str] = None
    error: Optional[str] = None

class User(BaseModel):
    username: str
    password: str
    email: EmailStr

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# In-memory storage (for simplicity)
users_db: Dict[str, UserInDB] = {}
history_db: Dict[str, HistoryItem] = {}

# Rate limiting storage
class RateLimiter:
    def __init__(self, anon_max_calls=50, auth_max_calls=500, window_seconds=86400):  # 86400 seconds = 24 hours
        self.anon_max_calls = anon_max_calls
        self.auth_max_calls = auth_max_calls
        self.window_seconds = window_seconds
        self.ip_requests = defaultdict(list)  # IP address -> list of timestamps
        self.auth_requests = defaultdict(list)  # username -> list of timestamps
    
    def is_rate_limited(self, identifier, is_authenticated=False):
        # Get the current time
        current_time = time.time()
        
        # Use auth_requests for authenticated users, ip_requests for anonymous
        request_store = self.auth_requests if is_authenticated else self.ip_requests
        max_calls = self.auth_max_calls if is_authenticated else self.anon_max_calls
        
        # Clean up old requests outside the time window
        request_store[identifier] = [
            timestamp for timestamp in request_store[identifier]
            if current_time - timestamp < self.window_seconds
        ]
        
        # Check if the number of requests exceeds the limit
        return len(request_store[identifier]) >= max_calls
    
    def add_request(self, identifier, is_authenticated=False):
        # Add the current timestamp to the list of requests
        request_store = self.auth_requests if is_authenticated else self.ip_requests
        request_store[identifier].append(time.time())
    
    def get_remaining_calls(self, identifier, is_authenticated=False):
        # Clean up old requests
        current_time = time.time()
        request_store = self.auth_requests if is_authenticated else self.ip_requests
        max_calls = self.auth_max_calls if is_authenticated else self.anon_max_calls
        
        request_store[identifier] = [
            timestamp for timestamp in request_store[identifier]
            if current_time - timestamp < self.window_seconds
        ]
        
        # Return the number of remaining calls
        return max(0, max_calls - len(request_store[identifier]))

# Initialize rate limiter
rate_limiter = RateLimiter(anon_max_calls=50)

# Helper functions for authentication
def get_password_hash(password: str) -> str:
    # In a real app, use proper password hashing like bcrypt
    return f"hashed_{password}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # In a real app, use proper password verification
    return hashed_password == f"hashed_{plain_password}"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Set up OAuth2 password bearer for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Authentication dependency
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.JWTError:
        raise credentials_exception
    
    # Get user from Supabase by email
    try:
        user = get_user_by_email(token_data.username)
        if user is None:
            raise credentials_exception
        return user
    except Exception:
        raise credentials_exception

# Rate limiting middleware
async def check_rate_limit(request: Request):
    # Get client IP address
    client_ip = request.client.host
    
    # Check if the user is authenticated
    auth_header = request.headers.get("Authorization")
    
    # Extract username from JWT token if authenticated
    is_authenticated = False
    identifier = client_ip
    if auth_header and auth_header.startswith("Bearer "):
        try:
            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")
            if username:
                is_authenticated = True
                identifier = username
        except jwt.JWTError:
            pass
    
    # Check if the user is rate limited
    if rate_limiter.is_rate_limited(identifier, is_authenticated):
        limit = rate_limiter.auth_max_calls if is_authenticated else rate_limiter.anon_max_calls
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {limit} requests per day."
        )
    
    # Add the request to the rate limiter
    rate_limiter.add_request(identifier, is_authenticated)
    
    return None

@app.post("/convert", response_model=ConvertResponse)
async def convert(request: ConvertRequest, rate_limit: None = Depends(check_rate_limit)):
    # Use the Gemini API to convert English to Python code
    python_code = convert_to_python(request.instructions)
    
    # Create a history item
    history_id = str(uuid.uuid4())
    history_item = HistoryItem(
        id=history_id,
        instructions=request.instructions,
        python_code=python_code,
        created_at=datetime.utcnow().isoformat()
    )
    
    # Store in history
    history_db[history_id] = history_item
    
    return ConvertResponse(
        python_code=python_code,
        instructions=request.instructions
    )

@app.post("/run", response_model=RunResponse)
async def run_code(request: RunRequest, rate_limit: None = Depends(check_rate_limit)):
    try:
        # Capture stdout to get the output
        stdout_buffer = io.StringIO()
        stderr_buffer = io.StringIO()
        
        # Create a safe execution environment
        exec_globals = {}
        
        # Redirect stdout and stderr
        with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
            exec(request.python_code, exec_globals)
        
        # Get the output
        output = stdout_buffer.getvalue()
        if not output and 'output' in exec_globals:
            # If no stdout but 'output' variable exists, use that
            output = str(exec_globals['output'])
        elif not output:
            output = "Code executed successfully (no output)"
        
        return RunResponse(output=output)
    except Exception as e:
        return RunResponse(output='', error=str(e))

@app.get("/history", response_model=List[HistoryItem])
async def get_history(rate_limit: None = Depends(check_rate_limit)):
    # Return all history items as a list
    return list(history_db.values())

@app.post("/auth/signup")
async def signup(user: User):
    try:
        # Register user with Supabase
        auth_response = sign_up_user(user.email, user.password, user.username)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {"message": "User registered successfully", "access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        # Sign in user with Supabase
        auth_response = sign_in_user(form_data.username, form_data.password)
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": form_data.username}, expires_delta=access_token_expires
        )
        
        return Token(access_token=access_token, token_type="bearer")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/rate-limit-status")
async def get_rate_limit_status(request: Request):
    # Get client IP address
    client_ip = request.client.host
    
    # Check if the user is authenticated
    auth_header = request.headers.get("Authorization")
    
    # If the user is authenticated, they have unlimited requests
    if auth_header:
        return {"authenticated": True, "remaining_calls": "unlimited"}
    
    # If the user is not authenticated, return the remaining calls
    remaining_calls = rate_limiter.get_remaining_calls(client_ip)
    return {
        "authenticated": False,
        "remaining_calls": remaining_calls,
        "max_calls_per_day": rate_limiter.max_calls
    }
