const express = require('express');
const router = express.Router();
const path = require('path');

const { getImgList } = require(path.join(process.cwd(), 'controller', 'ImgList'));

router.post('/', async (req, res, next) => {
  try {
    await getImgList(req, res);
  } catch (error) {
    console.error('ImgList route error:', error);
    sendJson(res, 500, "获取图片列表失败", { message: error.message });
  }
});

module.exports = router;
