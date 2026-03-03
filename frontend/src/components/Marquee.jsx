import React from "react";

const brands = [
  { name: "HP", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/HP_New_Logo_2D.svg" },
  { name: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg" },
  { name: "Lenovo", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg" },
  { name: "Asus", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg" },
  { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Logitech", logo: "https://upload.wikimedia.org/wikipedia/commons/1/17/Logitech_logo.svg" },
  { name: "Razer", logo: "https://upload.wikimedia.org/wikipedia/en/4/40/Razer_Inc._logo.svg" },
  { name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg" },
  { name: "MSI", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/MSI_Logo_2019.svg" },
];
export default function Marquee() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white py-12">
      {/* small title */}
      <p className="mb-8 text-sm font-medium text-gray-500">
        OFFICIAL RETAILER FOR
      </p>

      {/* Marquee Container */}
      <div className="flex w-full overflow-hidden">
        
        {/* Animated Wrapper */}
        <div className="flex animate-marquee whitespace-nowrap">
          
          {/* logos */}
          {brands.map((brand, index) => (
            <div key={index} className="mx-8 flex w-37.5 items-center justify-center">
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-12 w-auto object-contain"
              />
            </div>
          ))}

          {/* duplicate for looping */}
          {brands.map((brand, index) => (
            <div key={`duplicate-${index}`} className="mx-8 flex w-37.5 items-center justify-center">
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-12 w-auto object-contain"
              />
            </div>
          ))}
          
        </div>
      </div>

      {/* Fade Gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-white to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-white to-transparent"></div>
    </div>
  );
}