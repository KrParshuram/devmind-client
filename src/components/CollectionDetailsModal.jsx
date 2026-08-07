import { useMemo, useState,useEffect } from "react";
import AddResourceModal from "./AddResourceModal";
import api from "../api/axios";

export default function CollectionDetailsModal({
  isOpen,
  onClose,
  collection,
  resources = [],
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
const [collectionResources, setCollectionResources] = useState([]);


const filteredResources = useMemo(() => {
  if (!collectionResources) return [];
  return collectionResources.filter((resource) => {
    const matchesSearch =
      resource.title?.toLowerCase().includes(search.toLowerCase()) ||
      resource.tags?.join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || resource.type === filter;
    return matchesSearch && matchesFilter;
  });
}, [collectionResources, search, filter]);



const refreshResources = async () => {
  try {
    const res = await api.get(`/api/collections/${collection._id}/resources`);
    setCollectionResources(res.data.resources);  // ← .resources
  } catch(err) {
    console.error(err);
  }
};

useEffect(() => {
  if (isOpen && collection) {
    refreshResources();
  }
}, [isOpen, collection]);  // ← fetch whenever modal opens

    if (!isOpen || !collection) return null;

  const getIcon = (type) => {
    switch (type) {
      case "url":
        return "🌐";
      case "text":
        return "📝";
      case "code":
        return "💻";
      case "file":
      case "pdf":
        return "📄";
      default:
        return "📁";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="border-b border-slate-800 p-6 flex justify-between items-center">

          <div>
            <h2 className="text-2xl font-bold text-white">
              {collection.name}
            </h2>

            <p className="text-slate-400 mt-1">
              {filteredResources.length} Resources
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white"
            >
                + Add Resource
            </button>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg hover:bg-slate-800 text-white text-lg"
            >
              ✕
            </button>

          </div>

        </div>

        {/* Search + Filter */}
        <div className="border-b border-slate-800 p-6 flex flex-col md:flex-row gap-4">

          <div className="relative flex-1">

            <span className="absolute left-3 top-3 text-slate-400">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 rounded-xl pl-10 pr-4 py-3 text-white outline-none"
            />

          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 rounded-xl px-4 text-white"
          >
            <option value="all">All</option>
            <option value="url">URLs</option>
            <option value="text">Text</option>
            <option value="code">Code</option>
            <option value="file">Files</option>
          </select>

        </div>

        {/* Resources */}
        <div className="flex-1 overflow-y-auto p-6">

          {filteredResources.length === 0 ? (

            <div className="h-full flex flex-col justify-center items-center">

              <div className="text-6xl mb-4">
                📂
              </div>

              <h3 className="text-2xl font-semibold text-white">
                No Resources Found
              </h3>

              <p className="text-slate-400 mt-2">
                Add your first resource to this collection.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {filteredResources.map((resource) => (

                <div
                  key={resource._id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex justify-between hover:border-indigo-500 transition"
                >

                  <div className="flex gap-4">

                    <div className="text-2xl">
                      {getIcon(resource.type)}
                    </div>

                    <div>

                      <h3 className="text-white font-semibold">
                        {resource.title || "Untitled"}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">

                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                          {resource.type}
                        </span>

                        {resource.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}

                      </div>

                      {resource.sourceUrl && (
                        <a
                          href={resource.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block mt-3 text-sky-400 hover:underline"
                        >
                          Open Source
                        </a>
                      )}

                    </div>

                  </div>

                  <div className="flex gap-2">

                    <button className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg">
                      View
                    </button>

                    <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg">
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
      <AddResourceModal
  isOpen={showAddModal}
  onClose={() => setShowAddModal(false)}
  collection={collection}
  currentResources={collectionResources}
  onAdded={refreshResources}
/>
    </div>

  );
}