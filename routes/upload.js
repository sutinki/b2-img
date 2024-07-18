const express = require('express');
const router = express.Router();
const path = require('path');

const { getUpload, upload } = require(path.join(process.cwd(), 'controller', 'Upload'));

router.post('/', upload.single('file_'), async (req, res, next) => {
  try {
    await getUpload(req, res);
  } catch (error) {
    console.error('Upload route error:', error);
    sendJson(res, 500, "上传文件失败", { message: error.message });
  }
});

module.exports = router;
