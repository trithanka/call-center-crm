import React from "react";
import { useNavigate } from "react-router-dom";
import GrievanceList from "../components/GrievanceList";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Grievance = () => {
  const navigate = useNavigate();

  return (
    <div className="">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />

          {/* Main content */}
          <main className="overflow-auto w-full flex-grow bg-neutral-100">
            <div className="max-w-7xl mx-auto py-6 px-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Grievances</h1>
                  <p className="text-sm text-gray-500">
                    Manage and track all grievances in one place
                  </p>
                </div>
                <button
                  onClick={() => navigate("/grievance/new/incoming")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-xs"
                >
                  Create New Grievance
                </button>
              </div>
              <div className="">
                <GrievanceList />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Grievance;
