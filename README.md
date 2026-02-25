# FinSight AI Frontend

Next.js frontend for the FinSight AI expense tracking application.

## Features

### Core Features
- User authentication (login/register)
- Dashboard with expense overview
- Transaction management (add, view, delete)
- Monthly budget tracking
- Income management

### AI Features (v2)
- AI-powered expense entry with natural language
- Smart transaction categorization
- Monthly spending insights
- AI recommendations for savings

### WhatsApp Integration (v2)
- Link WhatsApp to your account
- Receive expense updates via WhatsApp
- Mobile-responsive WhatsApp linking UI

### UI/UX
- Modern, clean design
- Dark mode support
- Responsive (mobile, tablet, desktop)
- Real-time updates
- Loading states and skeletons

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI
- Recharts
- Sonner (toast notifications)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run development server:
```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Pages

- `/` - Landing page
- `/login` - Login
- `/signup` - Register
- `/dashboard` - Main dashboard
- `/transactions` - Transaction history

## API Integration

The frontend communicates with the Flask backend via REST API.

### Key Endpoints Used:
- Authentication (login, register, profile)
- Transactions CRUD
- Budgets CRUD
- AI parsing and insights
- WhatsApp verification

## Deployment

Deployed on Vercel.

- Production: https://www.finsightfinance.me

## Project Structure

```
app/
├── dashboard/      # Main dashboard page
├── transactions/  # Transaction history
├── login/          # Login page
├── signup/         # Signup page
└── layout.tsx     # Root layout

components/
├── ui/            # Reusable UI components
├── dashboard/     # Dashboard-specific components
└── ...            # Other components

lib/
├── api.ts          # API client
├── types.ts        # TypeScript types
└── utils.ts        # Utility functions
```

## License

MIT
