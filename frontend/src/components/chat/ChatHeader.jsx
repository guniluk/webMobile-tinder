import { ArrowLeft, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const ChatHeader = ({ matchUser }) => {
  const navigate = useNavigate();
  const { onlineUsers } = useAuthStore();

  const isOnline = matchUser?._id && onlineUsers.includes(matchUser._id);

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs z-10">
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          title="뒤로 가기"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-gray-100 border-2 border-pink-200 flex items-center justify-center shrink-0 shadow-xs">
              {matchUser?.image ? (
                <img
                  src={matchUser.image}
                  alt={matchUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* Realtime Status Dot */}
            {isOnline ? (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-xs"></span>
              </span>
            ) : (
              <span className="absolute -bottom-0.5 -right-0.5 inline-flex rounded-full h-3.5 w-3.5 bg-gray-300 border-2 border-white shadow-xs"></span>
            )}
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
              {matchUser?.name || "사용자"}
            </h3>
            <p className="text-xs flex items-center gap-1.5 mt-0.5">
              {isOnline ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  온라인
                </span>
              ) : (
                <span className="text-gray-400">오프라인</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
