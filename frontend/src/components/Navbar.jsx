import { ChevronRight, Menu, Smartphone, HardDrive, Monitor, Printer, Wifi,Shield } from "lucide-react";

const categories = [
  {
    name: "PC",
    icon: Smartphone
  },
  {
    name: "Hard Drive",
    icon: HardDrive,
  },
  {
    name: "Monitor",
    icon: Monitor,
  },
  {
    name: "Printer",
    icon: Printer,
  },
  {
    name: "Wifi",
    icon: Wifi,
  },
  {
    name: "Security",
    icon: Shield,
  },
];

export default function Navbar() {
  return (
    <nav className="w-full bg-white px-6 py-4 flex items-center gap-12">
      {/* LEFT: Browse Category + Dropdown */}
      <div className="relative group">
        {/* Browse button */}
        <button className="flex items-center gap-3 bg-white hover:bg-gray-200 px-5 py-3 rounded-xl font-medium transition">
          <Menu size={20} />
          <span>Browse Category</span>
          <ChevronRight size={18} />
        </button>

        {/* Dropdown (shows on hover) */}
        <div
          className="
            absolute left-0 mt-3 w-80
            bg-gray-100 rounded-xl
            shadow-lg border border-gray-200
            opacity-0 invisible
            group-hover:opacity-100 group-hover:visible
            transition-all duration-200
            z-50
          "
        >
          <ul className="p-3 space-y-2">
            {categories.map((category, i) => {
              const Icon = category.icon;

              return (
                <li
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-200 cursor-pointer transition"
                >
                  <div className="flex items-center gap-4">
                    
                    {/* icon */}
                    <Icon size={20} className="text-gray-600" />

                    {/* text */}
                    <span className="font-medium">
                      {category.name}
                    </span>
                  </div>

                  <ChevronRight size={18} className="text-gray-500" />
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* RIGHT: Navigation links */}
      <ul className="flex items-center gap-10 font-semibold">
        <li className="text-blue-500 cursor-pointer">HOME</li>
        <li className="cursor-pointer hover:text-blue-500">PRODUCTS</li>
        <li className="cursor-pointer hover:text-blue-500">CONTACT US</li>
        <li className="cursor-pointer hover:text-blue-500">ORDERS</li>
        <li className="cursor-pointer hover:text-blue-500">TRACK ORDER</li>
      </ul>
    </nav>
  );
}
