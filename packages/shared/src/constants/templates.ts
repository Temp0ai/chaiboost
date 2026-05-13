export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'caption' | 'image' | 'video' | 'carousel';
  promptTemplate: string;
  variables: string[];
  platforms: string[];
  exampleOutput: string;
}

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'new_product_launch',
    name: 'New Product Launch',
    description: 'Announce a new beverage or menu item',
    category: 'promotional',
    type: 'caption',
    promptTemplate:
      'Write an exciting social media caption announcing a new {product_name} at {business_name}. ' +
      'Highlight the key ingredients: {ingredients}. The tone should be {tone}. ' +
      'Include a call-to-action to visit the store. Keep it under 2200 characters.',
    variables: ['product_name', 'business_name', 'ingredients', 'tone'],
    platforms: ['instagram', 'google_my_business'],
    exampleOutput:
      '🍵 NEW DROP ALERT! Meet our Lavender Cloud Matcha — a dreamy blend of ceremonial-grade matcha, ' +
      'house-made lavender syrup, and silky oat milk foam. ☁️💜 Available starting this Friday! ' +
      'First 20 customers get a free cookie. 🍪 See you there! #NewDrink #MatchaLovers',
  },
  {
    id: 'behind_the_scenes',
    name: 'Behind the Scenes',
    description: 'Show the making process of your drinks',
    category: 'engagement',
    type: 'video',
    promptTemplate:
      'Create a video storyboard showing the behind-the-scenes process of making {drink_name} at {business_name}. ' +
      'Include {num_scenes} scenes. The vibe should be {vibe}. ' +
      'Each scene should have a description suitable for a short-form video.',
    variables: ['drink_name', 'business_name', 'num_scenes', 'vibe'],
    platforms: ['instagram'],
    exampleOutput: 'Scene 1: Close-up of hands scooping matcha powder...',
  },
  {
    id: 'customer_spotlight',
    name: 'Customer Spotlight',
    description: 'Feature a happy customer or review',
    category: 'social_proof',
    type: 'caption',
    promptTemplate:
      'Write a warm, appreciative social media post featuring this customer review: "{review_text}". ' +
      'The business is {business_name}, a {business_type}. ' +
      'Make it feel genuine and thank the customer. Tone: {tone}.',
    variables: ['review_text', 'business_name', 'business_type', 'tone'],
    platforms: ['instagram', 'google_my_business'],
    exampleOutput: 'We\'re blushing! 🥹 Thank you @tealover22 for the kind words...',
  },
  {
    id: 'seasonal_special',
    name: 'Seasonal Special',
    description: 'Promote a seasonal drink or offer',
    category: 'promotional',
    type: 'image',
    promptTemplate:
      'Generate a visually appealing image for a {season} special drink called "{drink_name}" ' +
      'at {business_name}. The drink contains {ingredients}. ' +
      'Style: {style}. Include the drink name text overlay.',
    variables: ['season', 'drink_name', 'business_name', 'ingredients', 'style'],
    platforms: ['instagram'],
    exampleOutput: '[Image of a warm spiced chai latte with cinnamon sticks and autumn leaves]',
  },
  {
    id: 'educational_tea_facts',
    name: 'Tea Facts',
    description: 'Share educational content about tea/beverages',
    category: 'educational',
    type: 'carousel',
    promptTemplate:
      'Create a {num_slides}-slide educational carousel about {topic}. ' +
      'Each slide should have a title, 2-3 sentences of content, and a visual suggestion. ' +
      'The tone should be {tone}. End with a slide about {business_name}.',
    variables: ['num_slides', 'topic', 'tone', 'business_name'],
    platforms: ['instagram'],
    exampleOutput: 'Slide 1: "Did you know? Matcha has 137x more antioxidants than regular green tea..."',
  },
  {
    id: 'weekly_special',
    name: 'Weekly Special',
    description: 'Announce this week\'s featured drink',
    category: 'promotional',
    type: 'caption',
    promptTemplate:
      'Write a caption announcing the weekly special at {business_name}: {special_name}. ' +
      'Price: {price}. Available from {start_day} to {end_day}. ' +
      'Make it sound irresistible. Tone: {tone}. Include relevant hashtags.',
    variables: ['business_name', 'special_name', 'price', 'start_day', 'end_day', 'tone'],
    platforms: ['instagram', 'google_my_business'],
    exampleOutput: '✨ THIS WEEK ONLY ✨ Our Brown Sugar Boba Milk Tea is just $4.99!',
  },
  {
    id: 'review_response',
    name: 'Review Response',
    description: 'Generate a response to a customer review',
    category: 'engagement',
    type: 'caption',
    promptTemplate:
      'Write a {tone} response to this {rating}-star review from {reviewer_name}: ' +
      '"{review_text}". The business is {business_name}. ' +
      'Be authentic, address specific points, and invite them back.',
    variables: ['tone', 'rating', 'reviewer_name', 'review_text', 'business_name'],
    platforms: ['google_my_business'],
    exampleOutput: 'Thank you so much, Sarah! We\'re thrilled you loved our ceremonial matcha...',
  },
];

export function getTemplatesByCategory(category: string): ContentTemplate[] {
  return CONTENT_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplatesByType(type: string): ContentTemplate[] {
  return CONTENT_TEMPLATES.filter((t) => t.type === type);
}
