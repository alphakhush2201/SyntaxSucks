import os
from supabase import create_client, Client
import sys

# Supabase configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://bdnopjgvogrlktgtuaci.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbm9wamd2b2dybGt0Z3R1YWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzY3MzUsImV4cCI6MjA1ODUxMjczNX0.cwgTTZQe53E8UBVK-7h7by5QQkQASU0ecOkxMPQ7RUI")

# Initialize Supabase client with error handling
try:
    # Initialize with minimal options to avoid proxy issues
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY, options={
        "schema": "public",
        "headers": {"X-Client-Info": "supabase-py/2.3.5"},
        "auto_refresh_token": True,
    })
except TypeError as e:
    if "proxy" in str(e):
        print("Error with proxy parameter in Supabase client. Trying alternative initialization.")
        try:
            from supabase import Client as SupabaseClient
            # Fallback to direct initialization without proxy
            supabase = SupabaseClient(SUPABASE_URL, SUPABASE_KEY)
        except Exception as inner_e:
            print(f"Failed to initialize Supabase client: {inner_e}")
            sys.exit(1)
    else:
        print(f"Supabase initialization error: {e}")
        sys.exit(1)
except Exception as e:
    print(f"Failed to initialize Supabase client: {e}")
    sys.exit(1)

# User management functions
def sign_up_user(email, password, username):
    """Register a new user in Supabase"""
    try:
        # Create user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        
        # If successful, store additional user data in profiles table
        if auth_response.user:
            user_id = auth_response.user.id
            
            # Insert into profiles table
            supabase.table("profiles").insert({
                "id": user_id,
                "username": username,
                "created_at": "now()"
            }).execute()
            
        return auth_response
    except Exception as e:
        raise Exception(f"Error signing up user: {str(e)}")

def sign_in_user(email, password):
    """Sign in a user with Supabase"""
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return auth_response
    except Exception as e:
        raise Exception(f"Error signing in user: {str(e)}")

def get_user_by_id(user_id):
    """Get user profile data by user ID"""
    try:
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        raise Exception(f"Error getting user profile: {str(e)}")

def get_user_by_email(email):
    """Get user by email"""
    try:
        # First try to get the user from Supabase auth
        auth_response = supabase.auth.admin.list_users()
        users = auth_response.users if hasattr(auth_response, 'users') else []
        
        # Find the user with the matching email
        user = next((u for u in users if u.email == email), None)
        
        if user:
            # Get the user's profile data
            profile = get_user_by_id(user.id)
            if profile:
                return {**profile, "email": email}
            return {"id": user.id, "email": email}
        
        return None
    except Exception as e:
        # Fallback to querying profiles table by email
        try:
            response = supabase.table("profiles").select("*").eq("email", email).execute()
            return response.data[0] if response.data and len(response.data) > 0 else None
        except Exception as inner_e:
            raise Exception(f"Error getting user by email: {str(e)}, {str(inner_e)}")