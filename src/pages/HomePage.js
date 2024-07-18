import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function HomePage() {
  const navigate = useNavigate();

  const handleUseNow = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/upload');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <img
          src={logo}
          alt="BlazeB2 Avatar"
          className="w-24 h-24 mx-auto mb-6"
        />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Backblaze 图床</h1>
        <p className="text-xl text-gray-600 mb-8">
          基于Backblaze B2和Cloudflare的CDN图床
        </p>
        <p className="text-gray-500 mb-8">
          供个人图片托管使用 📸 请自觉管理内容并遵守相关法律法规 👀
        </p>
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handleUseNow}
            className="px-6 py-2 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
          >
            立即使用 
          </button>
          <a
            href="https://github.com/sutinki/b2-img"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-white text-gray-800 border border-gray-300 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
          >
            Github 源码
          </a>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
