import { useEffect } from "react";
import { HiHome } from "react-icons/hi";
import {
  HiAdjustmentsHorizontal,
  HiCodeBracket,
  HiUser,
} from "react-icons/hi2";
import { useLocation, useNavigate } from "react-router-dom";
const SIDE_BAR_ITEM = [
  {
    name: "Home",
    icon: <HiHome />,
    url: "/",
  },
  {
    name: "Profile",
    icon: <HiUser />,
    url: "/profile",
  },
  {
    name: "Settings",
    icon: <HiAdjustmentsHorizontal />,
    url: "/settings",
  },
];
if (environments.isDevelopment) {
  SIDE_BAR_ITEM.push({
    name: "Dev Tools",
    icon: <HiCodeBracket />,
    url: "/dev-tools",
  });
}

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="bg-base-100 h-full top-0 left-0 min-w-[80px] flex flex-col gap-3 items-center justify-center">
      {SIDE_BAR_ITEM.map((item, idx) => {
        let className = `flex flex-col items-center gap-2 px-3 py-2 hover:text-base-content ease-in-out transition-colors
        ${item.url === pathname ? `text-primary` : `text-base-300`}`;

        return (
          <button
            key={idx}
            className={className}
            onClick={() => navigate(item.url)}
          >
            <div className="text-2xl">{item.icon}</div>
            <div className="text-sm">{item.name}</div>
          </button>
        );
      })}
    </div>
  );
}
