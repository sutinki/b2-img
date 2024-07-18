import React, { useCallback, useState,useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from '../api/axiosConfig';
import Toast from '../components/Toast';

function ImageUploader() {
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(location.state?.showWelcomeMessage);
  const [files, setFiles] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [uploadedLinks, setUploadedLinks] = useState({});
  const customUrl = JSON.parse(localStorage.getItem('token'))?.customUrl || '';

  const showToast = (message) => {
    setToast({ message, isVisible: true });
    setTimeout(() => setToast({ message: '', isVisible: false }), 3000);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.filter(file => file.size <= 5 * 1024 * 1024);
    if (newFiles.length + files.length > 10) {
      showToast('最多只能上传10张图片');
      return;
    }
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setUploadQueue((prevQueue) => [...prevQueue, ...newFiles]);
    if (newFiles.length !== acceptedFiles.length) {
      showToast('部分文件超过5MB大小限制，已被过滤');
    }
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  useEffect(() => {
    if (uploadQueue.length > 0 && !isUploading) {
      uploadNextImage();
    }
  }, [uploadQueue, isUploading]);
  useEffect(() => {
    if (showWelcome) {
      // 显示欢迎消息，可以使用 Toast 或其他方式
      showToast('登录成功，数据已保存到本地');
      setTimeout(() => setShowWelcome(false), 3000);
    }
  }, [showWelcome]);
  const uploadNextImage = async () => {
    if (uploadQueue.length === 0) {
      setIsUploading(false);
      return;
    }

    setIsUploading(true);
    const file = uploadQueue[0];

    try {
      const onProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(prev => ({ ...prev, [file.name]: percentCompleted }));
      };

      const result = await uploadImage(file, onProgress);
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

      // 使用 customUrl 和 fileName 构建完整的图片链接
      const imageUrl = `${customUrl}${result.data.fileName}`;
      setUploadedLinks(prev => ({ ...prev, [file.name]: imageUrl }));

      showToast(`${file.name} 上传成功`);
    } catch (error) {
      console.error('Image upload failed:', error);
      setUploadProgress(prev => ({ ...prev, [file.name]: 'Error' }));
      showToast(`${file.name} 上传失败`);
    } finally {
      setUploadQueue(prevQueue => prevQueue.slice(1));
      setIsUploading(false);
    }
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('链接已复制到剪贴板');
    });
  };
  const truncateFilename = (filename, maxLength = 30) => {
    if (filename.length <= maxLength) return filename;
    return filename.substr(0, maxLength - 3) + '...';
  };
  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      <div
        {...getRootProps()}
        className={`p-16 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors min-h-[400px] flex flex-col justify-center items-center ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
      >
        <input {...getInputProps()} />
        <div className="text-gray-600">
          <svg className="mx-auto h-32 w-32 text-gray-400 mb-6" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-2xl font-semibold mb-3">拖拽图片到此处或点击上传</p>
          <p className="text-base text-gray-500">支持拖动、点击、粘贴图片上传，最大支持5MB</p>
        </div>
      </div>

      {
        files.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-4">已上传文件:</h4>
            <div className="space-y-4">
              {files.map((file, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row items-center min-h-[120px] w-full">
                  <div className="w-16 h-16 bg-gray-200 rounded-md mb-4 sm:mb-0 sm:mr-4 flex-shrink-0 overflow-hidden">
                    {uploadedLinks[file.name] ? (
                      <img
                        src={uploadedLinks[file.name]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {uploadProgress[file.name] === 'Error' ? '失败' : '上传中'}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow text-center sm:text-left min-w-0">
                    <p className="font-medium truncate" title={file.name}>{truncateFilename(file.name)}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)}KB
                    </p>
                    {uploadProgress[file.name] && uploadProgress[file.name] !== 'Error' && (
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">{uploadProgress[file.name]}% 上传完成</p>
                      </div>
                    )}
                    {uploadProgress[file.name] === 'Error' && (
                      <p className="text-red-500 text-sm mt-1">上传失败</p>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                    {uploadedLinks[file.name] ? (
                      <button
                        onClick={() => copyToClipboard(uploadedLinks[file.name])}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 w-full sm:w-auto"
                      >
                        复制链接
                      </button>
                    ) : (
                      <button
                        className="bg-gray-300 text-gray-500 px-3 py-1 rounded cursor-not-allowed w-full sm:w-auto"
                        disabled
                      >
                        复制链接
                      </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ message: '', isVisible: false })}
      />
    </div>
  );
}

export default ImageUploader;