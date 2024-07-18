import React from 'react';

function Footer() {
  return (
    <footer className=" border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} B2-IMG 图床. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
