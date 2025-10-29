import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import apiService from "../services/api";
import * as Lu from "react-icons/lu";

const IncomingGrievanceForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Breadcrumb logic
  const segments = location.pathname.split("/").filter(Boolean);
  const labelMap = {
    dashboard: "Dashboard",
    grievance: "Grievances",
    feedback: "Feedback",
    new: "New",
    incoming: "Incoming",
    outgoing: "Outgoing",
  };

  const crumbs = segments.map((seg, i) => ({
    to: "/" + segments.slice(0, i + 1).join("/"),
    label: labelMap[seg] ?? decodeURIComponent(seg),
  }));
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
    setFormData({ ...formData, role: role });
    setError({ ...error, role: "" });

    // Reset search filter when role changes
    setCandidateSearchText("");
    setCandidateSearchType("name");
    setCandidateSearchResults([]);
    setSelectedCandidate(null);

    if (role === "Candidate") {
      setShowCandidateSearch(true);
      setIsFormDisabled(true);
      // Clear form data when switching to candidate search
      setFormData((prev) => ({
        ...prev,
        name: "",
        mobile: "",
        district: "",
        address: "",
      }));
    } else if (
      role === "Training Partner" ||
      role === "Training Center" ||
      role === "Trainer"
    ) {
      // Show search for training roles
      setShowCandidateSearch(true);
      setIsFormDisabled(true);
      // Clear form data when switching to training search
      setFormData((prev) => ({
        ...prev,
        name: "",
        mobile: "",
        district: "",
        address: "",
      }));
    } else if (role !== "") {
      // Enable form for other roles
      setShowCandidateSearch(false);
      setIsFormDisabled(false);
      setSelectedCandidate(null);
    } else {
      // Disable form when no role is selected
      setShowCandidateSearch(false);
      setIsFormDisabled(true);
      setSelectedCandidate(null);
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
                <div className="bg-white border border-neutral-200 rounded-xl text-sm overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-800 tracking-tight">
                        Incoming Grievance Form
                      </h2>
                      {showForm ? (
                        <p className="text-sm text-neutral-500 mt-0.5">
                          Please fill out the details below to record a new
                          grievance.
                        </p>
                      ) : (
                        <p className="text-sm text-neutral-500 mt-0.5">
                          Raised by{" "}
                          <span className="font-medium text-neutral-700">
                            {formData.role}
                          </span>
                          {" • "}Category:{" "}
                          <span className="font-medium text-neutral-700">
                            {formData.queryType}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error.general && (
                    <div className="mx-6 mt-4 rounded-md bg-red-50 border border-red-200 p-3 text-red-700 text-sm leading-relaxed">
                      <strong className="font-medium">Error:</strong>{" "}
                      {error.general}
                    </div>
                  )}

                  {/* Form Section */}
                  <div className="px-6 py-5 space-y-6">
                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Grievant’s Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        disabled={isLoadingMaster}
                        className="w-full border border-neutral-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      >
                        <option value="">
                          {isLoadingMaster
                            ? "Loading roles..."
                            : "-- Select Role --"}
                        </option>
                        {masterData.roles.map((role) => (
                          <option
                            key={role.pklUserRoleId}
                            value={role.vsRoleName}
                          >
                            {role.vsRoleName}
                          </option>
                        ))}
                      </select>
                      {error.role && (
                        <p className="text-xs text-red-600 mt-1">
                          {error.role}
                        </p>
                      )}
                    </div>

                    {/* Candidate Search */}
                    {showCandidateSearch && (
                      <div className="border border-neutral-200 rounded-md p-5 bg-neutral-50">
                        <h3 className="text-sm font-medium text-neutral-800 mb-4">
                          Search{" "}
                          {formData.role === "Candidate"
                            ? "Candidate"
                            : formData.role}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Search Type */}
                          <div>
                            <select
                              value={candidateSearchType}
                              onChange={(e) =>
                                setCandidateSearchType(e.target.value)
                              }
                              className="w-full border border-neutral-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs h-full"
                            >
                              <option value="name">By Name</option>
                              <option value="mobile">By Mobile</option>
                              {formData.role === "Candidate" && (
                                <option value="id">By ID</option>
                              )}
                            </select>
                          </div>

                          {/* Search Input */}
                          <div>
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
                              className="w-full border border-neutral-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs h-full"
                            />
                          </div>

                          {/* Buttons */}
                          <div className="flex items-end gap-2">
                            <button
                              onClick={searchCandidates}
                              disabled={
                                isSearchingCandidates ||
                                !candidateSearchText.trim()
                              }
                              className="bg-emerald-600 border border-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full font-medium text-sm transition-colors disabled:opacity-50 h-full"
                            >
                              {isSearchingCandidates
                                ? 
                                <Lu.LuLoaderCircle className="animate-spin" />
                                
                                : <Lu.LuSearch />}
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
                      </div>
                    )}
                  </div>

                  {/* Submit Section */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50">
                    <p className="text-sm text-neutral-500">
                      Review all details carefully before submitting.
                    </p>
                    <button
                      onClick={handleInitialSubmit}
                      disabled={isSubmitting || isFormDisabled}
                      className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                        isSubmitting
                          ? "bg-neutral-300 text-neutral-600 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Grievance"}
                    </button>
                  </div>
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
                            <p className="text-xs mt-1 text-gray-500">
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
                      <label className="block text-sm font-medium">
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
                        <label className="block text-sm font-medium">
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
                          <label className="block text-sm font-medium">
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
                      className="bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700"
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
