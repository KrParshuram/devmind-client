
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../store/slices/authSlice.js";
import NewConversationModal from "./NewConversationModal.jsx";
import api from "../api/axios.js";

export default function Sidebar({
  isOpen,
  setIsOpen,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state) => state.auth.user);

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);

  // ---------------------------------------
  // Application navigation
  // ---------------------------------------

  const links = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "📊",
    },
    {
      label: "Ask DevMind",
      path: "/query",
      icon: "🤖",
    },
    {
      label: "Collections",
      path: "/collections",
      icon: "📁",
    },
  ];

  // ---------------------------------------
  // Fetch conversations
  // ---------------------------------------

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);

      const response = await api.get(
        "/api/user/conversations"
      );

      setConversations(
        response.data.conversations || []
      );

    } catch (error) {
      console.error(
        "Error loading conversations:",
        error.response?.data || error.message
      );
    } finally {
      setLoadingConversations(false);
    }
  };

  // Load conversations when sidebar mounts
  useEffect(() => {
    fetchConversations();
  }, []);

  // ---------------------------------------
  // Navigation
  // ---------------------------------------

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // ---------------------------------------
  // New chat
  // ---------------------------------------

  const handleNewChat = () => {
    navigate("/chat");
    setIsOpen(false);
  };

  // ---------------------------------------
  // Open conversation
  // ---------------------------------------

  const handleConversationClick = (conversationId) => {
    navigate(`/chat/${conversationId}`);
    setIsOpen(false);
  };

  // ---------------------------------------
  // Logout
  // ---------------------------------------

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // ---------------------------------------
  // Search conversations
  // ---------------------------------------

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.title
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  // ---------------------------------------
  // Sidebar content
  // ---------------------------------------

  const sidebarContent = (
    <div className="h-full w-full flex flex-col border-r border-slate-800 bg-slate-900">

      {/* ============================= */}
      {/* LOGO */}
      {/* ============================= */}

      <div className="p-5 border-b border-slate-800 flex justify-between items-center">

        <div>
          <h1 className="text-white text-xl font-bold">
            DevMind
          </h1>

          <p className="text-slate-400 text-xs mt-1">
            AI Knowledge Base
          </p>
        </div>

        {/* Mobile close */}

        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-slate-400 hover:text-white text-xl"
        >
          ✕
        </button>

      </div>


      {/* ============================= */}
      {/* MAIN NAVIGATION */}
      {/* ============================= */}

      <nav className="px-3 py-4 border-b border-slate-800">

        <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Workspace
        </p>

        <div className="flex flex-col gap-1">

          {links.map((link) => {

            const isActive =
              location.pathname === link.path;

            return (
              <button
                key={link.path}
                onClick={() =>
                  handleNavigate(link.path)
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition text-left ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >

                <span>
                  {link.icon}
                </span>

                <span className="text-sm font-medium">
                  {link.label}
                </span>

              </button>
            );

          })}

        </div>

      </nav>


      {/* ============================= */}
      {/* CHAT SECTION */}
      {/* ============================= */}

      <div className="flex-1 flex flex-col min-h-0">

        {/* Chat header */}

        <div className="px-3 pt-4 pb-2">

          <div className="flex items-center justify-between">

            <p className="px-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Chats
            </p>

            <button
               onClick={() => setShowNewConversation(true)}
              title="New Chat"
              className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              +
            </button>

          </div>

        </div>


        {/* Search */}

        <div className="px-3 pb-3">

          <div className="relative">

            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search chats..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />

          </div>

        </div>


        {/* Conversations */}

        <div className="flex-1 overflow-y-auto px-2">

          {loadingConversations ? (

            <div className="flex justify-center py-8">

              <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />

            </div>

          ) : filteredConversations.length === 0 ? (

            <div className="text-center px-4 py-8">

              <div className="text-2xl mb-2">
                💬
              </div>

              <p className="text-sm text-slate-500">
                No conversations
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Start a new chat.
              </p>

            </div>

          ) : (

            <div className="space-y-1">

              {filteredConversations.map(
                (conversation) => {

                  const isActive =
                    location.pathname ===
                    `/chat/${conversation._id}`;

                  return (
                    <button
                      key={conversation._id}
                      onClick={() =>
                        handleConversationClick(
                          conversation._id
                        )
                      }
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition ${
                        isActive
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        <span className="text-sm">
                          💬
                        </span>

                        <div className="min-w-0 flex-1">

                          <p className="text-sm font-medium truncate">
                            {conversation.title ||
                              "New Conversation"}
                          </p>

                          <p className="text-xs text-slate-600 mt-0.5">
                            {conversation.mode ||
                              "rag"}
                          </p>

                        </div>

                      </div>

                    </button>
                  );

                }
              )}

            </div>

          )}

        </div>

      </div>


      {/* ============================= */}
      {/* USER */}
      {/* ============================= */}

      <div className="p-4 border-t border-slate-800">

        <p className="text-white text-sm font-semibold truncate">
          {user?.name}
        </p>

        <p className="text-slate-400 text-xs mb-3 truncate">
          {user?.email}
        </p>

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
      {/* ============================= */}
      {/* MOBILE OVERLAY */}
      {/* ============================= */}

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}


      {/* ============================= */}
      {/* MOBILE SIDEBAR */}
      {/* ============================= */}

      <div
        className={`md:hidden fixed top-0 left-0 h-full w-72 z-50 transition-transform duration-300 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>


      {/* ============================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ============================= */}

      <div className="hidden md:flex w-72 flex-shrink-0">
        {sidebarContent}
      </div>

      {showNewConversation && (
  <NewConversationModal
    onClose={() => {
      setShowNewConversation(false);
      fetchConversation();
    }}
  />
)}

    </>
  );
}

