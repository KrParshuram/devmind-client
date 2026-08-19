
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
  const [repos, setRepos] = useState([]);
  const [repoConversations, setRepoConversations] = useState({});
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [openRepoId, setOpenRepoId] = useState(null);

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

  //fetch github repos -- 
const fetchRepos = async () => {
  try {
    setLoadingRepos(true);

    const response = await api.get("/api/github/repos");
    // console.log(` github response ${JSON.stringify(response)}`);
    

    setRepos(response.data.Repos || []);
  } catch (error) {
    console.error(
      "Error loading repositories:",
      error.response?.data || error.message
    );
  } finally {
    setLoadingRepos(false);
  }
};


  // ---------------------------------------
  // Fetch conversations
  // ---------------------------------------

const fetchConversations = async () => {
  try {
    setLoadingConversations(true);

    const response = await api.get(
      "/api/user/conversations"
    );

    const allConversations =
      response.data.conversations || [];

    // Normal conversations
    setConversations(
      allConversations.filter(
        (conversation) => !conversation.repoId
      )
    );

    // GitHub conversations grouped by repoId
    const githubConversations =
      allConversations.filter(
        (conversation) => conversation.repoId
      );

    const grouped = {};

    githubConversations.forEach((conversation) => {
      const repoId = String(conversation.repoId);

      if (!grouped[repoId]) {
        grouped[repoId] = [];
      }

      grouped[repoId].push(conversation);
    });

    setRepoConversations(grouped);

    console.log("ALL CONVERSATIONS:", allConversations);
    console.log("GITHUB CONVERSATIONS:", githubConversations);
    console.log("GROUPED REPO CONVERSATIONS:", grouped);

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
    fetchRepos();
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

const handleGithubClick = (repoId) => {

  setOpenRepoId((current) =>
    current === repoId
      ? null
      : repoId
  );

};

  // ---------------------------------------
  // Sidebar content
  // ---------------------------------------

const sidebarContent = (
  <div className={`w-full h-full  flex flex-col bg-slate-900 border-r border-slate-800`}>

    {/* ========================= */}
    {/* LOGO */}
    {/* ========================= */}

    <div className="shrink-0 p-5 border-b border-slate-800">
      <div className="flex items-center gap-3">

        <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
          🧠
        </div>

        <div>
          <h1 className="text-white font-bold text-lg">
            DevMind
          </h1>

          <p className="text-xs text-slate-500">
            Your AI Second Brain
          </p>
        </div>

      </div>
    </div>


    {/* ========================= */}
    {/* EVERYTHING IN BETWEEN */}
    {/* ========================= */}

    <div className="flex-1 overflow-y-auto">

      {/* ========================= */}
      {/* WORKSPACE */}
      {/* ========================= */}

      <nav className="px-3 py-4 border-b border-slate-800">

        <p className="px-1 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Workspace
        </p>

        <div className="space-y-1">

          {links.map((link) => {

            const isActive = location.pathname === link.path;

            return (
              <button
                key={link.path}
                onClick={() => handleNavigate(link.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{link.icon}</span>

                <span className="text-sm font-medium">
                  {link.label}
                </span>
              </button>
            );

          })}

        </div>

      </nav>


      {/* ========================= */}
      {/* GITHUB */}
      {/* ========================= */}

      <section className="px-3 py-4 border-b border-slate-800">

        <div className="flex items-center justify-between mb-2">

          <p className="px-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            GitHub
          </p>

          <button
            onClick={() => handleNavigate("/github")}
            className="h-7 w-7 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            +
          </button>

        </div>


        {loadingRepos ? (

          <div className="flex justify-center py-3">
            <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>

        ) : repos.length === 0 ? (

          <p className="px-2 py-2 text-xs text-slate-600">
            No repositories
          </p>

        ) : (

<div className="space-y-2">

  {repos.map((repo) => {

    const repoId = String(repo._id);

    const isOpen =
      openRepoId === repoId;

    const repoChats =
      repoConversations[repoId] || [];

    return (
      <div key={repoId}>

        {/* =========================
            REPOSITORY
        ========================== */}

        <button
          onClick={() =>
            handleGithubClick(repoId)
          }
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-slate-400 hover:bg-slate-800 hover:text-white"
        >

          <span>📦</span>

          <div className="min-w-0 flex-1">

            <p className="text-sm truncate">
              {repo.name}
            </p>

            <p className="text-xs text-slate-600 truncate">
              {repo.owner}
            </p>

          </div>

          <span className="text-xs">
            {isOpen ? "⌃" : "⌄"}
          </span>

        </button>


        {/* =========================
            REPO CONVERSATIONS
        ========================== */}

        {isOpen && (

          <div className="ml-5 mt-1 space-y-1">

            {repoChats.length === 0 ? (

              <p className="px-3 py-2 text-xs text-slate-600">
                No conversations yet
              </p>

            ) : (

              repoChats.map((conversation) => {

                const conversationId =
                  String(conversation._id);

                const isActive =
                  location.pathname ===
                  `/github/${repoId}/chat/${conversationId}`;

                return (

                  <button
                    key={conversationId}
                    onClick={() =>
                      navigate(
                        `/github/${repoId}/chat/${conversationId}`
                      )
                    }
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-500 hover:bg-slate-800 hover:text-white"
                    }`}
                  >

                    <span className="text-xs">
                      💬
                    </span>

                    <span className="truncate">
                      {conversation.title ||
                        "New Conversation"}
                    </span>

                  </button>

                );

              })

            )}

          </div>

        )}

      </div>
    );

  })}

</div>

        )}

      </section>


      {/* ========================= */}
      {/* CHATS */}
      {/* ========================= */}

      <section className="px-3 py-4">

        <div className="flex items-center justify-between mb-2">

          <p className="px-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Chats
          </p>

          <button
            onClick={() => setShowNewConversation(true)}
            className="h-7 w-7 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            +
          </button>

        </div>


        {/* Search */}

        <div className="relative mb-3">

          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            🔍
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />

        </div>


        {/* Conversations */}

        <div className="space-y-1">

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

            </div>

          ) : (

            filteredConversations.map((conversation) => {

              const isActive =
                location.pathname === `/chat/${conversation._id}`;

              return (
                <button
                  key={conversation._id}
                  onClick={() =>
                    handleConversationClick(conversation._id)
                  }
                  className={`w-full text-left px-3 py-2.5 rounded-lg ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <span>💬</span>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-medium truncate">
                        {conversation.title || "New Conversation"}
                      </p>

                      <p className="text-xs text-slate-600 mt-0.5">
                        {conversation.mode || "rag"}
                      </p>

                    </div>

                  </div>

                </button>
              );

            })

          )}

        </div>

      </section>

    </div>


    {/* ========================= */}
    {/* USER / LOGOUT */}
    {/* ========================= */}

    <div className="shrink-0 p-4 border-t border-slate-800 bg-slate-900">

      <div className="flex items-center gap-3">

        <div className="h-9 w-9 shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-white">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-sm font-medium text-white truncate">
            {user?.name || "User"}
          </p>

          <p className="text-xs text-slate-500 truncate">
            {user?.email || ""}
          </p>

        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400"
        >
          ↪
        </button>

      </div>

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
      className={`
        md:hidden
        fixed top-0 left-0 h-full w-72 z-50
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {sidebarContent}
    </div>

    {/* ============================= */}
    {/* DESKTOP SIDEBAR */}
    {/* ============================= */}

    <div
      className={`
        hidden md:flex
        h-screen
        flex-shrink-0
        overflow-hidden
        transition-all duration-300
        ${isOpen ? "w-72" : "w-0"}
      `}
    >
      {sidebarContent}
    </div>

    {/* ============================= */}
    {/* NEW CONVERSATION */}
    {/* ============================= */}

    {showNewConversation && (
      <NewConversationModal
        onClose={() => {
          setShowNewConversation(false);
          fetchConversations();
        }}
      />
    )}
  </>
);
}