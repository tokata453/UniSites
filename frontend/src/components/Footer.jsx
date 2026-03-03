export default function Footer () {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center px-6">
        {/* Left side: Logo and description */}
        <div className="flex flex-col items-center mb-6 md:mb-0">
          {/* Logo placeholder */}
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded mr-2"></div>
            <span className="text-xl font-bold">LOGO</span>
          </div>
          {/* Description placeholder */}
          <p className="text-lg text-gray-300 text-center">
            Placeholder for company description or tagline.
          </p>
        </div>

        {/* Right side: Contact info */}
        <div className="text-center">
          <h3 className="font-semibold mb-2">Contact Info</h3>
          <p className="text-lg text-gray-300">
            123 Placeholder Street, City, Country
          </p>
          <p className="text-lg text-gray-300">012/345 678 910 | email@example.com</p>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-gray-700 mt-6 pt-4 text-center text-gray-500 text-lg">
        © 2026 Placeholder. All rights reserved.
      </div>
    </footer>
  );
};
