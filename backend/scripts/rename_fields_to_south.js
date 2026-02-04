const { sequelize, Field } = require('../models');

async function renameFields() {
    try {
        console.log('--- STARTING DATABASE MIGRATION: RENAMING FIELDS TO SOUTH ---');

        // 1. Update Fields table
        const [updatedFields] = await Field.update(
            { name: 'SOUTH' },
            {
                where: {
                    name: ['N/A', 'General Field', 'NOT SPECIFIED']
                }
            }
        );
        console.log(`Updated ${updatedFields} fields from [N/A, General Field, NOT SPECIFIED] to SOUTH.`);

        // 2. Check and Update Activities if name is stored literally in description (optional but good for consistency)
        // Actually, the user specifically asked for those columns/forms. 
        // The most important part is the Field table since it's the source of truth for name resolution.

        console.log('--- MIGRATION COMPLETE ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

renameFields();
