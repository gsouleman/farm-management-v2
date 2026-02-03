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

const isValidUUID = (id) => {
    if (!id) return false;
    const strId = String(id);
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(strId);
};
const path = require('path');

const sanitizeUUID = (val) => {
    if (val === '' || val === undefined || val === null || val === 'null' || val === 'undefined') return null;
    if (typeof val !== 'string' || !isValidUUID(val)) {
        return null;
    }
    return val;
};

const sanitizeNum = (val, defaultVal = null) => {
    if (val === '' || val === undefined || val === null || val === 'null' || val === 'undefined') return defaultVal;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? defaultVal : parsed;
};

const sanitizeDate = (val) => {
    if (val === '' || val === undefined || val === null || val === 'null' || val === 'undefined') return null;
    return val;
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
        const farmId = req.params.farmId || req.query.farm_id;
        if (!farmId) {
            return res.status(400).json({ message: 'Farm ID is required' });
        }
        const activities = await Activity.findAll({
            where: { farm_id: farmId },
            include: [Field, Input, Crop, Infrastructure],
            order: [['activity_date', 'DESC']]
        });
        res.json(activities);
    } catch (error) {
        console.error('Error fetching farm activities:', error);
        res.status(500).json({ message: 'Error fetching farm activities' });
    }
};

exports.getAllActivities = async (req, res) => {
    try {
        // 1. Find all farms
        const { Farm } = require('../models'); // Keep require here if not at top, but better at top. 
        // Actually, userFarms query is same.
        const userFarms = await Farm.findAll({
            where: { owner_id: req.user.id },
            attributes: ['id']
        });
        const farmIds = userFarms.map(f => f.id);

        if (farmIds.length === 0) return res.json([]);

        // 2. Fetch directly with farm_id (Activity has farm_id column!)
        // Activity has farm_id, so we don't need deep nested joins for filtering!
        // We only need includes for data display.
        const activities = await Activity.findAll({
            where: { farm_id: farmIds }, // Simple IN
            include: [
                {
                    model: Crop,
                    include: [{
                        model: Field,
                        required: false
                    }]
                },
                { model: Input }
            ],
            order: [['activity_date', 'DESC']]
        });

        res.json(activities);
    } catch (error) {
        console.error('Error fetching all activities:', error);
        res.status(500).json({ message: 'Error fetching all activities' });
    }
};

exports.createActivity = async (req, res) => {
    try {
        const activityData = {
            activity_type: req.body.activity_type || 'planting',
            activity_date: sanitizeDate(req.body.activity_date) || new Date().toISOString().split('T')[0],
            performed_by: req.user.id,
            farm_id: sanitizeUUID(req.body.farm_id),
            crop_id: sanitizeUUID(req.body.crop_id),
            field_id: sanitizeUUID(req.body.field_id),
            infrastructure_id: sanitizeUUID(req.body.infrastructure_id),
            harvest_id: sanitizeUUID(req.body.harvest_id),
            next_maintenance: sanitizeDate(req.body.next_maintenance),
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
            num_workers: Math.round(sanitizeNum(req.body.num_workers, 0)),
            description: String(req.body.description || ''),
            notes: String(req.body.notes || ''),
            priority: req.body.priority,
            work_status: req.body.work_status,
            start_time: sanitizeDate(req.body.start_time),
            end_time: sanitizeDate(req.body.end_time),
            weather_conditions: req.body.weather_conditions,
            temperature: sanitizeNum(req.body.temperature),
            equipment_used: req.body.equipment_used,
            component: req.body.component,
            materials_used: req.body.materials_used,
            next_maintenance: sanitizeDate(req.body.next_maintenance),
            issues: req.body.issues,
            supplier_name: req.body.supplier_name,
            supplier_contact: req.body.supplier_contact,
            invoice_number: req.body.invoice_number,
            warranty: req.body.warranty,
            payment_method: req.body.payment_method
        };
        const activity = await Activity.create(activityData);

        if (req.body.inputs && Array.isArray(req.body.inputs) && req.body.inputs.length > 0) {
            for (const item of req.body.inputs) {
                if (!item.input_id) continue;

                try {
                    const input = await Input.findByPk(item.input_id);
                    const quantityUsed = sanitizeNum(item.quantity_used, 0);
                    const itemCost = input ? (parseFloat(input.unit_cost || 0) * quantityUsed) : 0;

                    await ActivityInput.create({
                        activity_id: activity.id,
                        input_id: item.input_id,
                        quantity_used: quantityUsed,
                        unit: item.unit || (input ? input.unit : 'unit'),
                        cost: itemCost,
                        application_rate: sanitizeNum(item.application_rate)
                    });

                    if (input) {
                        await input.update({
                            quantity_in_stock: (parseFloat(input.quantity_in_stock) || 0) - quantityUsed
                        });
                    }
                } catch (inputError) {
                    console.error('[CreateActivity] Failed to process input:', item.input_id, inputError);
                }
            }
        }

        if (activity.infrastructure_id) {
            await recalculateInfraCost(activity.infrastructure_id);
        }

        res.status(201).json({
            data: activity,
            notification: {
                message: 'JOURNAL ENTRY LOGGED SUCCESSFULLY',
                type: 'success'
            }
        });
    } catch (error) {
        console.error('Activity Creation Error:', error);
        res.status(500).json({
            message: 'Internal server error create activity',
            notification: {
                message: `LOG FAILURE: ${error.message.toUpperCase()}`,
                type: 'error'
            },
            error: error.message
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
            next_maintenance: sanitizeDate(req.body.next_maintenance),
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

        // Sync back to Harvest if linked
        if (activity.harvest_id) {
            try {
                const { Harvest } = require('../models');
                const harvest = await Harvest.findByPk(activity.harvest_id);
                if (harvest) {
                    await harvest.update({
                        harvest_date: activity.activity_date,
                        total_revenue: activity.total_cost
                    });
                }
            } catch (syncError) {
                console.error('[ActivitySync] Failed to sync update back to Harvest:', syncError);
            }
        }

        if (activity.infrastructure_id) {
            await recalculateInfraCost(activity.infrastructure_id);
        }
        if (oldInfraId && oldInfraId !== activity.infrastructure_id) {
            await recalculateInfraCost(oldInfraId);
        }

        res.json({
            data: activity,
            notification: {
                message: 'JOURNAL RECORD UPDATED',
                type: 'success'
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating activity',
            notification: {
                message: 'UPDATE FAILURE: DATABASE LOCK OR SYNC ERROR',
                type: 'error'
            }
        });
    }
};

exports.deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findByPk(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });

        const infraId = activity.infrastructure_id;
        const harvestId = activity.harvest_id;

        await activity.destroy();

        if (harvestId) {
            try {
                const { Harvest } = require('../models');
                await Harvest.destroy({ where: { id: harvestId } });
            } catch (syncError) {
                console.error('[ActivitySync] Failed to sync deletion back to Harvest:', syncError);
            }
        }

        if (infraId) {
            await recalculateInfraCost(infraId);
        }

        res.json({
            message: 'Activity deleted successfully',
            notification: {
                message: 'JOURNAL RECORD PERMANENTLY REMOVED',
                type: 'success'
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting activity',
            notification: {
                message: 'DELETE FAILURE: RECORD LINKED TO VITAL DATA',
                type: 'error'
            }
        });
    }
};

exports.bulkUploadActivities = async (req, res) => {
    const filePath = req.file?.path;
    console.log(`[ActivityController] BULK UPLOAD INITIATED FOR FARM: ${req.params.farmId}`);

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const farmId = req.params.farmId;
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
            rawData = result.activities?.activity || [];
            if (!Array.isArray(rawData)) rawData = [rawData];
        } else if (fileExt === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            const lines = data.text.split('\n').filter(l => l.trim());
            rawData = lines.map(line => ({ description: line }));
        } else if (fileExt === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            const lines = result.value.split('\n').filter(l => l.trim());
            rawData = lines.map(line => ({ description: line }));
        }

        if (rawData.length === 0) {
            return res.status(400).json({ message: 'No activities found in file' });
        }

        // 2. Map Names to IDs
        const [fields, crops, infrastructures] = await Promise.all([
            Field.findAll({ where: { farm_id: farmId } }),
            Crop.findAll({ include: [{ model: Field, where: { farm_id: farmId } }] }),
            Infrastructure.findAll({ where: { farm_id: farmId } })
        ]);

        const findFieldId = (name) => name ? fields.find(f => String(f.name || '').toLowerCase().includes(String(name).toLowerCase()))?.id : null;
        const findCropId = (name) => name ? crops.find(c => String(c.crop_type || '').toLowerCase().includes(String(name).toLowerCase()))?.id : null;
        const findInfraId = (name) => name ? infrastructures.find(i => String(i.name || '').toLowerCase().includes(String(name).toLowerCase()))?.id : null;

        const activitiesToCreate = rawData
            .filter(row => Object.values(row).some(v => v !== null && v !== ''))
            .map((row, index) => {
                try {
                    // Robust column mapping - Ensure values are treated as strings before calling string methods
                    const activity_date = getVal(row, 'date', 'activity_date') || new Date().toISOString().split('T')[0];
                    const rawType = String(getVal(row, 'activity type', 'type', 'operation type', 'category') || 'General');
                    const activity_type = rawType.toLowerCase().replace(/ /g, '_');
                    const description = String(getVal(row, 'description', 'notes', 'detail') || `Bulk import: ${activity_type}`);

                    // Financials
                    const rawAmount = getVal(row, 'amount', 'cost', 'total_cost', 'financial', 'value', 'price');
                    let total_cost = 0;
                    if (rawAmount) {
                        const numericPart = String(rawAmount).replace(/[^\d.-]/g, '');
                        total_cost = parseFloat(numericPart) || 0;
                    }

                    // Transaction Type
                    const transStr = String(getVal(row, 'transaction', 'type', 'nature') || '').toLowerCase();
                    const transaction_type = (transStr.includes('income') || activity_type.includes('harvest') || transStr.includes('revenue') || transStr.includes('sale')) ? 'income' : 'expense';

                    // Link to assets
                    const opName = String(getVal(row, 'operation', 'asset', 'crop', 'infrastructure', 'structure') || '');
                    let field_id = findFieldId(getVal(row, 'field', 'location', 'parcel'));
                    let crop_id = findCropId(opName);
                    let infrastructure_id = findInfraId(opName);

                    return {
                        activity_date,
                        activity_type: activity_type.substring(0, 50), // Cap length
                        description: description.substring(0, 500), // Cap length
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
            return res.status(400).json({ message: 'No valid data found in file mapping' });
        }

        const createdActivities = await Activity.bulkCreate(activitiesToCreate);

        res.status(201).json({
            message: `Successfully imported ${createdActivities.length} activities`,
            count: createdActivities.length,
            notification: {
                message: `SYSTEM SYNC: ${createdActivities.length} RECORDS ARCHIVED`,
                type: 'success'
            }
        });

    } catch (error) {
        console.error('[BulkUpload] Critical Error:', error);
        res.status(500).json({
            message: 'Error processing bulk upload',
            error: error.message,
            notification: {
                message: `IMPORT FAILURE: ${error.message.toUpperCase()}`,
                type: 'error'
            }
        });
    } finally {
        // Safe cleanup
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkError) {
                console.error('[BulkUpload] Cleanup Failed:', unlinkError);
            }
        }
    }
};
