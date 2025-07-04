# HVAC Video Generator - Single Server Setup

This setup has been simplified to run **only the HVAC server** to prevent multiple video generation issues.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the HVAC server:**
   ```bash
   npm start
   ```
   The server will start on port 3025.

3. **Test video generation:**
   ```bash
   node test-hvac-server.js
   ```

## 🔧 API Usage

### Generate HVAC Video
```bash
curl -X POST http://localhost:3025/generate-video \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Your HVAC Business",
    "niche": "hvac"
  }'
```

### Health Check
```bash
curl http://localhost:3025/health
```

## 📁 Output

Videos are saved in the `videos/` directory with the format:
`hvac_professional_[business_name]_[timestamp].mp4`

## 🎬 Video Features

- 30-second HVAC emergency service demo
- Emergency chat interaction: "I need HVAC repair service"
- Professional site tour showcasing HVAC services
- Smooth scrolling and cursor simulation
- 1920x1080 resolution at 60 FPS

## 🛠️ Server Details

- **Port:** 3025
- **Main file:** `server-hvac-step5.js`
- **Template:** Uses HVAC-specific HTML templates
- **Single video generation:** Prevents multiple simultaneous generations

## 🔒 Important Notes

- All other server files have been removed to prevent conflicts
- Only the HVAC server is configured to run
- Test files that could trigger multiple generations have been removed
- GitHub Actions workflow still available for automated generation