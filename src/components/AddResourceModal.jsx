import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AddResourceModal({
  isOpen,
  onClose,
  collection,
  currentResources = [],
  onAdded,
}) {
  const [resources, setResources] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchResources(page);
      setSelected([]);
      setSearch("");
    }
  }, [isOpen, page]);

  const fetchResources = async (pageNo = 1) => {
    try {
      setLoading(true);

      const res = await api.get("/api/user/resource", {
        params: {
          page: pageNo,
        },
      });

      setResources(res.data.data);
      setTotalPage(res.data.totalPage);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const availableResources = resources.filter(
    (resource) =>
      !currentResources.some(
        (item) => item._id === resource._id
      )
  );

  const filteredResources = availableResources.filter((resource) =>
    resource.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleAdd = async () => {
    try {
     const response= await api.post(
        `/api/collections/${collection._id}/resources`,
        {
          resourceIds: selected,
        }
      );
      
      console.log(response);

      onAdded();
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">

      <div className="bg-slate-900 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col">

        {/* Header */}

        <div className="border-b border-slate-700 p-5 flex justify-between">

          <div>

            <h2 className="text-2xl font-bold text-white">
              Add Resources
            </h2>

            <p className="text-slate-400">
              {collection.name}
            </p>

          </div>

          <button
            onClick={onClose}
            className="text-white text-xl"
          >
            ✕
          </button>

        </div>

        {/* Search */}

        <div className="p-5">

          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-slate-800 rounded-lg px-4 py-3 text-white"
          />

        </div>

        {/* List */}

        <div className="flex-1 overflow-y-auto px-5">

          {loading ? (

            <div className="text-center text-slate-400 mt-10">
              Loading...
            </div>

          ) : filteredResources.length === 0 ? (

            <div className="text-center text-slate-400 mt-10">
              No available resources.
            </div>

          ) : (

            <div className="space-y-3">

              {filteredResources.map((resource) => (

                <div
                  key={resource._id}
                  onClick={() => toggle(resource._id)}
                  className={`cursor-pointer rounded-lg border p-4 transition
                  ${
                    selected.includes(resource._id)
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-slate-700 bg-slate-800"
                  }`}
                >

                  <div className="flex justify-between">

                    <div>

                      <h3 className="text-white font-semibold">
                        {resource.title}
                      </h3>

                      <p className="text-slate-400 text-sm">
                        {resource.type}
                      </p>

                    </div>

                    <input
                      type="checkbox"
                      checked={selected.includes(
                        resource._id
                      )}
                      readOnly
                    />

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Footer */}

        <div className="border-t border-slate-700 p-5 flex justify-between items-center">

          <div className="flex gap-2">

            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="bg-slate-800 text-white px-4 py-2 rounded disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-slate-300 self-center">
              {page} / {totalPage}
            </span>

            <button
              disabled={page === totalPage}
              onClick={() => setPage((p) => p + 1)}
              className="bg-slate-800 text-white px-4 py-2 rounded disabled:opacity-40"
            >
              Next
            </button>

          </div>

          <div className="flex gap-3">

            <button
              onClick={onClose}
              className="bg-slate-700 text-white px-5 py-2 rounded"
            >
              Cancel
            </button>

            <button
              disabled={selected.length === 0}
              onClick={handleAdd}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded"
            >
              Add Selected ({selected.length})
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}