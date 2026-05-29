export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span className="site-footer__brand">Holiday Planner</span>
        <p className="site-footer__tagline">Plan smarter. Travel better.</p>
        <p className="site-footer__copy">© {year} Holiday Planner. Photos by <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>.</p>
      </div>
    </footer>
  );
}
