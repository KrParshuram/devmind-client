
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";

import Login from "./pages/Login";
import RegisterPage from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Query from "./pages/Query";
import Collection from "./pages/Collections";
import Sidebar from "./components/Sidebar";
import AuthLayout from "./components/AuthLayout";
import Chat from "./pages/Chat";


// ===============================
// Layout
// ===============================

function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">

      {/* =========================
          Sidebar
      ========================== */}
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* =========================
          Main Application Area
      ========================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">

          <h1 className="text-white font-bold text-lg">
            DevMind
          </h1>

          <button
            onClick={() => setIsOpen(true)}
            className="text-white text-2xl"
          >
            ☰
          </button>

        </div>


        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {children}
        </main>

      </div>

    </div>
  );
}


// ===============================
// Protected Route
// ===============================

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector(
    (state) => state.auth
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// ===============================
// App
// ===============================

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            Public Routes
        ========================== */}

        <Route
          path="/login"
          element={
          <AuthLayout>
            <Login />
          </AuthLayout>}
        />

        <Route
          path="/register"
          element={
            <AuthLayout>
            <RegisterPage />
          </AuthLayout>}
          
        />


        {/* =========================
            Dashboard
        ========================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            Old Query Page
            Keep this for now
        ========================== */}

        <Route
          path="/query"
          element={
            <ProtectedRoute>
              <Layout>
                <Query />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            Collections
        ========================== */}

        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              <Layout>
                <Collection />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            New Chat
        ========================== */}

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout>
                <Chat />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            Existing Conversation
        ========================== */}

        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <Layout>
                <Chat />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            Default Route
        ========================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* =========================
            Unknown Route
        ========================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}
