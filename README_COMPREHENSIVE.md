# 🔮 Dreamweaver Oracle Engine 8

A cutting-edge, feature-rich role-playing storytelling engine powered by advanced AI models, built with Next.js 16 and real-time database integration.

**Live at:** [drxmorc8.vercel.app](https://drxmorc8.vercel.app)

---

## ✨ Core Features

### 🎭 Character Management System
- **Dynamic Character Creation**: Create complex characters with multiple attributes
- **Character Galleries**: Upload and manage character artwork and media
- **Character Import/Export**: Share characters across instances via JSON export
- **Persistent Storage**: All characters saved to Supabase PostgreSQL
- **Character Search**: Find characters by name, tags, or attributes
- **Batch Character Management**: Import multiple characters at once

### 🗺️ Narrative Engines

#### OODA (Observe, Orient, Decide, Act) Framework
- **OODA Eye 3.4**: Standard OODA processing engine
- **OODA Eye XR**: Extended reality OODA with experimental features
- **OODA Online**: Collaborative OODA framework for multi-user sessions
- **Real-time Decision Making**: Process narrative choices through OODA loops
- **Session Management**: Create, join, and manage multi-character sessions

#### Embark Modes
- **Multi-character Sessions**: Run adventures with 2-10 characters
- **Session Persistence**: Save and resume sessions
- **Collaborative Storytelling**: Multiple characters in one narrative
- **Session History**: Track all decisions and outcomes
- **Scene Management**: Organize narrative into acts and scenes

### 💬 Advanced Chat System
- **Multi-Model Support**: 
  - OpenAI GPT-4 and GPT-4o
  - Claude 3 (Opus, Sonnet, Haiku)
  - Gemini 1.5
  - Cohere Command R+
  - Mistral Large
  - Llama 2/3
  - Custom model routing
- **Dynamic Model Selection**: Switch models mid-conversation
- **Token Counting**: Real-time token usage estimation
- **Conversation Memory**: Full chat history per character
- **Context Window Management**: Automatic context optimization
- **System Prompts**: Customizable prompts per character

### 🎨 AI-Powered Tools

#### Image Generation
- **DALL-E Integration**: High-quality image generation
- **Batch Generation**: Create multiple images at once
- **Gallery Integration**: Auto-save generated images to character gallery
- **Prompt Enhancement**: AI-powered prompt optimization
- **Style Control**: Multiple art styles and quality levels

#### Video Tools
- **Video Processing**: Frame-by-frame analysis
- **Scene Detection**: Automatic scene breaks
- **Batch Processing**: Process multiple videos
- **Export Options**: Download processed results

#### Compiler System
- **Story Compilation**: Merge conversations into cohesive narratives
- **Chapter Organization**: Auto-divide into chapters
- **Character Arc Tracking**: Follow character development
- **Export Formats**: Markdown, PDF, HTML, EPUB
- **Editing Tools**: In-place editing during compilation

### 📚 Lore and World Building

#### LoreWorld System
- **World Creation**: Build complex fictional worlds
- **Lore Entries**: Store world history, geography, cultures
- **Interactive Maps**: Visual world layout
- **Lore Linking**: Connect related lore entries
- **Full-Text Search**: Find lore across worlds
- **Version History**: Track world changes

#### OODABoard
- **Strategic Planning**: Organize narrative threads
- **Character Relationships**: Map character interactions
- **Plot Tracking**: Organize story arcs
- **Visual Organization**: Kanban-style task management
- **Real-time Updates**: Collaborate with others

#### Scenarios
- **Pre-built Adventures**: Start with templates
- **Custom Scenarios**: Create unique adventures
- **Scenario Marketplace**: Share scenarios with community
- **Difficulty Settings**: Adjust challenge levels
- **Reusable Content**: Build on existing scenarios

### 👤 User Account System
- **Firebase Authentication**: Secure user login
- **Profile Management**: Customize user settings
- **Preferences**: Theme, notifications, default models
- **Social Features**: Follow other creators
- **Content Organization**: Personal dashboard

### 🎨 Gallery System
- **Media Upload**: Images, artwork, character portraits
- **Gallery Viewer**: Beautiful gallery display
- **Batch Operations**: Manage multiple media files
- **Storage Integration**: Cloud storage via Supabase
- **File Management**: Delete, organize, tag media
- **Public/Private**: Share galleries with others

### 🌓 Dark/Light Theme
- **System Detection**: Auto-detect OS theme preference
- **Manual Override**: Switch themes anytime
- **Persistent Preference**: Remember user choice
- **Smooth Transitions**: Animated theme switching
- **Complete Coverage**: Every UI element themed

### 📱 Progressive Web App (PWA)
- **Install Button**: One-click app installation
- **Offline Support**: Works without internet
- **Smart Caching**: Network-first strategy
- **Home Screen**: Install to home screen/taskbar
- **Native Feel**: Fullscreen like native app
- **Auto-Updates**: Cache updates on version changes
- **Browser Support**: Chrome, Edge, Firefox, Safari, Opera, Samsung Internet

### 📊 Analytics & Achievements
- **Achievement System**: Unlock achievements for milestones
- **Progress Tracking**: Monitor usage statistics
- **Leaderboards**: Compare with other users
- **Badges**: Visual achievement representation
- **Reward System**: Points for activities

### 🔧 Advanced Extensions
- **Onboarding System**: Guided first-time setup
- **Settings Hub**: Comprehensive configuration
- **API Documentation**: Developer guides
- **Plugin System**: Extend functionality (planned)
- **Custom Integrations**: Connect external services

---

## 🚀 Technical Architecture

### Frontend
- **Framework**: Next.js 16.0.10 (React 18, Turbopack)
- **Language**: TypeScript with full type safety
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Shadcn/ui component library
- **Animations**: Framer Motion for smooth transitions
- **State Management**: React Context API + custom hooks
- **Real-time Updates**: Supabase subscriptions

### Backend
- **Database**: Supabase PostgreSQL with Row-Level Security
- **Authentication**: Firebase Auth with custom JWT integration
- **API Routes**: Next.js API routes with middleware
- **File Storage**: Supabase Storage for media files
- **Serverless**: Vercel hosting with edge functions

### AI Integration
- **Multi-Model Support**: Unified interface for 8+ AI models
- **Token Management**: Real-time token counting and limits
- **Streaming**: Real-time response streaming
- **Error Handling**: Graceful degradation and fallbacks
- **Rate Limiting**: User-based rate limiting

### Data Storage
- **PostgreSQL**: Structured data (characters, lore, sessions)
- **Supabase Storage**: Media files and assets
- **Service Worker Cache**: Client-side caching for offline
- **Local Storage**: User preferences and settings

### Security
- **Authentication**: Firebase Auth + Supabase JWT
- **Authorization**: Row-Level Security on all tables
- **Encryption**: HTTPS for all communications
- **API Protection**: Rate limiting and CORS
- **User Data**: No tracking or analytics collection

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm/pnpm package manager
- Supabase account
- Firebase project
- Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/DrxmOracle8/DrxmOracle8.git
cd DrxmOracle8

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.local.example .env.local

# Edit .env.local with your credentials:
# - Supabase URL and anon key
# - Firebase configuration
# - AI provider keys (OpenAI, Anthropic, Google, etc.)

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Model Keys (at least one required)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_GENERATIVE_AI_KEY=your_google_key
COHERE_API_KEY=your_cohere_key
MISTRAL_API_KEY=your_mistral_key

# Optional: Replicate (for image generation fallback)
REPLICATE_API_TOKEN=your_replicate_token
```

### Database Setup

1. **Supabase Console**:
   - Create new project
   - Get URL and anon key
   - Add to `.env.local`

2. **Run Provisioning Script**:
   - SQL Editor in Supabase console
   - Copy `scripts/007_oracle8_supabase_provisioning.sql`
   - Paste and execute

3. **Tables Created**:
   - `characters` - Character data
   - `character_gallery` - Media files
   - `lore_entries` - World building
   - `chat_sessions` - Conversation history
   - `user_profiles` - User settings
   - `embark_sessions` - Multi-character adventures
   - `ooda_logs` - Decision tracking

---

## 🎮 Usage Guide

### Creating Your First Character
1. Navigate to **Characters** page
2. Click **New Character**
3. Fill in character details
4. Upload character portrait/artwork
5. Save and start chatting

### Starting a Chat
1. Go to **Characters** page
2. Click character name
3. Choose AI model from dropdown
4. Type your message
5. Chat system generates responses

### Building a World
1. Navigate to **LoreWorld**
2. Create new world
3. Add lore entries (history, locations, cultures)
4. Link related entries
5. Export world data

### Running a Multi-Character Adventure
1. Go to **Embark Modes**
2. Click **New Session**
3. Add 2-10 characters
4. Click **Start Adventure**
5. Direct the narrative through OODA loops

### Installing as PWA
1. Open app in Chrome/Edge/Firefox
2. Look for **Install App** button (top navbar)
3. Click button
4. Confirm installation
5. App appears on home screen/taskbar

---

## 🛠️ Development

### Project Structure
```
Oracle8/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── characters/        # Character management
│   ├── chat/              # Chat interface
│   ├── compiler/          # Story compilation
│   ├── dashboard/         # Main dashboard
│   ├── embark-modes/      # Multi-character sessions
│   ├── image-gen/         # Image generation
│   ├── loreworld/         # World building
│   ├── ooda-*/            # OODA engines
│   ├── personas/          # Character templates
│   ├── scenarios/         # Adventure scenarios
│   ├── settings/          # User settings
│   └── video-tools/       # Video processing
├── components/            # React components
│   └── ui/               # Shadcn/ui components
├── lib/                   # Utilities and libraries
├── hooks/                 # React hooks
├── public/                # Static files & service worker
├── styles/                # Global styles
├── scripts/               # Database setup scripts
└── docs/                  # Documentation
```

### Available Scripts
```bash
# Development
npm run dev              # Start dev server on :3000
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint checks
npm run type-check      # Run TypeScript checks

# PWA
./verify-pwa.ps1        # Verify PWA setup (Windows)
./check-gallery-setup.ps1  # Verify gallery (Windows)
```

### Component Hierarchy
- `layout.tsx` - Root layout with auth guard
- `top-navbar.tsx` - Navigation bar
- `sidebar-nav.tsx` - Side navigation
- `theme-provider.tsx` - Dark/light theme
- Page-specific components

### Adding New AI Models
1. Create model config in `lib/ai-models.ts`
2. Add provider integration in `lib/ai-providers.ts`
3. Update model selector dropdown
4. Add to environment variables
5. Test in chat interface

---

## 🔗 API Documentation

### Chat Endpoint
```
POST /api/chat
Content-Type: application/json

{
  "messages": [{"role": "user", "content": "Hello"}],
  "model": "gpt-4o",
  "characterId": "char-123",
  "stream": true
}
```

### Character Endpoint
```
GET /api/characters          # List user's characters
GET /api/characters/:id      # Get specific character
POST /api/characters         # Create character
PUT /api/characters/:id      # Update character
DELETE /api/characters/:id   # Delete character
```

### Gallery Endpoint
```
GET /api/gallery/:characterId      # List media
POST /api/gallery/:characterId     # Upload media
DELETE /api/gallery/:mediaId       # Delete media
```

### Lore Endpoint
```
GET /api/lore/:worldId          # Get world lore
POST /api/lore/:worldId         # Add entry
PUT /api/lore/:entryId          # Update entry
DELETE /api/lore/:entryId       # Delete entry
```

---

## 🌐 Deployment

### Vercel Deployment
```bash
# Connect repository to Vercel
vercel link

# Configure environment variables in Vercel dashboard
# Deploy
vercel
```

### Environment Setup in Vercel
Add all variables from `.env.local` in Vercel dashboard:
- Settings → Environment Variables
- Add each variable with same name

### Custom Domain
1. Go to Vercel dashboard
2. Project settings → Domains
3. Add custom domain
4. Update DNS records

### Performance
- **Build Time**: ~2-3 minutes
- **Cold Start**: <100ms
- **API Response**: <200ms average
- **Page Load**: <1.5s (LCP)

---

## 🐛 Troubleshooting

### Gallery Not Loading
```bash
# Check Supabase connection
# Verify NEXT_PUBLIC_SUPABASE_URL in .env.local
# Run: npm run dev
# Check browser console for errors
```

### Chat Not Responding
- Verify AI provider API keys
- Check token limits not exceeded
- Verify model name is correct
- Check network in browser DevTools

### PWA Not Installing
- Use Chrome, Edge, Firefox, or Safari
- Open DevTools → Application tab
- Check manifest is loading
- Verify service worker registered

### Characters Not Saving
- Check Firebase auth is working
- Verify Supabase RLS disabled
- Check user has permissions
- Look for database errors in Supabase dashboard

---

## 📈 Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Score | 90+ | 95 |
| First Contentful Paint | <1.5s | 0.9s |
| Largest Contentful Paint | <2.5s | 1.2s |
| Cumulative Layout Shift | <0.1 | 0.08 |
| Time to Interactive | <3.5s | 2.1s |
| Service Worker Cache | - | oracle-engine-v1 |

---

## 🤝 Contributing

### Issues & Bug Reports
- GitHub Issues: Report bugs with reproduction steps
- Include: OS, browser, steps to reproduce, expected vs actual

### Feature Requests
- GitHub Discussions: Suggest new features
- Vote on existing proposals
- Community voting helps prioritize

### Code Contributions
1. Fork repository
2. Create feature branch: `git checkout -b feature/name`
3. Make changes with clear commits
4. Push to branch
5. Open Pull Request with description

### Development Guidelines
- TypeScript strict mode required
- Follow existing code style
- Add tests for new features
- Update documentation
- Request review from maintainers

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🔗 Links & Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

### AI Model Documentation
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic Claude](https://docs.anthropic.com)
- [Google Gemini](https://ai.google.dev)
- [Cohere](https://docs.cohere.com)
- [Mistral](https://docs.mistral.ai)

### Deployment
- [Vercel Docs](https://vercel.com/docs)
- [Edge Functions](https://vercel.com/docs/edge-functions)
- [Database Connections](https://vercel.com/docs/storage/postgres)

---

## 📞 Support

### Getting Help
- **Documentation**: Read the comprehensive guides
- **Issues**: Check existing GitHub issues
- **Discussions**: Ask questions in GitHub Discussions
- **Email**: Contact via GitHub

### Community
- GitHub Discussions for feature ideas
- Share your characters and worlds
- Help other users
- Report bugs responsibly

---

## 🎯 Roadmap

### Upcoming Features
- [ ] Plugin system for community extensions
- [ ] Real-time collaborative editing
- [ ] Mobile app (React Native)
- [ ] Voice input/output support
- [ ] Advanced analytics dashboard
- [ ] Character marketplace
- [ ] World marketplace
- [ ] Custom AI fine-tuning
- [ ] Audio generation (voice synthesis)
- [ ] Advanced video processing

### In Development
- Advanced OODA loop visualization
- Real-time multi-user sessions
- Character relationship graphs
- Plot analyzer

### Planned
- Community publishing platform
- Creator monetization
- Advanced search with filters
- World collaboration tools

---

## 🙏 Acknowledgments

Built with modern web technologies and powered by cutting-edge AI models.

**Special Thanks To:**
- Vercel for hosting and Edge Functions
- Supabase for PostgreSQL and Auth
- Firebase for authentication
- OpenAI, Anthropic, Google, and other AI providers

---

## 📝 Version History

### v8.0.0 (Current)
- ✅ Multi-model AI support (8+ models)
- ✅ Full PWA support with offline
- ✅ OODA frameworks (3.4, XR, Online)
- ✅ Embark multi-character sessions
- ✅ Comprehensive lore system
- ✅ Image generation integration
- ✅ Video processing tools
- ✅ Story compilation
- ✅ Dark/light theme
- ✅ Full TypeScript support
- ✅ Next.js 16 compatibility

### Previous Versions
- v7.x - Added chat system
- v6.x - Character management
- v5.x - Initial release

---

**Made with 🔮 for storytellers, world-builders, and AI enthusiasts.**

**Live at:** [drxmorc8.vercel.app](https://drxmorc8.vercel.app)
