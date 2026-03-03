import React from 'react';
import { FaPhoneAlt, FaFacebook, FaInstagram, FaTelegramPlane, FaYoutube } from 'react-icons/fa';

export default function TopHeaderBar () {
  return (
    <div className="w-full bg-[#f8f9fa] py-2 px-4 md:px-8 border-b border-gray-200 flex justify-between items-center text-xs sm:text-sm text-gray-700">
      {/* Main Container: Light gray background, flexbox to space left/right items */}
      
      {/* Left Side: Phone Number */}
      <div className="flex items-center gap-2 font-medium">
        <FaPhoneAlt className="text-gray-500" />
        <span>(+855) 123 456 789</span>
      </div>

      {/* Right Side: Social Media Links */}
      <div className="flex items-center gap-3 font-medium">
        <span className="hidden sm:inline-block">Social Media:</span>
        <div className="flex items-center gap-2">
          {/* Facebook */}
          <a href="#" aria-label="Facebook" className="text-[#1877F2] hover:opacity-80 transition-opacity">
            <FaFacebook size={18} />
          </a>
          
          {/* Instagram */}
          <a href="#" aria-label="Instagram" className="text-[#E4405F] hover:opacity-80 transition-opacity">
            <FaInstagram size={18} />
          </a>
          
          {/* Telegram */}
          <a href="#" aria-label="Telegram" className="text-[#229ED9] hover:opacity-80 transition-opacity">
            <FaTelegramPlane size={18} />
          </a>
          
          {/* YouTube */}
          <a href="#" aria-label="YouTube" className="text-[#FF0000] hover:opacity-80 transition-opacity">
            <FaYoutube size={18} />
          </a>
        </div>
      </div>

    </div>
  );
};
