import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Certificate from '../models/Certificate.js';
import BlogPost from '../models/BlogPost.js';

function getAll(Model, sortField) {
  return async (req, res) => {
    try {
      const filter = {};
      if (req.query.category && Model === Project) {
        filter.category = req.query.category;
      }
      const docs = await Model.find(filter).sort({ [sortField]: 1 });
      res.json({ success: true, data: docs });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
}

function getById(Model) {
  return async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
      res.json({ success: true, data: doc });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
}

function create(Model) {
  return async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
}

function update(Model) {
  return async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
      res.json({ success: true, data: doc });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
}

function remove(Model) {
  return async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
      res.json({ success: true, message: 'Deleted successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
}

export const getProjects = getAll(Project, 'order');
export const getProjectById = getById(Project);
export const createProject = create(Project);
export const updateProject = update(Project);
export const deleteProject = remove(Project);

export const getSkills = getAll(Skill, 'order');
export const getSkillById = getById(Skill);
export const createSkill = create(Skill);
export const updateSkill = update(Skill);
export const deleteSkill = remove(Skill);

export const getExperience = getAll(Experience, 'order');
export const getExperienceById = getById(Experience);
export const createExperience = create(Experience);
export const updateExperience = update(Experience);
export const deleteExperience = remove(Experience);

export const getCertificates = getAll(Certificate, 'order');
export const getCertificateById = getById(Certificate);
export const createCertificate = create(Certificate);
export const updateCertificate = update(Certificate);
export const deleteCertificate = remove(Certificate);

export const getBlog = getAll(BlogPost, '-publishedAt');
export const getBlogPostById = getById(BlogPost);
export const createBlogPost = create(BlogPost);
export const updateBlogPost = update(BlogPost);
export const deleteBlogPost = remove(BlogPost);
