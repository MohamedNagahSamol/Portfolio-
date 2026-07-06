import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getProjects, getProjectById, createProject, updateProject, deleteProject,
  getSkills, getSkillById, createSkill, updateSkill, deleteSkill,
  getExperience, getExperienceById, createExperience, updateExperience, deleteExperience,
  getCertificates, getCertificateById, createCertificate, updateCertificate, deleteCertificate,
  getBlog, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost
} from '../controllers/contentController.js';

const router = Router();

router.get('/projects', getProjects);
router.get('/projects/:id', getProjectById);

router.get('/skills', getSkills);
router.get('/skills/:id', getSkillById);

router.get('/experience', getExperience);
router.get('/experience/:id', getExperienceById);

router.get('/certificates', getCertificates);
router.get('/certificates/:id', getCertificateById);

router.get('/blog', getBlog);
router.get('/blog/:id', getBlogPostById);

router.post('/admin/projects', authMiddleware, createProject);
router.put('/admin/projects/:id', authMiddleware, updateProject);
router.delete('/admin/projects/:id', authMiddleware, deleteProject);

router.post('/admin/skills', authMiddleware, createSkill);
router.put('/admin/skills/:id', authMiddleware, updateSkill);
router.delete('/admin/skills/:id', authMiddleware, deleteSkill);

router.post('/admin/experience', authMiddleware, createExperience);
router.put('/admin/experience/:id', authMiddleware, updateExperience);
router.delete('/admin/experience/:id', authMiddleware, deleteExperience);

router.post('/admin/certificates', authMiddleware, createCertificate);
router.put('/admin/certificates/:id', authMiddleware, updateCertificate);
router.delete('/admin/certificates/:id', authMiddleware, deleteCertificate);

router.post('/admin/blog', authMiddleware, createBlogPost);
router.put('/admin/blog/:id', authMiddleware, updateBlogPost);
router.delete('/admin/blog/:id', authMiddleware, deleteBlogPost);

export default router;
