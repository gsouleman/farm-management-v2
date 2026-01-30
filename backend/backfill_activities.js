const { Activity, Farm } = require('./models');

const backfill = async () => {
    try {
        const firstFarm = await Farm.findOne();
        if (!firstFarm) {
            console.log('No farms found to backfill activities.');
            return;
        }

        const updatedCount = await Activity.update(
            { farm_id: firstFarm.id },
            { where: { farm_id: null } }
        );

        console.log(`Backfilled ${updatedCount[0]} activities with farm_id: ${firstFarm.id}`);
        process.exit(0);
    } catch (error) {
        console.error('Backfill failed:', error);
        process.exit(1);
    }
};

backfill();
