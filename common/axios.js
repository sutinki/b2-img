const axios = require('axios');

const requestAuth = axios.create({
    timeout: 12000 // 请求超时时间
});

// 异常拦截处理器
const errorHandler = (error) => {
    if (error.response) {
        console.error('Response error:', error.response.data);
    } else if (error.request) {
        console.error('Request error:', error.request);
    } else {
        console.error('Error:', error.message);
    }
    return Promise.reject(error);
};

// 请求拦截
requestAuth.interceptors.request.use(
    (config) => config,
    errorHandler
);

// 响应拦截
requestAuth.interceptors.response.use(
    (response) => response.data || response,
    errorHandler
);

module.exports = { requestAuth };
