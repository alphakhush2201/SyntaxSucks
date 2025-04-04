# SyntaxSucks

SyntaxSucks is an AI-powered code generation platform that converts English instructions into multiple programming languages. The platform supports Python, JavaScript, Java, C++, and Ruby with both code generation and execution capabilities.

## Live Demo
Frontend: https://syntaxsucks.vercel.app  
API: https://syntaxsucks-api.onrender.com

## System Requirements

### Development
- Node.js 18+ for frontend development
- Python 3.11+ for backend development

### Required Software
For local development, you'll need:
- Node.js 18+
- Python 3.11+
- JDK 11+ (for Java execution)
- G++ compiler (for C++ execution)
- Ruby interpreter (for Ruby execution)

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://syntaxsucks-api.onrender.com
```

### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET_KEY=your_jwt_secret
CORS_ORIGINS=https://syntaxsucks.vercel.app
DEBUG=false
```

## Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/syntaxsucks.git
   cd syntaxsucks
   ```

2. **Frontend Setup**
   ```bash
   cd FrontEnd
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd Backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

## Deployment

### Frontend (Vercel)
1. Push your changes to GitHub
2. Connect your repository to Vercel
3. Set the following build configurations:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add environment variables in Vercel project settings

### Backend (Render)
1. Push your changes to GitHub
2. Connect your repository to Render
3. Create a new Web Service
4. Select the Backend directory
5. Set the following configuration:
   - Environment: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables in Render project settings

## API Documentation

### Convert English to Code
```http
POST /convert
{
    "instructions": "Your English instructions",
    "language": "python" // or "javascript", "java", "cpp", "ruby"
}
```

### Execute Code
```http
POST /run
{
    "code": "Your code",
    "language": "python" // or "javascript", "java", "cpp", "ruby"
}
```

## Security Features

1. **API Rate Limiting**
   - Anonymous users: 50 requests per day
   - Authenticated users: 500 requests per day

2. **Code Execution Security**
   - All code is executed in isolated environments
   - Memory and CPU limits are enforced
   - Network access is restricted
   - Execution timeout: 30 seconds

## Support and Updates

- Report issues: https://github.com/yourusername/syntaxsucks/issues
- Email support: support@syntaxsucks.com

## License

MIT License - see LICENSE file for details