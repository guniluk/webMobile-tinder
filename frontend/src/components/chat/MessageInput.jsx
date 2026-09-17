import { useState } from "react";
import { Send } from "lucide-react";

const QUICK_EMOJIS = ["👋", "💖", "✨", "😊", "🔥"];

const MessageInput = ({ onSendMessage, isSending }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || isSending) return;
    onSendMessage(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickEmoji = (emoji) => {
    onSendMessage(emoji);
  };

  return (
    <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-gray-100">
      {/* Quick Emoji Bar */}
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <span className="text-[11px] text-gray-400 font-medium mr-1">빠른 답장:</span>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleQuickEmoji(emoji)}
            disabled={isSending}
            className="text-sm sm:text-base px-2 py-0.5 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer hover:scale-110 active:scale-95 disabled:opacity-50"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={isSending}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-gray-900 rounded-2xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-sm outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="p-3 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:scale-95 text-white rounded-2xl shadow-md shadow-pink-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shrink-0"
          title="보내기"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
