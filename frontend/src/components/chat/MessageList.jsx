import { useEffect, useRef } from "react";
import { MessageCircleHeart, Loader2, Sparkles } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const MessageList = ({ messages, isLoading, matchUser }) => {
  const { user: authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <p className="text-xs font-medium">메시지를 불러오는 중...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-pink-100 to-rose-100 text-pink-500 flex items-center justify-center mb-4 shadow-inner">
          <MessageCircleHeart className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-gray-800 text-base mb-1">
          {matchUser?.name ? `${matchUser.name}님과 매치되었습니다!` : "새로운 대화를 시작해보세요"}
        </h3>
        <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-4">
          첫인사를 건네거나 마음에 드는 이모지로 대화를 열어보세요! ✨
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-full text-xs font-semibold border border-pink-100">
          <Sparkles className="w-3.5 h-3.5" />
          Say Hello to {matchUser?.name || "Match"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      {messages.map((msg, index) => {
        const senderId =
          typeof msg.senderId === "object" ? msg.senderId?._id : msg.senderId;
        const isMyMessage = senderId === authUser?._id;

        return (
          <div
            key={msg._id || index}
            className={`flex items-end gap-2.5 ${
              isMyMessage ? "justify-end" : "justify-start"
            }`}
          >
            {/* Other User Avatar (only for other user's message) */}
            {!isMyMessage && (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-pink-200 shrink-0 mb-1">
                {matchUser?.image ? (
                  <img
                    src={matchUser.image}
                    alt={matchUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-pink-100 text-pink-500 font-bold text-xs">
                    {matchUser?.name?.[0] || "?"}
                  </div>
                )}
              </div>
            )}

            {/* Bubble Container */}
            <div
              className={`flex flex-col max-w-[75%] sm:max-w-md ${
                isMyMessage ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-xs ${
                  isMyMessage
                    ? "bg-linear-to-r from-pink-500 to-rose-500 text-white rounded-br-xs font-normal"
                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-xs shadow-gray-100"
                }`}
              >
                {msg.content}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {formatTime(msg.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
