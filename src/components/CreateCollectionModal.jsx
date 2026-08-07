import { useState } from "react";

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onCreate,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) return;

    await onCreate(formData);

    setFormData({
      name: "",
      description: "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

          <div>
            <h2 className="text-2xl font-bold text-white">
              Create Collection
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Organize your resources into collections.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 transition hover:text-white"
          >
            ✕
          </button>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          {/* Name */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Collection Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Backend Development"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-indigo-500"
            />

          </div>

          {/* Description */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>

            <textarea
              rows={4}
              name="description"
              placeholder="Store all backend-related resources like Redis, Express, BullMQ..."
              value={formData.description}
              onChange={handleChange}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-indigo-500"
            />

          </div>

          {/* Footer */}

          <div className="flex justify-end gap-4">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-3 text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Collection"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}