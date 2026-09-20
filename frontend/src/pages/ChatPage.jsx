import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircleHeart } from 'lucide-react';
import { useMatchStore } from '../store/useMatchStore';
import { useMessageStore } from '../store/useMessageStore';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const { matches, getMyMatches } = useMatchStore();
  const {
    messages,
    isLoadingMessages,
    isSendingMessage,
    getMessages,
    sendMessage,
    setActiveChatUserId,
  } = useMessageStore();

  const matchUser = matches.find((m) => m._id === targetUserId);

  useEffect(() => {
    if (matches.length === 0) {
      getMyMatches();
    }
  }, [matches.length, getMyMatches]);

  useEffect(() => {
    if (targetUserId) {
      setActiveChatUserId(targetUserId);
      getMessages(targetUserId);
    }

    return () => {
      setActiveChatUserId(null);
    };
  }, [targetUserId, getMessages, setActiveChatUserId]);

  const handleSendMessage = (content) => {
    if (!targetUserId) return;
    sendMessage(targetUserId, content);
  };

  return (
    <div className="h-full w-full flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
      {/* Desktop Left: Matches Sidebar (Hidden on mobile when chat is open) */}
      <div className="hidden md:flex md:w-80 lg:w-96 shrink-0 h-full min-h-0 overflow-hidden">
        <Sidebar />
      </div>

      {/* Right: Main Chat Area */}
      <main className="flex-1 flex flex-col h-full min-h-0 bg-white/60 backdrop-blur-xs overflow-hidden relative">
        {matchUser ? (
          <>
            {/* Chat Top Header */}
            <ChatHeader matchUser={matchUser} />

            {/* Conversation Messages */}
            <MessageList
              messages={messages}
              isLoading={isLoadingMessages}
              matchUser={matchUser}
            />

            {/* Message Input Bar */}
            <MessageInput
              onSendMessage={handleSendMessage}
              isSending={isSendingMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-pink-50 text-pink-500 flex items-center justify-center mb-4">
              <MessageCircleHeart className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">
              상대방 정보를 찾을 수 없습니다
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              존재하지 않거나 매치 목록에 없는 사용자입니다.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-2xl text-sm shadow-md shadow-pink-500/20 hover:from-pink-600 hover:to-rose-600 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              홈으로 돌아가기
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
