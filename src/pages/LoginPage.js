import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { login } from '../api/axiosConfig';
import eventBus from '../utils/eventBus';


function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    applicationKeyId: '',
    applicationKey: '',
    customUrl: '',
    bucketName: ''
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // 登录
  const handleLogin = async (formData) => {
    try {
      // 先保存表单数据到 localStorage
      localStorage.setItem('token', JSON.stringify(formData));

      // 然后发送登录请求
      const response = await login(formData);

      // 处理登录响应，存储返回的授权信息
      localStorage.setItem('authInfo', JSON.stringify({
        authorizationToken: response.data.authInfo.authorizationToken,
        apiUrl: response.data.authInfo.apiInfo.storageApi.apiUrl,
        bucketId: response.data.authInfo.apiInfo.storageApi.bucketId
      }));
      localStorage.setItem('uploadInfo', JSON.stringify({
        uploadUrl: response.data.uploadInfo.uploadUrl,
        authorizationToken: response.data.uploadInfo.authorizationToken
      }));
      localStorage.setItem('deleteInfo', response.data.authInfo.apiInfo.storageApi.apiUrl);

      return true; // 登录成功
    } catch (error) {
      console.error('Login failed:', error);
      return false; // 登录失败
    }
  };
  useEffect(() => {
    const savedData = localStorage.getItem('token');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData({
          applicationKeyId: parsedData.applicationKeyId || '',
          applicationKey: parsedData.applicationKey || '',
          customUrl: parsedData.customUrl || '',
          bucketName: parsedData.bucketName || ''
        });
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleLogin(formData);
    if (success) {
      // 在这里触发登录状态改变事件
      eventBus.dispatch('loginStateChange');
      navigate('/upload', { state: { showWelcomeMessage: true } });
    } else {
      setToastMessage('登录失败，请检查您的输入');
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);  // 3秒后自动关闭
  };

  return (
    <div className="flex flex-col justify-center sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          登录配置
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className=" py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="applicationKeyId" className="block text-sm font-medium text-gray-700">
                applicationKeyId
              </label>
              <div className="mt-1">
                <input
                  id="applicationKeyId"
                  name="applicationKeyId"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.applicationKeyId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="applicationKey" className="block text-sm font-medium text-gray-700">
                applicationKey
              </label>
              <div className="mt-1">
                <input
                  id="applicationKey"
                  name="applicationKey"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.applicationKey}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="customUrl" className="block text-sm font-medium text-gray-700">
                customUrl
              </label>
              <div className="mt-1">
                <input
                  id="customUrl"
                  name="customUrl"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.customUrl}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="bucketName" className="block text-sm font-medium text-gray-700">
                bucketName
              </label>
              <div className="mt-1">
                <input
                  id="bucketName"
                  name="bucketName"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.bucketName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                登录并保存
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

export default Login;