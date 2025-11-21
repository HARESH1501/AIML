import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="btn btn-dark d-md-none m-2"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasSidebar"
      >
        ☰ Menu
      </button>

      {/* Sidebar for Desktop */}
      <div className="d-none d-md-block bg-dark text-white p-3 vh-100" style={{ width: "250px" }}>
        <h4 className="mb-4">Dashboard</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link className="nav-link text-white" to="/">Charts</Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link text-white" to="/dataset">Full Dataset</Link>
          </li>
        </ul>
      </div>

      {/* Offcanvas Sidebar for Mobile */}
      <div
        className="offcanvas offcanvas-start bg-dark text-white"
        tabIndex="-1"
        id="offcanvasSidebar"
        style={{ width: "250px" }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Dashboard</h5>
          <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
        </div>

        <div className="offcanvas-body">
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link className="nav-link text-white" to="/" data-bs-dismiss="offcanvas">Charts</Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link text-white" to="/dataset" data-bs-dismiss="offcanvas">Full Dataset</Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
