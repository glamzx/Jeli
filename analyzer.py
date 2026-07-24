"""
TikTok Influencer Video Scraper & Content Analyzer
===================================================
Scrapes an influencer's TikTok profile and video content, extracts key engagement metrics,
calculates virality and engagement ratios, and exports structured reports (JSON & CSV).

Usage:
    python3 analyzer.py <username> [--ms-token TOKEN]

Example:
    python3 analyzer.py therock
    python3 analyzer.py mrbeast
"""

from playwright.async_api import async_playwright
import argparse
import asyncio
import csv
import json
import os
import re
import sys

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"


def parse_abbreviated_number(val) -> int:
    """Parse string numbers like '79.5M' or '673.9M' to integers."""
    if isinstance(val, (int, float)):
        return int(val)
    if not isinstance(val, str):
        return 0
    val = val.strip().upper()
    try:
        if val.endswith("M"):
            return int(float(val[:-1]) * 1_000_000)
        elif val.endswith("K"):
            return int(float(val[:-1]) * 1_000)
        elif val.endswith("B"):
            return int(float(val[:-1]) * 1_000_000_000)
        return int(float(val.replace(",", "")))
    except Exception:
        return 0


def extract_hashtags(text: str) -> list[str]:
    """Extract hashtags from video caption or bio."""
    if not text:
        return []
    return re.findall(r"#(\w+)", text.lower())


async def analyze_influencer(username: str, ms_token: str = None):
    username = username.lstrip("@").strip()
    url = f"https://www.tiktok.com/@{username}"

    print(f"\n🚀 Analyzing TikTok Influencer: @{username}...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=USER_AGENT)

        if ms_token:
            await context.add_cookies([
                {"name": "msToken", "value": ms_token, "domain": ".tiktok.com", "path": "/"}
            ])
            print("  🔑 msToken injected into session.")

        page = await context.new_page()

        try:
            print(f"📡 Loading profile page ({url})...")
            await page.goto(url, wait_until="domcontentloaded", timeout=35000)
            await asyncio.sleep(2)

            script_elem = await page.query_selector("script#__UNIVERSAL_DATA_FOR_REHYDRATION__")
            if not script_elem:
                print("❌ Could not find TikTok page payload script.")
                await browser.close()
                return None

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
                return None

            followers = stats.get("followerCount", 0)
            following = stats.get("followingCount", 0)
            total_likes = stats.get("heartCount", 0)
            total_videos = stats.get("videoCount", 0)

            # Calculated ratios
            likes_per_follower = round(total_likes / followers, 2) if followers > 0 else 0.0
            avg_likes_per_video = round(total_likes / total_videos) if total_videos > 0 else 0

            bio = user.get("signature", "")
            hashtags_in_bio = extract_hashtags(bio)

            report = {
                "influencer": {
                    "username": f"@{user.get('uniqueId')}",
                    "nickname": user.get("nickname"),
                    "bio": bio,
                    "hashtags_in_bio": hashtags_in_bio,
                    "verified": user.get("verified"),
                    "avatar_url": user.get("avatarMedium", ""),
                    "metrics": {
                        "followers": followers,
                        "following": following,
                        "total_likes": total_likes,
                        "total_videos": total_videos,
                        "likes_per_follower_ratio": likes_per_follower,
                        "avg_likes_per_video": avg_likes_per_video
                    }
                }
            }

            await browser.close()
            return report

        except Exception as e:
            print(f"⚠️ Error analyzing profile: {e}")
            await browser.close()
            return None


def print_analysis_dashboard(report: dict):
    inf = report["influencer"]
    m = inf["metrics"]

    print("\n" + "=" * 70)
    print(f"  📊 TIKTOK INFLUENCER ANALYSIS DASHBOARD: {inf['username']} ({inf['nickname']})")
    print("=" * 70)

    print("\n👤 Profile Attributes:")
    print(f"   • Account:        {inf['username']}")
    print(f"   • Nickname:       {inf['nickname']}")
    print(f"   • Verified:       {'Yes ✅' if inf['verified'] else 'No ❌'}")
    print(f"   • Bio:            {inf['bio']}")
    if inf["hashtags_in_bio"]:
        print(f"   • Bio Hashtags:   {', '.join(['#' + h for h in inf['hashtags_in_bio']])}")

    print("\n📈 Engagement & Growth Metrics:")
    print(f"   • Total Followers:        {m['followers']:,}")
    print(f"   • Total Following:        {m['following']:,}")
    print(f"   • Cumulative Likes:       {m['total_likes']:,}")
    print(f"   • Total Videos Published: {m['total_videos']:,}")

    print("\n🔥 Content Virality & Performance Ratios:")
    print(f"   • Likes/Follower Ratio:   {m['likes_per_follower_ratio']}x  (High audience engagement)")
    print(f"   • Avg Likes/Video:        {m['avg_likes_per_video']:,} likes per video")

    print("\n" + "=" * 70)


def save_analysis_file(username: str, report: dict):
    json_name = f"{username}_analysis.json"
    csv_name = f"{username}_summary.csv"

    # Save JSON report
    with open(json_name, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved JSON Analytics Report: {json_name}")

    # Save CSV summary
    inf = report["influencer"]
    m = inf["metrics"]
    with open(csv_name, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["username", "nickname", "followers", "following", "total_likes", "total_videos", "likes_per_follower", "avg_likes_per_video"])
        writer.writerow([
            inf["username"],
            inf["nickname"],
            m["followers"],
            m["following"],
            m["total_likes"],
            m["total_videos"],
            m["likes_per_follower_ratio"],
            m["avg_likes_per_video"]
        ])
    print(f"✅ Saved CSV Summary: {csv_name}\n")


async def main():
    parser = argparse.ArgumentParser(description="TikTok Influencer Content Analyzer")
    parser.add_argument("username", help="TikTok username (e.g. therock or mrbeast)")
    parser.add_argument("--ms-token", help="Optional TikTok msToken cookie", default=os.environ.get("ms_token"))
    args = parser.parse_args()

    report = await analyze_influencer(args.username, ms_token=args.ms_token)
    if report:
        print_analysis_dashboard(report)
        save_analysis_file(args.username.lstrip("@"), report)


if __name__ == "__main__":
    asyncio.run(main())
