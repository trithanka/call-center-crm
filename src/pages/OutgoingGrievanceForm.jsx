import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import apiService from "../services/api";

const OutgoingGrievanceForm = () => {
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
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionResponses, setQuestionResponses] = useState({});

  const [formData, setFormData] = useState({
    role: "",
    name: "",
    mobile: "",
    queryType: "",
    description: "",
    dateTime: "",
    district: "",
    address: "",
    grievanceType: "outgoing", // Fixed to outgoing
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
            { pklDistrictId: 369, vsDistrictName: "Goalpara" },
            { pklDistrictId: 370, vsDistrictName: "Golaghat" },
            { pklDistrictId: 371, vsDistrictName: "Hailakandi" },
            { pklDistrictId: 1123, vsDistrictName: "Hojai" },
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
      setFormData(prev => ({
        ...prev,
        name: "",
        mobile: "",
        district: "",
        address: ""
      }));
    } else if (role === "Training Partner" || role === "Training Center" || role === "Trainer") {
      // Show search for training roles
      setShowCandidateSearch(true);
      setIsFormDisabled(true);
      // Clear form data when switching to training search
      setFormData(prev => ({
        ...prev,
        name: "",
        mobile: "",
        district: "",
        address: ""
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
        searchText: candidateSearchText.trim()
      });

      if (response && response.data) {
        setCandidateSearchResults(response.data);
        if (response.data.length === 0) {
          const roleName = formData.role === "Candidate" ? "candidates" : 
                          formData.role === "Training Partner" ? "training partners" :
                          formData.role === "Training Center" ? "training centers" :
                          formData.role === "Trainer" ? "trainers" : "results";
          toast.info(`No ${roleName} found`);
        }
      } else {
        setCandidateSearchResults([]);
        const roleName = formData.role === "Candidate" ? "candidates" : 
                        formData.role === "Training Partner" ? "training partners" :
                        formData.role === "Training Center" ? "training centers" :
                        formData.role === "Trainer" ? "trainers" : "results";
        toast.error(`Failed to search ${roleName}`);
      }
    } catch (error) {
      console.error("Error searching candidates:", error);
      const roleName = formData.role === "Candidate" ? "candidates" : 
                      formData.role === "Training Partner" ? "training partners" :
                      formData.role === "Training Center" ? "training centers" :
                      formData.role === "Trainer" ? "trainers" : "results";
      toast.error(`Failed to search ${roleName}`);
      setCandidateSearchResults([]);
    } finally {
      setIsSearchingCandidates(false);
    }
  };

  // Select candidate
  const selectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setFormData(prev => ({
      ...prev,
      name: candidate.candidateName || candidate.name,
      mobile: candidate.mobile,
      district: candidate.district,
      address: candidate.address || ""
    }));
    setShowCandidateSearch(false);
    setIsFormDisabled(false);
    const roleName = formData.role === "Candidate" ? "Candidate" : formData.role;
    toast.success(`${roleName} selected successfully`);
  };

  // Clear candidate selection
  const clearCandidateSelection = () => {
    setSelectedCandidate(null);
    setFormData(prev => ({
      ...prev,
      name: "",
      mobile: "",
      district: "",
      address: ""
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

  // Fetch questions when query type changes
  const fetchQuestions = async (queryType) => {
    if (!queryType || !formData.role) return;

    try {
      setIsLoadingQuestions(true);
      setQuestions([]);
      setQuestionResponses({});

      // Find the role ID and query type ID from master data
      const selectedRole = masterData.roles.find((r) => r.vsRoleName === formData.role);
      const selectedQueryType = masterData.queryTypes.find((q) => q.vsQueryType === queryType);

      if (!selectedRole || !selectedQueryType) {
        console.error("Role or query type not found");
        return;
      }

      const response = await apiService.getQuestions(selectedRole.pklUserRoleId, selectedQueryType.pklQueryTypeId);

      console.log("Questions API response:", response);

      if (response.message === "Fetched Successfully!" && response.data && response.data.queryType) {
        console.log("Questions data:", response.data.queryType);
        setQuestions(response.data.queryType);
        // Initialize question responses
        const initialResponses = {};
        response.data.queryType.forEach(question => {
          initialResponses[question.pklQuestionId] = {
            response: '',
            comment: ''
          };
        });
        setQuestionResponses(initialResponses);
      } else {
        console.log("No questions found or API error");
        setQuestions([]);
        setQuestionResponses({});
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      toast.error("Failed to load questions");
      setQuestions([]);
      setQuestionResponses({});
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleUnansweredSubmit = async () => {
    const { role, name, mobile, grievanceType, district, address } = formData;
    console.log("Unanswered form data being submitted:", formData);
    
    // No validation for unanswered submission - submit with whatever data is available

    setIsSubmitting(true);
    try {
      // Find the role ID and district ID from master data (use defaults if not found)
      const selectedRole = masterData.roles.find((r) => r.vsRoleName === role) || masterData.roles[0];
      const selectedDistrict = masterData.districts.find((d) => d.vsDistrictName === district) || masterData.districts[0];

      // Prepare grievance data for unanswered submission with defaults for empty fields
      const grievanceData = {
        userRoleId: selectedRole?.pklUserRoleId || 1,
        vsUserName: name || "Unknown",
        vsMobile: mobile || "0000000000",
        vsQueryType: "Unanswered", // Default query type
        vsQueryDescription: "No response provided - marked as unanswered", // Default description
        vsEntryDateTime: new Date().toISOString(), // Current date/time
        vsEntryType: "outgoing",
        districtId: selectedDistrict?.pklDistrictId || 1,
        vsAddress: address || "Not provided",
        questionResponses: {}, // Empty responses for unanswered
        unanswered: 1 // Flag to indicate this is an unanswered submission
      };

      console.log("Sending unanswered grievance data:", grievanceData);

      // Submit to API
      const response = await apiService.saveGrievance(grievanceData);

      // Handle API response
      if (response.status === "true" || response.status === true) {
        // Success - show toast and redirect to chats page
        toast.success(response.message || "Unanswered feedback submitted successfully!");
        
        // Extract pklCrmUserId from response data
        if (response.data && response.data.pklCrmUserId) {
          // Navigate to chat page with the user ID
          navigate(`/chats?id=${response.data.pklCrmUserId}`);
        } else {
          // Fallback: show error if no user ID in response
          toast.error("Feedback created but unable to redirect. Please check the feedback list.");
        }
      } else {
        // Status false - show error toast and stay on page
        toast.error(response.message || "Failed to submit unanswered feedback.");
      }
    } catch (error) {
      console.error("Failed to submit unanswered feedback:", error);
      toast.error(
        error.message || "Failed to submit unanswered feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitialSubmit = async () => {
    const { role, name, mobile, queryType, description, dateTime, grievanceType, district, address } = formData;
    console.log("Form data being validated:", formData);
    let errorMsg = {};

    if (!role) errorMsg.role = "Role is required.";
    if (!name) errorMsg.name = "Name is required.";
    if (!mobile) errorMsg.mobile = "Mobile number is required.";
    if (mobile && mobile.toString().length !== 10)
      errorMsg.mobile = "Mobile number must be 10 digits.";
    if (!queryType) errorMsg.queryType = "Query type is required.";
    // if (!description) errorMsg.description = "Description is required."; // Made optional
    // if (!dateTime) errorMsg.dateTime = "Date and time is required."; // Field commented out
    if (!district) errorMsg.district = "District is required.";
    if (!address) errorMsg.address = "Address is required.";

    // Validate question responses
    if (questions.length > 0) {
      questions.forEach((question, index) => {
        const response = questionResponses[question.pklQuestionId];
        if (!response || !response.response) {
          errorMsg[`question_${question.pklQuestionId}`] = `Question ${index + 1} is required.`;
        }
      });
    }

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

      const formattedDateTime = formatDateForAPI(dateTime);

      // Prepare question responses in the correct format
      const formattedQuestionResponses = {};
      Object.keys(questionResponses).forEach(questionId => {
        const response = questionResponses[questionId];
        if (response && response.response) {
          formattedQuestionResponses[questionId] = {
            questionId: parseInt(questionId),
            response: response.response,
            responseComment: response.comment || ''
          };
        }
      });

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
        questionResponses: formattedQuestionResponses, // Add formatted question responses
      };

      // Debug: Log the payload being sent
      console.log("Sending grievance data:", grievanceData);
      console.log("Entry type being sent:", grievanceData.entryType);

      // Submit to API
      const response = await apiService.saveGrievance(grievanceData);

      // Handle API response
      if (response.status === "true" || response.status === true) {
        // Success - show toast and redirect to chats page
        toast.success(response.message || "Outgoing feedback submitted successfully!");
        
        // Extract pklCrmUserId from response data
        const pklCrmUserId = response.data?.pklCrmUserId;
        
        if (pklCrmUserId) {
          // Redirect to chats page with the user ID
          navigate(`/chats?id=${pklCrmUserId}`);
        } else {
          // Fallback: show error if no user ID in response
          toast.error("Feedback created but unable to redirect. Please check the feedback list.");
        }
      } else {
        // Status false - show error toast and stay on page
        toast.error(response.message || "Failed to submit outgoing feedback.");
      }
    } catch (error) {
      console.error("Failed to submit outgoing feedback:", error);
      toast.error(
        error.message || "Failed to submit outgoing feedback. Please try again."
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
            <div className='max-w-7xl mx-auto py-6 px-6'>

          {showForm ? (
            <div className="bg-white rounded-xl shadow-md text-sm">

              <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Outgoing Feedback Form
                </h2>
                {showForm ? (
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-500">Submit a new outgoing feedback</p>
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Outgoing Feedback
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    Raised by: <span className="font-medium">{formData.role}</span>{" "}
                    | Category:{" "}
                    <span className="font-medium">{formData.queryType}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
          </div>
              {error.general && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error.general}
                </div>
              )}
              
              <div className="grid lg:grid-cols-3 gap-4 px-6 py-4">
                {/* Role */}
                <div className="">
                  <label className="block text-sm font-medium">
                    Grievant's Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full border px-3 py-2 rounded mt-1 bg-inherit"
                    disabled={isLoadingMaster}
                  >
                    <option value="" selected disabled>
                      {isLoadingMaster ? "Loading roles..." : "-- Select Role --"}
                    </option>
                    {masterData.roles.map((role) => (
                      <option key={role.pklUserRoleId} value={role.vsRoleName}>
                        {role.vsRoleName}
                      </option>
                    ))}
                </select>
                {error.role && (
                  <p className="text-red-600 text-xs mt-1">{error.role}</p>
                )}
              </div>

              </div>

              {/* Candidate Search Section */}
              {showCandidateSearch && (
                <div className="px-6 py-4 bg-blue-50 border border-blue-200 rounded-lg mx-6 mb-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    Search {formData.role === "Candidate" ? "Candidate" : formData.role}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Search Type
                      </label>
                      <select
                        value={candidateSearchType}
                        onChange={(e) => setCandidateSearchType(e.target.value)}
                        className="w-full border border-blue-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="name">Search by Name</option>
                        <option value="mobile">Search by Mobile</option>
                        {formData.role === "Candidate" && <option value="id">Search by ID</option>}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Search Text
                      </label>
                      <input
                        type="text"
                        value={candidateSearchText}
                        onChange={(e) => setCandidateSearchText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            searchCandidates();
                          }
                        }}
                        placeholder={`Enter ${candidateSearchType === 'name' ? 'name' : candidateSearchType === 'mobile' ? 'mobile number' : 'ID'}`}
                        className="w-full border border-blue-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <button
                        onClick={searchCandidates}
                        disabled={isSearchingCandidates || !candidateSearchText.trim()}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSearchingCandidates ? "Searching..." : "Search"}
                      </button>
                      <button
                        onClick={clearSearch}
                        disabled={isSearchingCandidates}
                        className="px-3 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Clear search"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Search Results */}
                  {candidateSearchResults.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-blue-700">Search Results:</h4>
                        <button
                          onClick={clearSearch}
                          className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          Clear Results
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-blue-50 sticky top-0">
                            <tr>
                              {formData.role === "Candidate" && (
                                <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-20">Candidate ID</th>
                              )}
                              <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-64">
                                {formData.role === "Candidate" ? "Candidate Name" : "Name"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-32">Mobile</th>
                              {(formData.role === "Candidate" || formData.role === "Training Center" || formData.role === "Training Partner") && (
                                <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-40">District</th>
                              )}
                              <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider w-24">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {candidateSearchResults.map((candidate, index) => (
                              <tr
                                key={candidate.Id || candidate.candidateId || candidate.TCId || candidate.id || index}
                                className="hover:bg-blue-50 cursor-pointer transition-colors"
                                onClick={() => selectCandidate(candidate)}
                              >
                                {formData.role === "Candidate" && (
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="text-gray-500">{candidate.Id || candidate.candidateId}</div>
                                  </td>
                                )}
                                <td className="px-3 py-2">
                                  <div className="font-medium text-gray-900 break-words max-w-xs">
                                    {candidate.candidateName || candidate.name}
                                  </div>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <div className="text-gray-600">{candidate.mobile}</div>
                                </td>
                                {(formData.role === "Candidate" || formData.role === "Training Center" || formData.role === "Training Partner") && (
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="text-gray-600">{candidate.district}</div>
                                  </td>
                                )}
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      selectCandidate(candidate);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                  >
                                    Select
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Selected Candidate Display */}
              {selectedCandidate && (
                <div className="px-6 py-4 bg-green-50 border border-green-200 rounded-lg mx-6 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-green-800">
                        Selected {formData.role === "Candidate" ? "Candidate" : formData.role}:
                      </h4>
                      <p className="text-sm text-green-700">
                        {selectedCandidate.candidateName || selectedCandidate.name} - {selectedCandidate.mobile}
                      </p>
                    </div>
                    <button
                      onClick={clearCandidateSelection}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Change {formData.role === "Candidate" ? "Candidate" : formData.role}
                    </button>
                  </div>
                </div>
              )}

              {/* Show form fields when non-search role is selected OR when search result is selected */}
              {formData.role && ((formData.role !== "Candidate" && formData.role !== "Training Partner" && formData.role !== "Training Center" && formData.role !== "Trainer") || selectedCandidate) && (
                <>
                  <div className="grid lg:grid-cols-2 gap-4 px-6 py-4">
                  {/* Name of the Grievant */}
                  <div>
                    <label className="block text-sm font-medium">
                      Name of the Grievant <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setError({ ...error, name: "" });
                      }}
                      className="w-full border px-3 py-2 rounded mt-1"
                      disabled={isFormDisabled || (selectedCandidate && (selectedCandidate.candidateName || selectedCandidate.name))} // Disable if candidate is selected and has name data
                    />
                    {error.name && (
                      <p className="text-red-600 text-xs mt-1">{error.name}</p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium">
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
                      className="w-full border px-3 py-2 rounded mt-1"
                        placeholder="Enter mobile number"
                        required
                        disabled={isFormDisabled || (selectedCandidate && selectedCandidate.mobile)} // Disable if candidate is selected and has mobile data
                    />
                    {error.mobile && (
                      <p className="text-red-600 text-xs mt-1">{error.mobile}</p>
                    )}
                  </div>

                  </div>
                </>
              )}

              {/* District and Address - Show when non-search role is selected OR when search result is selected */}
              {formData.role && ((formData.role !== "Candidate" && formData.role !== "Training Partner" && formData.role !== "Training Center" && formData.role !== "Trainer") || selectedCandidate) && (
                <>
                  <div className="grid lg:grid-cols-2 gap-4 px-6 py-4">
                    {/* District */}
                    <div>
                      <label className="block text-sm font-medium">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.district}
                        onChange={(e) => {
                          setFormData({ ...formData, district: e.target.value });
                          setError({ ...error, district: "" });
                        }}
                        className="w-full border px-3 py-2 rounded mt-1 bg-inherit"
                        disabled={isLoadingMaster || isFormDisabled || (selectedCandidate && selectedCandidate.district)} // Disable if candidate is selected and has district data
                      >
                        <option value="" selected disabled>
                          {isLoadingMaster ? "Loading districts..." : "-- Select District --"}
                        </option>
                        {masterData.districts.map((district) => (
                          <option key={district.pklDistrictId} value={district.vsDistrictName}>
                            {district.vsDistrictName}
                          </option>
                        ))}
                      </select>
                      {error.district && (
                        <p className="text-red-600 text-xs mt-1">{error.district}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value });
                          setError({ ...error, address: "" });
                        }}
                        className="w-full border px-3 py-2 rounded mt-1"
                        placeholder="Enter full address"
                        disabled={isFormDisabled || (selectedCandidate && selectedCandidate.address)} // Disable if candidate is selected and has address data
                      />
                      {error.address && (
                        <p className="text-red-600 text-xs mt-1">{error.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Query Type */}
                  <div className="px-6 py-4">
                    <label className="block text-sm font-medium">
                      Query Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.queryType}
                      onChange={(e) => {
                        setFormData({ ...formData, queryType: e.target.value });
                        setError({ ...error, queryType: "" });
                        // Clear previous question responses
                        setQuestionResponses({});
                        setQuestions([]);
                        // Fetch questions when query type changes
                        fetchQuestions(e.target.value);
                      }}
                        className="w-full border px-3 py-2 rounded mt-1 bg-inherit"
                        disabled={isLoadingMaster || isFormDisabled}
                      >
                        <option value="" selected disabled>
                          {isLoadingMaster ? "Loading query types..." : "-- Select Query Type --"}
                        </option>
                        {masterData.queryTypes.map((queryType) => (
                          <option key={queryType.pklQueryTypeId} value={queryType.vsQueryType}>
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

                  {/* Questions Section */}
                  {isLoadingQuestions && (
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-gray-600">Loading questions...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {questions.length > 0 && !isLoadingQuestions && (
                    <div className="px-6 py-4 bg-yellow-50 border border-yellow-200 rounded-lg mx-6 mb-4">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                        Feedback Questions
                      </h3>
                      {questions.map((question, index) => (
                        <div key={question.pklQuestionId} className="mb-6 p-4 bg-white rounded-lg border border-yellow-300">
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {index + 1}. {question.vsInteractionQuestion}
                            </label>
                            {error[`question_${question.pklQuestionId}`] && (
                              <p className="text-red-600 text-xs mb-2">
                                {error[`question_${question.pklQuestionId}`]}
                              </p>
                            )}

                            {/* Question Type 1: Yes/No with optional comment */}
                            {question.bQuestionType === "1" && (
                              <>
                                <div className="flex gap-4 mb-3">
                                  <label className="flex items-center">
                                    <input
                                      type="radio"
                                      name={`question_${question.pklQuestionId}`}
                                      value="Yes"
                                      checked={questionResponses[question.pklQuestionId]?.response === 'Yes'}
                                      onChange={(e) => {
                                        setQuestionResponses(prev => ({
                                          ...prev,
                                          [question.pklQuestionId]: {
                                            ...prev[question.pklQuestionId],
                                            response: e.target.value
                                          }
                                        }));
                                      }}
                                      className="mr-2"
                                    />
                                    <span className="text-sm">Yes</span>
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="radio"
                                      name={`question_${question.pklQuestionId}`}
                                      value="No"
                                      checked={questionResponses[question.pklQuestionId]?.response === 'No'}
                                      onChange={(e) => {
                                        setQuestionResponses(prev => ({
                                          ...prev,
                                          [question.pklQuestionId]: {
                                            ...prev[question.pklQuestionId],
                                            response: e.target.value
                                          }
                                        }));
                                      }}
                                      className="mr-2"
                                    />
                                    <span className="text-sm">No</span>
                                  </label>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Comments (Optional)
                                  </label>
                                  <textarea
                                    value={questionResponses[question.pklQuestionId]?.comment || ''}
                                    onChange={(e) => {
                                      setQuestionResponses(prev => ({
                                        ...prev,
                                        [question.pklQuestionId]: {
                                          ...prev[question.pklQuestionId],
                                          comment: e.target.value
                                        }
                                      }));
                                    }}
                                    rows="2"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    placeholder="Add your comments here..."
                                  />
                                </div>
                              </>
                            )}

                            {/* Question Type 2: Rating out of 5 stars (no comment) */}
                            {question.bQuestionType === "2" && (
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                  Rate from 1 to 5 stars:
                                </label>
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => {
                                        setQuestionResponses(prev => ({
                                          ...prev,
                                          [question.pklQuestionId]: {
                                            ...prev[question.pklQuestionId],
                                            response: star.toString()
                                          }
                                        }));
                                      }}
                                      className={`p-1 rounded-full transition-colors ${
                                        questionResponses[question.pklQuestionId]?.response === star.toString()
                                          ? 'bg-yellow-100'
                                          : 'hover:bg-gray-100'
                                      }`}
                                    >
                                      <svg
                                        className={`w-8 h-8 ${
                                          star <= parseInt(questionResponses[question.pklQuestionId]?.response || 0)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    </button>
                                  ))}
                                  <span className="ml-2 text-sm text-gray-600">
                                    {questionResponses[question.pklQuestionId]?.response || 0}/5
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Question Type 3: Descriptive text (no comment) */}
                            {question.bQuestionType === "3" && (
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                  Please provide your response:
                                </label>
                                <textarea
                                  value={questionResponses[question.pklQuestionId]?.response || ''}
                                  onChange={(e) => {
                                    setQuestionResponses(prev => ({
                                      ...prev,
                                      [question.pklQuestionId]: {
                                        ...prev[question.pklQuestionId],
                                        response: e.target.value
                                      }
                                    }));
                                  }}
                                  rows="3"
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                  placeholder="Type your response here..."
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Description - Only show after questions are loaded */}
                  {!isLoadingQuestions && (
                  <div className="px-6 py-4">
                    <label className="block text-sm font-medium">
                      Query Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows="4"
                      className="w-full border px-3 py-2 rounded mt-1"
                      disabled={isFormDisabled}
                    ></textarea>
                    {error.description && (
                      <p className="text-red-600 text-xs mt-1">
                        {error.description}
                      </p>
                    )}
                  </div>
                  )}

                  {/* Date & Time - Only show after questions are loaded */}
                  {!isLoadingQuestions && (
                  <div className="grid lg:grid-cols-2 gap-4 px-6 py-4">
                  {/* Date & Time - Commented out */}
                  {/* <div>
                      <label className="block text-sm font-medium">
                        Date and Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.dateTime}
                        onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                        className="w-full border px-3 py-2 rounded mt-1"
                        disabled={isFormDisabled}
                      />
                      {error.dateTime && (
                        <p className="text-red-600 text-xs mt-1">
                          {error.dateTime}
                        </p>
                      )}
                    </div> */}

                    {/* Empty div for grid balance */}
                    <div></div>
                  </div>
                  )}
                </>
              )}

              {/* Submit button and note - Only show when non-search role or search result is selected and questions are loaded */}
              {formData.role && ((formData.role !== "Candidate" && formData.role !== "Training Partner" && formData.role !== "Training Center" && formData.role !== "Trainer") || selectedCandidate) && !isLoadingQuestions && (
                <div className="px-6 py-4 flex justify-between border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500 italic">
                      NOTE: Please fill the form correctly and submit the outgoing feedback.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleUnansweredSubmit}
                      disabled={isSubmitting || isLoadingMaster || isFormDisabled}
                      className={`px-4 py-2 rounded font-semibold ${
                        isSubmitting || isLoadingMaster || isFormDisabled
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {isSubmitting ? "Submitting..." : "Unanswered"}
                    </button>
                <button
                  onClick={handleInitialSubmit}
                    className={`px-4 py-2 rounded font-semibold ${
                      isSubmitting || isLoadingMaster || isFormDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={isSubmitting || isLoadingMaster || isFormDisabled}
                  >
                    {isSubmitting ? "Submitting..." : isLoadingMaster ? "Loading..." : isFormDisabled ? (formData.role === "Candidate" ? "Select Candidate First" : "Select Role First") : "Submit Outgoing Grievance"}
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
                  <p className="text-center text-gray-400">No messages yet</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-center relative my-6 ${
                        msg.sender === "admin" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Timeline dot */}
                      <span
                        className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 ${
                          msg.sender === "admin"
                            ? "bg-blue-500 border-blue-200 -right-2"
                            : "bg-gray-400 border-gray-200 -left-2"
                        }`}
                      ></span>

                      {/* Message bubble */}
                      <div
                        className={`max-w-xs p-3 rounded-lg text-sm shadow ${
                          msg.sender === "admin"
                            ? "bg-blue-100 text-blue-800 mr-6"
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
                    <label className="block text-sm font-medium">Status</label>
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
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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

export default OutgoingGrievanceForm;
