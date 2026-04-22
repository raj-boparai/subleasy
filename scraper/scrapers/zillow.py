from playwright.sync_api import sync_playwright
import json, re

MARKETS = {
    'berkeley': {
        'url': 'https://www.zillow.com/berkeley-ca/rentals/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22isMapVisible%22%3Afalse%2C%22filterState%22%3A%7B%22fr%22%3A%7B%22value%22%3Atrue%7D%7D%7D',
    },
    'seattle': {
        'url': 'https://www.zillow.com/seattle-wa/rentals/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22isMapVisible%22%3Afalse%2C%22filterState%22%3A%7B%22fr%22%3A%7B%22value%22%3Atrue%7D%7D%7D',
    }
}

def scrape_zillow(market: str) -> list[dict]:
    listings = []
    config = MARKETS[market]

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                viewport={'width': 1280, 'height': 800}
            )
            page = context.new_page()

            # Block images/fonts for speed
            page.route('**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2}', lambda r: r.abort())

            page.goto(config['url'], wait_until='domcontentloaded', timeout=30000)
            page.wait_for_timeout(3000)

            # Try to grab listing data from the page's JSON state
            content = page.content()

            # Zillow injects __NEXT_DATA__ with listing info
            match = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', content, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group(1))
                    results = (
                        data.get('props', {})
                            .get('pageProps', {})
                            .get('searchPageState', {})
                            .get('cat1', {})
                            .get('searchResults', {})
                            .get('listResults', [])
                    )
                    for r in results:
                        price = r.get('price', '')
                        price_num = int(re.sub(r'[^\d]', '', str(price))) if price else None
                        if not price_num:
                            continue

                        listing = {
                            'source': 'zillow',
                            'external_id': str(r.get('id', '')),
                            'market': market,
                            'title': r.get('address', 'Zillow Rental'),
                            'description': r.get('hdpData', {}).get('homeInfo', {}).get('description', ''),
                            'price': price_num,
                            'url': f"https://www.zillow.com{r.get('detailUrl', '')}",
                            'image_url': r.get('imgSrc', None),
                            'address': r.get('address', None),
                            'lat': r.get('latLong', {}).get('latitude'),
                            'lng': r.get('latLong', {}).get('longitude'),
                            'room_type': 'studio' if r.get('beds', 0) <= 1 else 'private',
                            'furnished': False,
                            'utilities_included': False,
                            'available_start': None,
                            'available_end': None,
                            'active': True,
                        }
                        listings.append(listing)
                except Exception as e:
                    print(f"[Zillow] JSON parse error: {e}")

            browser.close()

    except Exception as e:
        print(f"[Zillow] Error for {market}: {e}")

    print(f"[Zillow] {market}: {len(listings)} listings scraped")
    return listings
