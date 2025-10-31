import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MdOutlineError } from "react-icons/md";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import apiService from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Trend Chart Component
const TrendChart = ({ yearWiseCount = [] }) => {
  // Use API data or fallback to empty array, reverse to show latest year on left
  const chartData =
    yearWiseCount.length > 0
      ? yearWiseCount
          .map((item) => ({
            year: item.year,
            grievances: item.outgoingCount || 0,
            feedbacks: item.ingoingCount || 0,
          }))
          .reverse() // Reverse to show latest year on the left
      : [];

  // Chart.js data configuration
  const data = {
    labels: chartData.map((item) => item.year),
    datasets: [
      {
        label: "Feedbacks",
        data: chartData.map((item) => item.feedbacks),
        borderColor: "#009966",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        pointBackgroundColor: "#009966",
        pointBorderColor: "#009966",
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.3,
      },
      {
        label: "Grievances",
        data: chartData.map((item) => item.grievances),
        borderColor: "#cccccc",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 2,
        borderDash: [8, 3],
        pointBackgroundColor: "#cccccc",
        pointBorderColor: "#cccccc",
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.3,
      },
    ],
  };

  // Chart.js options configuration
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll use custom legend
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "#f3f4f6",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  // Handle empty data
  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-xs mb-1">No data available</div>
          <div className="text-[.6rem] text-gray-300">
            Chart will appear when data is available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Custom Legend */}
      <div className="flex justify-end items-center gap-2 mb-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 bg-gray-300"></div>
          <span className="text-[.6rem] text-gray-600">Grievances</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 bg-emerald-600"></div>
          <span className="text-[.6rem] text-gray-600">Feedbacks</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-0">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

// Role Wise Count Pie Chart Component
const RoleWiseCountPieChart = ({ roleWiseCount = [] }) => {
  // Process the data for two-layered doughnut chart
  const feedbackData = [];
  const grievanceData = [];

  if (roleWiseCount.length > 0) {
    roleWiseCount.forEach((item) => {
      if (item.feedbackCount > 0) {
        feedbackData.push({
          label: item.roleName,
          value: item.feedbackCount,
        });
      }
      if (item.grievanceCount > 0) {
        grievanceData.push({
          label: item.roleName,
          value: item.grievanceCount,
        });
      }
    });
  }

  // Emerald-only color palette - darker tones
  const elegantColors = [
    "#059669", // Emerald 600 - Main theme
    "#047857", // Emerald 700
    "#065F46", // Emerald 800
    "#064E3B", // Emerald 900
    "#10B981", // Emerald 500
    "#059669", // Emerald 600 (repeat)
    "#047857", // Emerald 700 (repeat)
    "#065F46", // Emerald 800 (repeat)
  ];

  const lighterElegantColors = [
    "#10B981", // Emerald 500
    "#059669", // Emerald 600
    "#047857", // Emerald 700
    "#065F46", // Emerald 800
    "#34D399", // Emerald 400
    "#10B981", // Emerald 500 (repeat)
    "#059669", // Emerald 600 (repeat)
    "#047857", // Emerald 700 (repeat)
  ];

  // Chart.js data configuration for two datasets
  const data = {
    labels: [
      ...feedbackData.map((item) => `${item.label} - Feedbacks`),
      ...grievanceData.map((item) => `${item.label} - Grievances`),
    ],
    datasets: [
      {
        label: "Feedbacks",
        data: [
          ...feedbackData.map((item) => item.value),
          ...Array(grievanceData.length).fill(0),
        ],
        backgroundColor: [
          ...elegantColors.slice(0, feedbackData.length),
          ...Array(grievanceData.length).fill("transparent"),
        ],
        borderWidth: 0,
        cutout: "60%", // Inner layer
      },
      {
        label: "Grievances",
        data: [
          ...Array(feedbackData.length).fill(0),
          ...grievanceData.map((item) => item.value),
        ],
        backgroundColor: [
          ...Array(feedbackData.length).fill("transparent"),
          ...lighterElegantColors.slice(0, grievanceData.length),
        ],
        borderWidth: 0,
        cutout: "40%", // Outer layer
      },
    ],
  };

  // Chart.js options configuration
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
    },
    plugins: {
      legend: {
        display: false, // We'll use custom legend
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const datasetLabel = context.dataset.label;
            const label = context.label;
            const value = context.parsed;

            if (value > 0) {
              return `${label}: ${value}`;
            }
            return "";
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
        spacing: 4,
        borderRadius: 12,
        borderAlign: 'inner',
      },
    },
  };

  // Handle empty data
  if (feedbackData.length === 0 && grievanceData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-xs mb-1">No data available</div>
          <div className="text-[.6rem] text-gray-300">
            Chart will appear when data is available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-12 items-center">
      {/* Chart Container */}
      <div className="flex-1 min-h-0 min-w-0 h-full">
        <Pie data={data} options={options} />
      </div>

      {/* Custom Legend */}
      <div className="flex-shrink-0 lg:mt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Feedbacks Legend */}
          <div>
            <div className="text-[.6rem] text-gray-500 font-medium mb-2">
              Feedbacks
            </div>
            <div className="space-y-1">
              {feedbackData.map((item, index) => (
                <div
                  key={`feedback-${index}`}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: elegantColors[index] }}
                  ></div>
                  <span className="text-[.6rem] text-gray-600 truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grievances Legend */}
          <div>
            <div className="text-[.6rem] text-gray-500 font-medium mb-2">
              Grievances
            </div>
            <div className="space-y-1">
              {grievanceData.map((item, index) => (
                <div
                  key={`grievance-${index}`}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: lighterElegantColors[index] }}
                  ></div>
                  <span className="text-[.6rem] text-gray-600 truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [grievancesLoading, setGrievancesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiService.getDashboardStats();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch recent grievances
  useEffect(() => {
    const fetchRecentGrievances = async () => {
      try {
        setGrievancesLoading(true);

        // Fetch first page with 5 items to get latest grievances
        const response = await apiService.getGrievances(
          2892,
          1, // page 1
          5, // limit to 5 items
          {
            ticketId: "",
            userName: "",
            userMobile: "",
            userRole: "",
            queryType: "",
            status: "",
            district: "",
            entryType: "incoming",
          }
        );

        if (response && response.data) {
          setRecentGrievances(response.data);
        } else {
          setRecentGrievances([]);
        }
      } catch (err) {
        console.error("Error fetching recent grievances:", err);
        setRecentGrievances([]);
      } finally {
        setGrievancesLoading(false);
      }
    };

    fetchRecentGrievances();
  }, []);

  // Format date for display (same as GrievanceList)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      // Handle different date formats from API
      if (dateString.includes("/")) {
        // Format: "04/08/2025 05:00:28 pm" or "08/04/2025 05:25:20 pm"
        const datePart = dateString.split(" ")[0];
        const [day, month, year] = datePart.split("/");
        const parsedDate = new Date(year, month - 1, day);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        }
      } else if (dateString.includes("-")) {
        // Format: "23-10-2025 07:34:00 pm" or "04-08-2025 03:08:00 PM"
        const datePart = dateString.split(" ")[0];
        const [day, month, year] = datePart.split("-");
        const parsedDate = new Date(year, month - 1, day);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        }
      }

      // Fallback: try to parse as ISO date
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }

    return "N/A";
  };

  return (
    <div className="">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />

          {/* Main content */}
          <main className="overflow-auto w-full flex-grow bg-neutral-100">
            <div className="max-w-7xl mx-auto py-4 px-6">
              {/* <h2 className="text-2xl font-semibold mb-4">Grievance Overview</h2> */}

              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white p-6 rounded-lg shadow-md animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="text-red-500 text-4xl mb-4">
                    <MdOutlineError />
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Error Loading Dashboard
                  </h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              )}
              <div className="grid gap-4">
                {dashboardData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Tickets */}
                    <div
                      onClick={() => navigate("/grievance")}
                      className="bg-white rounded-xl p-4 border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <svg
                          className="w-3 h-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 17L17 7M7 7h10v10"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xs font-medium text-gray-800">
                        Total Tickets
                      </h3>
                      <p className="text-2xl font-bold text-gray-900 mt-0.5">
                        {dashboardData.totalTicket}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        All tickets count
                      </p>
                    </div>

                    {/* Open Tickets */}
                    <div
                      onClick={() => navigate("/grievance?status=In Progress")}
                      className="bg-white rounded-xl p-4 border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-7 h-7 bg-red-50 rounded-md flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <svg
                          className="w-3 h-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 17L17 7M7 7h10v10"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xs font-medium text-gray-800">
                        Open Tickets
                      </h3>
                      <p className="text-2xl font-bold text-gray-900 mt-0.5">
                        {dashboardData.openTicket}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Pending resolution
                      </p>
                    </div>

                    {/* Closed Tickets */}
                    <div
                      onClick={() => navigate("/grievance?status=Closed")}
                      className="bg-white rounded-xl p-4 border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-7 h-7 bg-gray-50 rounded-md flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <svg
                          className="w-3 h-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 17L17 7M7 7h10v10"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xs font-medium text-gray-800">
                        Closed Tickets
                      </h3>
                      <p className="text-2xl font-bold text-gray-900 mt-0.5">
                        {dashboardData.closedTicket}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Resolved successfully
                      </p>
                    </div>
                  </div>
                )}

                {dashboardData && (
                  <div className="">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Total Feedbacks */}
                      <div
                        onClick={() => navigate("/feedback")}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="w-7 h-7 bg-purple-50 rounded-md flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-purple-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <svg
                            className="w-3 h-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 17L17 7M7 7h10v10"
                            />
                          </svg>
                        </div>

                        <h3 className="text-xs font-medium text-gray-800">
                          Total Feedbacks
                        </h3>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">
                          {dashboardData.totalFeedbacks || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          All received feedbacks
                        </p>
                      </div>

                      {/* Answered Calls */}
                      <div
                        onClick={() => navigate("/feedback?isUnanswered=0")}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="w-7 h-7 bg-green-50 rounded-md flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <svg
                            className="w-3 h-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 17L17 7M7 7h10v10"
                            />
                          </svg>
                        </div>

                        <h3 className="text-xs font-medium text-gray-800">
                          Answered Calls
                        </h3>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">
                          {dashboardData.totalAnsweredCalls || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Handled successfully
                        </p>
                      </div>

                      {/* Unanswered Calls */}
                      <div
                        onClick={() => navigate("/feedback?isUnanswered=1")}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="w-7 h-7 bg-red-50 rounded-md flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-red-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M22 2a1 1 0 00-1.707-.707L17.586 4 15.293 1.707A1 1 0 0013.879 3.12L16.172 5.414 13.88 7.707a1 1 0 101.414 1.414L17.586 6l2.293 2.293A1 1 0 0021.707 6.88L19.414 4.586l2.293-2.293A1 1 0 0022 2z" />
                              <path d="M5.05 3.636a1.5 1.5 0 012.122 0l1.52 1.52a1.5 1.5 0 01.36 1.556l-.617 1.85a1.5 1.5 0 00.392 1.523l2.828 2.828a1.5 1.5 0 001.523.392l1.85-.617a1.5 1.5 0 011.556.36l1.52 1.52a1.5 1.5 0 010 2.122l-1.272 1.272a3 3 0 01-3.335.684 17.49 17.49 0 01-6.937-4.535A17.49 17.49 0 013.093 8.657a3 3 0 01.684-3.335L5.05 3.636z" />
                            </svg>
                          </div>
                          <svg
                            className="w-3 h-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 17L17 7M7 7h10v10"
                            />
                          </svg>
                        </div>

                        <h3 className="text-xs font-medium text-gray-800">
                          Unanswered Calls
                        </h3>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">
                          {dashboardData.totalUnansweredCalls || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Need attention
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Recent Grievances Table */}
                  {/* <div className="h-full row-span-2"> */}
                    <div className="h-full row-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-medium text-gray-800 mb-3 p-4 pb-0">
                          Recent Grievances
                        </h3>
                        <Link
                          to="/grievance"
                          className="text-[.6rem] text-gray-600 mb-3 p-4 pb-0 flex items-center gap-1"
                        >
                          View All{" "}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                            <path d="m21 3-9 9" />
                            <path d="M15 3h6v6" />
                          </svg>
                        </Link>
                      </div>

                      {grievancesLoading ? (
                        <div className="flex items-center justify-center h-24">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                      ) : recentGrievances.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-2 text-left text-[.6rem] font-bold text-gray-500 uppercase">
                                  Grievance Details
                                </th>
                                <th className="px-4 py-2 text-left text-[.6rem] font-bold text-gray-500 uppercase">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="text-xs divide-y divide-gray-200">
                              {recentGrievances.map((item, index) => (
                                <tr
                                  key={item.pklCrmUserId}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-4 py-2">
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        #{item.vsTicketId || "N/A"}
                                      </div>
                                      <div className="text-[.6rem] text-gray-500 mt-0.5">
                                        {item.vsUserName || "N/A"} •{" "}
                                        {item.vsMobile || "N/A"}
                                      </div>
                                      <div className="text-[.6rem] text-gray-400 mt-0.5">
                                        {formatDate(item.vsEntryDateTime)}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[.6rem] font-medium ${
                                          item.vsStatus === "In Progress"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : item.vsStatus === "Resolved"
                                            ? "bg-green-100 text-green-700"
                                            : item.vsStatus === "Pending"
                                            ? "bg-orange-100 text-orange-700"
                                            : "bg-gray-100 text-gray-700"
                                        }`}
                                      >
                                        {item.vsStatus || "N/A"}
                                      </span>
                                      <Link
                                        to={`/chats?id=${item.pklCrmUserId}`}
                                        className="transition-colors p-1"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="10"
                                          height="10"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                                          <path d="m21 3-9 9" />
                                          <path d="M15 3h6v6" />
                                        </svg>
                                      </Link>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-24 text-gray-500 text-xs">
                          No recent grievances found
                        </div>
                      )}
                    </div>
                  {/* </div> */}
                  {/* Grievance and feedbacks trend line chart */}
                  <div className="h-full">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 h-full flex flex-col">
                      <h3 className="text-xs font-medium text-gray-800 mb-2">
                        Grievance and Feedbacks Trend
                      </h3>
                      <div className="flex-1 min-h-0 relative">
                        <TrendChart
                          yearWiseCount={dashboardData?.yearWiseCount || []}
                        />
                      </div>
                    </div>
                  </div>
                   {/* Role Wise Count Pie Chart */}
                     {dashboardData && dashboardData.roleWiseCount && (
                       <div className="">
                         <div className="bg-white rounded-xl p-4 border border-gray-200 h-64 flex flex-col">
                           <h3 className="text-xs font-medium text-gray-800 mb-2">
                             Role Wise Count Distribution
                           </h3>
                           <div className="flex-grow min-h-0 relative">
                             <RoleWiseCountPieChart
                               roleWiseCount={dashboardData.roleWiseCount}
                             />
                           </div>
                         </div>
                       </div>
                     )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

