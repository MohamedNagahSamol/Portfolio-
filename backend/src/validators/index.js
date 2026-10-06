import { body, param } from 'express-validator';

// Helper predicate: On POST all required fields must be present.
// On PUT/PATCH, only validate the field if provided in req.body.
const isPostOrDefined = (field) => (value, { req }) => {
  if (req.method === 'POST') return true;
  return value !== undefined;
};

/**
 * Project Validator Schema
 */
export const projectValidator = [
  body('title.en')
    .if(isPostOrDefined('title.en'))
    .isString().withMessage('English title must be a string.').bail()
    .trim()
    .notEmpty().withMessage('English title is required.'),
  body('title.ar')
    .if(isPostOrDefined('title.ar'))
    .isString().withMessage('Arabic title must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Arabic title is required.'),
  body('description.en')
    .if(isPostOrDefined('description.en'))
    .isString().withMessage('English description must be a string.').bail()
    .trim()
    .notEmpty().withMessage('English description is required.'),
  body('description.ar')
    .if(isPostOrDefined('description.ar'))
    .isString().withMessage('Arabic description must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Arabic description is required.'),
  body('category')
    .if(isPostOrDefined('category'))
    .isString().withMessage('Category must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Category is required.').bail()
    .isIn(['backend', 'frontend', 'fullstack', 'simple'])
    .withMessage('Category must be one of: backend, frontend, fullstack, simple.'),
  body('stack')
    .optional()
    .isArray().withMessage('Stack must be an array of strings.'),
  body('stack.*')
    .optional()
    .isString().withMessage('Each stack item must be a string.'),
  body('links')
    .optional()
    .isObject().withMessage('Links must be an object.'),
  body('links.github')
    .optional()
    .isString().withMessage('GitHub link must be a string.'),
  body('links.frontend')
    .optional()
    .isString().withMessage('Frontend link must be a string.'),
  body('links.backend')
    .optional()
    .isString().withMessage('Backend link must be a string.'),
  body('links.admin')
    .optional()
    .isString().withMessage('Admin link must be a string.'),
  body('image')
    .optional()
    .isString().withMessage('Image URL must be a string.'),
  body('featured')
    .optional()
    .isBoolean().withMessage('Featured must be a boolean.'),
  body('order')
    .optional()
    .isInt().withMessage('Order must be an integer.')
];

/**
 * Skill Validator Schema
 */
export const skillValidator = [
  body('name')
    .if(isPostOrDefined('name'))
    .isString().withMessage('Skill name must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Skill name is required.'),
  body('category')
    .if(isPostOrDefined('category'))
    .isString().withMessage('Skill category must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Skill category is required.'),
  body('icon')
    .optional()
    .isString().withMessage('Icon must be a string.'),
  body('order')
    .optional()
    .isInt().withMessage('Order must be an integer.')
];

/**
 * Experience Validator Schema
 */
export const experienceValidator = [
  body('title.en')
    .if(isPostOrDefined('title.en'))
    .isString().withMessage('English title must be a string.').bail()
    .trim()
    .notEmpty().withMessage('English title is required.'),
  body('title.ar')
    .if(isPostOrDefined('title.ar'))
    .isString().withMessage('Arabic title must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Arabic title is required.'),
  body('organization.en')
    .if(isPostOrDefined('organization.en'))
    .isString().withMessage('English organization must be a string.').bail()
    .trim()
    .notEmpty().withMessage('English organization is required.'),
  body('organization.ar')
    .if(isPostOrDefined('organization.ar'))
    .isString().withMessage('Arabic organization must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Arabic organization is required.'),
  body('startDate')
    .if(isPostOrDefined('startDate'))
    .notEmpty().withMessage('Start date is required.').bail()
    .isISO8601().withMessage('Start date must be a valid ISO8601 date string.'),
  body('endDate')
    .optional({ nullable: true, values: 'falsy' })
    .isISO8601().withMessage('End date must be a valid ISO8601 date string.'),
  body('description.en')
    .optional()
    .isString().withMessage('English description must be a string.'),
  body('description.ar')
    .optional()
    .isString().withMessage('Arabic description must be a string.'),
  body('order')
    .optional()
    .isInt().withMessage('Order must be an integer.')
];

/**
 * Certificate Validator Schema
 */
export const certificateValidator = [
  body('title.en')
    .if(isPostOrDefined('title.en'))
    .isString().withMessage('English title must be a string.').bail()
    .trim()
    .notEmpty().withMessage('English title is required.'),
  body('title.ar')
    .if(isPostOrDefined('title.ar'))
    .isString().withMessage('Arabic title must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Arabic title is required.'),
  body('issuer')
    .if(isPostOrDefined('issuer'))
    .isString().withMessage('Issuer must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Issuer is required.'),
  body('date')
    .if(isPostOrDefined('date'))
    .notEmpty().withMessage('Date is required.').bail()
    .isISO8601().withMessage('Date must be a valid ISO8601 date string.'),
  body('credentialUrl')
    .optional()
    .isString().withMessage('Credential URL must be a string.'),
  body('image')
    .optional()
    .isString().withMessage('Image URL must be a string.'),
  body('order')
    .optional()
    .isInt().withMessage('Order must be an integer.')
];

/**
 * BlogPost Validator Schema
 */
export const blogPostValidator = [
  body('title.en')
    .if(isPostOrDefined('title.en'))
    .isString().withMessage('English title must be a string.').bail()
    .trim()
    .notEmpty().withMessage('English title is required.'),
  body('title.ar')
    .if(isPostOrDefined('title.ar'))
    .isString().withMessage('Arabic title must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Arabic title is required.'),
  body('excerpt.en')
    .optional()
    .isString().withMessage('English excerpt must be a string.'),
  body('excerpt.ar')
    .optional()
    .isString().withMessage('Arabic excerpt must be a string.'),
  body('content.en')
    .optional()
    .isString().withMessage('English content must be a string.'),
  body('content.ar')
    .optional()
    .isString().withMessage('Arabic content must be a string.'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array of strings.'),
  body('tags.*')
    .optional()
    .isString().withMessage('Each tag must be a string.'),
  body('coverImage')
    .optional()
    .isString().withMessage('Cover image URL must be a string.'),
  body('externalUrl')
    .optional()
    .isString().withMessage('External URL must be a string.'),
  body('publishedAt')
    .optional({ nullable: true, values: 'falsy' })
    .isISO8601().withMessage('PublishedAt must be a valid ISO8601 date string.')
];

/**
 * ID Parameter Validator
 */
export const idParamValidator = [
  param('id')
    .isMongoId().withMessage('Invalid ID format.')
];

/**
 * Auth Validator Schema (Login)
 */
export const authValidator = [
  body('email')
    .isString().withMessage('Email must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Email is required.').bail()
    .isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password')
    .isString().withMessage('Password must be a string.').bail()
    .notEmpty().withMessage('Password is required.').bail()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
];

/**
 * Contact Submission Validator Schema
 */
export const contactValidator = [
  body('name')
    .isString().withMessage('Name must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Name is required.'),
  body('email')
    .isString().withMessage('Email must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Email is required.').bail()
    .isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('message')
    .isString().withMessage('Message must be a string.').bail()
    .trim()
    .notEmpty().withMessage('Message is required.')
];
