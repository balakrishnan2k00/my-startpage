import "./TopBar.css";

type TopBarProps = {
  pageTitle: string;
  onAddWidget: () => void;
  darkTheme: boolean;
  onToggleTheme: () => void;
};

export function TopBar({
  pageTitle,
  onAddWidget,
  darkTheme,
  onToggleTheme,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar__left">
        <button type="button" className="top-bar__pages" disabled title="Coming soon">
          Pages
        </button>
        <span className="top-bar__tab">{pageTitle}</span>
      </div>
      <div className="top-bar__logo">my-startpage</div>
      <div className="top-bar__right">
        <button
          type="button"
          className="top-bar__btn"
          onClick={onToggleTheme}
          title="Toggle dark theme"
        >
          {darkTheme ? "☀️" : "🌙"}
        </button>
        <button
          type="button"
          className="top-bar__btn top-bar__btn--primary"
          onClick={onAddWidget}
          title="Add widget"
        >
          +
        </button>
      </div>
    </header>
  );
}
