const express = require('express');
const router = express.Router();
const path = require('path');

const { getDelPic } = require(path.join(process.cwd(), 'controller', 'DelPic'));

router.post('/', async (req, res, next) => {
  try {
    await getDelPic(req, res);
  } catch (error) {
    console.error('DelPic route error:', error);
    sendJson(res, 500, "删除图片失败", { message: error.message });
  }
});

module.exports = router;
