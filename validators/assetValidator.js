import Joi from 'joi';

const assetSchema = Joi.object({
  // This Regex allows: letters, numbers, dashes (-), and underscores (_)
  assetTag: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).min(3).max(20).required()
    .messages({
      'string.pattern.base': 'Asset Tag can only contain letters, numbers, dashes, and underscores.'
    }),
  model: Joi.string().min(2).required(),
  status: Joi.string().valid('In Stock', 'Deployed', 'Repair', 'Retired').default('In Stock'),
  LocationId: Joi.number().integer().positive().allow(null)
});

export default assetSchema;