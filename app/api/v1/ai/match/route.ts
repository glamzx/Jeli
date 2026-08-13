import { POST as discoverInfluencers } from '@/app/api/v1/influencers/discover/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Keep the legacy endpoint on the same evidence-based implementation.
export async function POST(request: Request) {
  return discoverInfluencers(request);
}
