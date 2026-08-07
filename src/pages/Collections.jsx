import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import CollectionCard from "../components/CollectionCard";
import CreateCollectionModal from "../components/CreateCollectionModal";
import CollectionDetailsModal from "../components/CollectionDetailsModal";
import AddResourceModal from "../components/AddResourceModal"


export default function Collection() {
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [resources, setResources] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleView = async (collection) => {

    setSelectedCollection(collection);

    const res = await api.get(
        `/api/collections/${collection._id}/resources`
    );

    setResources(res.data.resources);

    setDetailsOpen(true);

}
  const fetchCollections = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/collections");

      setCollections(res.data.collections || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (data) => {
    try {
      setCreating(true);

      await api.post("/api/collections", data);

      setShowModal(false);

      fetchCollections();
    } catch (err) {
      console.log(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this collection?")) return;

    try {
      await api.delete(`/api/collections/${id}`);

      setCollections((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-4xl font-bold text-white">
              Collections
            </h1>

            <p className="text-slate-400 mt-2">
              Organize your resources into collections.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl"
          >
            + New Collection
          </button>

        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-20">
            Loading...
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 py-20 text-center">

            <div className="text-6xl mb-4">📁</div>

            <h2 className="text-white text-2xl font-semibold">
              No Collections Yet
            </h2>

            <button
              onClick={() => setShowModal(true)}
              className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl text-white"
            >
              Create Collection
            </button>

          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

            {collections.map((collection) => (
              <CollectionCard
                key={collection._id}
                collection={collection}
                onDelete={handleDelete}
                onOpen={handleView}
              />
            ))}

          </div>
        )}

      </div>

      <CreateCollectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateCollection}
        loading={creating}
      />

      
      <CollectionDetailsModal

      isOpen={detailsOpen}

      onClose={() => setDetailsOpen(false)}

      collection={selectedCollection}

      resources={resources}

      />

      {/* <CreateResourceModal
    isOpen={showCreateModal}
    onClose={() => setShowCreateModal(false)}
    collection={collection}
      /> */}


    </div>
  );
}