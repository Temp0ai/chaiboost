export const TEA_HASHTAGS = {
  general: [
    '#tea', '#tealovers', '#teatime', '#tealife', '#tealover',
    '#teacommunity', '#teaporn', '#teaholic', '#teasommelier', '#instat',
  ],
  bubble_tea: [
    '#boba', '#bubbletea', '#bobatea', '#bobalife', '#bobaaddict',
    '#bubbletealover', '#bobamilk', '#bobatime', '#tapioca', '#bobafoodis',
    '#milktealover', '#bobatealovers',
  ],
  matcha: [
    '#matcha', '#matchalover', '#matchalatte', '#matchatea', '#matchagreent',
    '#matchapowder', '#matchalife', '#ceremonialmatcha', '#matchaespresso',
    '#matcharecipe',
  ],
  coffee: [
    '#coffee', '#coffeelover', '#coffeetime', '#coffeelife', '#coffeeaddict',
    '#specialtycoffee', '#coffeeshop', '#barista', '#coffeegram', '#lat',
    '#espresso', '#pourcoff',
  ],
  smoothie: [
    '#smoothie', '#smoothiebowl', '#smoothietime', '#healthysmoothie',
    '#fruitjuice', '#juicebar', '#juicecleanse', '#freshjuice',
    '#superfoods', '#healthyeating',
  ],
  kombucha: [
    '#kombucha', '#kombuchalover', '#kombuchatea', '#fermented',
    '#fermentedtea', '#guthealth', '#probiotics', '#kombuchalife',
    '#homebrew', '#kombuchabrewing',
  ],
  seasonal: {
    spring: ['#springtea', '#springvibes', '#floraltea', '#jasmine', '#cherryblossomtea'],
    summer: ['#icedtea', '#summerdrinks', '#colddrink', '#refreshing', '#summervibes'],
    autumn: ['#autumntea', '#chai', '#pumpkinspice', '#cozydrinks', '#fallvibes'],
    winter: ['#hotchocolate', '#warmdrinks', '#wintertea', '#cozy', '#holidaydrinks'],
  },
  engagement: [
    '#smallbusiness', '#supportlocal', '#shoplocal', '#localbusiness',
    '#handcrafted', '#madeinlocal', '#sustainable', '#ecofriendly',
    '#organic', '#fairtrade',
  ],
} as const;

export const CURRENT_SEASON_HASHTAGS: Record<string, string[]> = {
  spring: TEA_HASHTAGS.seasonal.spring,
  summer: TEA_HASHTAGS.seasonal.summer,
  autumn: TEA_HASHTAGS.seasonal.autumn,
  winter: TEA_HASHTAGS.seasonal.winter,
};

export function getSeasonHashtags(): string[] {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return [...TEA_HASHTAGS.seasonal.spring];
  if (month >= 5 && month <= 7) return [...TEA_HASHTAGS.seasonal.summer];
  if (month >= 8 && month <= 10) return [...TEA_HASHTAGS.seasonal.autumn];
  return [...TEA_HASHTAGS.seasonal.winter];
}

export function getHashtagsForCategory(category: string): string[] {
  const map: Record<string, readonly string[]> = {
    tea_shop: TEA_HASHTAGS.general,
    bubble_tea: TEA_HASHTAGS.bubble_tea,
    coffee_house: TEA_HASHTAGS.coffee,
    juice_bar: TEA_HASHTAGS.smoothie,
    smoothie_shop: TEA_HASHTAGS.smoothie,
    matcha_bar: TEA_HASHTAGS.matcha,
    kombucha: TEA_HASHTAGS.kombucha,
  };
  return [...(map[category] || TEA_HASHTAGS.general)];
}
