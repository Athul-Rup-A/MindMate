const Resource = require('../../models/Resource');
const asyncHandler = require('../../utils/asyncHandler');

const resourceController = {

    createResource: asyncHandler(async (req, res) => {
        const resource = new Resource({
            ...req.body,
            CreatedBy: req.userId,
        });
        await resource.save();
        res.status(201).json(resource);
    }),

    getOwnResources: asyncHandler(async (req, res) => {
        const resources = await Resource.find({ CreatedBy: req.userId })
            .populate('CreatedBy', 'FullName Role');
        res.json(resources);
    }),

    updateResource: asyncHandler(async (req, res) => {
        const resource = await Resource.findOneAndUpdate(
            { _id: req.params.id, CreatedBy: req.userId },
            req.body,
            { new: true }
        );
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found or unauthorized' });
        }
        res.json(resource);
    }),

    deleteResource: asyncHandler(async (req, res) => {
        const resource = await Resource.findOneAndDelete({
            _id: req.params.id,
            CreatedBy: req.userId
        });
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found or unauthorized' });
        }
        res.json({ message: 'Resource deleted successfully' });
    })

};

module.exports = resourceController;