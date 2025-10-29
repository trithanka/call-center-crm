import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import apiService from "../services/api";
import GrievanceTypeDialog from "./GrievanceTypeDialog";

const FeedbackList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [currentStatus, setCurrentStatus] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    ticketId: "",
    userName: "",
    userMobile: "",
    userRole: "",
    queryType: "",
    isUnanswered: "",
    district: "",
    entryType: "outgoing", // Fixed to outgoing for feedback
  });

  // Search state
  const [searchInput, setSearchInput] = useState("");

  // Master data states
  const [masterData, setMasterData] = useState({
    queryType: [],
    role: [],
    district: [],
  });
  const [masterDataLoading, setMasterDataLoading] = useState(true);

  // Grievance type dialog state
  const [showGrievanceTypeDialog, setShowGrievanceTypeDialog] = useState(false);

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".relative")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Fetch master data
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setMasterDataLoading(true);
        const response = await apiService.getMasterData();
        if (response && response.data) {
          setMasterData(response.data);
        }
      } catch (err) {
        console.error("Error fetching master data:", err);
      } finally {
        setMasterDataLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  // Get isUnanswered from URL parameters
  useEffect(() => {
    const isUnanswered = searchParams.get("isUnanswered");
    setCurrentStatus(isUnanswered);
    setFilters((prev) => ({ ...prev, isUnanswered: isUnanswered || "" }));
    setCurrentPage(1); // Reset to first page when filter changes
  }, [searchParams]);

  // Fetch grievances from API
  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        setLoading(true);
        setError(null);

        // Combine URL isUnanswered with filters
        const allFilters = { ...filters };
        if (currentStatus) {
          allFilters.isUnanswered = currentStatus;
        }

        // Using loginId 2892 as provided in the example
        console.log("Feedback API call with filters:", allFilters);
        const response = await apiService.getGrievances(
          2892,
          currentPage,
          pageSize,
          allFilters
        );

        if (response && response.data) {
          setGrievances(response.data);
          setTotalCount(response.count || 0);
        } else {
          setGrievances([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError(err.message || "Failed to fetch feedback");
        setGrievances([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, [currentPage, pageSize, currentStatus, filters]);

  // Format date for display
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

      // Try to parse as ISO date
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }

      return "N/A";
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "N/A";
    }
  };

  // Filter functions
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearAllFilters = () => {
    setFilters({
      ticketId: "",
      userName: "",
      userMobile: "",
      userRole: "",
      queryType: "",
      isUnanswered: "",
      district: "",
      entryType: "outgoing", // Keep as outgoing for feedback
    });
    setSearchInput("");
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      Object.values(filters).some((value) => value !== "") || searchInput !== ""
    );
  };

  // Smart search function
  const handleSearch = () => {
    if (!searchInput.trim()) {
      // Clear search filters if input is empty
      setFilters((prev) => ({
        ...prev,
        ticketId: "",
        userName: "",
        userMobile: "",
      }));
      return;
    }

    const input = searchInput.trim();

    // Check if input is only numbers (phone number)
    if (/^\d+$/.test(input)) {
      setFilters((prev) => ({
        ...prev,
        ticketId: "",
        userName: "",
        userMobile: input,
      }));
    }
    // Check if input contains both letters and numbers (ticket ID)
    else if (/[a-zA-Z]/.test(input) && /\d/.test(input)) {
      setFilters((prev) => ({
        ...prev,
        ticketId: input,
        userName: "",
        userMobile: "",
      }));
    }
    // If only letters, assume it's a name
    else if (/^[a-zA-Z\s]+$/.test(input)) {
      setFilters((prev) => ({
        ...prev,
        ticketId: "",
        userName: input,
        userMobile: "",
      }));
    }
    // Default case: search in all fields
    else {
      setFilters((prev) => ({
        ...prev,
        ticketId: input,
        userName: input,
        userMobile: input,
      }));
    }

    setCurrentPage(1);
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle grievance type selection
  const handleGrievanceTypeSelection = (type) => {
    if (type === "Incoming") {
      // Navigate to incoming grievance form
      navigate("/grievance/new/incoming");
    } else if (type === "Outgoing") {
      // Navigate to outgoing grievance form
      navigate("/grievance/new/outgoing");
    }
  };

  // Handle direct form navigation for feedback
  const handleCreateNew = () => {
    // For feedback, directly open outgoing form
    navigate("/grievance/new/outgoing");
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Feedback
            </p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-3 mb-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Side - Search Input */}
          <div className="flex-1">
            {/* <label className="block text-xs font-medium text-gray-700 mb-1">Search</label> */}
            <div className="flex gap-2 relative">
              <span className="absolute left-0 top-0 bottom-0 flex items-center justify-center px-2 text-gray-500 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent max-w-72"
              />
              {/* <button
                onClick={handleSearch}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 whitespace-nowrap"
              >
                Search
              </button> */}
            </div>
          </div>

          {/* Right Side - Filter Dropdowns */}
          <div className="flex flex-wrap gap-1">
            {/* Role Filter */}
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "role" ? null : "role")
                }
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{filters.userRole || "All Roles"}</span>
                <svg
                  className={`w-3 h-3 transition-transform ${
                    openDropdown === "role" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openDropdown === "role" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleFilterChange("userRole", "");
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                        !filters.userRole ? "bg-blue-50 text-blue-700" : ""
                      }`}
                    >
                      All Roles
                    </button>
                    {masterData.role?.map((role) => (
                      <button
                        key={role.pklUserRoleId}
                        onClick={() => {
                          handleFilterChange("userRole", role.vsRoleName);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                          filters.userRole === role.vsRoleName
                            ? "bg-blue-50 text-blue-700"
                            : ""
                        }`}
                      >
                        {role.vsRoleName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Query Type Filter */}
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "queryType" ? null : "queryType"
                  )
                }
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{filters.queryType || "All Types"}</span>
                <svg
                  className={`w-3 h-3 transition-transform ${
                    openDropdown === "queryType" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openDropdown === "queryType" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleFilterChange("queryType", "");
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                        !filters.queryType ? "bg-blue-50 text-blue-700" : ""
                      }`}
                    >
                      All Types
                    </button>
                    {masterData.queryType?.map((type) => (
                      <button
                        key={type.pklQueryTypeId}
                        onClick={() => {
                          handleFilterChange("queryType", type.vsQueryType);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                          filters.queryType === type.vsQueryType
                            ? "bg-blue-50 text-blue-700"
                            : ""
                        }`}
                      >
                        {type.vsQueryType}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* District Filter */}
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "district" ? null : "district"
                  )
                }
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{filters.district || "All Districts"}</span>
                <svg
                  className={`w-3 h-3 transition-transform ${
                    openDropdown === "district" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openDropdown === "district" && (
                <div className="absolute top-full left-0 mt-1 w-48 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="">
                    <button
                      onClick={() => {
                        handleFilterChange("district", "");
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                        !filters.district ? "bg-blue-50 text-blue-700" : ""
                      }`}
                    >
                      All Districts
                    </button>
                    {masterData.district?.map((district) => (
                      <button
                        key={district.pklDistrictId}
                        onClick={() => {
                          handleFilterChange(
                            "district",
                            district.vsDistrictName
                          );
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                          filters.district === district.vsDistrictName
                            ? "bg-blue-50 text-blue-700"
                            : ""
                        }`}
                      >
                        {district.vsDistrictName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Answered/Unanswered Filter */}
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "isUnanswered" ? null : "isUnanswered"
                  )
                }
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>
                  {filters.isUnanswered === ""
                    ? "All"
                    : filters.isUnanswered === "0"
                    ? "Answered"
                    : "Unanswered"}
                </span>
                <svg
                  className={`w-3 h-3 transition-transform ${
                    openDropdown === "isUnanswered" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openDropdown === "isUnanswered" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleFilterChange("isUnanswered", "");
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                        !filters.isUnanswered ? "bg-blue-50 text-blue-700" : ""
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => {
                        handleFilterChange("isUnanswered", "0");
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                        filters.isUnanswered === "0"
                          ? "bg-blue-50 text-blue-700"
                          : ""
                      }`}
                    >
                      Answered
                    </button>
                    <button
                      onClick={() => {
                        handleFilterChange("isUnanswered", "1");
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                        filters.isUnanswered === "1"
                          ? "bg-blue-50 text-blue-700"
                          : ""
                      }`}
                    >
                      Unanswered
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters() && (
              <div className="flex items-end">
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-2 text-xs flex items-center text-gray-600 hover:text-gray-800 rounded"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="text-xs">Clear All</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conditional Rendering: Table or No Data */}
      {grievances.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[.6rem] font-bold text-blue-600 uppercase tracking-wider">
                    SL No
                  </th>
                  <th className="px-4 py-3 text-left text-[.6rem] font-bold text-blue-600 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-4 py-3 text-left text-[.6rem] font-bold text-blue-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-[.6rem] font-bold text-blue-600 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left text-[.6rem] font-bold text-blue-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-[.6rem] font-bold text-blue-600 uppercase tracking-wider">
                    Query Type
                  </th>
                  <th className="px-4 py-3 text-left text-[.6rem] font-bold text-blue-600 uppercase tracking-wider">
                    Entry Type
                  </th>
                  <th className="px-4 py-3 text-left text-[.6rem] font-bold text-blue-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[.6rem] font-bold text-blue-600 uppercase tracking-wider">
                    Answered
                  </th>
                  <th className="px-4 py-3 text-left text-[.6rem] font-bold text-blue-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-gray-200">
                {grievances.map((item, index) => (
                  <tr key={item.pklCrmUserId} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-3 py-2">#{item.vsTicketId || "N/A"}</td>
                    <td className="px-3 py-2">{item.vsUserName || "N/A"}</td>
                    <td className="px-3 py-2">{item.vsMobile || "N/A"}</td>
                    <td className="px-3 py-2">{item.vsRoleName || "N/A"}</td>
                    <td className="px-3 py-2">{item.vsQueryType || "N/A"}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        {item.vsEntryType || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {formatDate(item.vsEntryDateTime)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`${
                          item.bIsUnanswered === 0 || item.bIsUnanswered === "0"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.bIsUnanswered === 0 || item.bIsUnanswered === "0"
                          ? "Yes"
                          : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/chats?id=${item.pklCrmUserId}`}
                          className="text-gray-600 hover:text-blue-600 text-xs font-medium"
                          title="View Details"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) =>
                    handlePageSizeChange(parseInt(e.target.value))
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No Data Found Section */
        <div className="overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 px-8">
            {/* No Data Illustration */}
            <div className="">
              <svg
                className="w-32 h-32 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Folder */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
                {/* Sad Face */}
                <g transform="translate(8, 10)">
                  {/* Left Eye */}
                  <circle cx="2.5" cy="3" r="0.3" fill="currentColor" />
                  {/* Right Eye */}
                  <circle cx="5.5" cy="3" r="0.3" fill="currentColor" />
                  {/* Sad Mouth (frown) */}
                  <path
                    d="M2.5 5.5 Q4 4.5 5.5 5.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={0.8}
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>

            {/* No Data Message */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Feedback Found
              </h3>
              <p className="text-gray-500 text-sm max-w-md">
                There are no feedbacks at the moment. <br /> Start by
                creating a new feedback to get started.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary - Only show when there are feedback entries */}
      {grievances.length > 0 && (
        <div className="mt-4 text-xs text-gray-600">
          Showing {grievances.length} of {totalCount} feedback entries
          {filters.isUnanswered && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {filters.isUnanswered === "0" ? "Answered" : "Unanswered"}
            </span>
          )}
        </div>
      )}

      {/* Grievance Type Dialog */}
      {showGrievanceTypeDialog && (
        <GrievanceTypeDialog
          onSelect={handleGrievanceTypeSelection}
          onClose={() => setShowGrievanceTypeDialog(false)}
        />
      )}
    </div>
  );
};

export default FeedbackList;
