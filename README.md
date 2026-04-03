<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NuruOS Field Intelligence

**AI-Native Audit Tool for Farms and Agrovets in Tanzania**

An offline-first Progressive Web App (PWA) that empowers agricultural auditors with AI-powered image analysis, voice transcription, and intelligent data collection.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5a0fc8)](https://web.dev/progressive-web-apps/)

---

## 🚀 Features

### ✨ Core Capabilities
- **Offline-First**: Full functionality without internet connection
- **AI-Powered Analysis**: Gemini 2.0 integration for image analysis, crop identification, and voice transcription
- **Dual Audit Types**: Farm audits and Business (Agrovet) audits
- **Smart Validation**: GPS accuracy checks, data consistency validation
- **Multi-Language**: English and Swahili support
- **Progressive Web App**: Install on mobile devices, works like a native app

### 🎯 AI Features
- **Image Analysis**: Automatic crop identification, soil assessment, infrastructure evaluation
- **Voice Transcription**: Convert field notes to text in English or Swahili
- **Smart Recommendations**: AI-generated expert analysis and action items
- **Offline AI Queue**: Queue AI tasks when offline, process when online

### 📊 Data Management
- **IndexedDB Storage**: Efficient local database for audits and images
- **Image Compression**: Automatic compression to optimize storage
- **Sync Queue**: Background sync with retry logic
- **Export Options**: Google Sheets integration, JSON/CSV export

---

## 🛠️ Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Gemini API Key** (get from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd nuruos-field-intelligence

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Edit .env.local and add your API key
# VITE_GEMINI_API_KEY=your_api_key_here

# 5. Run development server
npm run dev

# 6. Open in browser
# Visit: http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Button, Input, etc.)
│   ├── forms/          # Form components (FarmAuditForm, BusinessAuditForm)
│   ├── ai/             # AI-related components (AIAssistantPanel, VoiceInputButton)
│   └── ...
├── services/           # Business logic & API integration
│   ├── aiService.ts    # AI orchestration
│   ├── geminiService.ts # Gemini API integration
│   ├── syncService.ts  # Sync & offline queue
│   ├── storageService.ts # IndexedDB operations
│   ├── validationService.ts # Data validation
│   └── ...
├── utils/              # Helper utilities
│   ├── errorHandler.ts # Centralized error handling
│   ├── imageCompression.ts # Image optimization
│   ├── validation.ts   # Input validation
│   └── constants.ts    # App constants
├── data/               # Static data
│   ├── farmAuditQuestions.ts
│   └── businessAuditQuestions.ts
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following:

```env
# Required
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional
VITE_SUPABASE_AUDIT_PHOTOS_BUCKET=audit-photos
VITE_SENTRY_DSN=your_sentry_dsn
```

### API Keys

1. **Gemini API**: Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Supabase**: Create a project for auth, Postgres (`farm_audits`, etc.), and Storage (yield photos bucket; see `.env.example`)

---

## 📖 Usage Guide

### Creating a Farm Audit

1. Click "New Audit" on the dashboard
2. Select "Farm Audit"
3. Fill in sections:
   - **Location**: GPS coordinates (auto-captured)
   - **Farmer Profile**: Name, contact, demographics
   - **Land & Crops**: Farm size, crops grown, yields
   - **Soil Samples**: Collect samples with GPS tags
   - **Media**: Capture photos with AI analysis
4. Review and submit

### Using AI Features

**Image Analysis**:
- Tap camera icon to capture photo
- AI automatically analyzes for crop type, health, and issues
- Results appear in the analysis field

**Voice Notes**:
- Tap microphone icon to record
- Speak in English or Swahili
- AI transcribes and appends to notes

**Offline Mode**:
- All features work offline
- AI tasks queue automatically
- Sync when connection restored

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## 🚀 Deployment

### Deploy to Cloudflare Pages

```bash
# Build the app
npm run build

# Deploy with Wrangler
npx wrangler pages publish dist
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

---

## 🔐 Security

- **API Keys**: Never commit `.env.local` - use `.env.example` template
- **Input Sanitization**: All user inputs are validated and sanitized
- **HTTPS Only**: Production deployments use HTTPS
- **Content Security Policy**: XSS protection enabled
- **Authentication**: Implement JWT-based auth for production

---

## 🐛 Troubleshooting

### API Key Error
**Error**: "Gemini API key not configured"

**Fix**:
```bash
# Create .env.local file
cp .env.example .env.local

# Add your API key
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local

# Restart dev server
npm run dev
```

### Images Too Large
**Error**: IndexedDB quota exceeded

**Fix**: Images are automatically compressed. Adjust compression in `utils/imageCompression.ts`:
```typescript
const compressed = await compressImage(base64Image, {
  maxSizeKB: 300 // Reduce from 500
});
```

### Sync Failures
**Error**: Audits not syncing

**Fix**: Check network connection, Supabase URL/key, and RLS policies; sync runs via `src/lib/syncService.ts` and `src/lib/supabase.ts`

---

## 📚 Documentation

- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)**: Detailed list of all improvements and implementation guide
- **[API Documentation](./docs/API.md)**: (TODO) API endpoints and integration
- **[Architecture Guide](./docs/ARCHITECTURE.md)**: (TODO) System architecture overview

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI**: For powerful AI capabilities
- **Tanzania Agricultural Research Institute**: For domain expertise
- **Vite & React**: For excellent developer experience

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/nuruos-field-intelligence/issues)
- **Email**: support@nuruos.com
- **Documentation**: [Wiki](https://github.com/your-org/nuruos-field-intelligence/wiki)

---

**Built with ❤️ for Tanzanian agriculture**

View your app in AI Studio: https://ai.studio/apps/drive/11x-lMD60uWlNG-n86JZuEUQZkaqh-QAM
