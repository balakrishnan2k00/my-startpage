import "./SearchBar.css";

export function SearchBar() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("q") as HTMLInputElement;
    const q = input.value.trim();
    if (!q) return;
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <span className="search-bar__icon" aria-hidden>🌐</span>
      <input
        name="q"
        type="search"
        className="search-bar__input"
        placeholder="Search the web"
        autoComplete="off"
      />
      <button type="submit" className="search-bar__submit" aria-label="Search">
        🔍
      </button>
    </form>
  );
}
