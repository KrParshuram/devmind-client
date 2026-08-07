import { useState, useEffect, useMemo } from "react";
import api from '../api/axios.js';
import ResourceMetaFields from "../components/ResourceMetaFields";








export default function Dashboard() {

  const [createForm, setCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "file",
    title: "",
    content: "",
    sourceUrl: "",
    tags: "",
    collection: ""
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [resource, setResource] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // view modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewResource, setViewResource] = useState(null);

  // per-row delete state (so only the clicked card shows "Deleting...")
  const [deletingId, setDeletingId] = useState(null);

  // stats (total / by type / by status), pulled from a dedicated endpoint if you have one
  const [stats, setStats] = useState(null);
  const [collections, setCollections] = useState([]);


    useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await api.get("/api/collections");
      setCollections(res.data.collections);
    } catch (err) {
      console.log(err);
    }
  };



  const fetchResources = async (pageNo = 1) => {
    try {
      setLoading(true);

      const res = await api.get("/api/user/resource", {
        params: {
          page: pageNo,
        },
      });

      setResource(res.data.data);
      setTotalPage(res.data.totalPage);
      console.log(res);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // point this at a real aggregate endpoint if you have one, e.g.
      // GET /api/user/resource/stats -> { total, byType, byStatus, totalChunks }
      const res = await api.get("/api/user/resource/stats");
      setStats(res.data.data);
    } catch (err) {
      console.log(err);
      // no stats endpoint (yet) -- we fall back to counting the loaded page below
      setStats(null);
    }
  };

  useEffect(() => {
    fetchResources(page);

  }, [page]);

  // useEffect(() => {
  //   fetchStats();
  // }, []);

  useEffect(() => {
    console.log(resource);
  }, [resource]);

  // fallback stats computed from whatever page is currently loaded,
  // used only when there's no dedicated stats endpoint to hit
  const derivedStats = useMemo(() => {
    const byType = { file: 0, text: 0, code: 0, url: 0 };
    const byStatus = { completed: 0, pending: 0, failed: 0 };
    let totalChunks = 0;

    resource.forEach((item) => {
      if (byType[item.type] !== undefined) byType[item.type]++;
      if (byStatus[item.status] !== undefined) {
        byStatus[item.status]++;
      } else {
        byStatus.failed++;
      }
      totalChunks += item.chunkCount || 0;
    });

    return { total: resource.length, byType, byStatus, totalChunks };
  }, [resource]);

  const activeStats = stats || derivedStats;
  const statsAreEstimate = !stats;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Please give this resource a title.";
    }

    if (formData.type === "file" && !selectedFile) {
      return "Please choose a PDF file to upload.";
    }

    if ((formData.type === "text" || formData.type === "code") && !formData.content.trim()) {
      return formData.type === "code"
        ? "Please paste some code."
        : "Please write some content.";
    }

    if (formData.type === "url" && !formData.sourceUrl.trim()) {
      return "Please add a source URL.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError("");

    let response;

    try {
      setSubmitting(true);

      if (formData.type === "file") {
        const uploadData = new FormData();

        uploadData.append("title", formData.title);
        uploadData.append("file", selectedFile);

        response = await api.post("/api/user/resource/upload", uploadData);
      } else {
        response = await api.post("/api/user/resource", formData);
      }

      if (response.status == 200) {
        alert("Resource created successfully!");
      }

      setFormData({
        type: "file",
        title: "",
        content: "",
        sourceUrl: "",
        tags: "",
      });

      setSelectedFile(null);
      setCreateForm(false);

      // refresh the list and stats so the new resource shows up
      fetchResources(page);
      fetchStats();
    } catch (err) {
      console.error(err);
      alert("Failed to create resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource? This can't be undone.")) {
      return;
    }

    try {
      setDeletingId(id);

      await api.delete(`/api/user/resource/${id}`);

      setResource((prev) => prev.filter((item) => item._id !== id));
      alert("Resource deleted successfully!");
      fetchStats();
    } catch (err) {
      console.error(err);
      alert("Failed to delete resource");
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = async (id) => {
    try {
      setViewOpen(true);
      setViewLoading(true);
      setViewResource(null);

      const res = await api.get(`/api/user/resource/${id}`);
      setViewResource(res.data.data);

    } catch (err) {
      console.error(err);
      alert("Failed to load resource");
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const closeView = () => {
    setViewOpen(false);
    setViewResource(null);
  };

  const getIcon = (type) => {
    switch (type) {
      case "file":
        return "📄";

      case "url":
        return "🌐";

      case "code":
        return "💻";

      case "text":
        return "📝";

      default:
        return "📁";
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-400/10 text-emerald-300 border-emerald-400/20";
      case "pending":
        return "bg-amber-400/10 text-amber-300 border-amber-400/20";
      default:
        return "bg-rose-400/10 text-rose-300 border-rose-400/20";
    }
  };

  // builds a compact page list like: 1 ... 4 5 6 ... 12
  const getPageNumbers = (current, total) => {
    const delta = 1;
    const pages = [1];

    if (current - delta > 2) pages.push("...");

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      pages.push(i);
    }

    if (current + delta < total - 1) pages.push("...");

    if (total > 1) pages.push(total);

    return pages;
  };




  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8 w-full lg:w-4/5 mx-auto relative">

      {/* ambient background glow */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-32 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      {/* Dashboard Header */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-indigo-300">AI Knowledge Base</span>
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
          Dashboard
        </h1>

        <p className="text-gray-400 mt-2">
          Create and manage your learning resources.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Total Resources</p>
          <p className="text-2xl font-bold text-white mt-1">{activeStats.total}</p>
          {statsAreEstimate && (
            <p className="text-xs text-gray-500 mt-1">this page only</p>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1">{activeStats.byStatus.completed}</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Processing</p>
          <p className="text-2xl font-bold text-amber-300 mt-1">{activeStats.byStatus.pending}</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Chunks Indexed</p>
          <p className="text-2xl font-bold text-indigo-300 mt-1">{activeStats.totalChunks}</p>
        </div>

      </div>

      {/* By Type Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">📄</span>
          <div>
            <p className="text-gray-400 text-xs">Files</p>
            <p className="text-lg font-semibold text-white">{activeStats.byType.file}</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <div>
            <p className="text-gray-400 text-xs">Text</p>
            <p className="text-lg font-semibold text-white">{activeStats.byType.text}</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">💻</span>
          <div>
            <p className="text-gray-400 text-xs">Code</p>
            <p className="text-lg font-semibold text-white">{activeStats.byType.code}</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🌐</span>
          <div>
            <p className="text-gray-400 text-xs">URLs</p>
            <p className="text-lg font-semibold text-white">{activeStats.byType.url}</p>
          </div>
        </div>

      </div>

      {/* Resource Form */}

      <button
        onClick={() => setCreateForm(true)}
        className="bg-indigo-600 w-full text-white py-3 rounded-lg hover:bg-indigo-500 transition font-medium shadow-lg shadow-indigo-600/20"
      >
        + Create New Resource
      </button>

      {createForm && (
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl shadow-lg p-8 mt-6">

          <h2 className="text-2xl font-semibold text-white mb-6">
            Create New Resource
          </h2>

          <button
            type="button"
            onClick={() => {
              setCreateForm(false);
              setFormError("");
            }}
            className="text-red-400 hover:text-red-300 w-full text-center mb-4"
          >
            ✕ Close Form
          </button>

          {formError && (
            <div className="mb-4 text-sm text-rose-300 bg-rose-400/10 border border-rose-400/20 rounded-lg px-4 py-2">
              {formError}
            </div>
          )}

          {/* Resource Type */}
          <div className="mb-6 flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
              Resource Type
            </label>

            <select
              value={formData.type}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value
                }));
                setFormError("");
              }}
              className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-indigo-400"
            >
              <option value="file" className="bg-slate-900">PDF File</option>
              <option value="text" className="bg-slate-900">Text</option>
              <option value="code" className="bg-slate-900">Code</option>
              <option value="url" className="bg-slate-900">URL</option>
            </select>
          </div>

          {/* File Form */}
          {formData.type === "file" && (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Upload PDF
                </label>

                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="bg-white/5 border border-white/10 text-gray-300 rounded-lg px-4 py-3 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Tags
                </label>

              <ResourceMetaFields
                formData={formData}
                handleChange={handleChange}
                collections={collections}
              />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving..." : "Save Resource"}
              </button>

            </form>
          )}

          {/* Text Form */}
          {formData.type === "text" && (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Content
                </label>

                <textarea
                  rows="6"
                  name="content"
                  placeholder="Write your notes..."
                  value={formData.content}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none resize-none focus:border-indigo-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Tags
                </label>

              <ResourceMetaFields
                formData={formData}
                handleChange={handleChange}
                collections={collections}
              />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving..." : "Save Resource"}
              </button>

            </form>
          )}

          {/* Code Form */}
          {formData.type === "code" && (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Code
                </label>

                <textarea
                  rows="8"
                  name="content"
                  placeholder="Paste your code..."
                  value={formData.content}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 font-mono outline-none resize-none focus:border-indigo-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Tags
                </label>

              <ResourceMetaFields
                formData={formData}
                handleChange={handleChange}
                collections={collections}
              />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving..." : "Save Resource"}
              </button>

            </form>
          )}

          {/* URL Form */}
          {formData.type === "url" && (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Source URL
                </label>

                <input
                  type="url"
                  name="sourceUrl"
                  placeholder="https://example.com"
                  value={formData.sourceUrl}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  Tags
                </label>

              <ResourceMetaFields
                formData={formData}
                handleChange={handleChange}
                collections={collections}
              />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving..." : "Save Resource"}
              </button>

            </form>
          )}

        </div>

      )}



      {/* Now we will show the resource list here -- */}

      <div className="mt-8">

        {/* Loading skeletons */}
        {loading && resource.length === 0 && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse h-28"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && resource.length === 0 && (
          <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-12 text-center">
            <p className="text-4xl mb-3">🧠</p>
            <h3 className="text-white font-semibold text-lg">No resources yet</h3>
            <p className="text-gray-400 mt-1">
              Create your first resource to start building your knowledge base.
            </p>
          </div>
        )}

        {/* Resource cards */}
        {resource.map((item) => (
          <div
            key={item._id}
            className="bg-white/5 backdrop-blur border border-white/10 rounded-xl hover:border-indigo-400/40 hover:shadow-md hover:shadow-indigo-600/10 transition p-5 mb-4"
          >

            <div className="flex justify-between">

              <div>

                <h2 className="font-semibold text-lg text-white">
                  {getIcon(item.type)} {item.title}
                </h2>

                <div className="flex gap-3 mt-1 text-sm text-gray-400 items-center flex-wrap">

                  <span>{item.type.toUpperCase()}</span>

                  <span>•</span>

                  <span
                    className={`px-2 py-0.5 rounded-full border text-xs ${statusColor(item.status)}`}
                  >
                    {item.status}
                  </span>

                  {item.chunkCount && (
                    <>
                      <span>•</span>
                      <span>{item.chunkCount} Chunks</span>
                    </>
                  )}

                  <span>•</span>

                  <span>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                </div>

                {item.content && (
                  <p className="mt-3 text-gray-400 line-clamp-2">
                    {item.content}
                  </p>
                )}

                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 block truncate"
                    target="_blank"
                  >
                    {item.sourceUrl}
                  </a>
                )}

                {(item.tags || []).length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-white/10 text-gray-300 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

              </div>

              <div className="flex flex-col gap-2 shrink-0 ml-4">

                <button
                  onClick={() => handleView(item._id)}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition text-sm"
                >
                  View
                </button>

                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={deletingId === item._id}
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-400 transition text-sm disabled:opacity-50"
                >
                  {deletingId === item._id ? "Deleting..." : "Delete"}
                </button>

              </div>

            </div>

          </div>
        ))}

        {/* Pagination */}
        {totalPage > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">

            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              ← Prev
            </button>

            {getPageNumbers(page, totalPage).map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-gray-500 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded border text-sm transition ${
                    p === page
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
              disabled={page === totalPage}
              className="px-3 py-2 rounded bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Next →
            </button>

          </div>
        )}

      </div>

      {/* View Resource Modal */}
      {viewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-lg p-8 relative">

            <button
              onClick={closeView}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            {viewLoading && (
              <p className="text-gray-400 text-center py-12">Loading resource...</p>
            )}

            {!viewLoading && viewResource && (
              <div className="flex flex-col gap-4">

                <h2 className="text-xl font-semibold text-white">
                  {getIcon(viewResource.type)} {viewResource.title}
                </h2>

                <div className="flex gap-3 text-sm text-gray-400 items-center flex-wrap">
                  <span>{viewResource.type.toUpperCase()}</span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded-full border text-xs ${statusColor(viewResource.status)}`}>
                    {viewResource.status}
                  </span>
                  {viewResource.chunkCount && (
                    <>
                      <span>•</span>
                      <span>{viewResource.chunkCount} Chunks</span>
                    </>
                  )}
                </div>

                {viewResource.sourceUrl && (
                  <a
                    href={viewResource.sourceUrl}
                    target="_blank"
                    className="text-indigo-400 hover:text-indigo-300 text-sm truncate"
                  >
                    {viewResource.sourceUrl}
                  </a>
                )}

                {viewResource.content && (
                  <p className="text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {viewResource.content}
                  </p>
                )}

                {(viewResource.tags || []).length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {viewResource.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-white/10 text-gray-300 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Created {new Date(viewResource.createdAt).toLocaleString()}
                </p>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}