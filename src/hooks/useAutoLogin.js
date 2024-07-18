// src/hooks/useAutoLogin.js
import { useEffect } from 'react';
import { login } from '../api/axiosConfig';

const useAutoLogin = () => {
  useEffect(() => {
    const autoLogin = async () => {
      const tokenString = localStorage.getItem('token');
      if (!tokenString) return;

      const lastLoginTime = localStorage.getItem('lastLoginTime');
      const currentTime = new Date().getTime();

      // 检查上次登录是否在24小时内
      if (lastLoginTime && (currentTime - parseInt(lastLoginTime)) < 24 * 60 * 60 * 1000) {
        console.log('Login still valid, skipping auto login');
        return;
      }

      try {
        const formData = JSON.parse(tokenString);
        const response = await login(formData);

        if (response.state === 200) {
          // 存储 authInfo
          localStorage.setItem('authInfo', JSON.stringify({
            authorizationToken: response.data.authInfo.authorizationToken,
            apiUrl: response.data.authInfo.apiInfo.storageApi.apiUrl,
            bucketId: response.data.authInfo.apiInfo.storageApi.bucketId
          }));

          // 存储 uploadInfo
          localStorage.setItem('uploadInfo', JSON.stringify({
            uploadUrl: response.data.uploadInfo.uploadUrl,
            authorizationToken: response.data.uploadInfo.authorizationToken
          }));

          // 存储 deleteInfo
          localStorage.setItem('deleteInfo', response.data.authInfo.apiInfo.storageApi.apiUrl);

          // 更新最后登录时间
          localStorage.setItem('lastLoginTime', currentTime.toString());

          console.log('Auto login successful');
        } else {
          console.error('Auto login failed:', response.data.message);
        }
      } catch (error) {
        console.error('Error during auto login:', error);
      }
    };

    autoLogin();
  }, []);
};

export default useAutoLogin;
