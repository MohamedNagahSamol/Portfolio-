import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  projectValidator,
  skillValidator,
  experienceValidator,
  certificateValidator,
  blogPostValidator,
  idParamValidator
} from '../validators/index.js';
import {
  getProjects, getProjectById, createProject, updateProject, deleteProject,
  getSkills, getSkillById, createSkill, updateSkill, deleteSkill,
  getExperience, getExperienceById, createExperience, updateExperience, deleteExperience,
  getCertificates, getCertificateById, createCertificate, updateCertificate, deleteCertificate,
  getBlog, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost
} from '../controllers/contentController.js';

const router = Router();

router.get('/projects', getProjects);
router.get('/projects/:id', idParamValidator, validate, getProjectById);

router.get('/skills', getSkills);
router.get('/skills/:id', idParamValidator, validate, getSkillById);

router.get('/experience', getExperience);
router.get('/experience/:id', idParamValidator, validate, getExperienceById);

router.get('/certificates', getCertificates);
router.get('/certificates/:id', idParamValidator, validate, getCertificateById);

router.get('/blog', getBlog);
router.get('/blog/:id', idParamValidator, validate, getBlogPostById);

router.post('/admin/projects', authMiddleware, projectValidator, validate, createProject);
router.put('/admin/projects/:id', authMiddleware, idParamValidator, projectValidator, validate, updateProject);
router.delete('/admin/projects/:id', authMiddleware, idParamValidator, validate, deleteProject);

router.post('/admin/skills', authMiddleware, skillValidator, validate, createSkill);
router.put('/admin/skills/:id', authMiddleware, idParamValidator, skillValidator, validate, updateSkill);
router.delete('/admin/skills/:id', authMiddleware, idParamValidator, validate, deleteSkill);

router.post('/admin/experience', authMiddleware, experienceValidator, validate, createExperience);
router.put('/admin/experience/:id', authMiddleware, idParamValidator, experienceValidator, validate, updateExperience);
router.delete('/admin/experience/:id', authMiddleware, idParamValidator, validate, deleteExperience);

router.post('/admin/certificates', authMiddleware, certificateValidator, validate, createCertificate);
router.put('/admin/certificates/:id', authMiddleware, idParamValidator, certificateValidator, validate, updateCertificate);
router.delete('/admin/certificates/:id', authMiddleware, idParamValidator, validate, deleteCertificate);

router.post('/admin/blog', authMiddleware, blogPostValidator, validate, createBlogPost);
router.put('/admin/blog/:id', authMiddleware, idParamValidator, blogPostValidator, validate, updateBlogPost);
router.delete('/admin/blog/:id', authMiddleware, idParamValidator, validate, deleteBlogPost);

export default router;
