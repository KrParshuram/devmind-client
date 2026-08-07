import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../store/slices/authSlice.js';

export default function Sidebar({ isOpen, setIsOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.auth.user);


  const links = [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "Ask DevMind", path: "/query", icon: "🤖" },
    { label: "Collections", path: "/collections", icon: "📁" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false); // close on mobile after clicking
  };

  const sidebarContent = (
    <div className="h-full w-full flex flex-col border-r border-slate-800 bg-slate-900">

      {/* Logo */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-white text-xl font-bold">DevMind</h1>
          <p className="text-slate-400 text-xs mt-1">AI Knowledge Base</p>
        </div>
        {/* close button — mobile only */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-slate-400 hover:text-white text-xl"
        >
          ✕
        </button>
      </div>

      {/* Links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {links.map(link => (
          <div
            key={link.path}
            onClick={() => handleNavigate(link.path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
              ${location.pathname === link.path
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <span>{link.icon}</span>
            <span className="text-sm font-medium">{link.label}</span>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-white text-sm font-semibold">{user?.name}</p>
        <p className="text-slate-400 text-xs mb-3">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left text-red-400 hover:text-red-300 text-sm"
        >
          🚪 Logout
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}


      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile sidebar — slides in */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>

      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex w-64 flex-shrink-0">
        {sidebarContent}
      </div>
    </>
  );
}