# Subleasy 🏠

> Apartment hunting on autopilot for college students & interns.

## Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind
- **Database**: Supabase (Postgres)
- **Scraping**: Python + Playwright
- **Alerts**: Twilio SMS
- **Deploy**: Vercel (frontend) + Railway (scraper cron)

## Project Structure
```
subleasy/
├── app/                    # Next.js app
│   ├── page.tsx            # Landing page
│   ├── api/
│   │   ├── preferences/    # Save user preferences
│   │   └── listings/       # Listing endpoints
├── components/
│   ├── PreferenceForm.tsx  # User onboarding form
│   └── ListingCard.tsx
├── lib/
│   ├── supabase.ts         # Supabase client
│   └── twilio.ts           # SMS sender
├── scraper/                # Python scraper (runs on Railway)
│   ├── main.py             # Entry point / cron
│   ├── scrapers/
│   │   ├── craigslist.py
│   │   ├── zillow.py
│   │   └── facebook.py     # User-submit handler
│   ├── matcher.py          # Matching + scoring engine
│   ├── notifier.py         # Twilio SMS alerts
│   └── requirements.txt
├── supabase/
│   └── schema.sql          # Full DB schema
└── .env.example
```

## Setup

### 1. Supabase
- Create project at supabase.com
- Run `supabase/schema.sql` in the SQL editor

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

### 3. Frontend
```bash
npm install
npm run dev
```

### 4. Scraper
```bash
cd scraper
pip install -r requirements.txt
playwright install chromium
python main.py
```

### 5. Deploy
- Frontend → Vercel (connect GitHub repo, auto-deploys)
- Scraper → Railway (set cron: `0 * * * *` = every hour)
