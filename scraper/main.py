import os
import schedule
import time
from dotenv import load_dotenv
from supabase import create_client

from scrapers.craigslist import scrape_craigslist
from scrapers.zillow import scrape_zillow
from matcher import find_matches
from notifier import send_alert

load_dotenv()

MARKETS = ['berkeley', 'seattle']

def get_db():
    return create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_KEY'])


def upsert_listings(db, listings: list[dict]) -> list[dict]:
    """Save new listings to DB, skip duplicates. Return only newly inserted ones."""
    if not listings:
        return []

    new_listings = []
    for listing in listings:
        try:
            # Try to insert; if duplicate (source+external_id), it'll be ignored
            result = db.from_('listings').upsert(
                listing,
                on_conflict='source,external_id',
                ignore_duplicates=False
            ).execute()

            # Check if it was actually new (first_seen_at was just set)
            if result.data:
                row = result.data[0]
                # If first_seen = last_seen, it's new
                if row.get('first_seen_at') == row.get('last_seen_at'):
                    new_listings.append(row)
                else:
                    # Update last_seen for existing
                    db.from_('listings').update({'last_seen_at': 'NOW()'}).eq('id', row['id']).execute()

        except Exception as e:
            print(f"[DB] Upsert error: {e}")

    return new_listings


def get_active_preferences(db) -> list[dict]:
    result = db.from_('preferences') \
        .select('*, users(phone, email)') \
        .eq('active', True) \
        .execute()
    return result.data or []


def already_alerted(db, user_id: str, listing_id: str) -> bool:
    result = db.from_('alerts_sent') \
        .select('id') \
        .eq('user_id', user_id) \
        .eq('listing_id', listing_id) \
        .execute()
    return len(result.data or []) > 0


def record_alert(db, user_id: str, listing_id: str):
    db.from_('alerts_sent').insert({
        'user_id': user_id,
        'listing_id': listing_id
    }).execute()


def run_scrape_cycle():
    print("\n" + "="*50)
    print(f"[Main] Starting scrape cycle")
    print("="*50)

    db = get_db()
    all_new_listings = []

    for market in MARKETS:
        print(f"\n[Main] Scraping market: {market}")

        # Craigslist
        cl_listings = scrape_craigslist(market)
        new_cl = upsert_listings(db, cl_listings)
        print(f"[Main] Craigslist: {len(new_cl)} new listings")
        all_new_listings.extend(new_cl)

        # Zillow
        zl_listings = scrape_zillow(market)
        new_zl = upsert_listings(db, zl_listings)
        print(f"[Main] Zillow: {len(new_zl)} new listings")
        all_new_listings.extend(new_zl)

    if not all_new_listings:
        print("\n[Main] No new listings found. No alerts to send.")
        return

    print(f"\n[Main] Total new listings: {len(all_new_listings)}")

    # Load active user preferences
    preferences = get_active_preferences(db)
    print(f"[Main] Active user preferences: {len(preferences)}")

    if not preferences:
        print("[Main] No active users. Skipping matching.")
        return

    # Match and notify
    matches = find_matches(all_new_listings, preferences)
    print(f"[Main] Matches found: {len(matches)}")

    alerts_sent = 0
    for pref, listing, score in matches:
        user = pref.get('users', {})
        user_id = pref['user_id']
        phone = user.get('phone')

        if not phone:
            continue

        # Don't alert same user about same listing twice
        if already_alerted(db, user_id, listing['id']):
            continue

        success = send_alert(phone, listing)
        if success:
            record_alert(db, user_id, listing['id'])
            alerts_sent += 1

    print(f"\n[Main] Cycle complete. Alerts sent: {alerts_sent}")


if __name__ == '__main__':
    print("[Main] Subleasy scraper starting...")

    # Run immediately on startup
    run_scrape_cycle()

    # Then every hour
    schedule.every(1).hours.do(run_scrape_cycle)

    while True:
        schedule.run_pending()
        time.sleep(60)
