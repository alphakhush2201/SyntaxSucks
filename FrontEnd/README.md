# SyntaxSucks Frontend

## Deployment to Vercel

This project is configured for easy deployment to Vercel. Follow these steps to deploy:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in the Vercel dashboard
3. Vercel will automatically detect the Vite configuration
4. Add the following environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Environment Variables

The application uses the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

- `src/`: Source code
  - `components/`: React components
  - `App.jsx`: Main application component
  - `AuthContext.jsx`: Authentication context provider
  - `supabaseClient.js`: Supabase client configuration
- `public/`: Static assets
- `dist/`: Build output (generated after build)