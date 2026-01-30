const { Activity, Crop, Field, Input, ActivityInput, Infrastructure } = require('../models');
const xlsx = require('xlsx');
const xml2js = require('xml2js');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

const getVal = (row, ...keys) => {
    if (!row) return null;
    const rowKeys = Object.keys(row);
    for (const key of keys) {
        const found = rowKeys.find(k => k.toLowerCase() === key.toLowerCase() || k.toLowerCase().includes(key.toLowerCase()));
        if (found) return row[found];
    }
    return null;
};
const path = require('path');

const sanitizeUUID = (val) => (val === '' || val === undefined) ? null : val;
const sanitizeNum = (val, defaultVal = null) => {
    if (val === '' || val === undefined || val === null) return defaultVal;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? defaultVal : parsed;
};

const recalculateInfraCost = async (infrastructure_id) => {
    if (!infrastructure_id) return;
    try {
        const total = await Activity.sum('total_cost', {
            where: { infrastructure_id }
        });
        await Infrastructure.update(
            { cost: total || 0 },
            { where: { id: infrastructure_id } }
        );
    } catch (error) {
        console.error('Error recalculating infra cost:', error);
    }
};

exports.getCropActivities = async (req, res) => {
    try {
        const activities = await Activity.findAll({
            where: { crop_id: req.params.cropId },
            include: [Input]
        });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activities' });
    }
};

exports.getFarmActivities = async (req, res) => {
    try {
        const activities = await Activity.findAll({
            where: { farm_id: req.params.farmId },
            include: [Field, Input, Crop, Infrastructure],
            order: [['activity_date', 'DESC']]
        });
        res.json(activities);
    } catch (error) {
        console.error('Error fetching farm activities:', error);
        res.status(500).json({ message: 'Error fetching farm activities' });
    }
};

exports.createActivity = async (req, res) => {
    try {
        const activityData = {
            ...req.body,
            performed_by: req.user.id,
            farm_id: sanitizeUUID(req.body.farm_id),
            crop_id: sanitizeUUID(req.body.crop_id),
            field_id: sanitizeUUID(req.body.field_id),
            infrastructure_id: sanitizeUUID(req.body.infrastructure_id),
            harvest_id: sanitizeUUID(req.body.harvest_id),
            transaction_type: req.body.transaction_type || 'expense',
            labor_cost: sanitizeNum(req.body.labor_cost, 0),
            material_cost: sanitizeNum(req.body.material_cost, 0),
            equipment_cost: sanitizeNum(req.body.equipment_cost, 0),
            service_cost: sanitizeNum(req.body.service_cost, 0),
            transport_cost: sanitizeNum(req.body.transport_cost, 0),
            other_cost: sanitizeNum(req.body.other_cost, 0),
            total_cost: sanitizeNum(req.body.total_cost, 0),
            area_covered: sanitizeNum(req.body.area_covered),
            duration_hours: sanitizeNum(req.body.duration_hours),
            temperature: sanitizeNum(req.body.temperature),
            num_workers: Math.round(sanitizeNum(req.body.num_workers, 0))
        };
        console.log('[CreateActivity] Payload received:', JSON.stringify(activityData, null, 2));

        const activity = await Activity.create(activityData);

        if (req.body.inputs && req.body.inputs.length > 0) {
            for (const item of req.body.inputs) {
                const input = await Input.findByPk(item.input_id);
                const itemCost = input ? (parseFloat(input.unit_cost || 0) * parseFloat(item.quantity_used || 0)) : 0;

                await ActivityInput.create({
                    activity_id: activity.id,
                    input_id: item.input_id,
                    quantity_used: item.quantity_used,
                    unit: item.unit || (input ? input.unit : ''),
                    cost: itemCost
                });

                if (input) {
                    await input.update({
                        quantity_in_stock: parseFloat(input.quantity_in_stock) - parseFloat(item.quantity_used)
                    });
                }
            }
        }

        if (activity.infrastructure_id) {
            await recalculateInfraCost(activity.infrastructure_id);
        }

        res.status(201).json(activity);
    } catch (error) {
        console.error('Activity Creation Error:', error);
        res.status(500).json({
            message: 'Error creating activity',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.updateActivity = async (req, res) => {
    try {
        const activity = await Activity.findByPk(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });

        const oldInfraId = activity.infrastructure_id;
        const updateData = {
            ...req.body,
            farm_id: sanitizeUUID(req.body.farm_id),
            crop_id: sanitizeUUID(req.body.crop_id),
            field_id: sanitizeUUID(req.body.field_id),
            infrastructure_id: sanitizeUUID(req.body.infrastructure_id),
            harvest_id: sanitizeUUID(req.body.harvest_id),
            transaction_type: req.body.transaction_type || activity.transaction_type || 'expense',
            labor_cost: sanitizeNum(req.body.labor_cost, activity.labor_cost),
            material_cost: sanitizeNum(req.body.material_cost, activity.material_cost),
            equipment_cost: sanitizeNum(req.body.equipment_cost, activity.equipment_cost),
            service_cost: sanitizeNum(req.body.service_cost, activity.service_cost),
            transport_cost: sanitizeNum(req.body.transport_cost, activity.transport_cost),
            other_cost: sanitizeNum(req.body.other_cost, activity.other_cost),
            total_cost: sanitizeNum(req.body.total_cost, activity.total_cost),
            area_covered: sanitizeNum(req.body.area_covered, activity.area_covered),
            duration_hours: sanitizeNum(req.body.duration_hours, activity.duration_hours),
            temperature: sanitizeNum(req.body.temperature, activity.temperature),
            num_workers: Math.round(sanitizeNum(req.body.num_workers, activity.num_workers || 0))
        };
        await activity.update(updateData);

        if (activity.infrastructure_id) {
            await recalculateInfraCost(activity.infrastructure_id);
        }
        if (oldInfraId && oldInfraId !== activity.infrastructure_id) {
            await recalculateInfraCost(oldInfraId);
        }

        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Error updating activity' });
    }
};

exports.deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findByPk(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });

        const infraId = activity.infrastructure_id;
        await activity.destroy();

        if (infraId) {
            await recalculateInfraCost(infraId);
        }

        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting activity' });
    }
};

exports.bulkUploadActivities = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const farmId = req.params.farmId;
        const filePath = req.file.path;
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        let rawData = [];

        // 1. Parse File based on Extension
        if (fileExt === '.xlsx' || fileExt === '.xlsm' || fileExt === '.csv') {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else if (fileExt === '.xml') {
            const xmlContent = fs.readFileSync(filePath, 'utf8');
            const parser = new xml2js.Parser({ explicitArray: false });
            const result = await parser.parseStringPromise(xmlContent);
            // Assuming <activities><activity>...</activity></activities>
            rawData = result.activities?.activity || [];
            if (!Array.isArray(rawData)) rawData = [rawData];
        } else if (fileExt === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            // Note: PDF parsing is heuristic. Assuming one line per activity or similar.
            // For a production app, we'd need more specific layout logic.
            const lines = data.text.split('\n').filter(l => l.trim());
            // Attempt to treat each line as a comma-separated activity if possible, or just raw text
            rawData = lines.map(line => ({ description: line }));
        } else if (fileExt === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            const lines = result.value.split('\n').filter(l => l.trim());
            rawData = lines.map(line => ({ description: line }));
        }

        if (rawData.length === 0) {
            console.warn('[BulkUpload] No data parsed from file.');
            return res.status(400).json({ message: 'No activities found in file' });
        }

        console.log(`[BulkUpload] Processing ${rawData.length} rows for farm ${farmId}`);

        // 2. Map Names to IDs
        const [fields, crops, infrastructures] = await Promise.all([
            Field.findAll({ where: { farm_id: farmId } }),
            Crop.findAll({ include: [{ model: Field, where: { farm_id: farmId } }] }),
            Infrastructure.findAll({ where: { farm_id: farmId } })
        ]);

        const findFieldId = (name) => name ? fields.find(f => f.name?.toLowerCase().includes(String(name).toLowerCase()))?.id : null;
        const findCropId = (name) => name ? crops.find(c => c.crop_type?.toLowerCase().includes(String(name).toLowerCase()))?.id : null;
        const findInfraId = (name) => name ? infrastructures.find(i => i.name?.toLowerCase().includes(String(name).toLowerCase()))?.id : null;

        const activitiesToCreate = rawData
            .filter(row => Object.values(row).some(v => v !== null && v !== '')) // Filter out empty rows
            .map((row, index) => {
                try {
                    // Robust column mapping
                    const activity_date = getVal(row, 'date', 'activity_date') || new Date().toISOString().split('T')[0];
                    const rawType = getVal(row, 'activity type', 'type', 'operation type') || 'General';
                    const activity_type = rawType.toLowerCase().replace(/ /g, '_');
                    const description = getVal(row, 'description', 'notes') || `Bulk import: ${activity_type}`;

                    // Financials
                    const rawAmount = getVal(row, 'amount', 'cost', 'total_cost', 'financial');
                    let total_cost = 0;
                    if (rawAmount) {
                        // Extract numeric value from string (handling "XAF 1,000" etc)
                        const numericPart = String(rawAmount).replace(/[^\d.-]/g, '');
                        total_cost = parseFloat(numericPart) || 0;
                    }

                    // Transaction Type (Income/Expense)
                    const transStr = String(getVal(row, 'transaction', 'type') || '').toLowerCase();
                    const transaction_type = (transStr.includes('income') || activity_type.includes('harvest') || transStr.includes('revenue')) ? 'income' : 'expense';

                    // Link to assets
                    const opName = String(getVal(row, 'operation', 'asset', 'crop', 'infrastructure') || '');
                    let field_id = findFieldId(getVal(row, 'field', 'location'));
                    let crop_id = findCropId(opName);
                    let infrastructure_id = findInfraId(opName);

                    return {
                        activity_date,
                        activity_type,
                        description,
                        total_cost,
                        field_id,
                        crop_id,
                        infrastructure_id,
                        farm_id: farmId,
                        performed_by: req.user.id,
                        transaction_type,
                        work_status: 'completed'
                    };
                } catch (err) {
                    console.error(`[BulkUpload] Error mapping row ${index}:`, err);
                    return null;
                }
            })
            .filter(Boolean);

        if (activitiesToCreate.length === 0) {
            console.warn('[BulkUpload] No valid activity records could be mapped.');
            return res.status(400).json({ message: 'No valid data found in file mapping' });
        }

        console.log(`[BulkUpload] Inserting ${activitiesToCreate.length} records...`);

        // 3. Batch Create
        const createdActivities = await Activity.bulkCreate(activitiesToCreate);
        console.log(`[BulkUpload] Successfully inserted ${createdActivities.length} records.`);

        // 4. Cleanup
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(201).json({
            message: `Successfully imported ${createdActivities.length} activities`,
            count: createdActivities.length
        });

    } catch (error) {
        console.error('Bulk Upload Error:', error);
        res.status(500).json({ message: 'Error processing bulk upload' });
    }
};
