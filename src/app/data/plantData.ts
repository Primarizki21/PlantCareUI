// Plant data for Indonesian crops — Leaf Health Assessment System

export interface PlantInfo {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  icon: string;
  description: string;
  leafCharacteristics: string[];
  growingEnvironment: string;
  // Detail page sections
  overview: string;
  classification: {
    kingdom: string;
    family: string;
    genus: string;
    species: string;
  };
  growthRequirements: {
    soil: string;
    water: string;
    temperature: string;
    sunlight: string;
  };
  environmentalConditions: string;
  healthyLeafAppearance: string[];
  unhealthyLeafSigns: string[];
  leafHealthAssessmentInfo: string;
  bestPractices: string[];
}

// Keep Disease interface for backward compat with other pages that may use it
export interface Disease {
  id: string;
  name: string;
  plantType: string;
  description: string;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  prevention: string[];
  severity: "Low" | "Medium" | "High" | "Critical";
  affectedArea: string;
}

// Legacy Plant type for pages not yet migrated
export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  commonDiseases: string[];
  description: string;
  icon: string;
}

export const plantInfoList: PlantInfo[] = [
  {
    id: "rice",
    name: "Rice",
    scientificName: "Oryza sativa",
    category: "Cereal",
    icon: "🌾",
    description: "Indonesia's staple crop, cultivated in flooded paddy fields across the archipelago. Rice leaves are narrow and flat, making patch assessment straightforward.",
    leafCharacteristics: ["Narrow linear blades, 20–40 cm long", "Smooth upper surface with fine hairs beneath", "Pale to deep green depending on nitrogen levels"],
    growingEnvironment: "Flooded lowland paddies, upland terraces; tropical humid climate with 25–35 °C temperatures",
    overview: "Rice (Oryza sativa) is the primary staple food crop of Indonesia, covering more than 8 million hectares of farmland. Its leaves are a key indicator of overall plant health — a consistent deep-green color and turgid blade signal optimal growing conditions, while pale, spotted, or wilting patches indicate stress or infection.",
    classification: {
      kingdom: "Plantae",
      family: "Poaceae",
      genus: "Oryza",
      species: "O. sativa",
    },
    growthRequirements: {
      soil: "Clay to loam, pH 5.5–7.0, waterlogged during vegetative stage",
      water: "Flooded 5–10 cm during tillering; maintained moisture at grain fill",
      temperature: "25–35 °C optimal; sensitive to cold below 15 °C",
      sunlight: "Full sun, minimum 6 hours direct light per day",
    },
    environmentalConditions: "Rice thrives in tropical humid climates with high rainfall (1,500–2,000 mm/year). It requires alternating wet and dry phases throughout its 100–150 day growth cycle. The Indonesian archipelago's monsoon pattern provides ideal seasonal conditions.",
    healthyLeafAppearance: [
      "Uniform deep-green or bright-green color across the entire blade",
      "Firm, upright posture with no drooping or curling",
      "Smooth surface without spots, streaks, or lesions",
      "Continuous green from base to tip with no yellowing margin",
    ],
    unhealthyLeafSigns: [
      "Yellow-orange streaks or spots (blast, bacterial blight)",
      "Brown lesions with gray centers or water-soaked margins",
      "Pale yellow or white discoloration along leaf edges",
      "Wilting or rolling of leaf blades during the day",
      "Dark brown to black patches spreading across the lamina",
    ],
    leafHealthAssessmentInfo: "The AI system analyzes individual leaf patches detected in uploaded images and classifies each patch as Healthy or Unhealthy. The leaf health percentage reflects the proportion of healthy patch area relative to total leaf area, while the severity level (Mild / Moderate / Severe) is inferred from the extent and distribution of unhealthy patches.",
    bestPractices: [
      "Apply nitrogen in split doses to maintain consistent leaf color",
      "Monitor water depth weekly to prevent anaerobic root stress",
      "Remove infected leaf material promptly to limit spread",
      "Rotate with legume crops each season to reduce soil pathogen load",
      "Use certified, disease-tolerant seed varieties",
    ],
  },
  {
    id: "maize",
    name: "Maize",
    scientificName: "Zea mays",
    category: "Cereal",
    icon: "🌽",
    description: "The second-largest cereal crop in Indonesia, grown for food, feed, and industrial starch. Maize has broad, strap-like leaves that make visual patch assessment easy.",
    leafCharacteristics: ["Broad, flat blades 60–90 cm long and 5–10 cm wide", "Wavy leaf margin with prominent midrib", "Glossy green surface, lighter beneath"],
    growingEnvironment: "Well-drained upland soils; dryland and irrigated systems across Java, Sulawesi, and East Nusa Tenggara",
    overview: "Maize (Zea mays) is a versatile cereal cultivated extensively across the Indonesian outer islands. Its broad leaves are among the easiest to photograph for health assessment, and their size means unhealthy patches are visually prominent at early stages.",
    classification: {
      kingdom: "Plantae",
      family: "Poaceae",
      genus: "Zea",
      species: "Z. mays",
    },
    growthRequirements: {
      soil: "Well-drained loam to sandy loam, pH 5.8–7.0",
      water: "500–800 mm during growing season; drought-sensitive at silking",
      temperature: "20–30 °C; killed by frost",
      sunlight: "Full sun, 8+ hours preferred",
    },
    environmentalConditions: "Maize adapts to diverse rainfall patterns but is intolerant of waterlogging. It grows best at altitudes below 1,000 m in Indonesia's lowland and mid-elevation areas, where the dry season provides good grain-fill conditions.",
    healthyLeafAppearance: [
      "Vibrant mid-green with a slight waxy sheen",
      "Broad, flat blade held at 45° from the stem",
      "Continuous color from midrib to leaf margin",
      "No visible lesions, spots, or discoloration",
    ],
    unhealthyLeafSigns: [
      "Tan, cigar-shaped lesions with wavy margins (northern leaf blight)",
      "Small, circular tan spots with dark borders (gray leaf spot)",
      "Orange pustules or streaks (common rust)",
      "Yellowing beginning at leaf tip and progressing inward",
      "Water-soaked, greasy-looking streaks that later turn brown",
    ],
    leafHealthAssessmentInfo: "The AI patch classifier evaluates the proportion of each uploaded maize leaf that shows normal healthy tissue versus discolored or lesion-bearing patches, returning a percentage score and severity classification.",
    bestPractices: [
      "Plant resistant hybrids suited to local climate zones",
      "Ensure adequate spacing (70 × 20 cm) to improve air circulation",
      "Scout fields every 7–10 days during vegetative stages",
      "Apply foliar potassium to strengthen cell walls against fungal entry",
      "Rotate with legumes such as soybean every 2 seasons",
    ],
  },
  {
    id: "oil-palm",
    name: "Oil Palm",
    scientificName: "Elaeis guineensis",
    category: "Plantation",
    icon: "🌴",
    description: "Indonesia's most economically significant plantation crop, covering over 16 million hectares. Palm fronds are pinnately compound with dozens of leaflets per frond.",
    leafCharacteristics: ["Pinnate fronds 5–8 m long with 200–300 leaflets", "Leaflets lanceolate, 60–120 cm long, mid-green", "Stiff rachis with prominent spines at the base"],
    growingEnvironment: "Humid equatorial lowlands below 500 m elevation, high rainfall (2,000–2,500 mm/year), Sumatra and Kalimantan",
    overview: "The African oil palm dominates Indonesian plantation agriculture. Leaf health in oil palm is critical because photosynthetic efficiency directly impacts fruit bunch yield. Patch assessment focuses on individual leaflets photographed from mid-canopy fronds.",
    classification: {
      kingdom: "Plantae",
      family: "Arecaceae",
      genus: "Elaeis",
      species: "E. guineensis",
    },
    growthRequirements: {
      soil: "Deep, well-drained loam or alluvial, pH 4.0–6.0; tolerates slightly acidic peat",
      water: "2,000–2,500 mm/year with no dry month below 100 mm",
      temperature: "24–28 °C optimal; sensitive to temperatures below 15 °C",
      sunlight: "Full sun, no shade tolerance in mature palms",
    },
    environmentalConditions: "Oil palm thrives in the consistently humid equatorial belt of Sumatra and Kalimantan. It requires minimal seasonal variation in temperature and rainfall, making it uniquely suited to Indonesia's peatland and mineral-soil lowlands.",
    healthyLeafAppearance: [
      "Deep, uniform green leaflets with no chlorotic spotting",
      "Firm, flat lamina held horizontally from the rachis",
      "Smooth surface with visible parallel venation",
      "Waxy cuticle that repels water droplets",
    ],
    unhealthyLeafSigns: [
      "Yellow-orange or necrotic tips on leaflets (frond rot, nutrient deficiency)",
      "Dark brown or black lesions progressing from the margin inward",
      "Pale yellow-green interveinal chlorosis (magnesium or iron deficiency)",
      "Small circular spots with brown halos (Pestalotiopsis leafspot)",
      "Leaflet withering and browning while still attached to the frond",
    ],
    leafHealthAssessmentInfo: "For oil palm, the system analyzes individual leaflet images rather than whole fronds. Each leaflet patch is classified, producing a health percentage that correlates with estimated photosynthetic capacity and flags potential nutrient or pathogen issues.",
    bestPractices: [
      "Conduct frond sampling every 6 months for nutrient analysis",
      "Apply magnesium and boron as per leaf tissue test results",
      "Prune old fronds at the correct angle to prevent trunk damage",
      "Maintain legume ground cover to reduce soil erosion and splash dispersal",
      "Use IPM strategies for bagworm and nettle caterpillar management",
    ],
  },
  {
    id: "coffee",
    name: "Coffee",
    scientificName: "Coffea arabica",
    category: "Plantation",
    icon: "☕",
    description: "A high-value plantation crop grown in Indonesian highland regions. Coffee leaves are elliptical and glossy, and their condition directly influences cherry yield.",
    leafCharacteristics: ["Elliptical, glossy dark-green leaves, 10–15 cm long", "Opposite leaf arrangement on branches", "Prominent midrib and secondary veins, wavy margins"],
    growingEnvironment: "Highland areas 800–1,800 m elevation, moderate temperatures 18–24 °C, Aceh, Toraja, and Flores regions",
    overview: "Coffea arabica is grown on over 1 million hectares across Indonesian highlands, prized for its bright acidity and complex flavor. Leaf rust (Hemileia vastatrix) is the most destructive foliar pathogen, and early patch detection can save entire harvests.",
    classification: {
      kingdom: "Plantae",
      family: "Rubiaceae",
      genus: "Coffea",
      species: "C. arabica",
    },
    growthRequirements: {
      soil: "Deep, well-drained loam to clay-loam, rich in organic matter, pH 6.0–6.5",
      water: "1,500–2,500 mm/year with a distinct dry season of 2–3 months",
      temperature: "18–24 °C; frost kills plants",
      sunlight: "Partial shade (30–40% shade cover) to full sun in some cultivars",
    },
    environmentalConditions: "Arabica coffee performs best in the cool, misty highlands of Aceh, North Sumatra, Toraja, and Flores. The altitude moderates temperature and humidity, creating conditions that slow cherry maturation and develop complex cup profiles.",
    healthyLeafAppearance: [
      "Deep, lustrous dark green with a leathery texture",
      "Symmetrical leaf shape with smooth, undulating margins",
      "Visible venation without any chlorotic areas between veins",
      "Firm posture; does not droop or curl under normal conditions",
    ],
    unhealthyLeafSigns: [
      "Pale yellow spots on upper surface with orange powdery spores beneath (leaf rust)",
      "Dark brown circular lesions with a pale halo (brown eye spot)",
      "Interveinal yellowing progressing to bleaching (iron or zinc deficiency)",
      "Necrotic tips and margins with a scorched appearance",
      "Distorted or cupped leaves with irregular green and pale mosaic (coffee ringspot virus)",
    ],
    leafHealthAssessmentInfo: "Coffee leaf rust produces very characteristic orange spore masses on the abaxial (lower) leaf surface. The AI system is trained to detect rust patches from both leaf surfaces. Health percentage reflects healthy green tissue relative to affected area.",
    bestPractices: [
      "Apply copper-based fungicides preventively at the onset of rainy season",
      "Maintain 30–40% shade cover to reduce humidity on leaf surfaces",
      "Prune suckers and crossing branches for better canopy air flow",
      "Harvest ripe cherries promptly to reduce inoculum from overripe fruit",
      "Test soil annually and amend with lime if pH drops below 5.8",
    ],
  },
  {
    id: "cocoa",
    name: "Cocoa",
    scientificName: "Theobroma cacao",
    category: "Plantation",
    icon: "🍫",
    description: "A shade-loving plantation tree cultivated for its pods. Cocoa leaves are large and hang at a distinctive angle, making them ideal for image-based health assessment.",
    leafCharacteristics: ["Large ovate leaves, 20–35 cm long, hanging downward at 60–90°", "Glossy dark green adaxial surface, paler beneath", "New flushes emerge red or bronze before maturing to green"],
    growingEnvironment: "Humid tropical lowlands below 600 m elevation, 2,000+ mm rainfall, Sulawesi and Papua are major production zones",
    overview: "Theobroma cacao is a forest understory tree that thrives under the protective shade of larger trees. Indonesia is the world's third-largest cocoa producer, with Sulawesi accounting for over 60% of production. Phytophthora pod rot and vascular-streak dieback are key threats detectable through leaf health monitoring.",
    classification: {
      kingdom: "Plantae",
      family: "Malvaceae",
      genus: "Theobroma",
      species: "T. cacao",
    },
    growthRequirements: {
      soil: "Deep, friable, well-drained clay-loam, pH 6.0–7.5, high organic matter",
      water: "1,500–2,000 mm/year; short dry spells of 2–3 months tolerated",
      temperature: "21–32 °C; cannot tolerate cold",
      sunlight: "30–50% shade, especially for young trees",
    },
    environmentalConditions: "Cocoa requires a stable humid environment with minimal temperature fluctuation. It is grown under the canopy of Gliricidia or banana shade trees in agroforestry systems across Central Sulawesi, providing both microclimate regulation and biodiversity benefits.",
    healthyLeafAppearance: [
      "Uniform dark green with a glossy, waxy surface",
      "Mature leaves hang at 60–90° with no wilting or rolling",
      "Smooth lamina with no spots, pustules, or necrotic areas",
      "New flush leaves bright red-bronze, transitioning evenly to green",
    ],
    unhealthyLeafSigns: [
      "Water-soaked, dark patches spreading rapidly on young leaves (Phytophthora)",
      "Green or brown streak-like discoloration following veins (vascular-streak dieback)",
      "White or gray powdery coating on young leaf surfaces (powdery mildew)",
      "Circular pale spots with dark borders (Colletotrichum anthracnose)",
      "Premature leaf yellowing and abscission before end of life cycle",
    ],
    leafHealthAssessmentInfo: "Cocoa leaf health assessment focuses on detecting early-stage foliar symptoms before they progress to stem or pod damage. The AI model is particularly sensitive to water-soaked patterns and streak discoloration typical of Phytophthora and vascular-streak dieback.",
    bestPractices: [
      "Maintain proper shade levels to reduce heat stress and fungal humidity",
      "Prune for an open canopy that allows light penetration and air movement",
      "Remove and burn diseased pods and branches immediately",
      "Apply phosphonate systemic fungicides during high-humidity months",
      "Rehabilitate old, unproductive trees by grafting with improved clones",
    ],
  },
  {
    id: "coconut",
    name: "Coconut",
    scientificName: "Cocos nucifera",
    category: "Plantation",
    icon: "🥥",
    description: "Indonesia's most widely distributed plantation palm, grown coastally and inland for copra, oil, and fresh consumption. Frond leaflets are easily photographed.",
    leafCharacteristics: ["Pinnate fronds 4–6 m long with 200–250 leaflets", "Linear-lanceolate leaflets 50–90 cm long, deep green", "Stiff midrib with slightly arching leaflet posture"],
    growingEnvironment: "Coastal lowlands and inland plains below 400 m, tolerant of sandy soils and saline conditions, throughout the archipelago",
    overview: "Cocos nucifera is Indonesia's most geographically widespread plantation crop, present on virtually every island. It is a symbol of agricultural biodiversity and provides livelihoods for smallholder farmers across 3.4 million hectares. Lethal yellowing and cadang-cadang disease are critical threats detectable through early leaf monitoring.",
    classification: {
      kingdom: "Plantae",
      family: "Arecaceae",
      genus: "Cocos",
      species: "C. nucifera",
    },
    growthRequirements: {
      soil: "Sandy to loamy, well-drained, pH 5.0–8.0; salt-tolerant",
      water: "1,000–2,500 mm/year; drought-tolerant once established",
      temperature: "20–32 °C; damaged by temperatures below 12 °C",
      sunlight: "Full sun, no shade tolerance in mature palms",
    },
    environmentalConditions: "Coconut palms are uniquely adapted to coastal environments, tolerating salt spray, sandy soils, and fluctuating water tables. Their wide distribution across the Indonesian archipelago reflects this remarkable adaptability.",
    healthyLeafAppearance: [
      "Bright to deep green leaflets with a firm, arching posture",
      "Smooth lamina surface with parallel venation, no visible spots",
      "Consistent color from base to tip of each leaflet",
      "New spear leaves emerge tightly rolled then open progressively green",
    ],
    unhealthyLeafSigns: [
      "Progressive yellowing of older fronds moving upward (lethal yellowing phytoplasma)",
      "Small, round to oval brown spots on leaflet surfaces (leaf spot fungi)",
      "Leaflet tips browning and dying back from the margin",
      "Bronzing or reddish discoloration of young leaflets (boron deficiency)",
      "Scattered yellow-green mottle pattern (cadang-cadang viroid in early stage)",
    ],
    leafHealthAssessmentInfo: "For coconut, leaf patches from mid-canopy fronds (fronds 9–14 counting from the top) are most representative of current plant health status. The AI system classifies patches per leaflet and provides a canopy-level health estimate.",
    bestPractices: [
      "Conduct regular scouting for leaf miners and rhinoceros beetle damage",
      "Apply potassium chloride fertilizer to improve drought and disease resistance",
      "Remove skirt fronds (dead fronds) to eliminate beetle breeding habitat",
      "Use boron micronutrient spray if bronzing symptoms appear on young fronds",
      "Implement phytoplasma vector control (leafhopper) with appropriate insecticides",
    ],
  },
  {
    id: "banana",
    name: "Banana",
    scientificName: "Musa acuminata",
    category: "Fruit",
    icon: "🍌",
    description: "A tropical fruit plant with enormous paddle-shaped leaves, widely grown across Indonesian smallholder farms and estates for fresh fruit and cooking.",
    leafCharacteristics: ["Very large oblong blades, 1.5–3 m long and 30–60 cm wide", "Smooth, waxy surface with pale midrib and parallel secondary veins", "Mid-green to dark green; often develops reddish edges under stress"],
    growingEnvironment: "Humid tropical zones from sea level to 1,600 m, well-drained loam, high rainfall throughout Java, Sumatra, and Papua",
    overview: "Musa acuminata and its hybrids are the most widely consumed fruits in Indonesia. Banana plants are monocots that regrow from rhizomes, and their large leaf area makes them sensitive indicators of soil fertility, water stress, and foliar pathogens such as Sigatoka (Mycosphaerella) and banana Xanthomonas wilt.",
    classification: {
      kingdom: "Plantae",
      family: "Musaceae",
      genus: "Musa",
      species: "M. acuminata",
    },
    growthRequirements: {
      soil: "Deep, well-drained loam to clay-loam, pH 5.5–7.0, high organic matter",
      water: "1,500–2,500 mm/year; waterlogging damages rhizomes",
      temperature: "22–30 °C; chilling injury below 14 °C",
      sunlight: "Full sun to partial shade; minimum 6 hours direct sunlight",
    },
    environmentalConditions: "Bananas thrive in humid, warm environments with consistent rainfall and shelter from strong wind. In Indonesia they are intercropped with cocoa, cassava, and vegetables, providing shade and additional income for smallholders.",
    healthyLeafAppearance: [
      "Bright green, smooth, and slightly waxy upper surface",
      "Pale green undersurface with clear midrib and prominent lateral veins",
      "Intact, non-tattered blade edges held horizontal to slightly declining",
      "No spots, streaks, or chlorotic patches on the lamina",
    ],
    unhealthyLeafSigns: [
      "Yellow streaks developing into brown necrotic stripes (yellow Sigatoka)",
      "Dark brown spots with yellow halos spreading across the lamina (black Sigatoka)",
      "Yellow-green mottling with interveinal chlorosis (Panama wilt vascular symptoms)",
      "Water-soaked marginal yellowing progressing inward (bacterial Xanthomonas wilt)",
      "Tattered edges due to wind, but interior patches discolored is pathogen-related",
    ],
    leafHealthAssessmentInfo: "Banana leaves are large enough that a single photograph can capture multiple distinct patches. The AI scores each patch region separately, then aggregates to a whole-leaf health percentage, which directly correlates with photosynthetic efficiency and predicted yield.",
    bestPractices: [
      "Remove diseased leaves at the base with a clean, disinfected blade",
      "Ensure adequate plant spacing (2.5 × 2.5 m) to reduce canopy humidity",
      "Apply potassium and magnesium fertilizer for robust leaf tissue",
      "Use tissue-cultured, certified disease-free planting material",
      "De-bunch and de-hand at correct timing to focus plant energy on healthy leaves",
    ],
  },
  {
    id: "mango",
    name: "Mango",
    scientificName: "Mangifera indica",
    category: "Fruit",
    icon: "🥭",
    description: "A beloved tropical fruit tree with leathery, lance-shaped leaves grown across the Indonesian lowlands. Young flushing leaves are bronze-red and highly susceptible to anthracnose.",
    leafCharacteristics: ["Narrow, lanceolate leaves 25–40 cm long, leathery texture", "Dark green and glossy above, paler beneath with prominent midrib", "Young leaves bronze-red to purple-green before maturing"],
    growingEnvironment: "Dry to semi-arid lowland tropics below 600 m, seasonal climate with distinct dry period triggering flowering, Java, Nusa Tenggara",
    overview: "Mangifera indica is cultivated throughout Indonesia's lowland dry-zone areas, prized for premium fruit varieties such as Harum Manis, Gedong Gincu, and Manalagi. Leaf health is critical during flush periods, as Colletotrichum gloeosporioides (anthracnose) can devastate new growth and subsequently affect fruit set.",
    classification: {
      kingdom: "Plantae",
      family: "Anacardiaceae",
      genus: "Mangifera",
      species: "M. indica",
    },
    growthRequirements: {
      soil: "Well-drained deep loam to sandy loam, pH 5.5–7.5",
      water: "750–2,500 mm/year with a distinct 2–4 month dry period for flowering induction",
      temperature: "24–27 °C optimal; tolerates up to 46 °C with soil moisture",
      sunlight: "Full sun throughout the growing season",
    },
    environmentalConditions: "Mango requires a pronounced dry season to induce floral differentiation. East Java, Madura, and Nusa Tenggara have ideal climatic patterns with a 3–4 month dry season. High humidity during flowering promotes anthracnose infection, so monitoring leaf health during the transition from dry to wet season is critical.",
    healthyLeafAppearance: [
      "Mature leaves deep, lustrous green with a firm, leathery feel",
      "Uniform color across the lamina with no spots or lesions",
      "Wavy margins slightly recurved, smooth cuticle surface",
      "Young flush leaves bronze-red transitioning uniformly to green",
    ],
    unhealthyLeafSigns: [
      "Irregular brown-black spots with yellow halos (anthracnose)",
      "Powdery white coating on young leaf surfaces (powdery mildew)",
      "Leaf margins curling inward and scorching (tip burn, salt or water stress)",
      "Distorted, crinkled young leaves with green mosaic pattern (mango malformation)",
      "Pale, interveinal chlorosis on mature leaves (iron or manganese deficiency)",
    ],
    leafHealthAssessmentInfo: "Mango leaf health assessment is most valuable during active flush growth when susceptibility to anthracnose is highest. The AI classifier detects early lesion formation before symptoms are visible to the naked eye, enabling preventive spraying schedules.",
    bestPractices: [
      "Apply copper or mancozeb fungicide at flush initiation and again 10 days later",
      "Prune the canopy after harvest to stimulate uniform flushing",
      "Irrigate deeply but infrequently during dry season to avoid stress without waterlogging",
      "Control mango hoppers (Idioscopus) to reduce virus transmission",
      "Avoid overhead irrigation during flushing to reduce infection humidity",
    ],
  },
  {
    id: "chili-pepper",
    name: "Chili Pepper",
    scientificName: "Capsicum annuum",
    category: "Vegetable",
    icon: "🌶️",
    description: "A high-value vegetable crop grown intensively across Indonesian smallholder farms. Chili leaves are small and oval — discoloration is often the first sign of viral or fungal stress.",
    leafCharacteristics: ["Ovate-lanceolate leaves, 5–12 cm long, medium to dark green", "Smooth surface with slightly depressed venation", "Pale green undersurface with fine hairs on young leaves"],
    growingEnvironment: "Well-drained upland and lowland soils, 200–700 m elevation, requires warm day temperatures (25–30 °C), grown in Java, Sumatra, and Sulawesi",
    overview: "Capsicum annuum is one of Indonesia's most economically important vegetables, subject to extreme price volatility due to its sensitivity to foliar pathogens. Gemini virus (leaf curl virus) and Cercospora leaf spot cause major production losses. Early leaf patch detection is key to maintaining supply chain stability.",
    classification: {
      kingdom: "Plantae",
      family: "Solanaceae",
      genus: "Capsicum",
      species: "C. annuum",
    },
    growthRequirements: {
      soil: "Well-drained sandy loam to loam, pH 6.0–7.0; sensitive to waterlogging",
      water: "600–1,200 mm/season; regular irrigation in dry months",
      temperature: "25–30 °C day, 15–20 °C night; sensitive to heat above 35 °C",
      sunlight: "Full sun, minimum 8 hours direct light",
    },
    environmentalConditions: "Chili pepper cultivation is concentrated in lowland areas with reliable irrigation access and warm temperatures. Production peaks in the dry season when fruit quality is highest, but dry-season crops are more susceptible to leaf curl virus transmitted by whiteflies (Bemisia tabaci).",
    healthyLeafAppearance: [
      "Bright to medium green with a slightly glossy surface",
      "Flat, oval blade with smooth margins and no distortion",
      "Consistent color without any mottling, spots, or chlorotic zones",
      "Firm texture, not wilted even in morning when moisture is low",
    ],
    unhealthyLeafSigns: [
      "Upward curling of leaf margins with mosaic yellow-green mottling (leaf curl virus)",
      "Small circular spots with tan centers and dark margins (Cercospora leaf spot)",
      "Water-soaked then dark brown lesions at base of young leaves (Phytophthora blight)",
      "Yellow mottling and necrotic rings (tobacco mosaic virus)",
      "Pale yellow leaves with stunted growth (aphid infestation causing nutrient drain)",
    ],
    leafHealthAssessmentInfo: "For chili pepper, viral infections produce very distinctive leaf deformation patterns that the AI detects alongside patch-based discoloration. The leaf health score accounts for both area of discolored patches and degree of blade deformation detected in the image.",
    bestPractices: [
      "Control whitefly populations using yellow sticky traps and reflective mulch",
      "Remove infected plants immediately to limit gemini virus spread",
      "Apply fungicide at first signs of Cercospora spots (7-day schedule during wet season)",
      "Avoid overhead irrigation to minimize leaf wetness duration",
      "Rotate with non-solanaceous crops every season to break disease cycles",
    ],
  },
  {
    id: "cassava",
    name: "Cassava",
    scientificName: "Manihot esculenta",
    category: "Root Crop",
    icon: "🪴",
    description: "A drought-tolerant root crop forming a critical food security buffer across Indonesian rural communities. Its palmate leaves are a reliable early indicator of mosaic virus and mite infestations.",
    leafCharacteristics: ["Palmate leaves with 5–9 narrow lobes, each 10–20 cm long", "Deep green adaxial surface, paler beneath with prominent veins", "Long petiole, 10–30 cm, often reddish"],
    growingEnvironment: "Dryland and upland areas on poor, well-drained soils below 1,000 m, tolerates low rainfall (500–800 mm/year), throughout the outer islands",
    overview: "Manihot esculenta is a foundational food security crop across Indonesian smallholder farms, particularly in drought-prone eastern islands. While tolerant of poor soil and drought, its leaves are highly susceptible to cassava mosaic virus (CMV) and cassava mite (Mononychellus tanajoa), which together can reduce yields by 50–90% if undetected.",
    classification: {
      kingdom: "Plantae",
      family: "Euphorbiaceae",
      genus: "Manihot",
      species: "M. esculenta",
    },
    growthRequirements: {
      soil: "Sandy loam to loam, pH 5.5–7.0; adapted to poor, acidic soils",
      water: "500–1,200 mm/year; excellent drought tolerance once established",
      temperature: "20–29 °C optimal; tolerates up to 38 °C",
      sunlight: "Full sun; shade reduces tuber yield significantly",
    },
    environmentalConditions: "Cassava's remarkable drought tolerance makes it the crop of last resort in dry seasons across East Nusa Tenggara, East Java, and Maluku. It can be harvested 8–24 months after planting, providing a flexible food security buffer during seasonal food gaps.",
    healthyLeafAppearance: [
      "Deep, uniform green across all lobes with no mottling or distortion",
      "Flat, fully expanded lobes with smooth margins",
      "Uniform lobe symmetry with no size variation between adjacent lobes",
      "Clear venation visible but no yellowing along vein margins",
    ],
    unhealthyLeafSigns: [
      "Yellow-green mosaic mottling across lobes (cassava mosaic virus)",
      "Leaf distortion and lobe reduction in size (CMV severe strain)",
      "Fine stippling and bronzing of leaf surface (cassava green mite)",
      "Angular water-soaked spots turning brown (bacterial blight — Xanthomonas)",
      "Pale interveinal yellowing progressing to necrosis (sulfur or iron deficiency)",
    ],
    leafHealthAssessmentInfo: "Cassava mosaic virus produces highly distinctive mosaic patterns that the AI differentiates from nutrient deficiency patterns and mite-induced stippling. The leaf health score for cassava accounts for both patch area and pattern type, with mosaic patterns weighted more severely in the severity classification.",
    bestPractices: [
      "Use certified, mosaic-virus-resistant or tolerant varieties (e.g., Adira-4, Malang-6)",
      "Source planting stakes only from certified, disease-free mother plants",
      "Rogue and destroy mosaic-infected plants within 30 days of planting",
      "Apply acaricide for cassava green mite at first stippling sign on young leaves",
      "Intercrop with cowpea to improve soil nitrogen and suppress whitefly vector pressure",
    ],
  },
];

// Helper functions
export function getPlantById(id: string): PlantInfo | undefined {
  return plantInfoList.find((p) => p.id === id);
}

// Legacy functions retained for backward compat with non-migrated pages
export const plants: Plant[] = plantInfoList.map((p) => ({
  id: p.id,
  name: p.name,
  scientificName: p.scientificName,
  category: p.category,
  commonDiseases: [],
  description: p.description,
  icon: p.icon,
}));

export const diseases: Disease[] = [];

export function getDiseasesByPlant(_plantName: string): Disease[] {
  return [];
}

export function getDiseaseById(_id: string): Disease | undefined {
  return undefined;
}

export function getRandomDisease(): Disease {
  // Stub — no disease data in this leaf health assessment system
  return {
    id: "unhealthy_patch",
    name: "Unhealthy Leaf Patch",
    plantType: "Unknown",
    description: "One or more leaf patches were classified as unhealthy by the AI model.",
    symptoms: ["Discolored patches on leaf surface", "Abnormal texture in affected area"],
    causes: ["Environmental stress", "Pathogen presence", "Nutrient deficiency"],
    treatment: ["Remove and discard severely affected leaves", "Improve growing conditions"],
    prevention: ["Regular monitoring", "Maintain optimal growing conditions"],
    severity: "Medium",
    affectedArea: "Leaf patches",
  };
}
