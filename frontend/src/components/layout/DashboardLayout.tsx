import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function toggleSidebar() {
    setSidebarOpen((isOpen) => !isOpen);
  }

  return (
    <div className="dashboard-layout">
      <Navbar onMenuClick={toggleSidebar} />

      <div className="dashboard-body">
        <Sidebar isOpen={sidebarOpen} />

        <main
          className={
            sidebarOpen
              ? "main-content"
              : "main-content sidebar-collapsed"
          }
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;