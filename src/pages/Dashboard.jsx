// src/pages/DashboardPage.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard"; // Your current dashboard UI

const DashboardPage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Sidebar />
      <div className="flex-1 bg-gray-50 h-screen p-6 overflow-y-auto">
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        <Dashboard />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
