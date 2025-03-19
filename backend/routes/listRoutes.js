const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  uploadAndDistributeList, 
  getDistributedLists 
} = require('../controllers/listController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', 
  authMiddleware, 
  upload.single('file'), 
  uploadAndDistributeList
);
router.get('/distributed', authMiddleware, getDistributedLists);

module.exports = router;