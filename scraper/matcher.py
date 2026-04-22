from datetime import date, datetime
from typing import Optional


def parse_date(d) -> Optional[date]:
    if not d:
        return None
    if isinstance(d, date):
        return d
    try:
        return datetime.strptime(str(d)[:10], '%Y-%m-%d').date()
    except:
        return None


def dates_overlap(l_start, l_end, p_start, p_end) -> bool:
    """Check if listing dates overlap with user's preferred window."""
    ls = parse_date(l_start)
    le = parse_date(l_end)
    ps = parse_date(p_start)
    pe = parse_date(p_end)

    # If listing has no dates, don't disqualify — just score lower
    if not ls or not le:
        return True

    # Overlap if listing starts before pref ends AND listing ends after pref starts
    return ls <= pe and le >= ps


def score_listing(listing: dict, pref: dict) -> Optional[int]:
    """
    Score a listing against a user's preferences.
    Returns None if hard filters fail (disqualified).
    Returns 0-100 score otherwise.
    """
    score = 50  # baseline

    # ── Hard filters (instant disqualify) ──────────────────────────
    # Budget
    if listing['price'] > pref['max_budget']:
        return None

    # Date overlap
    if not dates_overlap(
        listing.get('available_start'), listing.get('available_end'),
        pref.get('move_in_start'), pref.get('move_out_end')
    ):
        return None

    # Room type (skip if pref is 'any')
    if pref.get('room_type') != 'any' and listing.get('room_type'):
        if listing['room_type'] != pref['room_type']:
            return None

    # Hard requirements
    if pref.get('furnished_required') and not listing.get('furnished'):
        return None
    if pref.get('utilities_required') and not listing.get('utilities_included'):
        return None

    # ── Soft scoring (nice to haves) ───────────────────────────────
    # Under budget = great
    budget_ratio = listing['price'] / pref['max_budget']
    if budget_ratio < 0.75:
        score += 20
    elif budget_ratio < 0.90:
        score += 10

    # Furnished bonus
    if listing.get('furnished'):
        score += 8

    # Utilities bonus
    if listing.get('utilities_included'):
        score += 8

    # Distance to anchor (campus/downtown)
    dist = listing.get('distance_to_anchor')
    if dist is not None:
        if dist < 0.5:
            score += 15
        elif dist < 1.0:
            score += 8
        elif dist < 2.0:
            score += 3

    # Source trust bonus
    source_scores = {'craigslist': 5, 'zillow': 8, 'facebook_submit': 3}
    score += source_scores.get(listing.get('source', ''), 0)

    return min(score, 100)


def find_matches(listings: list[dict], preferences: list[dict]) -> list[tuple]:
    """
    Match all active listings against all active user preferences.
    Returns list of (preference, listing, score) tuples above threshold.
    """
    SCORE_THRESHOLD = 50
    matches = []

    for pref in preferences:
        for listing in listings:
            # Only match same market
            if listing.get('market') != pref.get('market'):
                continue

            score = score_listing(listing, pref)
            if score is not None and score >= SCORE_THRESHOLD:
                matches.append((pref, listing, score))

    # Sort by score descending
    matches.sort(key=lambda x: x[2], reverse=True)
    return matches
