const express = require('express');
const router = express.Router();
const { createAgent, getAllAgents } = require('../controllers/agentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, createAgent);
router.get('/', authMiddleware, getAllAgents);

module.exports = router;