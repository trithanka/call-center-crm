import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import apiService from "../services/api";

const GrievanceChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Breadcrumb logic
  const segments = location.pathname.split("/").filter(Boolean);
  const labelMap = { 
    dashboard: "Dashboard", 
    grievance: "Grievances", 
    feedback: "Feedback",
    "new": "New",
    "incoming": "Incoming",
    "outgoing": "Outgoing"
  };
  
  const crumbs = segments.map((seg, i) => ({ 
    to: "/" + segments.slice(0, i + 1).join("/"), 
    label: labelMap[seg] ?? decodeURIComponent(seg) 
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
    dateTime: "",
    district: "",
    address: "",
    grievanceType: "incoming",
  });

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("messages");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  // Removed custom toast auto-hide - using react-toastify instead

  // Set grievance type from URL parameter
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'incoming' || type === 'outgoing') {
      setFormData(prev => ({
        ...prev,
        grievanceType: type
      }));
    }
  }, [searchParams]);

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

  // Removed custom showToast function - using react-toastify instead

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
    if (!description) errorMsg.description = "Description is required.";
    if (!dateTime) errorMsg.dateTime = "Date and time is required.";
    if (!grievanceType) errorMsg.grievanceType = "Grievance type is required.";
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

      const formattedDateTime = formatDateForAPI(dateTime);

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
      };

      // Debug: Log the payload being sent
      console.log("Sending grievance data:", grievanceData);
      console.log("Entry type being sent:", grievanceData.entryType);
      console.log("Alternative entry type field:", grievanceData.vsEntryType);

      // Submit to API
      const response = await apiService.saveGrievance(grievanceData);

      // Handle API response
      if (response.status === "true" || response.status === true) {
        // Success - show toast and redirect to chats page
        toast.success(response.message || "Grievance submitted successfully!");
        
        // Extract pklCrmUserId from response data
        const pklCrmUserId = response.data?.pklCrmUserId;
        
        if (pklCrmUserId) {
          // Redirect to chats page with the user ID
          navigate(`/chats?id=${pklCrmUserId}`);
        } else {
          // Fallback: show error if no user ID in response
          toast.error("Grievance created but unable to redirect. Please check the grievance list.");
        }
      } else {
        // Status false - show error toast and stay on page
        toast.error(response.message || "Failed to submit grievance.");
      }
    } catch (error) {
      console.error("Failed to submit grievance:", error);
      toast.error(
        error.message || "Failed to submit grievance. Please try again."
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
          
          {/* Fixed Breadcrumb */}
          <div className="">
            <div className="max-w-7xl mx-auto px-6 py-3">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  {/* Home breadcrumb */}
                  <li className="inline-flex items-center">
                    <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                      <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                      </svg>
                      Home
                    </Link>
                  </li>
                  
                  {/* Dynamic breadcrumbs */}
                  {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;
                    return (
                      <li key={crumb.to} className="flex items-center">
                        <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                        </svg>
                        {isLast ? (
                          <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                            {crumb.label}
                          </span>
                        ) : (
                          <Link 
                            to={crumb.to} 
                            className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                          >
                            {crumb.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>
          </div>

          {/* Main content */}
          <main className="overflow-auto w-full flex-grow bg-gray-50">
            <div className='max-w-7xl mx-auto py-6 px-6'>

          {showForm ? (
            <div className="bg-white rounded-xl shadow-md text-sm">

              <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Grievance #TKT1025
            </h2>
            {showForm ? (
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">Submit a new grievance</p>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  formData.grievanceType === 'incoming' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {formData.grievanceType === 'incoming' ? 'Incoming' : 'Outgoing'} Grievance
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Raised by: <span className="font-medium">{formData.role}</span>{" "}
                | Category:{" "}
                <span className="font-medium">{formData.queryType}</span>
              </p>
            )}
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
                  onChange={(e) => {
                    setFormData({ ...formData, role: e.target.value });
                    setError({ ...error, role: "" });
                  }}
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

              {/* Name */}
                <div className="lg:col-span-2">
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
                />
                {error.name && (
                  <p className="text-red-600 text-xs mt-1">{error.name}</p>
                )}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4 px-6 py-4">
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
                />
                {error.mobile && (
                  <p className="text-red-600 text-xs mt-1">{error.mobile}</p>
                )}
              </div>

              {/* Query Type */}
              <div>
                <label className="block text-sm font-medium">
                  Query Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.queryType}
                  onChange={(e) =>
                    setFormData({ ...formData, queryType: e.target.value })
                  }
                    className="w-full border px-3 py-2 rounded mt-1 bg-inherit"
                    disabled={isLoadingMaster}
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
              </div>

              {/* District and Address */}
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
                    disabled={isLoadingMaster}
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
                  />
                  {error.address && (
                    <p className="text-red-600 text-xs mt-1">{error.address}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="px-6 py-4">
                <label className="block text-sm font-medium">
                  Query Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="4"
                  className="w-full border px-3 py-2 rounded mt-1"
                ></textarea>
                {error.description && (
                  <p className="text-red-600 text-xs mt-1">
                    {error.description}
                  </p>
                )}
              </div>

              <div className="grid lg:grid-cols-2 gap-4 px-6 py-4">
              {/* Date & Time */}
              <div>
                  <label className="block text-sm font-medium">
                    Date and Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full border px-3 py-2 rounded mt-1"
                  />
                  {error.dateTime && (
                    <p className="text-red-600 text-xs mt-1">
                      {error.dateTime}
                    </p>
                  )}
                </div>

                {/* Empty div for grid balance */}
                <div></div>
              </div>

              <div className="px-6 py-4 flex justify-between border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 italic">
                    NOTE: Please fill the form correctly and submit the grievance.
                  </p>
                </div>
              <button
                onClick={handleInitialSubmit}
                  className={`px-4 py-2 rounded font-semibold ${
                    isSubmitting || isLoadingMaster
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  disabled={isSubmitting || isLoadingMaster}
                >
                  {isSubmitting ? "Submitting..." : isLoadingMaster ? "Loading..." : "Submit Grievance"}
              </button>
              </div>
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

export default GrievanceChat;
