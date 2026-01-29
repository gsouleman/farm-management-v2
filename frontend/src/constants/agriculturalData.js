export const CROP_CATEGORIES = {
    "Cereals & Grains": [
        { id: "corn_grain", label: "Corn (Grain)", varieties: ["Pioneer P1197", "DeKalb DKC62-08", "NK N68K", "Croplan 5678", "Channel 211-33"] },
        { id: "corn_silage", label: "Corn (Silage)", varieties: ["Pioneer P0157", "DeKalb DKC55-53", "Preferred Silage Plus"] },
        { id: "wheat_spring", label: "Wheat (Spring)", varieties: ["AAC Brandon", "AAC Viewfield", "AAC Starbuck", "SY Torach"] },
        { id: "wheat_winter", label: "Wheat (Winter)", varieties: ["AAC Wildfire", "AAC Emerson", "SY Sunrise"] },
        { id: "barley", label: "Barley", varieties: ["CDC Copeland", "AAC Synergy", "CDC Austenson", "KWS Fantex"] },
        { id: "oats", label: "Oats", varieties: ["CS Camden", "CDC Arborg", "AAC Douglas"] },
        { id: "sorghum", label: "Sorghum", varieties: ["Pioneer 84G62", "Dekalb DKS28-05", "Check-Mate"] },
        { id: "rice", label: "Rice (Paddy)", varieties: ["IR64", "Basmati 370", "Jasmine 85"] }
    ],
    "Oilseeds": [
        { id: "canola", label: "Canola / Rapeseed", varieties: ["InVigor L233P", "InVigor L340PC", "Nexera 1022 RR", "Pioneer 45H33"] },
        { id: "soybeans", label: "Soybeans", varieties: ["Asgrow AG06X8", "Pioneer P007A32X", "NK S007-Y4", "ProYield 005"] },
        { id: "sunflower", label: "Sunflower", varieties: ["P63ME70", "N4HM354", "Cobalt II"] },
        { id: "flax", label: "Flax / Linseed", varieties: ["CDC Glas", "CDC Bethune"] }
    ],
    "Pulses & Legumes": [
        { id: "peas_yellow", label: "Peas (Yellow)", varieties: ["AAC Carver", "CDC Amarillo", "CDC Spectrum"] },
        { id: "lentils_red", label: "Lentils (Red)", varieties: ["CDC Maxim", "CDC Proclaim"] },
        { id: "chickpeas", label: "Chickpeas (Kabuli)", varieties: ["CDC Leader", "CDC Frontier"] },
        { id: "beans_dry", label: "Beans (Dry/Kidney)", varieties: ["CDC Blackstrap", "AAC Island", "Red Hawk"] },
        { id: "peanuts", label: "Peanuts / Groundnut", varieties: ["Spanish White", "Virginia Jumbo"] }
    ],
    "Roots, Tubers & Bulbs": [
        { id: "potatoes", label: "Potatoes (Table)", varieties: ["Russet Burbank", "Norland", "Yukon Gold", "Ken_nebec"] },
        { id: "potatoes_seed", label: "Potatoes (Seed)", varieties: ["Elite 1", "Elite 2"] },
        { id: "cassava", label: "Cassava / Mani_oc", varieties: ["TME 419", "TMS 30572"] },
        { id: "sweet_potato", label: "Sweet Potato", varieties: ["Beauregard", "Covington"] },
        { id: "onion", label: "Onion", varieties: ["Yellow Spanish", "Red Burgundy"] },
        { id: "garlic", label: "Garlic", varieties: ["Music", "Silverwhite"] }
    ],
    "Fruits & Perennials": [
        { id: "apple", label: "Apple Orchard", varieties: ["Gala", "Honeycrisp", "Fuji"] },
        { id: "grape_wine", label: "Grape (Wine)", varieties: ["Cabernet Sauvignon", "Chardonnay", "Merlot"] },
        { id: "citrus", label: "Citrus (Orange/Lemon)", varieties: ["Valencia", "Eureka"] },
        { id: "banana", label: "Banana / Plantain", varieties: ["Cavendish", "Big Ebanga"] }
    ],
    "Specialty & Industrial": [
        { id: "sugar_beets", label: "Sugar Beets", varieties: ["Betaseed", "Crystal", "Hilleshog"] },
        { id: "sugar_cane", label: "Sugar Cane", varieties: ["CP 89-2143", "L 01-299"] },
        { id: "cotton", label: "Cotton", varieties: ["Deltapine 164 B2XF", "Phytogen 400 W3FE", "Stoneville 4946"] },
        { id: "tobacco", label: "Tobacco", varieties: ["Burley 21", "Virginia Gold"] },
        { id: "hemp", label: "Hemp (Industrial)", varieties: ["Finola", "Katani"] }
    ],
    "Beverages & Spices": [
        { id: "coffee", label: "Coffee (Arabica/Robusta)", varieties: ["SL28", "Catimor", "K7"] },
        { id: "cocoa", label: "Cocoa / Cacao", varieties: ["Forastero", "Criollo", "Trinitario"] },
        { id: "tea", label: "Tea", varieties: ["Assam", "Darjeeling"] },
        { id: "ginger", label: "Ginger", varieties: ["Canton", "Queensland"] },
        { id: "pepper_black", label: "Pepper (Black/White)", varieties: ["Lampong", "Sarawak"] }
    ],
    "Forage & Cover": [
        { id: "alfalfa", label: "Alfalfa", varieties: ["Common Heritage", "AC Bluebird", "Magnum 7"] },
        { id: "clover", label: "Clover (Red/White)", varieties: ["Red Clover", "White Clover"] },
        { id: "timothy", label: "Timothy Grass", varieties: ["Climax", "Richmond"] },
        { id: "cover_mix", label: "Cover Crop Mix", varieties: ["Radish/Rye Mix", "Oat/Pea Mix"] }
    ]
};

export const INFRASTRUCTURE_TYPES = [
    { id: 'farm_house', label: 'Farm House', icon: '🏠' },
    { id: 'residential', label: 'Residential House', icon: '🏡' },
    { id: 'storage', label: 'Storage / Warehouse', icon: '🏭' },
    { id: 'poultry', label: 'Poultry House', icon: '🐔' },
    { id: 'irrigation', label: 'Irrigation System', icon: '💧' },
    { id: 'well', label: 'Water Well / Borehole', icon: '🚰' },
    { id: 'fence', label: 'Fencing', icon: '🚧' }
];
