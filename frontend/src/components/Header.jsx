import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  Flame,
  User as UserIcon,
  ChevronDown,
  UserPen,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const Header = () => {
  const { user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      await logout();
      toast.success("로그아웃되었습니다.");
      navigate("/auth");
    } catch {
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const handleNavigation = (path) => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="w-10 h-10 bg-linear-to-tr from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform duration-200">
            <Flame className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Tinder
          </span>
        </Link>

        {/* Right - Desktop: Profile Dropdown (hidden on small screens) */}
        <div className="hidden sm:block relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 py-1.5 px-3 rounded-full hover:bg-gray-100 border border-gray-200/80 transition-all duration-200 cursor-pointer group"
            aria-expanded={isDropdownOpen}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-pink-200 flex items-center justify-center shrink-0">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs"></span>
            </div>

            <span className="text-sm font-semibold text-gray-800 max-w-30 truncate">
              {user?.name || "사용자"}
            </span>

            <ChevronDown
              className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180 text-pink-500" : ""
              }`}
            />
          </button>

          {/* Desktop Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              <button
                type="button"
                onClick={() => handleNavigation("/profile")}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
              >
                <UserPen className="w-4 h-4 text-gray-400 group-hover:text-pink-500" />
                프로필 변경
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                로그아웃
              </button>
            </div>
          )}
        </div>

        {/* Right - Mobile: Hamburger Button (visible only on small screens) */}
        <div className="flex items-center sm:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-xl text-gray-600 hover:text-pink-600 hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none"
            aria-label="메뉴 열기"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Fullscreen Menu via Portal (Solid White Opaque Background, Covering all under elements) */}
      {isMobileMenuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 w-screen h-screen bg-white z-9999 flex flex-col justify-between p-6 sm:hidden animate-in fade-in duration-150">
            {/* Top Section */}
            <div className="space-y-6">
              {/* Header in Mobile Menu with Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-linear-to-tr from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md shadow-pink-500/20">
                    <Flame className="w-6 h-6 text-white fill-white" />
                  </div>
                  <span className="text-xl font-bold bg-linear-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    Tinder
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
                  aria-label="메뉴 닫기"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Profile Card */}
              <div className="p-4 bg-linear-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 flex items-center gap-3.5 shadow-xs">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-pink-300 flex items-center justify-center shrink-0 shadow-xs">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user?.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-gray-900 truncate">
                      {user?.name || "사용자"}
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.2 rounded-md">
                      온라인
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleNavigation("/")}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 text-base font-semibold text-gray-800 hover:bg-gray-100 rounded-2xl transition-colors cursor-pointer"
                >
                  <div className="p-2 bg-gray-100 rounded-xl">
                    <Home className="w-5 h-5 text-gray-600" />
                  </div>
                  홈 화면
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigation("/profile")}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 text-base font-semibold text-gray-800 hover:bg-pink-50 hover:text-pink-600 rounded-2xl transition-colors cursor-pointer group"
                >
                  <div className="p-2 bg-pink-50 text-pink-600 rounded-xl group-hover:bg-pink-100">
                    <UserPen className="w-5 h-5" />
                  </div>
                  프로필 변경
                </button>
              </nav>
            </div>

            {/* Bottom Section - Logout Button */}
            <div className="pt-4 border-t border-gray-100 pb-4">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-base rounded-2xl transition-colors cursor-pointer shadow-xs"
              >
                <LogOut className="w-5 h-5 text-rose-500" />
                로그아웃
              </button>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
};

export default Header;
