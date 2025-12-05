# Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hasnat23/Aufgabe-FullStack-igelb)

## Manual Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Add Vercel serverless functions"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration from `vercel.json`
5. Click "Deploy"

### 3. Environment Variables (Optional)

For LLM-powered change detection, add in Vercel Dashboard:

- `OPENAI_API_KEY`: Your OpenAI API key

### 4. Architecture

**Vercel Deployment Structure:**
- Frontend: Static files served from `/dist`
- Backend: Serverless functions in `/api` folder
  - `/api/websites.js` → GET `/websites`
  - `/api/websites-modify.js` → POST/DELETE `/websites`
  - `/api/crawl.js` → POST `/crawl/:websiteId`
  - `/api/changes.js` → GET `/changes/:websiteId`

**Data Storage:**
- Uses `/tmp` directory (ephemeral in serverless)
- **Note**: Data resets on each cold start
- **Production**: Use Vercel KV, PostgreSQL, or external database

### 5. Limitations

⚠️ **Important**: Serverless functions on Vercel have limitations:
- 10-second execution timeout (Hobby plan)
- `/tmp` storage is ephemeral (data lost between invocations)
- Cold starts may cause delays

**Recommended for Production:**
- Use Vercel Postgres or external database
- Implement proper data persistence
- Consider upgrading to Pro plan for longer timeouts

### 6. Local Development

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally with serverless functions
vercel dev

# Or use the existing setup
npm run dev (frontend)
node server.cjs (backend)
```

## Troubleshooting

### 404 Errors
- Ensure `vercel.json` rewrites are configured
- Check API function files exist in `/api` folder

### CORS Errors
- CORS headers are set in each API function
- Check browser console for specific errors

### Data Loss
- Expected with `/tmp` storage on serverless
- Implement persistent storage for production
