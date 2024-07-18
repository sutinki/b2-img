import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">哎呀!页面迷路了</h1>
      <p className="text-gray-500 mb-5">这把是不是你打的有问题?</p>
      <Link to="/" className="bg-white text-indigo-600 px-6 py-3 rounded-full text-lg font-semibold hover:bg-purple-100 transition duration-300">
        返回首页
      </Link>
    </div>
  );
}

export default NotFoundPage;
