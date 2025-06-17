const Resource = require('../../models/Resource');
const asyncHandler = require('../../utils/asyncHandler');

const isValidURL = (url) => {
    const urlRegex = /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-]*)*\/?$/;
    return urlRegex.test(url);
};

const allowedTypes = ['video', 'article', 'podcast', 'guide'];
const allowedLanguages = ['English', 'Hindi', 'Tamil', 'Malayalam'];
const allowedTags = ['anxiety', 'study', 'sleep'];

const resourceController = {

    createResource: asyncHandler(async (req, res) => {

        const { title, type, language, link, tags } = req.body;

        if (!title || !type || !language || !link) {
            return res.status(400).json({ error: 'All required fields must be filled.' });
        }
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid resource type.' });
        }
        if (!allowedLanguages.includes(language)) {
            return res.status(400).json({ error: 'Invalid language.' });
        }
        if (!isValidURL(link)) {
            return res.status(400).json({ error: 'Invalid URL format.' });
        }
        if (tags && !tags.every(tag => allowedTags.includes(tag))) {
            return res.status(400).json({ error: 'One or more tags are invalid.' });
        }

        const resource = new Resource({
            title,
            type,
            language,
            link,
            tags,
            CreatedBy: req.userId,
        });

        await resource.save();
        res.status(201).json(resource);
    }),

    getOwnResources: asyncHandler(async (req, res) => {
        const resources = await Resource.find({ CreatedBy: req.userId })
            .populate('CreatedBy', 'FullName Role');

        if (!resources) { return res.status(404).json({ message: 'No resources found' }); }

        res.json(resources);
    }),

    updateResource: asyncHandler(async (req, res) => {

        const { title, type, language, link, tags } = req.body;

        if (type && !allowedTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid resource type.' });
        }
        if (language && !allowedLanguages.includes(language)) {
            return res.status(400).json({ error: 'Invalid language.' });
        }
        if (link && !isValidURL(link)) {
            return res.status(400).json({ error: 'Invalid URL format.' });
        }
        if (tags && !tags.every(tag => allowedTags.includes(tag))) {
            return res.status(400).json({ error: 'One or more tags are invalid.' });
        }

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