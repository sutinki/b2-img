import axios from 'axios';

const instance = axios.create({
  baseURL:'/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 获取存储的token信息
const getStoredToken = () => {
  const tokenString = localStorage.getItem('token');
  return tokenString ? JSON.parse(tokenString) : null;
};

// 获取存储的授权信息
const getStoredAuthInfo = () => {
  const authInfoString = localStorage.getItem('authInfo');
  return authInfoString ? JSON.parse(authInfoString) : null;
};

// 获取存储的上传信息
const getStoredUploadInfo = () => {
  const uploadInfoString = localStorage.getItem('uploadInfo');
  return uploadInfoString ? JSON.parse(uploadInfoString) : null;
};

// 获取存储的删除信息
const getStoredDeleteInfo = () => {
  return localStorage.getItem('deleteInfo');
};

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    if (config.url === '/upload') {
      const uploadInfo = getStoredUploadInfo();
      config.headers['Authorization'] = uploadInfo.authorizationToken;
    } else {
      const authInfo = getStoredAuthInfo();
      if (authInfo && authInfo.authorizationToken) {
        config.headers['Authorization'] = authInfo.authorizationToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    if (response.data.state === 200) {
      return response.data;
    }
    return Promise.reject(response.data);
  },
  (error) => {
    console.error('Request failed:', error);
    return Promise.reject(error);
  }
);

// 登录
export const login = () => {
  const token = getStoredToken();
  return instance.post('/auth', {
    applicationKeyId: token.applicationKeyId,
    applicationKey: token.applicationKey
  });
};

// 获取图片列表
export const getImageList = (prefix = '', startFileName = '') => {
  const authInfo = getStoredAuthInfo();
  return instance.post('/imglist', {
    bucketId: authInfo.bucketId,
    apiUrl: authInfo.apiUrl,
    prefix: prefix,
    startFileName: startFileName
  });
};

// 在上传函数中移除 Authorization 设置
export const uploadImage = (file) => {
  const uploadInfo = getStoredUploadInfo();
  const formData = new FormData();
  formData.append('file_', file);
  return instance.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'x-bz-info-uploadurl': uploadInfo.uploadUrl,
      'suffix': file.name.split('.').pop()
    }
  });
};

// 删除图片
export const deleteImage = (fileName, fileId) => {
  const deleteInfo = getStoredDeleteInfo();
  return instance.post('/delPic', {
    fileName,
    fileId,
    apiUrl: deleteInfo
  });
};

export default instance;