import { useState } from "react";
import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        {/* Tinder Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-linear-to-tr from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30 mb-3">
            <svg
              className="w-7 h-7 text-white fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12.75 2c-.17 0-.34.05-.48.15-2.2 1.63-4.22 4.07-5.02 7.07-.63 2.37-.32 4.79.88 6.8 1.19 1.99 3.12 3.39 5.37 3.86 2.25.47 4.63-.04 6.57-1.4 1.94-1.36 3.17-3.48 3.38-5.85.22-2.37-.62-4.69-2.28-6.42-.14-.14-.33-.22-.53-.21-.2 0-.39.1-.51.26-.52.71-1.15 1.33-1.85 1.84-.19.14-.44.15-.65.04-.2-.11-.32-.32-.31-.55.08-1.57-.26-3.14-1-4.52-.74-1.38-1.85-2.52-3.21-3.27-.1-.06-.23-.1-.36-.1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isLogin ? "Sign in to Tinder" : "Create Account"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin
              ? "Welcome back! Please enter your details."
              : "Find your perfect match today."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
              isLogin
                ? "bg-white text-gray-900 shadow-sm font-semibold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
              !isLogin
                ? "bg-white text-gray-900 shadow-sm font-semibold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Auth Forms */}
        {isLogin ? <LoginForm /> : <SignUpForm />}

        {/* Footer Toggle Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="font-semibold text-pink-600 hover:text-pink-700 hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="font-semibold text-pink-600 hover:text-pink-700 hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
