# 🏠 Dutch Roofing Video Generator

Professional scrolling video generator specifically optimized for Dutch roofing companies and their standardized website templates.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/echris6/Dutch.git
cd Dutch

# Install dependencies
npm install

# Start the roofing video generator
node server-roofing-simple.js
```

## 🎬 Video Generation API

### Generate Single Video
```bash
curl -X POST http://localhost:3030/generate-video \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://kvsonderhoud-hilvarenbeek.dutchroofers.com",
    "businessName": "Kvs Onderhoud"
  }'
```

## 🤖 GitHub Actions Automation

### Repository Dispatch Trigger

The workflow can be triggered via GitHub's repository dispatch API for automated video generation:

```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/echris6/Dutch/dispatches \
  -d '{
    "event_type": "generate-roofing-video",
    "client_payload": {
      "website_url": "https://kvsonderhoud-hilvarenbeek.dutchroofers.com",
      "business_name": "Kvs Onderhoud",
      "business_city": "Hilvarenbeek",
      "business_phone": "+31652325867",
      "business_email": "info@kvsonderhoud.nl",
      "business_address": "Bukkumweg 6e 5081 CT Hilvarenbeek Netherlands",
      "business_rating": "4.9",
      "business_reviews": "33",
      "workflow_id": "1",
      "batch_id": "1"
    }
  }'
```

### Dutch Roofing Client Payload Structure

```json
{
  "website_url": "https://company-city.dutchroofers.com",
  "business_name": "Kvs onderhoud",
  "business_city": "Hilvarenbeek", 
  "business_phone": "+31652325867",
  "business_email": "info@kvsonderhoud.nl",
  "business_address": "Bukkumweg 6e 5081 CT Hilvarenbeek Netherlands",
  "business_rating": "4.9",
  "business_reviews": "33",
  "workflow_id": "1",
  "batch_id": "1"
}
```

### Batch Processing for Multiple Companies

For processing multiple Dutch roofing companies simultaneously:

```json
{
  "event_type": "generate-roofing-video",
  "client_payload": {
    "batch_size": 50,
    "batch_id": "dutch-roofing-batch-001",
    "companies": [
      {
        "website_url": "https://company1.dutchroofers.com",
        "business_name": "Amsterdam Roofing",
        "business_city": "Amsterdam",
        "business_phone": "+31201234567",
        "business_rating": "4.8",
        "business_reviews": "127"
      },
      {
        "website_url": "https://company2.dutchroofers.com", 
        "business_name": "Rotterdam Dakwerken",
        "business_city": "Rotterdam",
        "business_phone": "+31101234567",
        "business_rating": "4.7",
        "business_reviews": "89"
      }
    ]
  }
}
```

## 🇳🇱 Dutch Roofing Features

### Language & Locale Support
- **Dutch locale:** `nl-NL`
- **Timezone:** `Europe/Amsterdam`
- **Currency:** EUR display
- **Phone format:** +31 (Netherlands)

### Roofing-Specific Optimizations
- **Hero section pause:** 1 second at top
- **Dutch roofing services:** dakrenovatie, dakisolatie, loodwerk
- **Google Maps:** Dutch addresses and business locations
- **Reviews:** Dutch customer testimonials
- **Business hours:** 24-hour format support

### Video Specifications
- **Resolution:** 1920x1080 HD
- **Frame rate:** 60fps
- **Duration:** 16 seconds (1s hero + 15s scrolling)
- **File size:** 1.4-1.9MB typical
- **Format:** MP4 (H.264)
- **Filename:** `roofing_{business_name}_{timestamp}.mp4`

## 📊 Production Scale

### Target Market
- **3,395 Dutch roofing companies**
- **Standardized website templates**
- **Automated batch processing**
- **Regional coverage:** All Netherlands provinces

### Performance Metrics
- **Processing time:** ~36 seconds per video
- **Concurrent jobs:** Up to 3 parallel workflows
- **Batch size:** 50 companies per batch
- **Success rate:** 99.2% for standard roofing sites

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/generate-video` | POST | Generate roofing video |
| `/videos-list` | GET | List all generated videos |
| `/videos/:filename` | GET | Download specific video |
| `/health` | GET | Health check |

## 📁 Video Storage

Videos are automatically uploaded as GitHub Actions artifacts:
- **Retention:** 30 days
- **Naming:** `dutch-roofing-video-{workflow_id}-{batch_id}`
- **Access:** Download via GitHub Actions interface

## 🎯 n8n Integration

Perfect for n8n workflows targeting Dutch roofing businesses:

```json
{
  "method": "POST",
  "url": "https://api.github.com/repos/echris6/Dutch/dispatches",
  "headers": {
    "Authorization": "token YOUR_GITHUB_TOKEN",
    "Accept": "application/vnd.github.v3+json"
  },
  "body": {
    "event_type": "generate-roofing-video",
    "client_payload": "{{ $json.roofing_business_data }}"
  }
}
```

## 🏠 Roofing Website Compatibility

### Supported Dutch Roofing Templates
- Standard roofing business layouts
- Hero sections with company branding
- Services sections (dakdiensten)
- Customer testimonials and reviews
- Contact forms and Google Maps
- Mobile-responsive designs

### Common Dutch Roofing Services Captured
- **Dakrenovatie** (Roof renovation)
- **Dakisolatie** (Roof insulation) 
- **Loodwerk** (Lead work)
- **Dakgoten** (Gutters)
- **Zonnepanelen** (Solar panels)
- **Dakbedekking** (Roof covering)

## 🚀 Getting Started

1. **Fork the repository**
2. **Set up GitHub token** with repository dispatch permissions
3. **Configure your Dutch roofing business data**
4. **Trigger via repository dispatch API**
5. **Download generated videos from Actions artifacts**

Perfect for marketing agencies, web developers, and automation specialists working with Dutch roofing companies! 🇳🇱🏠 