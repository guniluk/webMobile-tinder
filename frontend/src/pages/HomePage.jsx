import { useEffect, useState } from 'react';
import { Flame, MessageCircleHeart, Loader2 } from 'lucide-react';
import { useMatchStore } from '../store/useMatchStore';
import Sidebar from '../components/Sidebar';
import SwipeCard from '../components/SwipeCard';
import NoMoreProfiles from '../components/NoMoreProfiles';

const HomePage = () => {
  const {
    userProfiles,
    isLoadingProfiles,
    getUserProfiles,
    getMyMatches,
    matches,
  } = useMatchStore();

  // Mobile tab state: 'discover' (swipe feed) or 'matches' (matches list)
  const [mobileTab, setMobileTab] = useState('discover');

  useEffect(() => {
    getUserProfiles();
    getMyMatches();
  }, [getUserProfiles, getMyMatches]);

  return (
    <div className="h-full w-full flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
      {/* Mobile Tab Switcher (< md) */}
      <div className="md:hidden flex items-center justify-around bg-white border-b border-gray-100 p-2 shadow-xs z-10 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('discover')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mobileTab === 'discover'
              ? 'bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Flame className="w-4 h-4" />
          Discover
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('matches')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mobileTab === 'matches'
              ? 'bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <MessageCircleHeart className="w-4 h-4" />
          Matches ({matches.length})
        </button>
      </div>

      {/* Left: Matches Sidebar (Desktop is always visible and fills 100% height; Mobile is tab dependent) */}
      <div
        className={`${
          mobileTab === 'matches' ? 'flex-1 flex' : 'hidden'
        } md:flex md:w-80 lg:w-96 shrink-0 h-full min-h-0 overflow-hidden`}
      >
        <Sidebar />
      </div>

      {/* Right: Main Swipe Discovery Feed (Desktop is always visible; Mobile is tab dependent) */}
      <main
        className={`${
          mobileTab === 'discover' ? 'flex' : 'hidden'
        } md:flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto h-full min-h-0`}
      >
        {isLoadingProfiles ? (
          <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
            <div className="w-16 h-16 rounded-3xl bg-pink-50 flex items-center justify-center text-pink-500 shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              새로운 추천 상대를 찾고 있습니다...
            </p>
          </div>
        ) : userProfiles.length > 0 ? (
          <div className="w-full flex justify-center py-2 animate-in fade-in duration-300">
            <SwipeCard key={userProfiles[0]._id} user={userProfiles[0]} />
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <NoMoreProfiles />
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
