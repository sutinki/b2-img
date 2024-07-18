const express = require('express');
const router = express.Router();
const path = require('path');

const { getAuth } = require(path.join(process.cwd(), 'controller', 'Auth'));
router.post('/', async (req, res, next) => {
  try {
    await getAuth(req, res);
  } catch (error) {
    console.error('Route error:', error);
    sendJson(res, 500, "服务器内部错误", { message: error.message });
  }
});

module.exports = router;
