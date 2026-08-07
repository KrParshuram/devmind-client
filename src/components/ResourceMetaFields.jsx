export default function ResourceMetaFields({
  formData,
  handleChange,
  collections,
}) {
  return (
    <>
      {/* Tags */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">
          Tags
        </label>

        <input
          type="text"
          name="tags"
          placeholder="react,nodejs,mongodb"
          value={formData.tags}
          onChange={handleChange}
          className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:border-indigo-400"
        />
      </div>

      {/* Collection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">
          Collection
        </label>

        <select
          name="collection"
          value={formData.collection}
          onChange={handleChange}
          className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-indigo-400"
        >
          <option value="" className="bg-slate-900">
            No Collection
          </option>

          {collections.map((collection) => (
            <option
              key={collection._id}
              value={collection._id}
              className="bg-slate-900"
            >
              {collection.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}