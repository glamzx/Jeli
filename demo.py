"""
TikTok API Demo Script
======================
An interactive demo to try out the unofficial TikTok API.

Usage:
    python3 demo.py

You can optionally set the ms_token environment variable for better results:
    export ms_token="your_ms_token_here"

To get your ms_token:
  1. Go to TikTok.com in your browser
  2. Open DevTools (F12) → Application → Cookies
  3. Find the cookie named "msToken" and copy its value
"""

from TikTokApi import TikTokApi
import asyncio
import json
import os

ms_token = os.environ.get("ms_token", None)
BROWSER = os.getenv("TIKTOK_BROWSER", "chromium")


async def get_trending_videos(api, count=10):
    """Fetch trending videos from TikTok."""
    print(f"\n🔥 Fetching {count} trending videos...\n")
    i = 0
    async for video in api.trending.videos(count=count):
        i += 1
        d = video.as_dict
        author = d.get("author", {}).get("uniqueId", "unknown")
        desc = d.get("desc", "No description")[:80]
        stats = d.get("stats", {})
        plays = stats.get("playCount", 0)
        likes = stats.get("diggCount", 0)
        comments = stats.get("commentCount", 0)
        shares = stats.get("shareCount", 0)

        print(f"  {i}. @{author}")
        print(f"     📝 {desc}")
        print(f"     ▶️  {plays:,} plays  |  ❤️  {likes:,} likes  |  💬 {comments:,} comments  |  🔗 {shares:,} shares")
        print()


async def get_user_info(api, username):
    """Fetch info about a TikTok user."""
    print(f"\n👤 Fetching info for @{username}...\n")
    user = api.user(username)
    try:
        user_data = await user.info()
        info = user_data.get("user", user_data.get("userInfo", {}).get("user", {}))
        stats = user_data.get("stats", user_data.get("userInfo", {}).get("stats", {}))

        print(f"  Username:    @{info.get('uniqueId', username)}")
        print(f"  Nickname:    {info.get('nickname', 'N/A')}")
        print(f"  Bio:         {info.get('signature', 'N/A')}")
        print(f"  Verified:    {'✅ Yes' if info.get('verified') else '❌ No'}")
        print(f"  Followers:   {stats.get('followerCount', 'N/A'):,}" if isinstance(stats.get('followerCount'), int) else f"  Followers:   {stats.get('followerCount', 'N/A')}")
        print(f"  Following:   {stats.get('followingCount', 'N/A'):,}" if isinstance(stats.get('followingCount'), int) else f"  Following:   {stats.get('followingCount', 'N/A')}")
        print(f"  Total Likes: {stats.get('heartCount', stats.get('heart', 'N/A')):,}" if isinstance(stats.get('heartCount', stats.get('heart')), int) else f"  Total Likes: {stats.get('heartCount', stats.get('heart', 'N/A'))}")
        print(f"  Videos:      {stats.get('videoCount', 'N/A'):,}" if isinstance(stats.get('videoCount'), int) else f"  Videos:      {stats.get('videoCount', 'N/A')}")
    except Exception as e:
        print(f"  ⚠️  Error fetching user info: {e}")

    print(f"\n  📹 Recent videos from @{username}:")
    i = 0
    async for video in user.videos(count=5):
        i += 1
        d = video.as_dict
        desc = d.get("desc", "No description")[:80]
        stats = d.get("stats", {})
        plays = stats.get("playCount", 0)
        likes = stats.get("diggCount", 0)
        print(f"    {i}. {desc}")
        print(f"       ▶️  {plays:,} plays  |  ❤️  {likes:,} likes")
    print()


async def get_hashtag_videos(api, hashtag, count=10):
    """Fetch videos for a specific hashtag."""
    print(f"\n#️⃣  Fetching {count} videos for #{hashtag}...\n")
    tag = api.hashtag(name=hashtag)
    i = 0
    async for video in tag.videos(count=count):
        i += 1
        d = video.as_dict
        author = d.get("author", {}).get("uniqueId", "unknown")
        desc = d.get("desc", "No description")[:80]
        stats = d.get("stats", {})
        plays = stats.get("playCount", 0)
        likes = stats.get("diggCount", 0)

        print(f"  {i}. @{author}")
        print(f"     📝 {desc}")
        print(f"     ▶️  {plays:,} plays  |  ❤️  {likes:,} likes")
        print()


async def search_videos(api, query, count=10):
    """Search for videos by keyword."""
    print(f"\n🔍 Searching for '{query}'...\n")
    i = 0
    async for video in api.search.videos(query, count=count):
        i += 1
        d = video.as_dict
        author = d.get("author", {}).get("uniqueId", "unknown")
        desc = d.get("desc", "No description")[:80]
        stats = d.get("stats", {})
        plays = stats.get("playCount", 0)
        likes = stats.get("diggCount", 0)

        print(f"  {i}. @{author}")
        print(f"     📝 {desc}")
        print(f"     ▶️  {plays:,} plays  |  ❤️  {likes:,} likes")
        print()


async def main():
    print("=" * 60)
    print("  🎵 TikTok API Demo  🎵")
    print("=" * 60)

    if ms_token:
        print("  ✅ ms_token detected from environment")
    else:
        print("  ⚠️  No ms_token set (some features may not work)")
        print("     Set it with: export ms_token='your_token_here'")

    print()
    print("  Initializing TikTok API session...")
    print("  (This will launch a headless browser — may take a moment)")
    print()

    async with TikTokApi() as api:
        await api.create_sessions(
            ms_tokens=[ms_token] if ms_token else None,
            num_sessions=1,
            sleep_after=3,
            browser=BROWSER,
            suppress_resource_load_types=["image", "media", "font", "websocket", "eventsource"],
            timeout=60000,
        )
        print("  ✅ Session created successfully!\n")

        while True:
            print("-" * 60)
            print("  What would you like to do?\n")
            print("  1. 🔥 Get trending videos")
            print("  2. 👤 Look up a user")
            print("  3. #️⃣  Search by hashtag")
            print("  4. 🔍 Search videos by keyword")
            print("  5. ❌ Exit")
            print()

            choice = input("  Enter your choice (1-5): ").strip()

            if choice == "1":
                await get_trending_videos(api)

            elif choice == "2":
                username = input("  Enter TikTok username (e.g. therock): ").strip().lstrip("@")
                if username:
                    await get_user_info(api, username)
                else:
                    print("  ⚠️  No username entered.")

            elif choice == "3":
                hashtag = input("  Enter hashtag (e.g. funny): ").strip().lstrip("#")
                if hashtag:
                    await get_hashtag_videos(api, hashtag)
                else:
                    print("  ⚠️  No hashtag entered.")

            elif choice == "4":
                query = input("  Enter search query: ").strip()
                if query:
                    await search_videos(api, query)
                else:
                    print("  ⚠️  No query entered.")

            elif choice == "5":
                print("\n  👋 Goodbye!\n")
                break

            else:
                print("  ⚠️  Invalid choice, please try again.")


if __name__ == "__main__":
    asyncio.run(main())
