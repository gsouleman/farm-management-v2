const { CropDefinition } = require('../models');

// Initial seed data from agriculturalData.js structure
const INITIAL_CROPS = {
    "Cereals & Grains": [
        { name: "Maize (Maïs)", varieties: ["CMS 8704", "CMS 9015", "CMS 8501", "Composite White", "Local Yellow"], icon: '🌽', color: '#ffd700' },
        { name: "Rice (Riz)", varieties: ["IRAD 342", "NERICA 3", "NERICA 8", "Tox 3145", "Local Paddy"], icon: '🌾', color: '#f0e68c' },
        { name: "Sorghum (Sorgho)", varieties: ["IRAD S-35", "CS-54", "Local Red"], icon: '🌾', color: '#d2b48c' },
        { name: "Millet", varieties: ["Local Early", "Local Late"], icon: '🌾', color: '#deb887' }
    ],
    "Roots & Tubers": [
        { name: "Cassava (Manioc)", varieties: ["TME 419", "TMS 92/0326", "TMS 96/0023", "Red Skin", "White Skin"], icon: '🍠', color: '#8b4513' },
        { name: "Yam (Igname)", varieties: ["Yellow Yam", "White Yam", "Water Yam (Bitala)"], icon: '🍠', color: '#cd853f' },
        { name: "Cocoyam (Macabo/Taro)", varieties: ["Ibo Macabo", "Red Macabo", "White Macabo", "Taro (Ekoe)"], icon: '🌿', color: '#556b2f' },
        { name: "Sweet Potato (Patate)", varieties: ["TIB 1", "TIB 2", "Orange Fleshed (OFSP)", "White Fleshed"], icon: '🍠', color: '#ff8c00' },
        { name: "Irish Potato (Pomme)", varieties: ["Cipira", "Bambui Red"], icon: '🥔', color: '#f4a460' }
    ],
    "Pulses & Legumes": [
        { name: "Groundnuts (Arachides)", varieties: ["28-206", "Florispan", "Campala", "Local Red"], icon: '🥜', color: '#d2691e' },
        { name: "Beans (Haricots)", varieties: ["GLP 2", "NITU", "Black Beans", "Kidney Beans"], icon: '🫘', color: '#800000' },
        { name: "Soybeans (Soja)", varieties: ["TGX 1910-14F", "TGX 1835-10E"], icon: '🌱', color: '#9acd32' },
        { name: "Egusi (Melon)", varieties: ["Large Seed", "Small Seed"], icon: '🍈', color: '#f0fff0' }
    ],
    "Fruit Trees": [
        { name: "Plantain", varieties: ["Big Ebanga", "Batard", "Essong", "Mbouroukou"], icon: '🍌', color: '#ffffe0' },
        { name: "Banana (Banane douce)", varieties: ["Cavendish", "Gros Michel", "Poyo"], icon: '🍌', color: '#ffff00' },
        { name: "Avocado (Avocatier)", varieties: ["Booth 7", "Booth 8", "Hass", "Local Butter"], icon: '🥑', color: '#556b2f' },
        { name: "Mango (Manguier)", varieties: ["Amélie", "Brooks", "Kent", "Keitt", "Local Green"], icon: '🥭', color: '#ffa500' },
        { name: "Citrus (Orange/Citron)", varieties: ["Valencia Orange", "Washington Navel", "Eureka Lemon", "Lime"], icon: '🍊', color: '#ff4500' },
        { name: "Papaya (Papayer)", varieties: ["Solo", "Sunrise", "Local Large"], icon: '🍈', color: '#ffdab9' },
        { name: "Pineapple (Ananas)", varieties: ["Smooth Cayenne", "Sugar Loaf"], icon: '🍍', color: '#ffd700' },
        { name: "Safou (Plum)", varieties: ["Long Safou", "Round Safou"], icon: '🟣', color: '#800080' }
    ],
    "Cash & Industrial": [
        { name: "Cocoa (Cacao)", varieties: ["Hybrid (High Yield)", "Forastero", "Trinitario"], icon: '🍫', color: '#a0522d' },
        { name: "Coffee (Robusta)", varieties: ["IFC 1", "Local Selection"], icon: '☕', color: '#654321' },
        { name: "Coffee (Arabica)", varieties: ["Java", "Jamaican Blue Mountain Type"], icon: '☕', color: '#8b4513' },
        { name: "Oil Palm (Palmier)", varieties: ["Tenera (Hybrid)", "Dura", "Pisifera"], icon: '🌴', color: '#ff0000' },
        { name: "Rubber (Hévéa)", varieties: ["GT 1", "PB 217", "Local Clone"], icon: '🌳', color: '#f5f5f5' },
        { name: "Cotton (Coton)", varieties: ["IRAD Hybrid", "Local L-21"], icon: '☁️', color: '#ffffff' },
        { name: "Sugar Cane (Canne)", varieties: ["Local Red", "Local Green"], icon: '🎋', color: '#90ee90' }
    ],
    "Vegetables & Spices": [
        { name: "Tomato (Tomate)", varieties: ["Rio Grande", "Roma VF", "Cobra", "Local Cherry"], icon: '🍅', color: '#ff6347' },
        { name: "Onion (Oignon)", varieties: ["Galmi Violet", "Red Creole"], icon: '🧅', color: '#dda0dd' },
        { name: "Pepper (Piment)", varieties: ["Habanero (Yellow/Red)", "Bird's Eye", "Green Pepper"], icon: '🌶️', color: '#ff0000' },
        { name: "Okra (Gombo)", varieties: ["Kirikou", "Local Early"], icon: '🥬', color: '#006400' },
        { name: "Bitter leaf (Ndolé)", varieties: ["Small leaf", "Large leaf"], icon: '🌿', color: '#008000' },
        { name: "Penja Pepper", varieties: ["White Penja", "Black Penja"], icon: '🧂', color: '#000000' },
        { name: "Ginger (Gingembre)", varieties: ["Local Sharp", "Yellow Ginger"], icon: '🫚', color: '#f0e68c' },
        { name: "Garlic (Ail)", varieties: ["Local White"], icon: '🧄', color: '#fffacd' }
    ]
};

exports.getAllDefinitions = async (req, res) => {
    try {
        let definitions = await CropDefinition.findAll({ order: [['name', 'ASC']] });

        // Auto-seed if empty
        if (definitions.length === 0) {
            console.log('Seeding Crop Definitions...');
            const seedData = [];
            Object.entries(INITIAL_CROPS).forEach(([category, crops]) => {
                crops.forEach(crop => {
                    seedData.push({ ...crop, category });
                });
            });
            await CropDefinition.bulkCreate(seedData);
            definitions = await CropDefinition.findAll({ order: [['name', 'ASC']] });
        }

        res.json(definitions);
    } catch (error) {
        console.error('Error fetching crop definitions:', error);
        res.status(500).json({ message: 'Failed to fetch crop definitions' });
    }
};

exports.createDefinition = async (req, res) => {
    try {
        const definition = await CropDefinition.create(req.body);
        res.status(201).json(definition);
    } catch (error) {
        console.error('Error creating crop definition:', error);
        res.status(500).json({ message: 'Failed to create crop definition' });
    }
};

exports.updateDefinition = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await CropDefinition.update(req.body, { where: { id } });
        if (!updated) return res.status(404).json({ message: 'Definition not found' });

        const updatedDefinition = await CropDefinition.findByPk(id);
        res.json(updatedDefinition);
    } catch (error) {
        console.error('Error updating crop definition:', error);
        res.status(500).json({ message: 'Failed to update definition' });
    }
};

exports.deleteDefinition = async (req, res) => {
    try {
        const { id } = req.params;
        await CropDefinition.destroy({ where: { id } });
        res.json({ message: 'Definition deleted' });
    } catch (error) {
        console.error('Error deleting crop definition:', error);
        res.status(500).json({ message: 'Failed to delete definition' });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const definition = await CropDefinition.findByPk(id);
        if (!definition) return res.status(404).json({ message: 'Definition not found' });

        definition.is_active = !definition.is_active;
        await definition.save();
        res.json(definition);
    } catch (error) {
        console.error('Error toggling status:', error);
        res.status(500).json({ message: 'Failed to toggle status' });
    }
};
