export const CROP_CATEGORIES = {
    "Cereals & Grains": [
        { id: "maize", label: "Maize (Maïs)", varieties: ["CMS 8704", "CMS 9015", "CMS 8501", "Composite White", "Local Yellow"] },
        { id: "rice", label: "Rice (Riz)", varieties: ["IRAD 342", "NERICA 3", "NERICA 8", "Tox 3145", "Local Paddy"] },
        { id: "sorghum", label: "Sorghum (Sorgho)", varieties: ["IRAD S-35", "CS-54", "Local Red"] },
        { id: "millet", label: "Millet", varieties: ["Local Early", "Local Late"] }
    ],
    "Roots & Tubers": [
        { id: "cassava", label: "Cassava (Manioc)", varieties: ["TME 419", "TMS 92/0326", "TMS 96/0023", "Red Skin", "White Skin"] },
        { id: "yam", label: "Yam (Igname)", varieties: ["Yellow Yam", "White Yam", "Water Yam (Bitala)"] },
        { id: "cocoyam", label: "Cocoyam (Macabo/Taro)", varieties: ["Ibo Macabo", "Red Macabo", "White Macabo", "Taro (Ekoe)"] },
        { id: "sweet_potato", label: "Sweet Potato (Patate)", varieties: ["TIB 1", "TIB 2", "Orange Fleshed (OFSP)", "White Fleshed"] },
        { id: "irish_potato", label: "Irish Potato (Pomme)", varieties: ["Cipira", "Bambui Red"] }
    ],
    "Pulses & Legumes": [
        { id: "groundnuts", label: "Groundnuts (Arachides)", varieties: ["28-206", "Florispan", "Campala", "Local Red"] },
        { id: "beans", label: "Beans (Haricots)", varieties: ["GLP 2", "NITU", "Black Beans", "Kidney Beans"] },
        { id: "soybeans", label: "Soybeans (Soja)", varieties: ["TGX 1910-14F", "TGX 1835-10E"] },
        { id: "egusi", label: "Egusi (Melon)", varieties: ["Large Seed", "Small Seed"] }
    ],
    "Fruit Trees": [
        { id: "plantain", label: "Plantain", varieties: ["Big Ebanga", "Batard", "Essong", "Mbouroukou"] },
        { id: "banana", label: "Banana (Banane douce)", varieties: ["Cavendish", "Gros Michel", "Poyo"] },
        { id: "avocado", label: "Avocado (Avocatier)", varieties: ["Booth 7", "Booth 8", "Hass", "Local Butter"] },
        { id: "mango", label: "Mango (Manguier)", varieties: ["Amélie", "Brooks", "Kent", "Keitt", "Local Green"] },
        { id: "citrus", label: "Citrus (Orange/Citron)", varieties: ["Valencia Orange", "Washington Navel", "Eureka Lemon", "Lime"] },
        { id: "papaya", label: "Papaya (Papayer)", varieties: ["Solo", "Sunrise", "Local Large"] },
        { id: "pineapple", label: "Pineapple (Ananas)", varieties: ["Smooth Cayenne", "Sugar Loaf"] },
        { id: "safou", label: "Safou (Plum)", varieties: ["Long Safou", "Round Safou"] }
    ],
    "Cash & Industrial": [
        { id: "cocoa", label: "Cocoa (Cacao)", varieties: ["Hybrid (High Yield)", "Forastero", "Trinitario"] },
        { id: "coffee_robusta", label: "Coffee (Robusta)", varieties: ["IFC 1", "Local Selection"] },
        { id: "coffee_arabica", label: "Coffee (Arabica)", varieties: ["Java", "Jamaican Blue Mountain Type"] },
        { id: "oil_palm", label: "Oil Palm (Palmier)", varieties: ["Tenera (Hybrid)", "Dura", "Pisifera"] },
        { id: "rubber", label: "Rubber (Hévéa)", varieties: ["GT 1", "PB 217", "Local Clone"] },
        { id: "cotton", label: "Cotton (Coton)", varieties: ["IRAD Hybrid", "Local L-21"] },
        { id: "sugar_cane", label: "Sugar Cane (Canne)", varieties: ["Local Red", "Local Green"] }
    ],
    "Vegetables & Spices": [
        { id: "tomato", label: "Tomato (Tomate)", varieties: ["Rio Grande", "Roma VF", "Cobra", "Local Cherry"] },
        { id: "onion", label: "Onion (Oignon)", varieties: ["Galmi Violet", "Red Creole"] },
        { id: "pepper", label: "Pepper (Piment)", varieties: ["Habanero (Yellow/Red)", "Bird's Eye", "Green Pepper"] },
        { id: "okra", label: "Okra (Gombo)", varieties: ["Kirikou", "Local Early"] },
        { id: "ndole", label: "Bitter leaf (Ndolé)", varieties: ["Small leaf", "Large leaf"] },
        { id: "penja_pepper", label: "Penja Pepper", varieties: ["White Penja", "Black Penja"] },
        { id: "ginger", label: "Ginger (Gingembre)", varieties: ["Local Sharp", "Yellow Ginger"] },
        { id: "garlic", label: "Garlic (Ail)", varieties: ["Local White"] }
    ]
};

export const INFRASTRUCTURE_TYPES = [
    { id: 'farm_house', label: 'Farm House', icon: '🏠' },
    { id: 'residential', label: 'Residential Unit', icon: '🏡' },
    { id: 'storage', label: 'General Warehouse', icon: '🏭' },
    { id: 'cocoa_dryer', label: 'Cocoa/Coffee Dryer', icon: '♨️' },
    { id: 'oil_press', label: 'Oil Press / Mill', icon: '⚙️' },
    { id: 'poultry', label: 'Poultry Pen', icon: '🐔' },
    { id: 'livestock_pen', label: 'Livestock Pen (Piggery/Shed)', icon: '🐖' },
    { id: 'irrigation', label: 'Irrigation System', icon: '💧' },
    { id: 'well', label: 'Water Well / Borehole', icon: '🚰' },
    { id: 'fence', label: 'Fencing / Boundary', icon: '🚧' }
];
