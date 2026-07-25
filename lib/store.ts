// In-memory runtime persistence store for registered influencers and brands

export interface RegisteredInfluencer {
  id: string;
  username: string;
  nickname: string;
  email: string;
  followers: number;
  totalLikes: number;
  totalVideos: number;
  niche: string;
  city: string;
  avatar: string;
  verified: boolean;
  bio: string;
  createdAt: string;
}

export interface RegisteredBrand {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  websiteUrl?: string;
  budget?: string;
  createdAt: string;
}

const globalForStore = globalThis as unknown as {
  influencerStore: RegisteredInfluencer[] | undefined;
  brandStore: RegisteredBrand[] | undefined;
};

export const influencerStore: RegisteredInfluencer[] =
  globalForStore.influencerStore ?? [];

export const brandStore: RegisteredBrand[] =
  globalForStore.brandStore ?? [];

if (process.env.NODE_ENV !== 'production') {
  globalForStore.influencerStore = influencerStore;
  globalForStore.brandStore = brandStore;
}
