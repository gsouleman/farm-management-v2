const { Document, Farm } = require('../models');
const path = require('path');
const fs = require('fs');

exports.getFarmDocuments = async (req, res) => {
    try {
        const documents = await Document.findAll({
            where: { farm_id: req.params.farmId },
            order: [['created_at', 'DESC']]
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching farm documents' });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { farm_id, entity_type, entity_id, document_type, description, tags } = req.body;

        const document = await Document.create({
            farm_id,
            uploaded_by: req.user.id,
            entity_type,
            entity_id,
            file_name: req.file.originalname,
            file_type: req.file.mimetype,
            file_size: req.file.size,
            file_url: `/uploads/documents/${req.file.filename}`,
            document_type,
            description,
            tags: tags ? tags.split(',') : []
        });

        res.status(201).json(document);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading document' });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        // Delete physical file
        const filePath = path.join(__dirname, '../', document.file_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await document.destroy();
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting document' });
    }
};
