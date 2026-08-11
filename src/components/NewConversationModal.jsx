import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export default function NewConversationModal({ onClose }) {
const navigate = useNavigate();

const [scopeType, setScopeType] = useState("all");
const [collectionId, setCollectionId] = useState("");
const [collections, setCollections] = useState([]);

const [loadingCollections, setLoadingCollections] = useState(false);
const [creating, setCreating] = useState(false);

// -----------------------------------------
// Fetch collections
// -----------------------------------------

useEffect(() => {
const fetchCollections = async () => {
try {
setLoadingCollections(true);

    const response = await api.get("/api/collections");

    setCollections(response.data.collections || []);
  } catch (error) {
    console.error(
      "Failed to load collections:",
      error.response?.data || error.message
    );
  } finally {
    setLoadingCollections(false);
  }
};

fetchCollections();


}, []);

// -----------------------------------------
// Create conversation
// -----------------------------------------

const handleCreateConversation = async () => {
if (creating) return;


if (scopeType === "collection" && !collectionId) {
  return;
}

try {
  setCreating(true);

  const knowledgeScope = {
    type: scopeType,
    collectionId:
      scopeType === "collection"
        ? collectionId
        : null,
  };

  const response = await api.post(
    "/api/user/conversation",
    {
      knowledgeScope,
    }
  );

  const conversation = response.data.conversation;

  // Close modal
  onClose();

  // Open newly created conversation
  navigate(`/chat/${conversation._id}`);

} catch (error) {
  console.error(
    "Failed to create conversation:",
    error.response?.data || error.message
  );
} finally {
  setCreating(false);
}


};

// -----------------------------------------
// UI
// -----------------------------------------

return ( <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">

  <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

    {/* Header */}
    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">

      <div>
        <h2 className="text-lg font-semibold text-white">
          New Conversation
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Choose what DevMind should search.
        </p>
      </div>

      <button
        onClick={onClose}
        disabled={creating}
        className="text-slate-500 hover:text-white text-xl"
      >
        ✕
      </button>

    </div>

    {/* Body */}
    <div className="p-6 space-y-4">

      <p className="text-sm font-medium text-slate-300">
        Knowledge source
      </p>

      {/* All Resources */}
      <button
        type="button"
        onClick={() => {
          setScopeType("all");
          setCollectionId("");
        }}
        className={`w-full text-left p-4 rounded-xl border transition ${
          scopeType === "all"
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-slate-700 bg-slate-950 hover:border-slate-600"
        }`}
      >
        <div className="flex items-start gap-3">

          <span className="text-xl">
            🌐
          </span>

          <div>
            <p className="text-sm font-medium text-white">
              All Resources
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Search across everything saved in your knowledge base.
            </p>
          </div>

        </div>
      </button>

      {/* Collection */}
      <button
        type="button"
        onClick={() => setScopeType("collection")}
        className={`w-full text-left p-4 rounded-xl border transition ${
          scopeType === "collection"
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-slate-700 bg-slate-950 hover:border-slate-600"
        }`}
      >
        <div className="flex items-start gap-3">

          <span className="text-xl">
            📁
          </span>

          <div>
            <p className="text-sm font-medium text-white">
              Specific Collection
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Search resources from one collection only.
            </p>
          </div>

        </div>
      </button>

      {/* Collection selector */}
      {scopeType === "collection" && (
        <div className="pl-2">

          <label className="block text-xs font-medium text-slate-400 mb-2">
            Select collection
          </label>

          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            disabled={loadingCollections}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">
              {loadingCollections
                ? "Loading collections..."
                : "Select a collection"}
            </option>

            {collections.map((collection) => (
              <option
                key={collection._id}
                value={collection._id}
              >
                {collection.name || collection.title}
              </option>
            ))}
          </select>

          {!loadingCollections && collections.length === 0 && (
            <p className="text-xs text-slate-500 mt-2">
              You don't have any collections yet.
            </p>
          )}

        </div>
      )}

      {/* No Resources */}
      <button
        type="button"
        onClick={() => {
          setScopeType("none");
          setCollectionId("");
        }}
        className={`w-full text-left p-4 rounded-xl border transition ${
          scopeType === "none"
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-slate-700 bg-slate-950 hover:border-slate-600"
        }`}
      >
        <div className="flex items-start gap-3">

          <span className="text-xl">
            🚫
          </span>

          <div>
            <p className="text-sm font-medium text-white">
              No Resources
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Have a normal conversation without your saved resources.
            </p>
          </div>

        </div>
      </button>

    </div>

    {/* Footer */}
    <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-slate-800">

      <button
        onClick={onClose}
        disabled={creating}
        className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition"
      >
        Cancel
      </button>

      <button
        onClick={handleCreateConversation}
        disabled={
          creating ||
          (scopeType === "collection" && !collectionId)
        }
        className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition"
      >
        {creating ? "Creating..." : "Create Chat"}
      </button>

    </div>

  </div>

</div>


);
}
