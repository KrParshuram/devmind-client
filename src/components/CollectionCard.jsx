export default function CollectionCard({ collection, onDelete, onOpen }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-indigo-400">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            📁 {collection.name}
          </h2>
          <p className="mt-2 text-slate-400">
            {collection.description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => onOpen(collection)}
          className="rounded-lg bg-indigo-600 px-4 py-2"
        >
          Open
        </button>
        <button
          onClick={() => onDelete(collection._id)}
          className="rounded-lg bg-red-600 px-4 py-2"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
