# LP Optimization App

A React-based landing page optimization tool that helps analyze and improve website conversion rates through AI-powered suggestions.

## 🚀 Features

- **URL Analysis**: Scrape and analyze any landing page
- **Element Optimization**: Identify key elements for improvement
- **AI Suggestions**: Get intelligent optimization recommendations (coming soon)
- **Live Preview**: See changes in real-time with full-screen preview
- **User Authentication**: Secure login and registration system

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **UI Components**: Radix UI with custom design system
- **Icons**: Lucide React
- **Backend API**: Node.js (deployed separately)

## 📦 Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173)

## 🌐 Deployment on Vercel

### Prerequisites
- Vercel account
- Repository pushed to GitHub/GitLab/Bitbucket

### Manual Deployment Steps

1. **Login to Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your account

2. **Create New Project**
   - Click "New Project"
   - Import your Git repository
   - Select the project folder if using a monorepo

3. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables**
   Add these environment variables in Vercel dashboard:
   ```
   VITE_API_URL=https://web-scraper-backend-kappa.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Your app will be available at `https://your-project-name.vercel.app`

### Automatic Deployment
- Once connected, Vercel will automatically deploy on every push to your main branch
- Preview deployments are created for pull requests

## 🔧 Build Configuration

The project includes:
- `vercel.json` - Vercel deployment configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

## 📁 Project Structure

```
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── MainPage.tsx     # Main application interface
│   ├── DropdownSection.tsx  # Element optimization interface
│   └── ...
├── services/            # API services
├── styles/              # Global styles
├── src/                 # Entry point
├── public/              # Static assets
└── dist/                # Build output (generated)
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://web-scraper-backend-kappa.vercel.app` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License.
