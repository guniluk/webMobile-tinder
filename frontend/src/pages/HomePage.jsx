import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const HomePage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("로그아웃되었습니다.");
      navigate("/auth");
    } catch {
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center">
        {/* Tinder Logo */}
        <div className="w-16 h-16 bg-linear-to-tr from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30 mx-auto mb-4">
          <svg
            className="w-9 h-9 text-white fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12.75 2c-.17 0-.34.05-.48.15-2.2 1.63-4.22 4.07-5.02 7.07-.63 2.37-.32 4.79.88 6.8 1.19 1.99 3.12 3.39 5.37 3.86 2.25.47 4.63-.04 6.57-1.4 1.94-1.36 3.17-3.48 3.38-5.85.22-2.37-.62-4.69-2.28-6.42-.14-.14-.33-.22-.53-.21-.2 0-.39.1-.51.26-.52.71-1.15 1.33-1.85 1.84-.19.14-.44.15-.65.04-.2-.11-.32-.32-.31-.55.08-1.57-.26-3.14-1-4.52-.74-1.38-1.85-2.52-3.21-3.27-.1-.06-.23-.1-.36-.1z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tinder Home</h1>
        {user ? (
          <p className="text-sm text-gray-600 mb-6">
            안녕하세요, <span className="font-semibold text-pink-600">{user.name}</span>님! ({user.email})
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-6">홈 화면에 오신 것을 환영합니다.</p>
        )}

        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 cursor-pointer"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default HomePage;
