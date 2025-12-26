const express = require('express');
const router = express.Router();
const multer = require('multer');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.post('/', authMiddleware, upload.single('zipFile'), projectController.createProject);
router.get('/', authMiddleware, projectController.getProjects);
router.get('/:projectId', authMiddleware, projectController.getProjectById);

module.exports = router;