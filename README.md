# Personal Dashboard with Plaid Integration

A Next.js financial dashboard for tracking credit card accounts with live data integration via Plaid API.

## Features

- 📊 Track multiple credit card accounts
- 💳 View credit limits, balances, and utilization
- 🔗 Link accounts to live bank data via Plaid
- 📈 Real-time balance and payment tracking
- 🎨 Clean, modern UI with compact and detailed views
- 💾 MongoDB database storage

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB
- **API Integration:** Plaid
- **Styling:** Tailwind CSS
- **Language:** TypeScript/JavaScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB account (free tier at mongodb.com)
- Plaid account (free sandbox at plaid.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/waynemareci/personalDashboardWithPlaid001.git
   cd personalDashboardWithPlaid001
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   - `MONGODB_URI`: Your MongoDB connection string
   - `PLAID_CLIENT_ID`: From Plaid dashboard
   - `PLAID_SECRET`: From Plaid dashboard (sandbox)
   - `PLAID_ENV`: Set to `sandbox` for testing

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## Usage

### Adding Accounts Manually

1. Navigate to `/accounts`
2. Click "Create New Account"
3. Fill in account details
4. Save

### Linking to Live Bank Data

1. Go to `/accounts`
2. Click "Details ▼" on any account
3. Click "Link Account" button
4. Authenticate with your bank via Plaid
5. Account will sync with live data

### Sandbox Testing

Use Plaid test credentials:
- Username: `user_good`
- Password: `pass_good`

## Project Structure

```
├── app/
│   ├── accounts/          # Account management pages
│   ├── api/              # API routes
│   │   ├── accounts/     # Account CRUD operations
│   │   └── plaid/        # Plaid integration endpoints
│   ├── types.ts          # TypeScript definitions
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/                  # Utility functions
├── models/              # MongoDB schemas
└── public/              # Static assets
```

## API Endpoints

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/[id]` - Update account
- `DELETE /api/accounts/[id]` - Delete account
- `POST /api/accounts/link` - Link account to Plaid
- `POST /api/accounts/refresh` - Refresh Plaid data

### Plaid
- `POST /api/plaid/create-link-token` - Create Plaid Link token
- `POST /api/plaid/exchange-public-token` - Exchange public token
- `POST /api/plaid/sync-accounts` - Sync accounts from Plaid

## Production Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add environment variables** in Vercel dashboard

4. **Update Plaid settings**
   - Switch to production credentials
   - Add redirect URI in Plaid dashboard
   - Request OAuth institution access

### Environment Variables for Production

```env
MONGODB_URI=your_production_mongodb_uri
MONGODB_DB=financial_accounts
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_production_plaid_secret
PLAID_ENV=production
NEXT_PUBLIC_PLAID_ENV=production
```

## Plaid Production Setup

1. Get production approval from Plaid
2. Request institution access for specific banks
3. Configure HTTPS redirect URI
4. For OAuth institutions, deploy to HTTPS domain first

See [PLAID_LINKING_GUIDE.md](./PLAID_LINKING_GUIDE.md) for detailed instructions.

## Security Notes

- Never commit `.env.local` to Git
- Keep API keys secure
- Use environment variables for all secrets
- Production requires HTTPS

## Contributing

This is a personal project, but suggestions are welcome via issues.

## License

MIT

## Author

Wayne Mareci
