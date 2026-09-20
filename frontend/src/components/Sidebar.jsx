import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircleHeart,
  Users,
  Loader2,
  Sparkles,
  Send,
} from 'lucide-react';
import { useMatchStore } from '../store/useMatchStore';
import { useAuthStore } from '../store/useAuthStore';
import { useMessageStore } from '../store/useMessageStore';

const Sidebar = () => {
  const { matches, isLoadingMatches, getMyMatches } = useMatchStore();
  const { onlineUsers } = useAuthStore();
  const { unreadSenders } = useMessageStore();

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
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            온라인 {matches.filter((m) => onlineUsers.includes(m._id)).length}명
          </span>
          <span className="px-2.5 py-1 bg-linear-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-xs shadow-pink-500/20">
            {matches.length}
          </span>
        </div>
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
          matches.map((match) => {
            const isOnline = onlineUsers.includes(match._id);
            const hasUnread = unreadSenders.includes(match._id);

            return (
              <Link
                key={match._id}
                to={`/chat/${match._id}`}
                className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-200 group border cursor-pointer ${
                  hasUnread
                    ? 'bg-rose-50/80 border-rose-200 shadow-xs hover:bg-rose-100/70'
                    : 'hover:bg-pink-50/70 active:bg-pink-100/50 border-transparent hover:border-pink-100/80 hover:shadow-xs'
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 transition-colors shrink-0 shadow-xs ${
                      hasUnread
                        ? 'border-rose-500 ring-2 ring-rose-300/50'
                        : 'border-pink-200 group-hover:border-pink-500'
                    }`}
                  >
                    {match.image ? (
                      <img
                        src={match.image}
                        alt={match.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-pink-100 text-pink-500 font-bold text-sm">
                        {match.name?.[0] || '?'}
                      </div>
                    )}
                  </div>

                  {/* Airplane Icon on Top-Left of Avatar when unread */}
                  {hasUnread && (
                    <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-linear-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/30 animate-bounce">
                      <Send className="w-2.5 h-2.5 fill-white text-white rotate-45 translate-x-[-0.5px] translate-y-[-0.5px]" />
                    </div>
                  )}

                  {/* Realtime Status Dot Badge (Bottom-Right) */}
                  {isOnline ? (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-xs"></span>
                    </span>
                  ) : (
                    <span className="absolute -bottom-0.5 -right-0.5 inline-flex rounded-full h-3.5 w-3.5 bg-gray-300 border-2 border-white shadow-xs"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4
                        className={`font-bold text-sm truncate transition-colors ${
                          hasUnread
                            ? 'text-rose-600 font-extrabold'
                            : 'text-gray-900 group-hover:text-pink-600'
                        }`}
                      >
                        {match.name}
                      </h4>

                      {/* Airplane icon next to name */}
                      {hasUnread && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-white px-1.5 py-0.5 rounded-full border border-rose-200 shadow-xs shrink-0">
                          <Send className="w-2.5 h-2.5 fill-rose-500 text-rose-500 rotate-45" />
                          새 메시지
                        </span>
                      )}

                      {isOnline && !hasUnread && (
                        <span className="shrink-0 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-100">
                          온라인
                        </span>
                      )}
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p
                    className={`text-xs truncate mt-0.5 ${
                      hasUnread
                        ? 'text-rose-500 font-semibold'
                        : 'text-gray-500 font-normal'
                    }`}
                  >
                    {hasUnread
                      ? '✈️ 새로운 메시지가 도착했습니다!'
                      : isOnline
                        ? '지금 대화 가능합니다!'
                        : '새로운 매치! 메시지를 보내보세요.'}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
