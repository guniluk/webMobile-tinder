import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const SignUpForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [genderPreference, setGenderPreference] = useState("");

  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !age || !gender || !genderPreference) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }

    const numericAge = Number(age);
    if (isNaN(numericAge) || numericAge < 18 || numericAge > 100) {
      toast.error("나이는 18세 이상 100세 이하만 가능합니다.");
      return;
    }

    if (password.length < 4) {
      toast.error("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    try {
      await signup({
        name,
        email,
        password,
        age: numericAge,
        gender,
        genderPreference,
      });
      toast.success("회원가입이 완료되었습니다!");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all duration-200"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all duration-200"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          required
          minLength={4}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="•••••••• (4자 이상)"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all duration-200"
        />
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Age
        </label>
        <input
          type="number"
          required
          min={18}
          max={100}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="18"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all duration-200"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Gender
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setGender("male")}
            className={`py-2 px-3 text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer ${
              gender === "male"
                ? "border-pink-500 bg-pink-50 text-pink-600 font-semibold"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => setGender("female")}
            className={`py-2 px-3 text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer ${
              gender === "female"
                ? "border-pink-500 bg-pink-50 text-pink-600 font-semibold"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Female
          </button>
        </div>
      </div>

      {/* Gender Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Interested In
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["male", "female", "both"].map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => setGenderPreference(pref)}
              className={`py-2 px-2 text-xs sm:text-sm font-medium rounded-xl border capitalize transition-all duration-200 cursor-pointer ${
                genderPreference === pref
                  ? "border-pink-500 bg-pink-50 text-pink-600 font-semibold"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {pref === "both" ? "Everyone" : pref}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !gender || !genderPreference}
        className="w-full mt-3 py-3 px-4 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium rounded-xl shadow-lg shadow-pink-500/25 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
};

export default SignUpForm;
