"""
Jeli - Exact Video Content Summarizer & Business Alignment Matcher
===================================================================
Analyzes exact video content, generates verbatim caption summaries, and evaluates
how precisely an influencer's video content aligns with a specific business marketing request.

Uses exact raw data (no rounded approximations).

Usage:
    python3 jeli_matcher.py --username <username> --business "<business description>"
"""

from playwright.async_api import async_playwright
import argparse
import asyncio
import json
import os
import re
import sys
from collections import Counter

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

STOP_WORDS = set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "up", "about", "into", "over", "after", "is", "are", "was", "were",
    "be", "been", "being", "have", "has", "had", "do", "does", "did", "this", "that",
    "these", "those", "my", "your", "his", "her", "its", "our", "their", "it", "you",
    "we", "they", "me", "him", "them", "what", "which", "who", "whom", "how", "when",
    "where", "why", "not", "no", "just", "so", "more", "like", "get", "got", "can", "will",
    "video", "content", "tiktok", "make", "new", "out", "all", "one"
])


def tokenize_exact(text: str) -> list[str]:
    """Tokenize text into lowercased clean words."""
    if not text:
        return []
    words = re.findall(r"\b[a-zA-Z0-9]{2,}\b", text.lower())
    return [w for w in words if w not in STOP_WORDS]


def calculate_alignment_score(video_captions: list[str], bio: str, business_request: str) -> dict:
    business_tokens = set(tokenize_exact(business_request))
    if not business_tokens:
        return {"alignment_score_pct": "0.0%", "matched_keywords": [], "alignment_level": "None"}

    combined_content = f"{bio} " + " ".join(video_captions)
    content_tokens = tokenize_exact(combined_content)
    content_token_counts = Counter(content_tokens)

    matched_keywords = []
    total_matched_occurrences = 0

    for b_token in business_tokens:
        count = content_token_counts.get(b_token, 0)
        if count > 0:
            matched_keywords.append({"keyword": b_token, "exact_count_in_content": count})
            total_matched_occurrences += count

    coverage_ratio = len(matched_keywords) / len(business_tokens)
    density_score = min(total_matched_occurrences / max(len(content_tokens), 1) * 10, 1.0)

    raw_score = (coverage_ratio * 0.7 + density_score * 0.3) * 100
    alignment_score_pct = round(min(max(raw_score, 0.0), 100.0), 2)

    if alignment_score_pct >= 50.0:
        level = "High Alignment 🔥 (Strong Marketing Fit)"
    elif alignment_score_pct >= 20.0:
        level = "Moderate Alignment ⚡ (Potential Ambassador)"
    elif alignment_score_pct > 0.0:
        level = "Low Alignment ⚠️ (Limited Keyword Overlap)"
    else:
        level = "No Alignment ❌ (Unrelated Content)"

    return {
        "alignment_score_pct": f"{alignment_score_pct}%",
        "alignment_numerical": alignment_score_pct,
        "alignment_level": level,
        "total_business_keywords": len(business_tokens),
        "matched_keyword_count": len(matched_keywords),
        "matched_keywords": matched_keywords
    }


async def analyze_and_match_video_content(username: str, business_request: str):
    username = username.lstrip("@").strip()
    url = f"https://www.tiktok.com/@{username}"

    print(f"\n⚡ JELI EXACT ANALYZER & MATCHER: Analyzing @{username}...")
    print(f"💼 Business Request: \"{business_request}\"\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=USER_AGENT)
        page = await context.new_page()

        try:
            print(f"📡 Fetching exact live data from {url}...")
            await page.goto(url, wait_until="domcontentloaded", timeout=35000)
            await asyncio.sleep(2)

            data = None
            scripts = await page.query_selector_all("script")
            for s in scripts:
                s_id = await s.get_attribute("id")
                if s_id in ["__UNIVERSAL_DATA_FOR_REHYDRATION__", "SIGI_STATE"]:
                    content = await s.inner_text()
                    try:
                        data = json.loads(content)
                        break
                    except Exception:
                        pass

            if not data:
                print("❌ Could not find TikTok page payload script.")
                await browser.close()
                return None

            default_scope = data.get("__DEFAULT_SCOPE__", {})
            user_detail = default_scope.get("webapp.user-detail", {})
            user_info = user_detail.get("userInfo", {})
            user = user_info.get("user", {})
            stats = user_info.get("stats", {})

            if not user.get("uniqueId"):
                print(f"❌ User @{username} not found or account is private.")
                await browser.close()
                return None

            exact_followers = int(stats.get("followerCount", 0))
            exact_following = int(stats.get("followingCount", 0))
            exact_total_likes = int(stats.get("heartCount", 0))
            exact_total_videos = int(stats.get("videoCount", 0))
            bio = user.get("signature", "")

            item_list = user_detail.get("itemList", [])
            exact_videos = []
            captions_list = []

            for item in item_list:
                caption = item.get("desc", "")
                if caption:
                    captions_list.append(caption)

                video_stats = item.get("stats", {})
                exact_plays = int(video_stats.get("playCount", 0))
                exact_likes = int(video_stats.get("diggCount", 0))
                exact_comments = int(video_stats.get("commentCount", 0))
                exact_shares = int(video_stats.get("shareCount", 0))

                exact_videos.append({
                    "exact_video_id": str(item.get("id")),
                    "video_url": f"https://www.tiktok.com/@{username}/video/{item.get('id')}",
                    "exact_caption": caption,
                    "exact_metrics": {
                        "exact_plays": exact_plays,
                        "exact_likes": exact_likes,
                        "exact_comments": exact_comments,
                        "exact_shares": exact_shares
                    }
                })

            alignment = calculate_alignment_score(captions_list, bio, business_request)

            video_summary = f"Influencer @{user.get('uniqueId')} has published {exact_total_videos} videos with {exact_total_likes} total likes. Analyzed {len(exact_videos)} video samples."
            captions_summary = " ".join([c for c in captions_list if c])[:300] if captions_list else bio

            report = {
                "jeli_match_report": {
                    "influencer_username": f"@{user.get('uniqueId')}",
                    "nickname": user.get("nickname"),
                    "bio": bio,
                    "verified": user.get("verified"),
                    "exact_metrics": {
                        "exact_followers_count": exact_followers,
                        "exact_following_count": exact_following,
                        "exact_total_likes_count": exact_total_likes,
                        "exact_total_videos_count": exact_total_videos
                    },
                    "content_summary": {
                        "video_content_summary": video_summary,
                        "captions_summary": captions_summary,
                        "analyzed_sample_count": len(exact_videos)
                    },
                    "business_alignment": {
                        "business_request_text": business_request,
                        "alignment_score_pct": alignment["alignment_score_pct"],
                        "alignment_level": alignment["alignment_level"],
                        "matched_keyword_count": alignment["matched_keyword_count"],
                        "matched_keywords": alignment["matched_keywords"]
                    },
                    "exact_video_samples": exact_videos
                }
            }

            await browser.close()
            return report

        except Exception as e:
            print(f"⚠️ Error: {e}")
            await browser.close()
            return None


def print_match_dashboard(report: dict):
    r = report["jeli_match_report"]
    m = r["exact_metrics"]
    ba = r["business_alignment"]
    cs = r["content_summary"]

    print("\n" + "=" * 75)
    print(f"  🎯 JELI BUSINESS ALIGNMENT & VIDEO CONTENT REPORT: {r['influencer_username']}")
    print("=" * 75)

    print("\n👤 Influencer Identity:")
    print(f"   • Account:            {r['influencer_username']} ({r['nickname']})")
    print(f"   • Bio:                {r['bio']}")
    print(f"   • Exact Followers:    {m['exact_followers_count']:,}")
    print(f"   • Exact Total Likes:  {m['exact_total_likes_count']:,}")
    print(f"   • Exact Video Count:  {m['exact_total_videos_count']:,}")

    print("\n💼 Business Request Alignment:")
    print(f"   • Business Request:   \"{ba['business_request_text']}\"")
    print(f"   • Alignment Score:    {ba['alignment_score_pct']}")
    print(f"   • Alignment Level:    {ba['alignment_level']}")
    print(f"   • Keywords Matched:   {ba['matched_keyword_count']} matched terms")

    if ba["matched_keywords"]:
        print("   • Matched Terms:")
        for mk in ba["matched_keywords"]:
            print(f"     - '{mk['keyword']}' (Occurrences in content: {mk['exact_count_in_content']})")

    print("\n📝 Video & Captions Summary:")
    print(f"   • Overview:           {cs['video_content_summary']}")
    print(f"   • Captions Preview:   {cs['captions_summary']}")

    if r["exact_video_samples"]:
        print("\n📹 Sample Exact Video Breakdown:")
        for idx, v in enumerate(r["exact_video_samples"][:3], 1):
            vm = v["exact_metrics"]
            print(f"   {idx}. ID: {v['exact_video_id']}")
            print(f"      Caption: {v['exact_caption']}")
            print(f"      Exact Plays: {vm['exact_plays']:,}  |  Likes: {vm['exact_likes']:,}  |  Comments: {vm['exact_comments']:,}")
            print(f"      URL: {v['video_url']}\n")

    print("=" * 75 + "\n")


def save_exact_report(username: str, report: dict):
    filename = f"jeli_{username}_alignment_report.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"✅ Exact Alignment Report Saved: {filename}\n")


async def main():
    parser = argparse.ArgumentParser(description="Jeli Exact Video Summarizer & Business Alignment Matcher")
    parser.add_argument("--username", required=True, help="TikTok username (e.g. therock or mrbeast)")
    parser.add_argument("--business", required=True, help="Business description or marketing request")
    args = parser.parse_args()

    report = await analyze_and_match_video_content(args.username, args.business)
    if report:
        print_match_dashboard(report)
        save_exact_report(args.username.lstrip("@"), report)


if __name__ == "__main__":
    asyncio.run(main())
