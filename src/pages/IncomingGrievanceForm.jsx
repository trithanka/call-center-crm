import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import apiService from "../services/api";
import * as Lu from "react-icons/lu";

const IncomingGrievanceForm = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [status, setStatus] = useState("Pending");
  const [forwardTo, setForwardTo] = useState("");
  const [error, setError] = useState({});
  const [showForm, setShowForm] = useState(true);
  const [masterData, setMasterData] = useState({
    roles: [],
    queryTypes: [],
    districts: [],
  });
  const [isLoadingMaster, setIsLoadingMaster] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    role: "",
    name: "",
    mobile: "",
    queryType: "",
    description: "",
    district: "",
    address: "",
    grievanceType: "incoming", // Fixed to incoming
  });

  // Candidate search states
  const [showCandidateSearch, setShowCandidateSearch] = useState(false);
  const [candidateSearchText, setCandidateSearchText] = useState("");
  const [candidateSearchType, setCandidateSearchType] = useState("name");
  const [candidateSearchResults, setCandidateSearchResults] = useState([]);
  const [isSearchingCandidates, setIsSearchingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isFormDisabled, setIsFormDisabled] = useState(true); // Start with form disabled

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("messages");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  // Fetch master data on component mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setIsLoadingMaster(true);
        const response = await apiService.getMasterData();

        if (response.message === "Fetched Successfully!" && response.data) {
          setMasterData({
            roles: response.data.role || [],
            queryTypes: response.data.queryType || [],
            districts: response.data.district || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch master data:", error);
        // Fallback to default options if API fails
        setMasterData({
          roles: [
            { pklUserRoleId: 1, vsRoleName: "Candidate" },
            { pklUserRoleId: 2, vsRoleName: "Training Center" },
            { pklUserRoleId: 3, vsRoleName: "Trainer" },
            { pklUserRoleId: 4, vsRoleName: "Training Partner" },
            { pklUserRoleId: 5, vsRoleName: "Public" },
          ],
          queryTypes: [
            { pklQueryTypeId: 1, vsQueryType: "Registration" },
            { pklQueryTypeId: 2, vsQueryType: "Course" },
            { pklQueryTypeId: 3, vsQueryType: "Training Center" },
            { pklQueryTypeId: 4, vsQueryType: "Placement" },
            { pklQueryTypeId: 5, vsQueryType: "Employment" },
            { pklQueryTypeId: 6, vsQueryType: "Others" },
          ],
          districts: [
            { pklDistrictId: 1132, vsDistrictName: "Bajali" },
            { pklDistrictId: 1130, vsDistrictName: "Baksa" },
            { pklDistrictId: 362, vsDistrictName: "Barpeta" },
            { pklDistrictId: 1131, vsDistrictName: "Biswanath" },
            { pklDistrictId: 363, vsDistrictName: "Bongaigaon" },
            { pklDistrictId: 364, vsDistrictName: "Cachar" },
            { pklDistrictId: 1120, vsDistrictName: "Charaideo" },
            { pklDistrictId: 1121, vsDistrictName: "Chirang" },
            { pklDistrictId: 365, vsDistrictName: "Darrang" },
            { pklDistrictId: 366, vsDistrictName: "Dhemaji" },
            { pklDistrictId: 367, vsDistrictName: "Dhubri" },
            { pklDistrictId: 368, vsDistrictName: "Dibrugarh" },
            { pklDistrictId: 1122, vsDistrictName: "Dima Hasao" },
            { pklDistrictId: 1123, vsDistrictName: "Hojai" },
            { pklDistrictId: 369, vsDistrictName: "Goalpara" },
            { pklDistrictId: 370, vsDistrictName: "Golaghat" },
            { pklDistrictId: 371, vsDistrictName: "Hailakandi" },
            { pklDistrictId: 372, vsDistrictName: "Jorhat" },
            { pklDistrictId: 373, vsDistrictName: "Kamrup" },
            { pklDistrictId: 1124, vsDistrictName: "Kamrup Metropolitan" },
            { pklDistrictId: 1125, vsDistrictName: "Karbi Anglong - East" },
            { pklDistrictId: 1126, vsDistrictName: "Karbi Anglong - West" },
            { pklDistrictId: 376, vsDistrictName: "Kokrajhar" },
            { pklDistrictId: 377, vsDistrictName: "Lakhimpur" },
            { pklDistrictId: 1127, vsDistrictName: "Majuli" },
            { pklDistrictId: 378, vsDistrictName: "Morigaon" },
            { pklDistrictId: 379, vsDistrictName: "Nagaon" },
            { pklDistrictId: 380, vsDistrictName: "Nalbari" },
            { pklDistrictId: 382, vsDistrictName: "Sivasagar" },
            { pklDistrictId: 383, vsDistrictName: "Sonitpur" },
            { pklDistrictId: 1128, vsDistrictName: "South Salmara-Mankachar" },
            { pklDistrictId: 375, vsDistrictName: "Sribhumi" },
            { pklDistrictId: 1134, vsDistrictName: "Tamulpur" },
            { pklDistrictId: 384, vsDistrictName: "Tinsukia" },
            { pklDistrictId: 1129, vsDistrictName: "Udalguri" },
          ],
        });
      } finally {
        setIsLoadingMaster(false);
      }
    };

    fetchMasterData();
  }, []);

  // Handle role change to show candidate search
  const handleRoleChange = (role) => {
    // Clear error for role
    setError({ ...error, role: "" });

    // Always clear prefilled data when role changes
    setFormData((prev) => ({
      ...prev,
      role: role,
      name: "",
      mobile: "",
      district: "",
      address: "",
    }));

    // Reset search filter when role changes
    setCandidateSearchText("");
    setCandidateSearchType("name");
    setCandidateSearchResults([]);
    setSelectedCandidate(null);

    if (role === "Candidate") {
      setShowCandidateSearch(true);
      setIsFormDisabled(true);
    } else if (
      role === "Training Partner" ||
      role === "Training Center" ||
      role === "Trainer"
    ) {
      // Show search for training roles
      setShowCandidateSearch(true);
      setIsFormDisabled(true);
    } else if (role !== "") {
      // Enable form for other roles
      setShowCandidateSearch(false);
      setIsFormDisabled(false);
    } else {
      // Disable form when no role is selected
      setShowCandidateSearch(false);
      setIsFormDisabled(true);
    }
  };

  // Search candidates
  const searchCandidates = async () => {
    if (!candidateSearchText.trim()) {
      toast.error("Please enter search text");
      return;
    }

    try {
      setIsSearchingCandidates(true);
      // Clear previous search results
      setCandidateSearchResults([]);

      // Determine userType based on selected role
      let userType = "Candidate";
      if (formData.role === "Training Partner") {
        userType = "TrainingPartner";
      } else if (formData.role === "Training Center") {
        userType = "TrainingCenter";
      } else if (formData.role === "Trainer") {
        userType = "Trainer";
      }

      const response = await apiService.getUserData({
        userType: userType,
        queryType: candidateSearchType,
        searchText: candidateSearchText.trim(),
      });

      if (response && response.data) {
        setCandidateSearchResults(response.data);
        if (response.data.length === 0) {
          const roleName =
            formData.role === "Candidate"
              ? "candidates"
              : formData.role === "Training Partner"
              ? "training partners"
              : formData.role === "Training Center"
              ? "training centers"
              : formData.role === "Trainer"
              ? "trainers"
              : "results";
          toast.info(`No ${roleName} found`);
        }
      } else {
        setCandidateSearchResults([]);
        const roleName =
          formData.role === "Candidate"
            ? "candidates"
            : formData.role === "Training Partner"
            ? "training partners"
            : formData.role === "Training Center"
            ? "training centers"
            : formData.role === "Trainer"
            ? "trainers"
            : "results";
        toast.error(`Failed to search ${roleName}`);
      }
    } catch (error) {
      console.error("Error searching candidates:", error);
      const roleName =
        formData.role === "Candidate"
          ? "candidates"
          : formData.role === "Training Partner"
          ? "training partners"
          : formData.role === "Training Center"
          ? "training centers"
          : formData.role === "Trainer"
          ? "trainers"
          : "results";
      toast.error(`Failed to search ${roleName}`);
      setCandidateSearchResults([]);
    } finally {
      setIsSearchingCandidates(false);
    }
  };

  // Select candidate
  const selectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setFormData((prev) => ({
      ...prev,
      name: candidate.candidateName || candidate.name,
      mobile: candidate.mobile,
      district: candidate.district,
      address: candidate.address || "",
    }));
    setShowCandidateSearch(false);
    setIsFormDisabled(false);
    const roleName =
      formData.role === "Candidate" ? "Candidate" : formData.role;
    toast.success(`${roleName} selected successfully`);
  };

  // Clear candidate selection
  const clearCandidateSelection = () => {
    setSelectedCandidate(null);
    setFormData((prev) => ({
      ...prev,
      name: "",
      mobile: "",
      district: "",
      address: "",
    }));
    setShowCandidateSearch(true);
    setIsFormDisabled(true);
  };

  // Clear search text and results
  const clearSearch = () => {
    setCandidateSearchText("");
    setCandidateSearchResults([]);
    setSelectedCandidate(null);
  };

  const handleInitialSubmit = async () => {
    const {
      role,
      name,
      mobile,
      queryType,
      description,
      grievanceType,
      district,
      address,
    } = formData;
    console.log("Form data being validated:", formData);
    let errorMsg = {};

    if (!role) errorMsg.role = "Role is required.";
    if (!name) errorMsg.name = "Name is required.";
    if (!mobile) errorMsg.mobile = "Mobile number is required.";
    if (mobile && mobile.toString().length !== 10)
      errorMsg.mobile = "Mobile number must be 10 digits.";
    if (!queryType) errorMsg.queryType = "Query type is required.";
    // if (!description) errorMsg.description = "Description is required."; // Made optional
    if (!district) errorMsg.district = "District is required.";
    if (!address) errorMsg.address = "Address is required.";

    setError(errorMsg);
    if (Object.keys(errorMsg).length > 0) {
      console.log("Validation errors:", errorMsg);
      return;
    }

    setIsSubmitting(true);
    try {
      // Find the role ID, query type ID, and district ID from master data
      const selectedRole = masterData.roles.find((r) => r.vsRoleName === role);
      const selectedQueryType = masterData.queryTypes.find(
        (q) => q.vsQueryType === queryType
      );
      const selectedDistrict = masterData.districts.find(
        (d) => d.vsDistrictName === district 
      );

      if (!selectedRole || !selectedQueryType || !selectedDistrict) {
        toast.error("Invalid role, query type, or district selected.");
        return;
      }

      // Format date time to required format (DD-MM-YYYY HH:mm:ss am/pm)
      const formatDateForAPI = (dateTimeString) => {
        if (!dateTimeString) {
          // Use current date/time if not provided
          const now = new Date();
          const day = String(now.getDate()).padStart(2, "0");
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const year = now.getFullYear();
          const hours = now.getHours();
          const minutes = String(now.getMinutes()).padStart(2, "0");
          const seconds = String(now.getSeconds()).padStart(2, "0");
          const ampm = hours >= 12 ? "pm" : "am";
          const displayHours = hours % 12 || 12;

          return `${day}-${month}-${year} ${String(displayHours).padStart(
            2,
            "0"
          )}:${minutes}:${seconds} ${ampm}`;
        }

        const date = new Date(dateTimeString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        const ampm = hours >= 12 ? "pm" : "am";
        const displayHours = hours % 12 || 12;

        return `${day}-${month}-${year} ${String(displayHours).padStart(
          2,
          "0"
        )}:${minutes}:${seconds} ${ampm}`;
      };

      const formattedDateTime = formatDateForAPI(); // Always use current date/time

      // Prepare API request data
      const grievanceData = {
        user: name,
        mobile: mobile,
        queryTypeId: selectedQueryType.pklQueryTypeId,
        entryDateTime: formattedDateTime,
        queryDescription: description,
        roleId: selectedRole.pklUserRoleId,
        entryType: grievanceType,
        districtId: selectedDistrict.pklDistrictId,
        address: address,
        userId: selectedCandidate ? selectedCandidate.Id : null, // Add userId from selected candidate/training entity
      };

      // Debug: Log the payload being sent
      console.log("Sending grievance data:", grievanceData);
      console.log("Entry type being sent:", grievanceData.entryType);

      // Submit to API
      const response = await apiService.saveGrievance(grievanceData);

      // Handle API response
      if (response.status === "true" || response.status === true) {
        // Success - show toast and redirect to chats page
        toast.success(
          response.message || "Incoming grievance submitted successfully!"
        );

        // Extract pklCrmUserId from response data
        const pklCrmUserId = response.data?.pklCrmUserId;

        if (pklCrmUserId) {
          // Redirect to chats page with the user ID
          navigate(`/chats?id=${pklCrmUserId}`);
        } else {
          // Fallback: show error if no user ID in response
          toast.error(
            "Grievance created but unable to redirect. Please check the grievance list."
          );
        }
      } else {
        // Status false - show error toast and stay on page
        toast.error(response.message || "Failed to submit incoming grievance.");
      }
    } catch (error) {
      console.error("Failed to submit incoming grievance:", error);
      toast.error(
        error.message ||
          "Failed to submit incoming grievance. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const reply = {
      id: messages.length + 1,
      sender: "admin",
      message: `${newMessage}\n\nStatus: ${status}${
        status === "Forwarded to" ? ` (${forwardTo})` : ""
      }`,
      timestamp: new Date().toLocaleString("en-IN"),
    };

    setMessages([...messages, reply]);
    setNewMessage("");
    setStatus("Pending");
    setForwardTo("");
  };

  return (
    <div className="">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />

          {/* Main content */}
          <main className="overflow-auto w-full flex-grow bg-neutral-100">
            <div className="max-w-7xl mx-auto py-6 px-6">
              {showForm ? (
                <div className="bg-white rounded-xl border border-neutral-200 text-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          Incoming Grievance Form
                        </h2>
                        {showForm ? (
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-700">
                              Submit a new incoming grievance
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 mt-1">
                            Raised by:{" "}
                            <span className="font-medium">{formData.role}</span>{" "}
                            | Category:{" "}
                            <span className="font-medium">
                              {formData.queryType}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {error.general && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error.general}
                    </div>
                  )}

                  <div className="grid lg:grid-cols-3 gap-4 px-6 py-4">
                    {/* Role */}
                    <div className="lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Grievant's Role <span className="text-red-500">*</span>
                      </label>

                      {isLoadingMaster ? (
                        <p className="text-sm text-gray-700">
                          Loading roles...
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {masterData.roles.map((role) => (
                            <label
                              key={role.pklUserRoleId}
                              className="relative cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="role"
                                value={role.vsRoleName}
                                checked={formData.role === role.vsRoleName}
                                onChange={(e) =>
                                  handleRoleChange(e.target.value)
                                }
                                className="peer hidden"
                                disabled={isLoadingMaster}
                              />
                              <div
                                className="px-4 py-2 rounded border border-gray-300 text-sm transition-all duration-200
            peer-checked:ring-1 ring-emerald-600 peer-checked:border-emerald-600 peer-checked:font-medium peer-checked:bg-emerald-50 
            peer-checked:text-emerald-700"
                              >
                                {role.vsRoleName}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {error.role && (
                        <p className="text-red-600 text-xs mt-1">
                          {error.role}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Candidate Search Section */}
                  {showCandidateSearch && (
                    <div className="border-t border-neutral-200 bg-emerald-50">
                      <div className="border-b border-emerald-100 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
                          <Lu.LuSearch />
                          Search{" "}
                          {formData.role === "Candidate"
                            ? "Candidate"
                            : formData.role}
                        </h3>
                      </div>

                      <div className="">
                        {/* Search Filters */}
                        <div className="flex gap-4 p-6 pb-2">
                          {/* Search Type */}
                          <div>
                            <select
                              value={candidateSearchType}
                              onChange={(e) =>
                                setCandidateSearchType(e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                            >
                              <option value="name">Search by Name</option>
                              <option value="mobile">Search by Mobile</option>
                              {formData.role === "Candidate" && (
                                <option value="id">Search by ID</option>
                              )}
                            </select>
                          </div>

                          {/* Search Text */}
                          <div className="w-full max-w-xs">
                            <input
                              type="text"
                              value={candidateSearchText}
                              onChange={(e) =>
                                setCandidateSearchText(e.target.value)
                              }
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  searchCandidates();
                                }
                              }}
                              placeholder={`Enter ${
                                candidateSearchType === "name"
                                  ? "name"
                                  : candidateSearchType === "mobile"
                                  ? "mobile number"
                                  : "ID"
                              }`}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                            />
                          </div>

                          {/* Buttons */}
                          <div className="flex items-end gap-3">
                            <button
                              onClick={searchCandidates}
                              disabled={
                                isSearchingCandidates ||
                                !candidateSearchText.trim()
                              }
                              className="bg-emerald-600 border border-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full font-medium text-sm transition-colors disabled:opacity-50 h-full"
                            >
                              {isSearchingCandidates ? (
                                <Lu.LuLoaderCircle className="animate-spin" />
                              ) : (
                                <Lu.LuSearch />
                              )}
                            </button>
                            <button
                              onClick={clearSearch}
                              disabled={isSearchingCandidates}
                              className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-100 text-sm font-medium transition-colors disabled:opacity-50 h-full"
                            >
                              <Lu.LuX />
                            </button>
                          </div>
                        </div>

                        {/* Results */}
                        {candidateSearchResults.length > 0 ? (
                          <div className="">
                            <div className="flex justify-between items-center px-6 border-t border-neutral-300 p-4">
                              <h4 className="text-sm font-medium text-gray-800">
                                Search Results
                              </h4>
                              <button
                                onClick={clearSearch}
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                              >
                                Clear Results
                              </button>
                            </div>

                            <div className="overflow-hidden border border-gray-200 shadow-sm max-h-96 overflow-y-auto">
                              <table className="w-full text-xs">
                                <thead className="bg-emerald-200 border-b sticky top-0 self-start">
                                  <tr>
                                    {formData.role === "Candidate" && (
                                      <th className="px-4 py-3 text-left text-[.65rem] font-semibold text-gray-900 uppercase w-20">
                                        Candidate ID
                                      </th>
                                    )}
                                    <th className="px-4 py-3 text-left text-[.65rem] font-semibold text-gray-900 uppercase w-64">
                                      {formData.role === "Candidate"
                                        ? "Candidate Name"
                                        : "Name"}
                                    </th>
                                    <th className="px-4 py-3 text-left text-[.65rem] font-semibold text-gray-900 uppercase w-32">
                                      Mobile
                                    </th>
                                    {(formData.role === "Candidate" ||
                                      formData.role === "Training Center" ||
                                      formData.role === "Training Partner") && (
                                      <th className="px-4 py-3 text-left text-[.65rem] font-semibold text-gray-900 uppercase w-40">
                                        District
                                      </th>
                                    )}
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase w-1/12"></th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-300">
                                  {candidateSearchResults.map(
                                    (candidate, index) => (
                                      <tr
                                        key={
                                          candidate.Id ||
                                          candidate.candidateId ||
                                          candidate.TCId ||
                                          candidate.id ||
                                          index
                                        }
                                        className="hover:bg-gray-100 cursor-pointer transition-colors"
                                        onClick={() =>
                                          selectCandidate(candidate)
                                        }
                                      >
                                        {formData.role === "Candidate" && (
                                          <td className="px-4 py-2 text-gray-900 font-medium whitespace-nowrap">
                                            {candidate.Id ||
                                              candidate.candidateId}
                                          </td>
                                        )}
                                        <td className="px-4 py-2 font-semibold text-gray-900 break-words max-w-xs">
                                          {candidate.candidateName ||
                                            candidate.name}
                                        </td>
                                        <td className="px-4 py-2 text-gray-900 font-medium whitespace-nowrap">
                                          {candidate.mobile}
                                        </td>
                                        {(formData.role === "Candidate" ||
                                          formData.role === "Training Center" ||
                                          formData.role ===
                                            "Training Partner") && (
                                          <td className="px-4 py-2 text-gray-900 font-medium whitespace-nowrap">
                                            {candidate.district}
                                          </td>
                                        )}
                                        <td className="px-4 py-2 whitespace-nowrap">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              selectCandidate(candidate);
                                            }}
                                            className="text-emerald-600 hover:text-emerald-800 font-medium text-xs transition-all"
                                          >
                                            <Lu.LuSquareMousePointer />
                                          </button>
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center flex flex-col items-center justify-center py-8 border-t border-gray-300 text-gray-500 bg-gray-50">
                            <svg
                              className="w-12 h-12 text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              {/* Search Icon */}
                              <circle
                                cx="10"
                                cy="10"
                                r="7"
                                strokeWidth="1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <line
                                x1="15"
                                y1="15"
                                x2="21"
                                y2="21"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />

                              {/* Sad Face inside the lens */}
                              <g transform="translate(5.5, 5.5)">
                                {/* Left Eye */}
                                <circle
                                  cx="2.8"
                                  cy="3"
                                  r="0.35"
                                  fill="currentColor"
                                />
                                {/* Right Eye */}
                                <circle
                                  cx="5.8"
                                  cy="3"
                                  r="0.35"
                                  fill="currentColor"
                                />
                                {/* Sad Mouth */}
                                <path
                                  d="M2.8 5.6 Q4.3 4.6 5.8 5.6"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="0.8"
                                  strokeLinecap="round"
                                />
                              </g>
                            </svg>

                            <p className="text-sm font-medium">
                              No{" "}
                              {formData.role === "Candidate"
                                ? "Candidate"
                                : formData.role}{" "}
                              data found
                            </p>
                            <p className="text-xs text-gray-700">
                              Try adjusting your search filters or entering
                              different keywords.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected Candidate Display */}
                  {selectedCandidate && (
                    <div className="mb-4 px-6 py-4 border-y border-neutral-300 transition-all bg-emerald-50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
                            <span className="text-2xl text-emerald-700">
                              <Lu.LuUser />
                            </span>
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-emerald-800">
                              {selectedCandidate.candidateName ||
                                selectedCandidate.name}
                            </h4>
                            <p className="text-sm text-emerald-700 flex flex-wrap items-center gap-2">
                              <span className="">
                                {selectedCandidate.mobile}
                              </span>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={clearCandidateSelection}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-xs flex gap-1"
                        >
                          <Lu.LuRepeat className="text-base" />
                          {formData.role === "Candidate"
                            ? "Candidate"
                            : formData.role}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show form fields when non-search role is selected OR when search result is selected */}
                  {formData.role &&
                    ((formData.role !== "Candidate" &&
                      formData.role !== "Training Partner" &&
                      formData.role !== "Training Center" &&
                      formData.role !== "Trainer") ||
                      selectedCandidate) && (
                      <>
                        <div className="grid lg:grid-cols-2 gap-6 px-6 py-1">
                          {/* Name of the Grievant */}
                          <div>
                            <label className="block text-sm font-medium text-gray-800">
                              Name of the Grievant{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                });
                                setError({ ...error, name: "" });
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                              disabled={
                                isFormDisabled ||
                                (selectedCandidate &&
                                  (selectedCandidate.candidateName ||
                                    selectedCandidate.name))
                              }
                            />
                            {error.name && (
                              <p className="text-red-600 text-xs mt-1">
                                {error.name}
                              </p>
                            )}
                          </div>

                          {/* Mobile */}
                          <div>
                            <label className="block text-sm font-medium text-gray-800">
                              Mobile No. <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={formData.mobile}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 10) {
                                  setFormData({ ...formData, mobile: value });
                                  setError({ ...error, mobile: "" });
                                }
                              }}
                              maxLength={10}
                              placeholder="Enter mobile number"
                              required
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                              disabled={
                                isFormDisabled ||
                                (selectedCandidate && selectedCandidate.mobile)
                              }
                            />
                            {error.mobile && (
                              <p className="text-red-600 text-xs mt-1">
                                {error.mobile}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                  {/* District and Address - Show when non-search role is selected OR when search result is selected */}
                  {formData.role &&
                    ((formData.role !== "Candidate" &&
                      formData.role !== "Training Partner" &&
                      formData.role !== "Training Center" &&
                      formData.role !== "Trainer") ||
                      selectedCandidate) && (
                      <>
                        <div className="grid lg:grid-cols-2 gap-6 px-6 py-1">
                          {/* District */}
                          <div>
                            <label className="block text-sm font-medium text-gray-800">
                              District <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.district}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  district: e.target.value,
                                });
                                setError({ ...error, district: "" });
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                              disabled={
                                isLoadingMaster ||
                                isFormDisabled ||
                                (selectedCandidate &&
                                  selectedCandidate.district)
                              } // Disable if candidate is selected and has district data
                            >
                              <option value="" selected disabled>
                                {isLoadingMaster
                                  ? "Loading districts..."
                                  : "-- Select District --"}
                              </option>
                              {masterData.districts
                                .filter((district) => district.fklStateId === 4)
                                .map((district) => (
                                  <option
                                    key={district.pklDistrictId}
                                    value={district.vsDistrictName}
                                  >
                                    {district.vsDistrictName}
                                  </option>
                                ))}
                            </select>
                            {error.district && (
                              <p className="text-red-600 text-xs mt-1">
                                {error.district}
                              </p>
                            )}
                          </div>

                          {/* Address */}
                          <div>
                            <label className="block text-sm font-medium text-gray-800">
                              Address <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.address}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  address: e.target.value,
                                });
                                setError({ ...error, address: "" });
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                              placeholder="Enter full address"
                              disabled={
                                isFormDisabled ||
                                (selectedCandidate && selectedCandidate.address)
                              } // Disable if candidate is selected and has address data
                            />
                            {error.address && (
                              <p className="text-red-600 text-xs mt-1">
                                {error.address}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Query Type */}
                        <div className="px-6 py-1">
                          <label className="block text-sm font-medium text-gray-800">
                            Query Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.queryType}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                queryType: e.target.value,
                              });
                              setError({ ...error, queryType: "" });
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                            disabled={isLoadingMaster || isFormDisabled}
                          >
                            <option value="" selected disabled>
                              {isLoadingMaster
                                ? "Loading query types..."
                                : "-- Select Query Type --"}
                            </option>
                            {masterData.queryTypes.map((queryType) => (
                              <option
                                key={queryType.pklQueryTypeId}
                                value={queryType.vsQueryType}
                              >
                                {queryType.vsQueryType}
                              </option>
                            ))}
                          </select>
                          {error.queryType && (
                            <p className="text-red-600 text-xs mt-1">
                              {error.queryType}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        <div className="px-6 py-1">
                          <label className="block text-sm font-medium text-gray-800">
                            Query Description
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            rows="4"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                            disabled={isFormDisabled}
                          ></textarea>
                          {error.description && (
                            <p className="text-red-600 text-xs mt-1">
                              {error.description}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                  {/* Submit button and note - Only show when non-search role or search result is selected */}
                  {formData.role &&
                    ((formData.role !== "Candidate" &&
                      formData.role !== "Training Partner" &&
                      formData.role !== "Training Center" &&
                      formData.role !== "Trainer") ||
                      selectedCandidate) && (
                      <div className="px-6 py-4 flex justify-between border-t border-gray-200">
                        <div>
                          <p className="text-sm text-gray-700 italic">
                            NOTE: Please fill the form correctly and submit the
                            incoming grievance.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleInitialSubmit}
                            className={`bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-xs flex gap-1 ${
                              isSubmitting || isLoadingMaster || isFormDisabled
                                ? "bg-emerald-600/50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={
                              isSubmitting || isLoadingMaster || isFormDisabled
                            }
                          >
                            {isSubmitting
                              ? "Submitting..."
                              : isLoadingMaster
                              ? "Loading..."
                              : isFormDisabled
                              ? formData.role === "Candidate"
                                ? "Select Candidate First"
                                : "Select Role First"
                              : "Submit Grievance"}
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <>
                  {/* Timeline Chat */}
                  <div className="relative bg-white rounded shadow p-4 h-[calc(100vh-300px)] overflow-y-auto">
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 -translate-x-1/2"></div>
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-400">
                        No messages yet
                      </p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex items-center relative my-6 ${
                            msg.sender === "admin"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {/* Timeline dot */}
                          <span
                            className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 ${
                              msg.sender === "admin"
                                ? "bg-emerald-500 border-emerald-200 -right-2"
                                : "bg-gray-400 border-gray-200 -left-2"
                            }`}
                          ></span>

                          {/* Message bubble */}
                          <div
                            className={`max-w-xs p-3 rounded-lg text-sm shadow ${
                              msg.sender === "admin"
                                ? "bg-emerald-100 text-emerald-800 mr-6"
                                : "bg-gray-200 text-gray-800 ml-6"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                            <p className="text-xs mt-1 text-gray-700">
                              {msg.timestamp}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Admin Reply Section */}
                  <div className="mt-4 bg-white p-4 rounded shadow space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800">
                        Reply Message
                      </label>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows="3"
                        placeholder="Type your reply..."
                        className="w-full border px-3 py-2 rounded mt-1"
                      ></textarea>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-800">
                          Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full border px-3 py-2 rounded mt-1"
                        >
                          <option value="Closed">Closed</option>
                          <option value="Pending">Pending</option>
                          <option value="Forwarded to">Forwarded to</option>
                        </select>
                      </div>

                      {status === "Forwarded to" && (
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-800">
                            Department
                          </label>
                          <select
                            value={forwardTo}
                            onChange={(e) => setForwardTo(e.target.value)}
                            className="w-full border px-3 py-2 rounded mt-1"
                          >
                            <option value="">Select Department</option>
                            <option value="HR">HR</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="MIS">MIS</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={sendMessage}
                      className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                    >
                      Send Reply
                    </button>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default IncomingGrievanceForm;
