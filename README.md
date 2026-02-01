# FinSight AI - Frontend

**Intelligent expense tracking web application with AI-powered categorization**

**Live Application:** [https://www.finsightfinance.me](https://www.finsightfinance.me)  
**Backend Repository:** [finsight_ai_backend](https://github.com/Pranavchikte/finsight_ai_backend)  
**API Documentation:** [https://api.finsightfinance.me/api/docs](https://api.finsightfinance.me/api/docs)

---

## Overview

FinSight AI Frontend is a modern, responsive web application built with Next.js 16 and React 19 that provides an intuitive interface for tracking expenses. It features AI-powered natural language expense entry, real-time transaction updates, budget management, and detailed financial analytics.

### Key Features

- **AI-Powered Expense Entry** - Add expenses using natural language (e.g., "Coffee for 350 from chai")
- **Real-time Transaction Processing** - Live status updates for AI-categorized expenses
- **Smart Budget Management** - Set monthly limits per category with visual progress tracking
- **Transaction History** - View expenses grouped by day with advanced filtering
- **AI Spending Insights** - Get personalized spending analysis and recommendations
- **Responsive Design** - Optimized for mobile, tablet, and desktop devices
- **Dark Mode UI** - Modern glassmorphism design with smooth animations
- **Secure Authentication** - JWT-based auth with automatic token refresh
- **Offline Detection** - Graceful handling of network issues

---

## Screenshots

### User Registration
![Signup Page](./screenshots/signup.jpg)

### Dashboard Overview
![Dashboard](./screenshots/dashboard.jpg)

### AI Expense Entry
![AI Expense Modal](./screenshots/ai-expense.jpg)

### Budget Management
![Monthly Budgets](./screenshots/budgets.jpg)

### AI Insights
![AI Spending Summary](./screenshots/ai-insights.jpg)

### Transaction History
![History View](./screenshots/history.png)

---

## Tech Stack

### Core Framework
- **Next.js 16.1** - React framework with App Router and server components
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first styling

### UI Components & Design
- **Radix UI** - Accessible headless components (Dialog, Select, Avatar, etc.)
- **Lucide React** - Modern icon library
- **Sonner** - Toast notifications
- **class-variance-authority** - Component variant management
- **tailwind-merge** - Conditional class merging

### State & Data Management
- **Axios 1.7** - HTTP client with interceptors
- **React Hooks** - useState, useEffect, useRef for state management
- **Context API** - Global state (if needed)

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - Browser compatibility

---

## Project Structure
```
finsight_ai_frontend/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Login page (/)
│   ├── globals.css             # Global styles and Tailwind imports
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard view
│   ├── transactions/
│   │   └── page.tsx            # Transaction list page
│   ├── history/
│   │   └── page.tsx            # Transaction history (grouped by day)
│   ├── signup/
│   │   └── page.tsx            # User registration
│   ├── forgot-password/
│   │   └── page.tsx            # Password reset request
│   └── reset-password/
│       └── page.tsx            # Password reset confirmation
├── components/
│   ├── login-form.tsx          # Login form component
│   ├── signup-form.tsx         # Registration form
│   ├── dashboard-layout.tsx    # Shared layout with navigation
│   ├── add-expense-modal.tsx   # Expense entry modal (AI + Manual)
│   ├── transaction-table.tsx   # Transaction list with actions
│   ├── transaction-history.tsx # Grouped transaction view
│   ├── ai-summary-card.tsx     # AI insights display
│   ├── budget-list.tsx         # Budget management
│   ├── add-budget-modal.tsx    # Budget creation modal
│   ├── stat-card.tsx           # Dashboard statistics
│   ├── brand-panel.tsx         # Auth page branding
│   └── ui/                     # Reusable UI primitives
│       ├── button.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       └── ...
├── lib/
│   ├── api.ts                  # Axios instance with interceptors
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # Helper functions (formatting, dates)
├── public/                     # Static assets
├── screenshots/                # Application screenshots
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies
└── README.md                   # Documentation
```

---

## Getting Started

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm or yarn** (comes with Node.js)

### Environment Variables

Create a `.env.local` file in the project root:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
```

For production:
```bash
NEXT_PUBLIC_BACKEND_URL=https://api.finsightfinance.me/api
```

### Local Development
```bash
# 1. Clone the repository
git clone https://github.com/Pranavchikte/finsight_ai_frontend.git
cd finsight_ai_frontend

# 2. Install dependencies
npm install
# or
yarn install

# 3. Run development server
npm run dev
# or
yarn dev

# 4. Open in browser
# Navigate to http://localhost:3000
```

The application will hot-reload as you edit files.

---

## Build & Deployment

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start

# Or export static site
npm run build
npm run export
```

### Deployment Options

**Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Docker**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Other Platforms**
- Netlify
- AWS Amplify
- Azure Static Web Apps
- Cloudflare Pages

---

## Features in Detail

### AI-Powered Expense Entry

Users can add expenses using natural language:

**Input:** "Bought groceries from Walmart for 2500 rupees"

**AI Processing:**
1. Frontend sends text to backend API
2. Backend queues task to Celery with Gemini AI
3. Frontend receives 202 status with transaction ID
4. Frontend polls every 2 seconds for completion
5. AI extracts: amount (2500), category (Groceries), description

**UI States:**
- Processing indicator with spinner
- Success notification with extracted data
- Error handling with retry option

### Smart Budget Management

- Set monthly spending limits per category
- Visual progress bars (green/yellow/red based on usage)
- Automatic calculation of current spend vs. limit
- Warning alerts when nearing or exceeding budget

### Transaction Filtering

**Available Filters:**
- Search by description (case-insensitive)
- Filter by category
- Amount range (min/max)
- Date range
- Sort by date or amount (ascending/descending)
- Pagination (50 transactions per page)

### Timezone Handling

- Backend stores all dates in UTC
- Frontend automatically converts to user's local timezone
- Transaction history groups by local date (Today/Yesterday)
- Time display in 12-hour format with user's timezone

### Authentication Flow

1. **Registration:**
   - Email validation
   - Password strength requirements (8+ chars, uppercase, number, special char)
   - Real-time password strength indicator
   - Success redirect to login

2. **Login:**
   - JWT access token (15 min expiry)
   - JWT refresh token (7 days expiry)
   - Automatic token refresh on API calls
   - Logout with token revocation

3. **Password Reset:**
   - Email-based reset link
   - Token validation (1-hour expiry)
   - New password with strength validation

---

## API Integration

### Axios Configuration
```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 30000,
});

// Request interceptor - Add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Auto token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
      const refreshToken = localStorage.getItem("refresh_token");
      const response = await axios.post("/auth/refresh", {}, {
        headers: { Authorization: `Bearer ${refreshToken}` }
      });
      localStorage.setItem("access_token", response.data.data.access_token);
      // Retry original request
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Error Handling

**Network Errors:**
- Offline detection with banner notification
- Request timeout handling (30s)
- Graceful degradation

**API Errors:**
- 400: Validation errors with field-specific messages
- 401: Unauthorized - auto token refresh or redirect to login
- 403: Forbidden - show permission error
- 404: Not found - show helpful message
- 409: Conflict (duplicate email) - specific error message
- 429: Rate limit - show retry timer
- 500: Server error - generic error with retry option

---

## Mobile Optimization

### Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile-Specific Features:**
- Hamburger menu navigation
- Floating action button for quick expense entry
- Card-based layout for transactions (not table)
- Touch-optimized buttons (44px minimum)
- Swipe gestures for actions
- Auto-focus on form fields for instant keyboard
- Show/hide password toggle

### Performance Optimization

- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Route prefetching
- Lazy loading for modals and heavy components
- Memoization for expensive computations
- Debounced search inputs

---

## Accessibility

- Semantic HTML elements
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management in modals
- Color contrast compliance (WCAG AA)
- Skip to main content link
- Form validation with clear error messages

---

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Testing
```bash
# Run tests (if configured)
npm test

# Run tests in watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

**Recommended Testing Stack:**
- Jest for unit tests
- React Testing Library for component tests
- Cypress for E2E tests
- MSW for API mocking

---

## Performance Metrics

**Lighthouse Scores (Production):**
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

**Load Times:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Total Bundle Size: < 300KB (gzipped)

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code Standards:**
- Use TypeScript for all new code
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## Troubleshooting

### Common Issues

**Issue: API calls failing with CORS errors**
- Solution: Ensure backend CORS is configured for your frontend URL
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`

**Issue: Authentication not persisting**
- Solution: Check localStorage for tokens
- Verify token expiry times
- Clear browser cache and localStorage

**Issue: AI transactions stuck in "processing"**
- Solution: Check backend Celery worker is running
- Verify Gemini API key is valid
- Check network tab for polling requests

**Issue: Build failing**
- Solution: Delete `.next` folder and `node_modules`
- Run `npm install` again
- Check Node.js version (18+)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Pranav Chikte**  
- GitHub: [@Pranavchikte](https://github.com/Pranavchikte)
- LinkedIn: [Pranav Chikte](https://www.linkedin.com/in/pranav-chikte)
- Email: chiktepranav1378@gmail.com

---

## Acknowledgments

- Next.js team for the amazing framework
- Radix UI for accessible components
- Tailwind CSS for utility-first styling
- Vercel for hosting platform
- Google Fonts for typography

---

## Related Links

- **Backend Repository:** [finsight_ai_backend](https://github.com/Pranavchikte/finsight_ai_backend)
- **Live Application:** [https://www.finsightfinance.me](https://www.finsightfinance.me)
- **API Documentation:** [https://api.finsightfinance.me/api/docs](https://api.finsightfinance.me/api/docs)

---

Made with care by Pranav Chikte
