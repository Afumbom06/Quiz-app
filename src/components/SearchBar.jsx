import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <input
      type="text"
      placeholder="Search a category..."
      value={query}
      onChange={handleChange}
      className="w-full p-2 border rounded-md shadow-md"
    />
  );
}
