import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, Heart, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { updateProfile, loading } = useUserStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [gender, setGender] = useState(user?.gender || 'male');
  const [genderPreference, setGenderPreference] = useState(
    user?.genderPreference || 'both',
  );
  const [image, setImage] = useState(user?.image || '');
  const [isImageChanged, setIsImageChanged] = useState(false);

  const [prevUser, setPrevUser] = useState(user);

  if (user !== prevUser) {
    setPrevUser(user);
    setName(user?.name || '');
    setBio(user?.bio || '');
    setAge(user?.age ? String(user.age) : '');
    setGender(user?.gender || 'male');
    setGenderPreference(user?.genderPreference || 'both');
    setImage(user?.image || '');
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setIsImageChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('이름을 입력해주세요.');
      return;
    }

    const numericAge = Number(age);
    if (isNaN(numericAge) || numericAge < 18 || numericAge > 100) {
      toast.error('나이는 18세 이상 100세 이하로 입력해주세요.');
      return;
    }

    if (!gender) {
      toast.error('성별을 선택해주세요.');
      return;
    }

    if (!genderPreference) {
      toast.error('선호 성별을 선택해주세요.');
      return;
    }

    const payload = {
      name: name.trim(),
      bio: bio.trim(),
      age: numericAge,
      gender,
      genderPreference,
    };

    if (isImageChanged && image) {
      payload.image = image;
    }

    try {
      await updateProfile(payload);
      navigate('/');
    } catch {
      // toast handled in useUserStore
      toast.error('프로필 업데이트에 실패했습니다.');
    }
  };

  return (
    <div className="w-full min-h-full pt-8 sm:pt-12 pb-16 sm:pb-24 px-3 sm:px-6 flex flex-col items-center justify-start">
      <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-10 my-2 sm:my-4">
        {/* Header with Back button and Title */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-gray-100">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-pink-100 hover:text-pink-600 px-3 py-2 rounded-xl border border-gray-200 transition-all shadow-xs"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            Back
          </Link>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Your Profile
          </h1>
          <div className="w-16 sm:w-20"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Age Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Age
            </label>
            <input
              type="number"
              required
              min={18}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
              className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          {/* Gender Field */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </span>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`flex items-center gap-3 py-2.5 px-4 text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer ${
                    gender === item.value
                      ? 'border-pink-500 bg-pink-50 text-pink-700 font-semibold shadow-xs'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={item.value}
                    checked={gender === item.value}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-4 h-4 text-pink-600 accent-pink-600 focus:ring-pink-500 cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gender Preference Field */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Interested In
            </span>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: 'male', label: 'Men' },
                { value: 'female', label: 'Women' },
                { value: 'both', label: 'Everyone' },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`flex items-center gap-2 sm:gap-2.5 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer ${
                    genderPreference === item.value
                      ? 'border-pink-500 bg-pink-50 text-pink-700 font-semibold shadow-xs'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="genderPreference"
                    value={item.value}
                    checked={genderPreference === item.value}
                    onChange={(e) => setGenderPreference(e.target.value)}
                    className="w-4 h-4 text-pink-600 accent-pink-600 focus:ring-pink-500 cursor-pointer shrink-0"
                  />
                  <span className="truncate">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Introduction Showcase Photo Section */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
              <label className="block text-sm font-semibold text-gray-800">
                Introduction Photo
              </label>
              <span className="text-xs text-pink-600 font-medium">
                매칭 시 상대방에게 보여지는 대표 사진
              </span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border-2 border-dashed border-pink-200 bg-linear-to-b from-pink-50/50 to-gray-50 hover:border-pink-400 transition-all duration-200 cursor-pointer group flex flex-col items-center justify-center text-center p-3 sm:p-4 shadow-inner"
            >
              {image ? (
                <>
                  <img
                    src={image}
                    alt="Introduction showcase"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  {/* Overlay for hovering/editing */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white p-4">
                    <div className="p-2.5 sm:p-3 bg-white/20 backdrop-blur-md rounded-full mb-1.5 sm:mb-2">
                      <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">
                      사진 변경하기
                    </span>
                    <span className="text-[11px] sm:text-xs text-gray-200 mt-0.5">
                      클릭하여 새 소개 사진을 선택하세요
                    </span>
                  </div>

                  {/* Corner Badge */}
                  <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-black/60 backdrop-blur-md text-white text-[11px] sm:text-xs font-medium rounded-lg flex items-center gap-1 sm:gap-1.5">
                    <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-400 fill-pink-400" />
                    대표 소개 사진
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform duration-200 shadow-xs">
                    <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">
                      소개 사진 추가하기
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                      상대방에게 매력을 어필할 멋진 사진을 올려보세요 (최대 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 px-4 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                  Saving Profile...
                </span>
              ) : (
                'Save Profile'
              )}
            </button>

            <Link
              to="/"
              className="w-full py-3 sm:py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-semibold rounded-xl border border-gray-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
              Back to Home (홈으로 돌아가기)
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
