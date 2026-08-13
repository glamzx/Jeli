export interface GeminiMatchCandidate {
  username: string;
  nickname: string;
  bio: string;
  niche: string;
  followers: number;
  country: string;
  videos: Array<{
    title: string;
    description: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
}

export interface GeminiMatchResult {
  username: string;
  score: number;
  nicheFit: number;
  audienceFit: number;
  contentFit: number;
  commercialFit: number;
  recommendation: string;
  evidence: string[];
  missingInformation: string[];
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key && key !== 'your_gemini_api_key_here' ? key : null;
}

function parseJson(text: string): unknown {
  const fence = String.fromCharCode(96).repeat(3);
  const clean = text.trim()
    .replace(new RegExp('^' + fence + 'json\\s*', 'i'), '')
    .replace(new RegExp(fence + '$'), '')
    .trim();
  return JSON.parse(clean);
}

export async function analyzeInfluencerMatches(input: {
  businessDescription: string;
  targetNiche: string;
  budget: string;
  audience: string;
  campaignGoal: string;
  deliverables: string;
  tone: string;
  location: string;
  candidates: GeminiMatchCandidate[];
}): Promise<{ available: boolean; results: GeminiMatchResult[]; error?: string }> {
  const apiKey = getGeminiKey();
  if (!apiKey) return { available: false, results: [], error: 'GEMINI_API_KEY is not configured' };
  if (input.candidates.length === 0) return { available: true, results: [] };

  const business = JSON.stringify({
    description: input.businessDescription,
    targetNiche: input.targetNiche,
    budget: input.budget,
    audience: input.audience,
    campaignGoal: input.campaignGoal,
    deliverables: input.deliverables,
    tone: input.tone,
    location: input.location
  }, null, 2);
  const evidence = JSON.stringify(input.candidates, null, 2);
  const prompt = [
    "You are Jeli's evidence-based influencer matching analyst.",
    'Analyze only the supplied business requirements and creator evidence. Never invent audience demographics, performance, industry, or facts that are not present. If information is missing, put it in missingInformation and reduce the relevant score.',
    '',
    'BUSINESS REQUIREMENTS:',
    business,
    '',
    'CREATOR EVIDENCE (OAuth profile/video metadata and scraper observations):',
    evidence,
    '',
    'Return only a JSON array. Create exactly one object for every supplied creator. Each object must contain:',
    'username, score, nicheFit, audienceFit, contentFit, commercialFit (all integers 0-100), recommendation (2 concise Russian sentences), evidence (2-5 short Russian facts quoted or directly derived from the supplied evidence), missingInformation (short Russian list).',
    'The overall score must reflect the four component scores: niche 30%, audience 20%, content 30%, commercial 20%. Do not use popularity alone as fit. Score 0-39 poor, 40-69 possible, 70-84 good, 85-100 excellent.'
  ].join('\n');

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 5000,
            responseMimeType: 'application/json'
          }
        }),
        cache: 'no-store'
      }
    );

    const payload = await response.json();
    if (!response.ok) {
      return { available: false, results: [], error: payload?.error?.message || 'Gemini request failed' };
    }

    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    const raw = parseJson(String(text || ''));
    if (!Array.isArray(raw)) throw new Error('Gemini returned a non-array result');

    const results = raw.map((item: any) => ({
      username: String(item.username || ''),
      score: clampScore(item.score),
      nicheFit: clampScore(item.nicheFit),
      audienceFit: clampScore(item.audienceFit),
      contentFit: clampScore(item.contentFit),
      commercialFit: clampScore(item.commercialFit),
      recommendation: String(item.recommendation || 'Недостаточно данных для рекомендации.'),
      evidence: Array.isArray(item.evidence) ? item.evidence.map(String).slice(0, 5) : [],
      missingInformation: Array.isArray(item.missingInformation) ? item.missingInformation.map(String).slice(0, 5) : []
    })).filter(item => item.username);

    return { available: true, results };
  } catch (error: any) {
    return { available: false, results: [], error: error.message || 'Gemini response parsing failed' };
  }
}

function clampScore(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, Math.round(number))) : 0;
}
