import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re

MARKETS = {
    'berkeley': {
        'url': 'https://sfbay.craigslist.org/search/eby/sub',  # East Bay sublets
        'anchor_lat': 37.8719,
        'anchor_lng': -122.2585,
    },
    'seattle': {
        'url': 'https://seattle.craigslist.org/search/sub',
        'anchor_lat': 47.6062,
        'anchor_lng': -122.3321,
    }
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}

def parse_price(text: str) -> int | None:
    match = re.search(r'\$(\d+)', text.replace(',', ''))
    return int(match.group(1)) if match else None

def parse_dates(text: str):
    """Try to extract date ranges from listing text."""
    # Basic patterns: May 15, Jun 1, etc.
    months = r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{1,2}'
    dates = re.findall(months, text, re.IGNORECASE)
    return dates[:2] if len(dates) >= 2 else (None, None)

def scrape_craigslist(market: str) -> list[dict]:
    config = MARKETS[market]
    listings = []

    try:
        resp = requests.get(config['url'], headers=HEADERS, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')

        results = soup.select('li.cl-search-result')

        for item in results:
            try:
                title_el = item.select_one('.title-blob a')
                price_el = item.select_one('.priceinfo')
                meta_el = item.select_one('.meta')

                if not title_el:
                    continue

                title = title_el.get_text(strip=True)
                url = title_el.get('href', '')
                price_text = price_el.get_text(strip=True) if price_el else ''
                price = parse_price(price_text)

                if not price:
                    continue

                # Get listing detail for dates (optional, slows things down)
                # For v1, we'll just use title/meta date hints
                meta_text = meta_el.get_text() if meta_el else ''
                dates = parse_dates(f"{title} {meta_text}")

                external_id = url.split('/')[-1].replace('.html', '')

                listing = {
                    'source': 'craigslist',
                    'external_id': external_id,
                    'market': market,
                    'title': title,
                    'price': price,
                    'url': url if url.startswith('http') else f'https://sfbay.craigslist.org{url}',
                    'available_start': None,
                    'available_end': None,
                    'furnished': any(w in title.lower() for w in ['furnished', 'furn']),
                    'utilities_included': any(w in title.lower() for w in ['utilities', 'util incl', 'all incl']),
                    'room_type': detect_room_type(title),
                    'active': True,
                }
                listings.append(listing)

            except Exception as e:
                print(f"[Craigslist] Error parsing item: {e}")
                continue

    except Exception as e:
        print(f"[Craigslist] Fetch error for {market}: {e}")

    print(f"[Craigslist] {market}: {len(listings)} listings scraped")
    return listings


def detect_room_type(text: str) -> str:
    text = text.lower()
    if any(w in text for w in ['studio', '1br', '1 br', '1bed', '1 bed']):
        return 'studio'
    if any(w in text for w in ['shared', 'share', 'roommate']):
        return 'shared'
    return 'private'
