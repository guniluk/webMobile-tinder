import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageCircleHeart, Users, Loader2, Sparkles } from "lucide-react";
import { useMatchStore } from "../store/useMatchStore";

const Sidebar = () => {
  const { matches, isLoadingMatches, getMyMatches } = useMatchStore();

  useEffect(() => {
    getMyMatches();
  }, [getMyMatches]);

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-white/95 backdrop-blur-md border-r border-gray-200 flex flex-col h-full min-h-0 shadow-[2px_0_12px_-4px_rgba(0,0,0,0.03)] z-10">
      {/* Sidebar Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-pink-50 text-pink-600 rounded-xl shadow-xs">
            <MessageCircleHeart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">
              Matches
            </h2>
            <p className="text-xs text-gray-400">대화를 시작해보세요</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 bg-linear-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-xs shadow-pink-500/20">
          {matches.length}
        </span>
      </div>

      {/* Matches List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 divide-y divide-gray-50/50">
        {isLoadingMatches ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
            <span className="text-xs font-medium">
              매칭 목록을 불러오는 중...
            </span>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-400 flex items-center justify-center mb-3 shadow-inner">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">
              아직 매치된 상대가 없습니다
            </h3>
            <p className="text-xs text-gray-400 max-w-50 leading-relaxed">
              오른쪽 카드를 스와이프하여 마음에 드는 상대에게 좋아요를
              보내보세요!
            </p>
          </div>
        ) : (
          matches.map((match) => (
            <Link
              key={match._id}
              to={`/chat/${match._id}`}
              className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-pink-50/70 active:bg-pink-100/50 transition-all duration-200 group border border-transparent hover:border-pink-100/80 hover:shadow-xs cursor-pointer"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-pink-200 group-hover:border-pink-500 transition-colors shrink-0 shadow-xs">
                  {match.image ? (
                    <img
                      src={match.image}
                      alt={match.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-pink-100 text-pink-500 font-bold text-sm">
                      {match.name?.[0] || "?"}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-pink-600 transition-colors">
                    {match.name}
                  </h4>
                  <Sparkles className="w-3.5 h-3.5 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5 font-normal">
                  새로운 매치! 메시지를 보내보세요.
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
