"""
Jeli - Automatic Influencer Content & Topic Scraper
===================================================
Scrapes an influencer's TikTok profile, analyzes video captions, hashtags, and bio text,
identifies primary content niches, extracts key topics/keywords, and outputs a structured
Jeli Influencer Profile ready for business brand matching.

Usage:
    python3 jeli_analyzer.py <username>

Example:
    python3 jeli_analyzer.py therock
    python3 jeli_analyzer.py mrbeast
"""

from playwright.async_api import async_playwright
import argparse
import asyncio
import csv
import json
import os
import re
import sys
from collections import Counter

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

# Taxonomies of content niches and associated keywords
NICHE_DICTIONARY = {
    "Tech & Software": ["code", "tech", "coding", "developer", "software", "ai", "python", "app", "gadget", "computer", "saas", "cyber", "web", "data", "robot", "crypto"],
    "Fitness & Health": ["workout", "gym", "fitness", "bodybuilding", "health", "exercise", "diet", "protein", "training", "muscle", "abs", "fit", "cardio", "run", "sport"],
    "Beauty & Skincare": ["makeup", "skincare", "beauty", "hair", "cosmetics", "glow", "dermatology", "fashion", "style", "outfit", "glam", "routine", "skin"],
    "Business & Finance": ["business", "money", "investing", "stocks", "finance", "entrepreneur", "startup", "marketing", "realestate", "wealth", "crypto", "sales", "crypto"],
    "Gaming & Esports": ["gaming", "gamer", "playstation", "xbox", "pcgaming", "streamer", "twitch", "gameplay", "fortnite", "minecraft", "esports", "nintendo"],
    "Food & Cooking": ["food", "recipe", "cooking", "chef", "eat", "delicious", "kitchen", "bake", "dinner", "yummy", "snack", "restaurant", "taste"],
    "Travel & Lifestyle": ["travel", "vlog", "explore", "vacation", "trip", "adventure", "lifestyle", "nature", "hotel", "beach", "city", "tour"],
    "Comedy & Entertainment": ["funny", "comedy", "joke", "lol", "meme", "prank", "humor", "react", "entertainment", "challenge", "viral"]
}

STOP_WORDS = set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "up", "about", "into", "over", "after", "is", "are", "was", "were",
    "be", "been", "being", "have", "has", "had", "do", "does", "did", "this", "that",
    "these", "those", "my", "your", "his", "her", "its", "our", "their", "it", "you",
    "we", "they", "me", "him", "them", "what", "which", "who", "whom", "how", "when",
    "where", "why", "not", "no", "just", "so", "more", "like", "get", "got", "can", "will"
])


def clean_text(text: str) -> list[str]:
    """Extract clean words from text."""
    if not text:
        return []
    words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
    return [w for w in words if w not in STOP_WORDS]


def extract_hashtags(text: str) -> list[str]:
    """Extract hashtags from text."""
    if not text:
        return []
    return re.findall(r"#(\w+)", text.lower())


def categorize_content(text_corpus: list[str]) -> tuple[str, list[tuple[str, int]], list[str]]:
    """Categorize content into primary niche and top sub-topics based on word & hashtag frequency."""
    combined_text = " ".join(text_corpus)
    words = clean_text(combined_text)
    hashtags = extract_hashtags(combined_text)
    
    all_tokens = words + hashtags

    # Score niches
    niche_scores = Counter()
    for token in all_tokens:
        for niche, keywords in NICHE_DICTIONARY.items():
            if token in keywords:
                niche_scores[niche] += 1

    # Determine primary and secondary niches
    sorted_niches = niche_scores.most_common(2)
    primary_niche = sorted_niches[0][0] if sorted_niches else "General Content"
    secondary_niche = sorted_niches[1][0] if len(sorted_niches) > 1 else None

    # Top recurring topics/keywords
    top_topics = Counter(words).most_common(8)
    top_hashtags = [f"#{tag}" for tag, _ in Counter(hashtags).most_common(5)]

    return primary_niche, top_topics, top_hashtags


async def jeli_analyze_influencer(username: str):
    username = username.lstrip("@").strip()
    url = f"https://www.tiktok.com/@{username}"

    print(f"\n⚡ JELI AUTOMATIC SCRAPER: Analyzing @{username}...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=USER_AGENT)
        page = await context.new_page()

        try:
            print(f"📡 Fetching live DOM & metadata from {url}...")
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
            bio = user.get("signature", "")

            # Video item payloads if available
            item_list = user_detail.get("itemList", [])
            video_captions = [bio]

            videos_data = []
            for item in item_list:
                desc = item.get("desc", "")
                if desc:
                    video_captions.append(desc)
                v_stats = item.get("stats", {})
                videos_data.append({
                    "video_id": item.get("id"),
                    "caption": desc,
                    "plays": v_stats.get("playCount", 0),
                    "likes": v_stats.get("diggCount", 0),
                    "comments": v_stats.get("commentCount", 0)
                })

            # Topic & Niche Analysis
            primary_niche, top_keywords, top_hashtags = categorize_content(video_captions)

            # Jeli Suitability Rating (1.0 to 10.0 scale)
            avg_likes = round(total_likes / total_videos) if total_videos > 0 else 0
            follower_tier = "Mega" if followers >= 1_000_000 else "Macro" if followers >= 100_000 else "Micro"

            jeli_profile = {
                "jeli_platform": "Jeli Marketing Network",
                "influencer": {
                    "username": f"@{user.get('uniqueId')}",
                    "nickname": user.get("nickname"),
                    "bio": bio,
                    "verified": user.get("verified"),
                    "avatar_url": user.get("avatarMedium", ""),
                    "metrics": {
                        "followers": followers,
                        "following": following,
                        "total_likes": total_likes,
                        "total_videos": total_videos,
                        "avg_likes_per_video": avg_likes,
                        "influencer_tier": follower_tier
                    }
                },
                "content_intelligence": {
                    "primary_niche": primary_niche,
                    "top_keywords": [word for word, count in top_keywords],
                    "top_hashtags": top_hashtags,
                    "content_summary": f"Influencer @{user.get('uniqueId')} creates content primarily focused on {primary_niche}."
                },
                "video_samples": videos_data
            }

            await browser.close()
            return jeli_profile

        except Exception as e:
            print(f"⚠️ Scraper error: {e}")
            await browser.close()
            return None


def print_jeli_dashboard(profile: dict):
    inf = profile["influencer"]
    m = inf["metrics"]
    ci = profile["content_intelligence"]

    print("\n" + "=" * 75)
    print(f"  🚀 JELI INFLUENCER PROFILE: {inf['username']} ({inf['nickname']})")
    print("=" * 75)

    print("\n📌 Account Summary:")
    print(f"   • Username:       {inf['username']}")
    print(f"   • Nickname:       {inf['nickname']}")
    print(f"   • Bio:            {inf['bio']}")
    print(f"   • Verified:       {'Yes ✅' if inf['verified'] else 'No ❌'}")
    print(f"   • Creator Tier:   {m['influencer_tier']} Influencer")

    print("\n🎯 JELI Content Classification:")
    print(f"   • Primary Niche:  🏷️  {ci['primary_niche'].upper()}")
    print(f"   • Key Topics:     {', '.join(ci['top_keywords'][:6]) if ci['top_keywords'] else 'General'}")
    print(f"   • Top Hashtags:   {', '.join(ci['top_hashtags']) if ci['top_hashtags'] else 'None'}")
    print(f"   • Content Summary: {ci['content_summary']}")

    print("\n📊 Audience & Performance Stats:")
    print(f"   • Followers:      {m['followers']:,}")
    print(f"   • Total Likes:    {m['total_likes']:,}")
    print(f"   • Total Videos:   {m['total_videos']:,}")
    print(f"   • Avg Likes/Vid:  {m['avg_likes_per_video']:,}")

    print("=" * 75 + "\n")


def save_jeli_profile(username: str, profile: dict):
    json_filename = f"jeli_{username}_profile.json"
    with open(json_filename, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2, ensure_ascii=False)
    print(f"✅ Jeli Profile Saved: {json_filename}")


async def main():
    parser = argparse.ArgumentParser(description="Jeli Automatic Influencer Scraper & Content Analyzer")
    parser.add_argument("username", help="TikTok username (e.g. therock or mrbeast)")
    args = parser.parse_args()

    profile = await jeli_analyze_influencer(args.username)
    if profile:
        print_jeli_dashboard(profile)
        save_jeli_profile(args.username.lstrip("@"), profile)


if __name__ == "__main__":
    asyncio.run(main())
