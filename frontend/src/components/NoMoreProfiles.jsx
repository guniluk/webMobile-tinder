import { Sparkles, RefreshCw } from "lucide-react";
import { useMatchStore } from "../store/useMatchStore";

const NoMoreProfiles = () => {
  const { getUserProfiles, isLoadingProfiles } = useMatchStore();

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 max-w-sm sm:max-w-md w-full">
      <div className="w-20 h-20 bg-linear-to-tr from-pink-100 to-rose-100 text-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
        <Sparkles className="w-10 h-10" />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        새로운 프로필이 없습니다
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
        주변의 모든 추천 프로필을 확인하셨습니다.
        <br />
        잠시 후 다시 확인하거나 프로필 설정을 변경해보세요!
      </p>

      <button
        type="button"
        onClick={() => getUserProfiles()}
        disabled={isLoadingProfiles}
        className="inline-flex items-center gap-2 py-3 px-6 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-2xl shadow-lg shadow-pink-500/25 transition-all duration-200 cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
      >
        <RefreshCw
          className={`w-4 h-4 ${isLoadingProfiles ? "animate-spin" : ""}`}
        />
        {isLoadingProfiles ? "새로고침 중..." : "다시 찾아보기"}
      </button>
    </div>
  );
};

export default NoMoreProfiles;
