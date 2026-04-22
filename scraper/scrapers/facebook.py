# Facebook: since we can't reliably scrape FB groups,
# this module handles user-submitted listings that come
# through the /api/listings endpoint on the frontend.
#
# Future upgrade paths:
# 1. Chrome extension that lets users click "Add to Subleasy" on FB posts
# 2. A dedicated submission form linked from FB group posts
# 3. Email parsing (users forward FB notifications to listings@subleasy.io)

def get_facebook_submitted(db) -> list[dict]:
    """
    Pull user-submitted listings from DB that haven't been processed yet.
    These come in via the /api/listings POST endpoint.
    """
    result = db.from_('listings') \
        .select('*') \
        .eq('source', 'facebook_submit') \
        .eq('active', True) \
        .execute()
    return result.data or []
