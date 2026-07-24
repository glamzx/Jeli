"""
Jeli - Batch Influencer Scraper & Catalog Generator
===================================================
Scrapes and categorizes multiple influencers in one command, generating a combined
Jeli Influencer Catalog (jeli_influencer_catalog.json) ready for business product matching.

Usage:
    python3 jeli_batch.py --influencers therock,mrbeast,khaby.lame

Example:
    python3 jeli_batch.py --influencers therock,mrbeast
"""

from jeli_analyzer import jeli_analyze_influencer
import argparse
import asyncio
import json


async def run_batch_scrape(influencer_list: list[str]):
    print(f"\n🚀 JELI BATCH SCRAPER: Processing {len(influencer_list)} influencers...\n")
    catalog = []

    for idx, username in enumerate(influencer_list, 1):
        username = username.strip()
        print(f"[{idx}/{len(influencer_list)}] Processing @{username}...")
        profile = await jeli_analyze_influencer(username)
        if profile:
            catalog.append(profile)
        await asyncio.sleep(1)

    output_filename = "jeli_influencer_catalog.json"
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    print("=" * 70)
    print(f"🎉 BATCH COMPLETE: Successfully analyzed {len(catalog)} influencers!")
    print(f"📁 Combined Jeli Database Saved: {output_filename}")
    print("=" * 70 + "\n")


async def main():
    parser = argparse.ArgumentParser(description="Jeli Batch Influencer Scraper")
    parser.add_argument("--influencers", required=True, help="Comma-separated list of TikTok usernames")
    args = parser.parse_args()

    influencer_list = [u.strip() for u in args.influencers.split(",") if u.strip()]
    await run_batch_scrape(influencer_list)


if __name__ == "__main__":
    asyncio.run(main())
