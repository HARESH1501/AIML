import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 shadow-sm">
      <span className="navbar-brand mb-0 h1">Student Result Analysis</span>
      <button
        className="navbar-toggler"
        type="button"
        aria-controls="navbarNav"
        aria-expanded={isMenuOpen}
        aria-label="Toggle navigation"
        onClick={toggleMenu}
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`} id="navbarNav">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link
              className={`nav-link ${location.pathname === '/' ? 'active fw-bold' : ''}`}
              to="/"
              onClick={closeMenu}
            >
              Charts & Results
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link ${location.pathname === '/dataset' ? 'active fw-bold' : ''}`}
              to="/dataset"
              onClick={closeMenu}
            >
              Dataset
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
