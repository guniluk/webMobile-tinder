import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import { useAuthStore } from "./store/useAuthStore";
import { useMatchStore } from "./store/useMatchStore";
import { useMessageStore } from "./store/useMessageStore";
import { useEffect } from "react";

const App = () => {
  const { isAuthenticated, checkAuth, loading, socket } = useAuthStore();
  const { subscribeToNewMatches, unsubscribeFromNewMatches } = useMatchStore();
  const { subscribeToGlobalMessages, unsubscribeFromGlobalMessages } =
    useMessageStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && socket) {
      subscribeToNewMatches();
      subscribeToGlobalMessages();
    }
    return () => {
      unsubscribeFromNewMatches();
      unsubscribeFromGlobalMessages();
    };
  }, [
    isAuthenticated,
    socket,
    subscribeToNewMatches,
    unsubscribeFromNewMatches,
    subscribeToGlobalMessages,
    unsubscribeFromGlobalMessages,
  ]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff,#fef9c3)] bg-size-[72px_72px,72px_72px,100%_100%] flex flex-col overflow-hidden">
      {/* Show Header on all pages except auth */}
      {isAuthenticated && <Header />}

      {/* Main Content Area filling remaining vertical space */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <HomePage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/auth"
            element={isAuthenticated ? <Navigate to="/" /> : <AuthPage />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <ProfilePage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/chat/:id"
            element={isAuthenticated ? <ChatPage /> : <Navigate to="/auth" />}
          />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
