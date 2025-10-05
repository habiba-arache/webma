# 🚀 Quick Setup Guide

## Prerequisites Check

Before starting, ensure you have Node.js installed:

```bash
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
```

If not installed, download from: https://nodejs.org/

## Installation Steps

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd ../backend
npm install
```

### 2. Verify Environment Files

Both `.env` files are already created. Verify they exist:

- `frontend/.env` → Contains `VITE_API_BASE=http://localhost:8080/api`
- `backend/.env` → Contains `PORT=8080` and `CORS_ORIGIN=http://localhost:5173`

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🌍 Webma EarthGuard API running on http://localhost:8080
📡 CORS enabled for: http://localhost:5173
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 4. Open the App

Navigate to: **http://localhost:5173**

## Troubleshooting

### Port Already in Use

If port 5173 or 8080 is busy:

**Frontend:** Edit `frontend/vite.config.ts` and change the port:
```typescript
server: {
  port: 3000, // Change to any available port
}
```

**Backend:** Edit `backend/.env`:
```
PORT=3001  # Change to any available port
```

Don't forget to update `frontend/.env` with the new backend port!

### Module Not Found Errors

Run `npm install` again in the respective directory.

### CORS Errors

Ensure:
1. Backend is running on the port specified in `frontend/.env`
2. `backend/.env` has the correct frontend URL in `CORS_ORIGIN`

### Leaflet Map Not Showing

Check browser console for errors. Common issues:
- Leaflet CSS not loaded (check `index.html`)
- Network blocked (check firewall/antivirus)

## Next Steps

1. **Click on the map** to see environmental data for that location
2. **Toggle layers** in the sidebar (Fire, Heat, Air Quality, etc.)
3. **View suggestions** in the InfoPanel
4. **Toggle dark mode** with the moon/sun icon

## Production Deployment

See `README.md` for Vercel (frontend) and Render (backend) deployment instructions.

## Need Help?

- Check `README.md` for full documentation
- Review browser console for errors
- Ensure all dependencies are installed
- Verify Node.js version is 18+

---

**Happy mapping! 🌍**
