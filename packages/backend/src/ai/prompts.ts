/**
 * All prompt templates for ChaiBoost AI features.
 * These are the core prompts used by the AI generators.
 */

// ============================================================
// CAPTION GENERATION
// ============================================================

export const CAPTION_SYSTEM_PROMPT = `You are a social media copywriter specializing in tea, coffee, and beverage businesses.
Your captions are engaging, authentic, and drive customer engagement.
You understand the culture around specialty drinks — from matcha ceremonies to boba trends.
Always write in a way that feels human and relatable, never robotic or overly salesy.
Include emojis naturally (not excessively). Keep Instagram's character limits in mind.`;

export function buildCaptionPrompt(params: {
  businessName: string;
  businessCategory: string;
  topic: string;
  tone: string;
  language: string;
  customPrompt?: string;
  brandDescription?: string;
  toneOfVoice?: string;
}): string {
  return `Generate a social media caption for a ${params.businessCategory} business called "${params.businessName}".

${params.brandDescription ? `About the business: ${params.brandDescription}` : ''}
${params.toneOfVoice ? `Brand voice: ${params.toneOfVoice}` : ''}

Topic/Theme: ${params.topic}
Tone: ${params.tone}
Language: ${params.language}
${params.customPrompt ? `Additional instructions: ${params.customPrompt}` : ''}

Requirements:
- Length: 150-300 characters (ideal for Instagram)
- Include a clear call-to-action
- Use 2-4 relevant emojis naturally
- End with a line break before hashtags (will be added separately)
- Make it shareable and save-worthy
- Avoid clichés and generic marketing speak

Provide 3 alternative opening hooks as suggestions.`;
}

// ============================================================
// IMAGE GENERATION
// ============================================================

export const IMAGE_STYLE_PRESETS: Record<string, string> = {
  product_photo: 'Professional product photography, clean white background, soft studio lighting, high-end beverage photography style, 4K quality',
  lifestyle: 'Warm lifestyle photography, cozy cafe setting, natural light, shallow depth of field, instagrammable aesthetic',
  flat_lay: 'Overhead flat lay photography, styled with complementary props (dried flowers, wooden surfaces, linen napkins), editorial quality',
  artistic: 'Artistic food photography, dramatic lighting, bold colors, moody atmosphere, magazine editorial style',
  minimal: 'Minimalist photography, lots of negative space, clean lines, modern aesthetic, single subject focus',
  seasonal: 'Seasonal themed photography, appropriate seasonal props and colors, festive but not overwhelming',
};

export function buildImagePrompt(params: {
  businessName: string;
  businessCategory: string;
  topic: string;
  style: string;
  brandColors?: { primary: string; secondary: string; accent: string };
}): string {
  const stylePreset = IMAGE_STYLE_PRESETS[params.style] || IMAGE_STYLE_PRESETS.product_photo;

  let prompt = `A stunning ${params.businessCategory} beverage photo for "${params.businessName}".
Subject: ${params.topic}
Style: ${stylePreset}`;

  if (params.brandColors) {
    prompt += `\nBrand colors to incorporate subtly: primary ${params.brandColors.primary}, accent ${params.brandColors.accent}`;
  }

  prompt += `\n\nNo text overlays. No watermarks. High resolution. Instagram-ready composition (4:5 aspect ratio).`;

  return prompt;
}

// ============================================================
// VIDEO STORYBOARD
// ============================================================

export function buildVideoStoryboardPrompt(params: {
  businessName: string;
  businessCategory: string;
  topic: string;
  duration: number;
}): string {
  return `Create a ${params.duration}-second video storyboard for a ${params.businessCategory} business called "${params.businessName}".

Topic: ${params.topic}

Format your response as a JSON object with this structure:
{
  "scenes": [
    {
      "order": 1,
      "duration": 3,
      "description": "Detailed visual description of what happens in this scene",
      "text": "Text overlay for this scene (if any)",
      "animation": "Transition or animation effect"
    }
  ],
  "totalDuration": ${params.duration},
  "music": "Suggested music style/mood",
  "transitions": ["transition1", "transition2"]
}

Requirements:
- Each scene should be 2-5 seconds
- First scene must hook attention immediately
- Include product showcase moment
- End with clear CTA
- Optimize for vertical (9:16) format
- Suggest smooth transitions between scenes`;
}

// ============================================================
// HASHTAG GENERATION
// ============================================================

export function buildHashtagPrompt(params: {
  businessCategory: string;
  caption: string;
  topic?: string;
}): string {
  return `Generate 20-30 relevant Instagram hashtags for a ${params.businessCategory} business.

${params.caption ? `Post caption: "${params.caption}"` : ''}
${params.topic ? `Topic: ${params.topic}` : ''}

Mix of:
- 5-7 high-volume hashtags (1M+ posts)
- 8-10 medium-volume hashtags (100K-1M posts)
- 5-7 niche hashtags (10K-100K posts)
- 3-5 branded/trending hashtags

Format as a JSON array of strings (without # prefix).
Order from most to least popular.
Only include hashtags relevant to tea, coffee, beverages, and food culture.`;
}

// ============================================================
// REVIEW RESPONSE
// ============================================================

export function buildReviewResponsePrompt(params: {
  reviewText: string;
  rating: number | null;
  authorName: string;
  businessName: string;
  businessCategory: string;
  sentiment: string | null;
  tone: string;
  customInstructions?: string;
}): string {
  const ratingContext = params.rating
    ? `This is a ${params.rating}-star review.`
    : 'This review has no star rating.';

  return `Write a ${params.tone} response to this customer review for "${params.businessName}" (a ${params.businessCategory}).

${ratingContext}
Customer name: ${params.authorName}
Review: "${params.reviewText}"
Detected sentiment: ${params.sentiment || 'unknown'}
${params.customInstructions ? `Special instructions: ${params.customInstructions}` : ''}

Guidelines:
- Address the customer by name
- Reference specific points from their review
- ${params.rating && params.rating >= 4 ? 'Express genuine gratitude and invite them back' : ''}
- ${params.rating && params.rating <= 2 ? 'Acknowledge their concern, apologize sincerely, and offer to make it right' : ''}
- ${!params.rating || (params.rating > 2 && params.rating < 4) ? 'Thank them for their feedback and address any concerns' : ''}
- Keep it 50-150 words
- Sound human, not templated
- Include a warm sign-off`;
}

// ============================================================
// TREND ANALYSIS
// ============================================================

export function buildTrendAnalysisPrompt(params: {
  category: string;
  platform?: string;
}): string {
  return `Analyze current social media trends in the ${params.category} industry${params.platform ? ` on ${params.platform}` : ''}.

Identify the top 15-20 trending topics, hashtags, and content themes.

For each trend, provide:
- keyword: the main topic/keyword
- estimatedVolume: estimated post count (number)
- growthRate: growth rate as decimal (e.g., 0.25 = 25% growth)
- avgEngagement: typical engagement rate for this topic (percentage)
- platforms: array of platforms where trending
- relatedHashtags: array of related hashtag strings (without #)
- sampleContent: array of 2-3 content idea descriptions

Focus on:
- Seasonal beverage trends
- Viral drink recipes or challenges
- Emerging ingredients or preparation methods
- Sustainability and health trends
- Cultural moments relevant to beverages

Format as JSON: { "trends": [ ... ] }`;
}

// ============================================================
// CAPTION REFINEMENT
// ============================================================

export function buildCaptionRefinementPrompt(
  originalCaption: string,
  feedback: string,
  context: { businessName: string; businessCategory: string }
): string {
  return `Refine this social media caption based on the feedback.

Business: ${context.businessName} (${context.businessCategory})
Original caption: "${originalCaption}"
Feedback: "${feedback}"

Provide 3 refined versions, each with a different approach to addressing the feedback.
Keep the core message intact while incorporating the requested changes.`;
}

// ============================================================
// CONTENT IDEATION
// ============================================================

export function buildContentIdeationPrompt(params: {
  businessName: string;
  businessCategory: string;
  currentTrends?: string[];
  recentContent?: string[];
}): string {
  return `Generate 10 content ideas for "${params.businessName}", a ${params.businessCategory}.

${params.currentTrends?.length ? `Current trends to leverage: ${params.currentTrends.join(', ')}` : ''}
${params.recentContent?.length ? `Recent content to avoid repeating: ${params.recentContent.join(', ')}` : ''}

For each idea, provide:
- title: catchy title
- type: caption | image | video | carousel | story
- description: 2-3 sentence description
- hooks: 2 attention-grabbing opening lines
- bestTime: optimal posting time suggestion

Mix content types. Include:
- 3 educational/fun facts
- 3 behind-the-scenes/brand story
- 2 promotional/seasonal
- 2 user-generated/community

Format as JSON: { "ideas": [ ... ] }`;
}
