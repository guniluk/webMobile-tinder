import { useState, useRef } from "react";
import { X, Heart, Sparkles, User as UserIcon, Info } from "lucide-react";
import { useMatchStore } from "../store/useMatchStore";

const SwipeCard = ({ user }) => {
  const { swipeRight, swipeLeft } = useMatchStore();
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showFullBio, setShowFullBio] = useState(false);
  const cardRef = useRef(null);

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset.x > 120) {
      swipeRight(user);
    } else if (dragOffset.x < -120) {
      swipeLeft(user);
    }
    setDragOffset({ x: 0, y: 0 });
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset.x > 100) {
      swipeRight(user);
    } else if (dragOffset.x < -100) {
      swipeLeft(user);
    }
    setDragOffset({ x: 0, y: 0 });
  };

  // Rotation and opacity calculations
  const rotateDeg = dragOffset.x * 0.08;
  const likeOpacity = Math.min(Math.max(dragOffset.x / 100, 0), 1);
  const nopeOpacity = Math.min(Math.max(-dragOffset.x / 100, 0), 1);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm sm:max-w-md select-none">
      {/* Card Container */}
      <div
        ref={cardRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.3}px, 0) rotate(${rotateDeg}deg)`,
          transition: isDragging
            ? "none"
            : "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        className="relative w-full h-120 sm:h-135 rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-100/50"
      >
        {/* User Image */}
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-pink-400 to-rose-600 text-white p-6">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <p className="text-xl font-bold">{user.name}</p>
          </div>
        )}

        {/* Swipe Feedback Stamp Badges */}
        {/* LIKE Stamp (Right Swipe) */}
        <div
          style={{ opacity: likeOpacity }}
          className="absolute top-8 left-8 border-4 border-emerald-400 text-emerald-400 font-extrabold text-2xl sm:text-3xl px-4 py-1.5 rounded-2xl -rotate-20 uppercase tracking-wider backdrop-blur-xs pointer-events-none transition-opacity shadow-lg"
        >
          LIKE
        </div>

        {/* NOPE Stamp (Left Swipe) */}
        <div
          style={{ opacity: nopeOpacity }}
          className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 font-extrabold text-2xl sm:text-3xl px-4 py-1.5 rounded-2xl rotate-20 uppercase tracking-wider backdrop-blur-xs pointer-events-none transition-opacity shadow-lg"
        >
          NOPE
        </div>

        {/* Bottom Gradient Overlay & User Details */}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent pt-24 pb-6 px-6 text-white pointer-events-none">
          <div className="flex items-baseline gap-2.5 mb-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user.name}
            </h2>
            <span className="text-xl sm:text-2xl font-light text-gray-200">
              {user.age}
            </span>
            <span className="ml-auto px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-xs capitalize font-medium text-gray-100">
              {user.gender === "male"
                ? "남성"
                : user.gender === "female"
                  ? "여성"
                  : user.gender}
            </span>
          </div>

          {/* User Bio */}
          {user.bio ? (
            <div className="pointer-events-auto">
              <p
                onClick={() => setShowFullBio((prev) => !prev)}
                className={`text-xs sm:text-sm text-gray-200 leading-relaxed cursor-pointer ${
                  showFullBio ? "" : "line-clamp-2"
                }`}
              >
                {user.bio}
              </p>
              {user.bio.length > 60 && (
                <button
                  type="button"
                  onClick={() => setShowFullBio((prev) => !prev)}
                  className="text-[11px] text-pink-300 hover:text-pink-200 underline mt-0.5 inline-flex items-center gap-0.5"
                >
                  <Info className="w-3 h-3" />
                  {showFullBio ? "접기" : "더보기"}
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              작성된 소개글이 없습니다.
            </p>
          )}
        </div>
      </div>

      {/* Swipe Action Buttons */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 mt-6">
        {/* Pass (Dislike) Button */}
        <button
          type="button"
          onClick={() => swipeLeft(user)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-xl hover:shadow-rose-500/20 text-rose-500 hover:text-rose-600 border border-rose-100 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group"
          title="Pass (Swipe Left)"
        >
          <X className="w-7 h-7 group-hover:stroke-[2.5]" />
        </button>

        {/* Super Like / Sparkle Deco Button */}
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-400 to-amber-500 text-white shadow-md flex items-center justify-center cursor-default opacity-80">
          <Sparkles className="w-5 h-5" />
        </div>

        {/* Like Button */}
        <button
          type="button"
          onClick={() => swipeRight(user)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-linear-to-tr from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-xl shadow-pink-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group"
          title="Like (Swipe Right)"
        >
          <Heart className="w-7 h-7 fill-white group-hover:scale-105 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default SwipeCard;
