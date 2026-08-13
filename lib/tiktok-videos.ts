export interface TikTokVideo {
  id: string;
  title: string;
  description: string;
  duration: number;
  coverImageUrl: string;
  embedLink: string;
  shareUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

const TIKTOK_VIDEO_LIST_URL = 'https://open.tiktokapis.com/v2/video/list/';
const VIDEO_FIELDS = [
  'id',
  'title',
  'video_description',
  'duration',
  'cover_image_url',
  'embed_link',
  'share_url',
  'view_count',
  'like_count',
  'comment_count',
  'share_count'
].join(',');

export async function listTikTokVideos(accessToken: string): Promise<TikTokVideo[]> {
  const response = await fetch(`${TIKTOK_VIDEO_LIST_URL}?fields=${encodeURIComponent(VIDEO_FIELDS)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ max_count: 12 }),
    cache: 'no-store'
  });

  const payload = await response.json();
  if (!response.ok || payload?.error?.code && payload.error.code !== 'ok') {
    throw new Error(payload?.error?.message || 'TikTok video list request failed');
  }

  return (payload?.data?.videos || []).map((video: Record<string, unknown>) => ({
    id: String(video.id || ''),
    title: String(video.title || ''),
    description: String(video.video_description || ''),
    duration: Number(video.duration || 0),
    coverImageUrl: String(video.cover_image_url || ''),
    embedLink: String(video.embed_link || ''),
    shareUrl: String(video.share_url || ''),
    viewCount: Number(video.view_count || 0),
    likeCount: Number(video.like_count || 0),
    commentCount: Number(video.comment_count || 0),
    shareCount: Number(video.share_count || 0)
  })).filter((video: TikTokVideo) => video.id);
}
