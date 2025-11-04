# 🌌 KarmAnk - Cosmic Numerology Web App

**Discover your cosmic destiny through authentic Vedic numerology, compatibility analysis, and sacred wisdom from the Bhagavad Gita.**

## ✨ Features

### 🔐 Secure Authentication
- **Login System**: Secure entry to your cosmic journey
- **Demo Access**: Try with `demo@karmank.com` / `demo123`
- **Protected Routes**: All features require authentication

### 🎯 Core Numerology Features
- **🧮 Vedic Kundli 3×3 Grid**: Sacred numerological matrix analysis
- **💕 Cosmic Compatibility**: Relationship analysis through Vedic numerology  
- **📝 Name Analysis**: Discover hidden vibrations in names (Chaldean & Pythagorean)
- **📖 Krishna Bhagavad Gita Gyan**: Sacred wisdom aligned with your numbers

### 🌍 Multilingual Support
- **English** 🇺🇸
- **हिंदी (Hindi)** 🇮🇳  
- **Hinglish** 🌏 - Perfect blend of English and Hindi

### 🎨 Cosmic Design System
- **Starfield Background**: Immersive cosmic atmosphere with twinkling stars
- **Glassmorphism UI**: Translucent cards with subtle Sri Yantra patterns
- **Sacred Geometry**: Authentic Vedic visual elements
- **Responsive Design**: Beautiful across all devices

### 💎 Premium Features
- **Free Plan**: 3 compatibility readings, 2 name analyses daily
- **Pro Plan**: Extended quotas, premium themes, priority support
- **Supreme Plan**: Unlimited access, white-label PDFs, advanced features

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd karmank-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Demo Login
Use these credentials to explore the app:
- **Email**: `demo@karmank.com`
- **Password**: `demo123`

## 🛠️ Technology Stack

- **Framework**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion
- **State**: Zustand (lightweight & efficient)
- **Forms**: react-hook-form + zod validation
- **Icons**: Lucide React
- **Fonts**: Inter, Cinzel, Noto Sans Devanagari

## 🎨 Design System

### Cosmic Color Palette
- **Cosmic Blue**: `#0A1640` - Deep space foundation
- **Nebula Violet**: `#5B35AC` - Mystical energy
- **Auric Gold**: `#F8D26A` - Sacred illumination
- **Stardust**: `#C6C6D3` - Celestial accents

### Typography
- **Headings**: Cinzel (elegant serif for cosmic titles)
- **Body**: Inter (clean sans-serif for readability)
- **Devanagari**: Noto Sans Devanagari (authentic Hindi script)

## 🧮 Numerology Engine

### Core Calculations
- **Life Path Numbers**: Authentic Vedic reduction (preserving 11/22/33)
- **Name Numerology**: Both Chaldean and Pythagorean systems
- **Compatibility Matrix**: 81 unique number combinations
- **Vedic Kundli Grid**: Sacred 3×3 matrix analysis

### Vedic Kundli 3×3 Matrix
```
3  1  9    Mental Plane
6  7  5    Emotional Plane  
2  8  4    Physical Plane
```

### Plane Analysis
- **Physical Plane** (1,4,7): Material world, practical actions
- **Mental Plane** (3,6,9): Intellect, communication, creativity
- **Emotional Plane** (2,5,8): Feelings, relationships, intuition

## 🌟 Key Components

### Authentication
- `src/pages/Login.tsx` - Cosmic login experience
- `src/store/appStore.ts` - Zustand state management
- Protected route system with navigation guards

### Core Features
- `src/features/dashboard/components/KundliGrid3x3.tsx` - Sacred grid analysis
- `src/lib/numerology/` - Complete numerology engine
- `src/components/StarfieldBackground.tsx` - Cosmic atmosphere

### Design System
- `src/components/ui/glass-card.tsx` - Glassmorphism components
- `src/index.css` - Cosmic design tokens and utilities
- `tailwind.config.ts` - Extended cosmic theme

## 🎯 Usage Examples

### Basic Vedic Kundli Analysis
```typescript
import { computeKundliGrid } from '@/lib/numerology/compute';

const result = computeKundliGrid('22/04/1987', 'en');
console.log(result.summary); // Cosmic interpretation
console.log(result.planes);  // Physical/Mental/Emotional analysis
```

### Compatibility Analysis
```typescript
import { compatibility } from '@/lib/numerology/compute';

const analysis = compatibility(
  { dob: '22/04/1987', name: 'John' },
  { dob: '15/08/1990', name: 'Jane' },
  'en'
);
console.log(analysis.summary);   // Relationship insights
console.log(analysis.remedies);  // Cosmic remedies
```

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Secure authentication system
- ✅ Vedic Kundli 3×3 grid analysis
- ✅ Multilingual support (EN/HI/Hinglish)
- ✅ Cosmic design system

### Phase 2 (Coming Soon)
- 🔄 Full compatibility analysis interface
- 🔄 Complete name analysis with suggestions
- 🔄 Krishna Gita wisdom integration
- 🔄 Text-to-Speech functionality

### Phase 3 (Future)
- 📱 Mobile app version
- 🤖 AI-powered chatbot
- 📊 Advanced analytics dashboard
- 🔐 Enterprise features

## 🛡️ Security & Privacy

- Secure authentication with protected routes
- No sensitive data in localStorage
- Environment-based configuration
- Input validation and sanitization

## 🤝 Contributing

We welcome contributions to make KarmAnk even more cosmic! Please:

1. Fork the repository
2. Create a feature branch
3. Follow our coding standards
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For cosmic guidance and technical support:
- 📧 Email: support@karmank.com
- 💬 Community: [Discord](https://discord.gg/karmank)
- 📚 Docs: [docs.karmank.com](https://docs.karmank.com)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**"In the cosmic dance of numbers, every digit holds the key to universal wisdom."**
*- Ancient Vedic Saying*

Made with 🌌 cosmic energy and ❤️ by the KarmAnk team.