"""
TikTok Live Data Scraper & API Helper
=====================================
Fetches user information, follower counts, bio, total likes, and profile stats.

Usage:
    python3 fetch_tiktok.py <username> [ms_token]

Example:
    python3 fetch_tiktok.py therock
    python3 fetch_tiktok.py mrbeast ErQnJmCJfyTw-pc9xALw8XbJWGXBne7c3PR2Ryt...
"""

from playwright.async_api import async_playwright
import asyncio
import json
import os
import sys

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"


async def fetch_profile(username: str, ms_token: str = None):
    username = username.lstrip("@").strip()
    url = f"https://www.tiktok.com/@{username}"
    print(f"\n🔍 Fetching live profile data for @{username}...\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=USER_AGENT)

        # Set msToken cookie if provided
        if ms_token:
            await context.add_cookies([
                {
                    "name": "msToken",
                    "value": ms_token,
                    "domain": ".tiktok.com",
                    "path": "/",
                }
            ])
            print("  🔑 Active msToken injected into browser context.")

        page = await context.new_page()

        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(2)

            script_elem = await page.query_selector("script#__UNIVERSAL_DATA_FOR_REHYDRATION__")
            if not script_elem:
                print("❌ Could not find TikTok rehydration payload on page.")
                await browser.close()
                return

            raw_text = await script_elem.inner_text()
            data = json.loads(raw_text)

            default_scope = data.get("__DEFAULT_SCOPE__", {})
            user_detail = default_scope.get("webapp.user-detail", {})
            user_info = user_detail.get("userInfo", {})
            user = user_info.get("user", {})
            stats = user_info.get("stats", {})

            if not user.get("uniqueId"):
                print(f"❌ User @{username} not found or account is private.")
                await browser.close()
                return

            print("=" * 60)
            print(f"  👤 Username:     @{user.get('uniqueId')}")
            print(f"  📛 Nickname:     {user.get('nickname', 'N/A')}")
            print(f"  📝 Bio:          {user.get('signature', 'N/A')}")
            print(f"  ✅ Verified:     {'Yes' if user.get('verified') else 'No'}")
            print(f"  👥 Followers:    {stats.get('followerCount', 0):,}")
            print(f"  ➡️  Following:    {stats.get('followingCount', 0):,}")
            print(f"  ❤️  Total Likes:  {stats.get('heartCount', 0):,}")
            print(f"  📹 Total Videos: {stats.get('videoCount', 0):,}")
            print("=" * 60)
            print()

        except Exception as e:
            print(f"⚠️ Error fetching data: {e}")
        finally:
            await browser.close()


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "therock"
    token = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("ms_token", None)
    asyncio.run(fetch_profile(target, token))
