import React, { useState, useEffect, useRef } from 'react';
import { getImageList, deleteImage } from '../api/axiosConfig';
import Toast from '../components/Toast';
import cssIcon from '../assets/icons/css_icon.png';
import jsIcon from '../assets/icons/js_icon.png';
import jsonIcon from '../assets/icons/json_icon.png';
import xmlIcon from '../assets/icons/xml_icon.png';
import defaultIcon from '../assets/icons/default_icon.png';
import SearchBar from '../components/SearchBar';

function Gallery() {
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [displayedImages, setDisplayedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const lastImageRef = useRef();
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 新增：视图模式状态
  const [searchTerm, setSearchTerm] = useState('');
  const [nextFileName, setNextFileName] = useState(null);
  // 获取图片列表
  const fetchImageList = async (prefix = '', startFileName = '') => {
    try {
      const customUrl = JSON.parse(localStorage.getItem('token')).customUrl;
      setLoading(true);
      const response = await getImageList(prefix, startFileName);
      const imgList = response.data.files.map(file => ({
        id: file.fileName,
        fileId: file.fileId,
        src: `${customUrl}${file.fileName}`,
        uploadTimestamp: file.uploadTimestamp
      }));
      // 按照上传时间降序排序
      const sortedImgList = imgList.sort((a, b) => b.uploadTimestamp - a.uploadTimestamp);
      setImages(prevImages => [...prevImages, ...sortedImgList]);
      setNextFileName(response.data.nextFileName);
      setError(null);
      return sortedImgList; // 返回新获取的图片列表
    } catch (error) {
      console.error('Failed to fetch image list:', error);
      setError('Failed to load images. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  };
  // 删除图片
  const handleImageDelete = async (fileName, fileId) => {
    try {
      await deleteImage(fileName, fileId);
      setImages(prevImages => prevImages.filter(img => img.fileId !== fileId));
      setDisplayedImages(prevDisplayed => prevDisplayed.filter(img => img.fileId !== fileId));

      // 显示成功 Toast
      setToastMessage('图片已成功删除');
      setIsToastVisible(true);
      setTimeout(() => setIsToastVisible(false), 3000);
    } catch (error) {
      console.error('Image deletion failed:', error);

      // 显示失败 Toast
      setToastMessage('删除图片失败，请稍后重试');
      setIsToastVisible(true);
      setTimeout(() => setIsToastVisible(false), 3000);
    }
  };
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        const initialImages = await fetchImageList(searchTerm);
        setImages(initialImages);
      } catch (error) {
        console.error('Error during initial load:', error);
        setError('Failed to load images. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, [searchTerm]);

  useEffect(() => {
    setDisplayedImages(images);
  }, [images]); // 当 images 更新时更新 displayedImages

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextFileName) {
        loadMoreImages();
      }
    }, options);

    if (lastImageRef.current) {
      observer.current.observe(lastImageRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [displayedImages, nextFileName, loading]);


  const loadMoreImages = async () => {
    if (!loading && nextFileName) {
      setLoading(true);
      const newImages = await fetchImageList(searchTerm, nextFileName);
      setDisplayedImages(prevImages => [...prevImages, ...newImages]);
      setLoading(false);

      // 如果加载完所有图片后 nextFileName 为 null，再次尝试加载
      if (newImages.length > 0 && nextFileName === null) {
        setTimeout(() => loadMoreImages(), 100);
      }
    }
  };
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'css':
        return cssIcon;;
      case 'js':
      case 'jsx':
        return jsIcon;
      case 'json':
        return jsonIcon;
      case 'xml':
        return xmlIcon;
      // 添加更多文件类型
      default:
        return defaultIcon;
    }
  };
  const isImage = (fileName) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'ico', 'avif', 'svg'];
    const extension = fileName.split('.').pop().toLowerCase();
    return imageExtensions.includes(extension);
  };
  const handleFileClick = (file) => {
    if (isImage(file.id)) {
      setPreviewImage(file);
    } else {
      // 处理非图片文件,比如下载或在新标签页中打开
      window.open(file.src, '_blank');
    }
  };
  // 新增：切换视图模式
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'grid' ? 'list' : 'grid');
  };

  // 新增：刷新图片列表
  const refreshImageList = async () => {
    setImages([]);
    setDisplayedImages([]);
    setNextFileName(null);
    const refreshedImages = await fetchImageList(searchTerm);
    setDisplayedImages(refreshedImages);
    setToastMessage('图片列表已刷新');
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };
  const handleSearch = (term) => {
    setSearchTerm(term);
    setImages([]);
    setDisplayedImages([]);
    setNextFileName(null);
    // 移除这里的 fetchImageList 调用
  };
  const truncateFilename = (filename, maxLength = 30) => {
    if (filename.length <= maxLength) return filename;
    return filename.substr(0, maxLength - 3) + '...';
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <SearchBar onSearch={handleSearch} />
        </div>
        <div className="flex space-x-2">
          <button
            className="p-2 text-gray-600 hover:text-gray-800"
            onClick={toggleViewMode}
          >
            {viewMode === 'grid' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            )}
          </button>
          <button
            className="p-2 text-gray-600 hover:text-gray-800"
            onClick={refreshImageList}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      <div className={viewMode === 'grid' ?
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4" :
        "space-y-4"
      }>
        {displayedImages.map((file, index) => (
          <div
            key={file.id}
            className={`relative group ${viewMode === 'list' ? 'flex items-center bg-white p-4 rounded-lg shadow-md' : ''}`}
            ref={index === displayedImages.length - 1 ? lastImageRef : null}
            onClick={() => handleFileClick(file)}
          >
            {isImage(file.id) ? (
              <img
                src={file.src}
                alt={file.id}
                className={`${viewMode === 'grid' ? 'w-full h-40 object-cover' : 'w-20 h-20 object-cover flex-shrink-0'} rounded-lg cursor-pointer`}
              />
            ) : (
              <div className={`${viewMode === 'grid' ? 'w-full h-40' : 'w-20 h-20 flex-shrink-0'} flex items-center justify-center bg-gray-200 rounded-lg cursor-pointer`}>
                <img src={getFileIcon(file.id)} alt={file.id} className="w-128 h-128" />
              </div>
            )}
            {viewMode === 'list' && (
              <div className="ml-4 flex-grow min-w-0">
                <p className="text-sm text-gray-800 truncate" title={file.id}>
                  {truncateFilename(file.id)}
                </p>
              </div>
            )}
            <div className={`${viewMode === 'grid' ? 'absolute inset-0' : 'ml-auto'}`}>
              <div className={`${viewMode === 'grid' ? 'absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-lg' : ''}`}></div>
              <div className={`${viewMode === 'grid' ? 'absolute top-2 right-2' : ''} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <button
                  className="p-1 bg-red-500 text-white rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageDelete(file.id, file.fileId);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {viewMode === 'grid' && (
                <p className="absolute bottom-2 left-2 right-2 text-sm text-white truncate">{file.id}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-xl text-gray-700">加载中...</p>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setPreviewImage(null)}>
          <img
            src={previewImage.src}
            alt={previewImage.id}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
      {error && (
        <div className="text-center mt-4 text-red-500">
          <p>{error}</p>
        </div>
      )}
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}

export default Gallery;