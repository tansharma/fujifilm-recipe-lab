const PRESET_RECIPES = {
  "m10-rich": {
    title: "M10 High Contrast",
    style: "Preset recipe",
    film: "Classic Chrome",
    dr: "DR100",
    wb: "R: -1, B: -2",
    high: "-1",
    shad: "+4",
    color: "+2",
    sharp: "+1",
    nr: "-4",
    grain: "Weak",
    chrome_blue: "Off",
    tip: "Perfect for London architecture. Deepens blacks in Victorian brickwork while maintaining detail in shadows. Use during golden hour for dramatic micro-contrast on textures.",
    compatibility: ["x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["high-contrast", "architecture", "warm", "moody"],
    annotations: {
      shad: "Crushed blacks — the inky shadow base of the Leica M look",
      high: "Smooth roll-off preserves highlight latitude in brick and stone textures",
      nr: "Organic noise floor retained — the −4 rule applies to all film looks"
    }
  },
  "m10-monochrome": {
    title: "M10 Monochrome",
    style: "Preset recipe",
    film: "Acros (Std)",
    dr: "DR100",
    wb: "N/A",
    high: "+2",
    shad: "+4",
    color: "N/A",
    sharp: "+2",
    nr: "-4",
    grain: "Strong",
    chrome_blue: "Off",
    tip: "Street photography essential. The strong grain mimics classic Leica film. Ideal for high-contrast scenes with decisive moments.",
    compatibility: ["x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["black-and-white", "street", "high-contrast", "grain"],
    annotations: {
      film: "Acros's orthochromatic-like response deepens skies and separates tonal zones",
      shad: "Crushed blacks — inky shadow foundation of the Leica Monochrom look",
      grain: "Coarse halide grain mimics fast Tri-X film pushed in low light"
    }
  },
  "m10-street": {
    title: "M10 Street Night",
    style: "Preset recipe",
    film: "PRO Neg. Hi",
    dr: "DR200",
    wb: "R: 0, B: +2",
    high: "-1",
    shad: "+3",
    color: "+1",
    sharp: "+1",
    nr: "-4",
    grain: "None",
    chrome_blue: "Weak",
    tip: "Night scene specialist. The cool WB shift enhances neon and tungsten mood. Extended DR200 recovers blown highlights.",
    compatibility: ["x-trans-2", "x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["night", "cool", "street", "extended-range"],
    annotations: {
      wb: "Cool B shift enhances neon and tungsten — modern street colour rendering",
      chrome_blue: "Cyan accent in highlights adds Ektachrome sky quality to night scenes",
      dr: "Extended range recovers blown streetlights without lifting shadows"
    }
  },
  "classic-heritage": {
    title: "The Leitz (Natural)",
    style: "Preset recipe",
    film: "Provia",
    dr: "DR200",
    wb: "R: +1, B: -1",
    high: "-1",
    shad: "+1",
    color: "-1",
    sharp: "+2",
    nr: "-4",
    grain: "None",
    chrome_blue: "Off",
    tip: "Timeless elegance for color work. Warm, natural rendition with just enough contrast. Perfect for environmental portraits and documentary work.",
    compatibility: ["x-trans-2", "x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["natural", "portrait", "warm", "documentary"],
    annotations: {
      color: "Slight desaturation for documentary restraint — the Leica natural palette",
      sharp: "Micro-contrast sharpness without halation — Summicron clinical rendering",
      high: "Soft highlight roll-off for portrait headroom — film latitude over digital clipping"
    }
  },
  "vintage-summicron": {
    title: "Vintage Summicron",
    style: "Preset recipe",
    film: "Astia",
    dr: "DR400",
    wb: "R: +3, B: -3",
    high: "-2",
    shad: "0",
    color: "+1",
    sharp: "-1",
    nr: "-4",
    grain: "Weak",
    chrome_blue: "Off",
    tip: "Golden-age Leica aesthetic. The warm WB shift evokes 1970s character. Extended DR400 and muted saturation for vintage rendering.",
    compatibility: ["x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["vintage", "warm", "saturated", "extended-range"],
    annotations: {
      wb: "Strong warm shift evokes the Leica CCD glow — Kodachrome's paper-white warmth",
      sharp: "Slight softness evokes vintage Elmar / Elmarit rendering — controlled diffusion",
      dr: "DR400 replicates vintage film's wide exposure latitude in contrasty scenes"
    }
  },
  "gritty-reporter": {
    title: "M-Reporter (Gritty)",
    style: "Preset recipe",
    film: "Classic Chrome",
    dr: "DR400",
    wb: "R: 0, B: 0",
    high: "0",
    shad: "+2",
    color: "-2",
    sharp: "+1",
    nr: "-4",
    grain: "Strong",
    chrome_blue: "Off",
    tip: "Photojournalism character. Extended dynamic range and aggressive grain. Grips shadows without losing highlights. Desaturated color adds authenticity.",
    compatibility: ["x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["documentary", "grain", "desaturated", "extended-range"],
    annotations: {
      color: "Heavy desaturation — documentary restraint in the era of Cartier-Bresson",
      grain: "Aggressive grain — pushed Tri-X photojournalism texture",
      dr: "Extended range handles mixed-light press environments without blowing tungsten"
    }
  },
  "m6-sunny": {
    title: "M6 Sunny 16",
    style: "Preset recipe",
    film: "Velvia",
    dr: "DR200",
    wb: "R: 0, B: -1",
    high: "-1",
    shad: "+1",
    color: "+3",
    sharp: "+2",
    nr: "-4",
    grain: "None",
    chrome_blue: "Off",
    tip: "Inspired by the classic M6 + Velvia 50 pairing favoured by travel photographers. Bold, saturated colour with punchy contrast. Made for bright outdoor light.",
    compatibility: ["x-trans-2", "x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["travel", "landscape", "saturated", "outdoor"],
    annotations: {
      film: "Velvia simulation anchors the extreme colour science of the original slide film",
      color: "Punchy saturation matches Velvia 50's vibrant chromogenic rendering",
      sharp: "Clinical sharpness reinforces Velvia's natural acuity and detail separation"
    }
  },
  "mono-classic": {
    title: "M Monochrome (Classic)",
    style: "Preset recipe",
    film: "Monochrome (Std)",
    dr: "DR200",
    wb: "N/A",
    high: "0",
    shad: "+3",
    color: "N/A",
    sharp: "+2",
    nr: "-4",
    grain: "None",
    chrome_blue: "Off",
    tip: "A BW look accessible on every X-Trans generation. Punchy shadows with clean mid-tones — strong for street and documentary work without relying on Acros.",
    compatibility: ["x-trans-2", "x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["black-and-white", "street", "documentary", "classic"],
    annotations: {
      film: "Monochrome (Std) delivers Acros-like tonal control on all X-Trans generations",
      shad: "Shadow lift creates Leica street punch without requiring Acros",
      sharp: "High sharpness compensates for lower micro-contrast in base Monochrome mode"
    }
  }
};

const FILM_MATCH_RECIPES = {
  "portra-400": {
    title: "Portra 400 Match",
    style: "Film emulation: Portra 400",
    film: "Astia",
    dr: "DR400",
    wb: "R: +2, B: -1",
    high: "-1",
    shad: "+1",
    color: "+3",
    sharp: "+1",
    nr: "-4",
    grain: "Weak",
    chrome_blue: "Off",
    tip: "Portra 400's legendary skin tones and warm, saturated palette. Astia provides vibrant color science. WB shift mimics Portra's warmth.",
    compatibility: ["x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["portrait", "skin-tones", "warm", "saturated"],
    annotations: {
      dr: "DR400 replicates Portra's wide exposure latitude",
      grain: "Weak grain approximates Portra 400's fine, barely-visible halide structure",
      wb: "Warm R shift mimics Portra's characteristically golden skin rendering"
    }
  },
  "kodachrome-64": {
    title: "Kodachrome 64 Match",
    style: "Film emulation: Kodachrome 64",
    film: "Provia",
    dr: "DR200",
    wb: "R: +1, B: -2",
    high: "-2",
    shad: "+2",
    color: "+4",
    sharp: "+2",
    nr: "-3",
    grain: "None",
    chrome_blue: "Off",
    tip: "Kodachrome's ultra-saturated, rich color and legendary longevity. Provia delivers the punch and clarity.",
    compatibility: ["x-trans-2", "x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["saturated", "vibrant", "cool", "vintage-film"],
    annotations: {
      high: "Deep roll-off preserves Kodachrome's legendary overexposure headroom",
      color: "Maximum saturation matches Kodachrome 64's ultra-vivid slide rendering",
      nr: "NR −3 lets Provia's cleaner base render Kodachrome's grain-free sharpness"
    }
  },
  "tri-x-400": {
    title: "Tri-X 400 Match",
    style: "Film emulation: Tri-X 400 BW",
    film: "Acros (Std)",
    dr: "DR400",
    wb: "N/A",
    high: "-1",
    shad: "+4",
    color: "N/A",
    sharp: "+3",
    nr: "-4",
    grain: "Strong",
    chrome_blue: "Off",
    tip: "Tri-X's iconic grain structure and punchy contrast. Acros with strong grain recreates the film's character perfectly.",
    compatibility: ["x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["black-and-white", "grain", "high-contrast", "classic-film"],
    annotations: {
      film: "Acros's strong orthochromatic-like response mirrors Tri-X's tonal separation",
      shad: "Crushed blacks mirror Tri-X's aggressive shadow zone when pushed",
      grain: "Strong grain replicates Tri-X's coarse, energetic halide structure"
    }
  },
  "hp5-plus": {
    title: "HP5 Plus Match",
    style: "Film emulation: HP5 Plus",
    film: "Acros (Std)",
    dr: "DR200",
    wb: "N/A",
    high: "0",
    shad: "+3",
    color: "N/A",
    sharp: "+2",
    nr: "-4",
    grain: "Weak",
    chrome_blue: "Off",
    tip: "HP5's fine grain and pleasant tonality. Acros with weak grain delivers smooth gradation and balanced contrast.",
    compatibility: ["x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["black-and-white", "fine-grain", "balanced", "versatile"],
    annotations: {
      grain: "Weak grain matches HP5's fine-grained structure at box speed",
      shad: "Moderate shadow lift mirrors HP5's pleasant shadow detail retention",
      film: "Acros approximates HP5's smooth, full-range tonal gradation"
    }
  },
  "ektachrome-64": {
    title: "Ektachrome 64 Match",
    style: "Film emulation: Ektachrome 64",
    film: "Provia",
    dr: "DR200",
    wb: "R: -1, B: +1",
    high: "-1",
    shad: "+2",
    color: "+2",
    sharp: "+2",
    nr: "-4",
    grain: "None",
    chrome_blue: "Weak",
    tip: "Ektachrome's cool, saturated character and subtle blue cast. Provia delivers rich, contrasty slide film rendering.",
    compatibility: ["x-trans-2", "x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["saturated", "cool", "slide-film", "vibrant"],
    annotations: {
      chrome_blue: "Color Chrome FX Blue adds Ektachrome's characteristic cool cast in skies and water",
      wb: "Cool B shift reinforces Ektachrome's neutral-to-blue daylight balance",
      film: "Provia's slide-film contrast curve matches Ektachrome's clean midtone structure"
    }
  },
  "portra-160": {
    title: "Portra 160 NC Match",
    style: "Film emulation: Portra 160 NC",
    film: "Astia",
    dr: "DR400",
    wb: "R: +3, B: 0",
    high: "-1",
    shad: "+1",
    color: "+2",
    sharp: "+1",
    nr: "-3",
    grain: "None",
    chrome_blue: "Off",
    tip: "Portra 160 NC's warm, neutral-to-cool palette. Extended DR400 for exposure latitude. Clean, professional rendering.",
    compatibility: ["x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["portrait", "skin-tones", "exposure-latitude", "professional"],
    annotations: {
      dr: "DR400 replicates Portra 160 NC's extreme exposure latitude",
      nr: "NR −3 preserves Portra 160's very fine, nearly invisible grain structure",
      wb: "Strong warm R shift mimics Portra 160 NC's characteristic golden skin rendering"
    }
  },
  "velvia-50": {
    title: "Velvia 50 Match",
    style: "Film emulation: Velvia 50",
    film: "Velvia",
    dr: "DR200",
    wb: "R: 0, B: -2",
    high: "-2",
    shad: "+1",
    color: "+4",
    sharp: "+2",
    nr: "-4",
    grain: "None",
    chrome_blue: "Weak",
    tip: "The iconic slide film. Extreme saturation and punchy contrast made for bright daylight — landscapes, flora, and travel. Handle highlights carefully.",
    compatibility: ["x-trans-2", "x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["landscape", "saturated", "slide-film", "travel"],
    annotations: {
      color: "Maximum saturation — Velvia 50 is the reference for extreme chromogenic rendering",
      high: "Deep roll-off prevents overexposure in bright daylight — Velvia clips fast",
      chrome_blue: "Cyan accent completes Velvia's vivid sky and water rendering"
    }
  },
  "superia-400": {
    title: "Superia 400 Match",
    style: "Film emulation: Fujicolor Superia 400",
    film: "PRO Neg. Hi",
    dr: "DR200",
    wb: "R: +1, B: 0",
    high: "0",
    shad: "+2",
    color: "+1",
    sharp: "+1",
    nr: "-3",
    grain: "None",
    chrome_blue: "Off",
    tip: "The everyday colour neg. Slightly warm, honest rendering with natural contrast. Great for street, travel, and casual shooting — the anti-recipe recipe.",
    compatibility: ["x-trans-2", "x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["everyday", "street", "warm", "natural"],
    annotations: {
      film: "PRO Neg. Hi's elevated contrast curve matches Superia's daylight rendering",
      nr: "NR −3 preserves Superia 400's natural consumer-film grain structure",
      dr: "DR200 adds the exposure flexibility typical of everyday 400-speed colour negative"
    }
  },
  "pro-400h": {
    title: "Pro 400H Match",
    style: "Film emulation: Fujicolor Pro 400H",
    film: "Astia",
    dr: "DR400",
    wb: "R: +2, B: +1",
    high: "-2",
    shad: "0",
    color: "-1",
    sharp: "0",
    nr: "-3",
    grain: "Weak",
    chrome_blue: "Off",
    tip: "Pastel palette and flattering skin tones. Loved for portraits and weddings. Extended DR400 handles bright skies. The WB shift lifts shadows toward a cool-magenta cast.",
    compatibility: ["x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["portrait", "wedding", "pastel", "skin-tones"],
    annotations: {
      high: "Deep highlight roll-off matches Pro 400H's famous overexposure latitude",
      color: "Slight desaturation renders Pro 400H's refined pastel palette",
      wb: "Warm R + B lift mimics Pro 400H's cool-magenta shadow cast under overcast light"
    }
  },
  "delta-3200": {
    title: "Delta 3200 Match",
    style: "Film emulation: Ilford Delta 3200",
    film: "Acros (Std)",
    dr: "DR400",
    wb: "N/A",
    high: "-1",
    shad: "+4",
    color: "N/A",
    sharp: "+3",
    nr: "-4",
    grain: "Strong",
    chrome_blue: "Off",
    tip: "Pushed high-ISO grain texture. Acros with strong grain approximates Delta 3200's chunky, energetic structure. Built for low light, night, and gritty interiors.",
    compatibility: ["x-trans-3", "x-trans-4", "x-trans-5"],
    tags: ["black-and-white", "grain", "low-light", "night"],
    annotations: {
      film: "Acros's deep tonal range approximates Delta 3200's high-speed shadow quality",
      shad: "Crushed blacks mirror Delta 3200's extreme shadow compression at high ISO",
      grain: "Strong grain replicates Delta 3200's chunky, energetic halide structure"
    }
  }
};

const ALL_RECIPES = {
  ...PRESET_RECIPES,
  ...FILM_MATCH_RECIPES
};

const CAMERA_INFO = {
  "x-trans-2": {
    name: "X-Trans II (X-T1, X100T, X30)",
    limitations: {
      noAcros: true,
      noGrainEffect: true,
      noClarity: true,
      noColorChromeBlue: true,
      maxHighlight: 2,
      maxShadow: 2
    },
    drMinISO: { DR200: 400, DR400: 800 },
    warning: "X-Trans II has limited advanced settings. Some recipes may need adjustments."
  },
  "x-trans-3": {
    name: "X-Trans III (X-T2, X-Pro2, X100F)",
    limitations: {
      noColorChrome: true,
      noColorChromeBlue: true
    },
    drMinISO: { DR200: 400, DR400: 800 },
    warning: null
  },
  "x-trans-4": {
    name: "X-Trans IV (X-T4, X-S10, X-T3)",
    limitations: {},
    drMinISO: { DR200: 320, DR400: 640 },
    warning: null
  },
  "x-trans-5": {
    name: "X-Trans V (X-T5, X-H2, X100VI)",
    limitations: {},
    drMinISO: { DR200: 250, DR400: 500 },
    warning: null
  }
};

function getRecipeByKey(key) {
  return ALL_RECIPES[key] || null;
}

function getRecipesByCamera(cameraKey) {
  if (!cameraKey) return [];
  return Object.entries(ALL_RECIPES)
    .filter(([_, recipe]) => recipe.compatibility.includes(cameraKey))
    .map(([key, recipe]) => ({ ...recipe, key }));
}

function isRecipeCompatibleWithCamera(recipeKey, cameraKey) {
  if (!cameraKey) return false;
  const recipe = getRecipeByKey(recipeKey);
  if (!recipe) return false;
  return recipe.compatibility.includes(cameraKey);
}

function isRecipeFullyCompatible(recipeKey, cameraKey) {
  if (!cameraKey) return true;
  const recipe = getRecipeByKey(recipeKey);
  if (!recipe || !recipe.compatibility.includes(cameraKey)) return false;

  const limitations = CAMERA_INFO[cameraKey]?.limitations ?? {};

  if (limitations.noAcros && recipe.film.includes('Acros')) return false;
  if (limitations.noGrainEffect && recipe.grain !== 'None') return false;
  if (limitations.maxHighlight != null) {
    const val = parseInt(recipe.high, 10);
    if (!isNaN(val) && Math.abs(val) > limitations.maxHighlight) return false;
  }
  if (limitations.maxShadow != null) {
    const val = parseInt(recipe.shad, 10);
    if (!isNaN(val) && Math.abs(val) > limitations.maxShadow) return false;
  }
  if (limitations.noColorChromeBlue && recipe.chrome_blue !== 'Off') return false;

  return true;
}
