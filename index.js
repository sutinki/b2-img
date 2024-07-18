const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
require(path.join(process.cwd(), 'common', 'utils'));

// 中间件
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public/build')));

// 路由配置
const routes = {
  auth: require('./routes/auth'),
  imgList: require('./routes/imgList'),
  upload: require('./routes/upload'),
  delPic: require('./routes/delPic')
};

Object.entries(routes).forEach(([path, router]) => {
  app.use(`/api/${path}`, router);
});
// API 404 处理
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API 路由未找到' });
});
// 处理所有其他路由，返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/build', 'index.html'));
});
// 错误处理
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器启动成功，监听端口 ${PORT}`);
});

module.exports = app; // 导出 app 以便测试
