import React from "react";
import { toast } from "react-toastify";
import { useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import apiService from "../services/api";

export function Chat() {
  const location = useLocation();
  const [chatData, setChatData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [newMessage, setNewMessage] = React.useState("");
  const [responseDateTime, setResponseDateTime] = React.useState("");
  const [isClosed, setIsClosed] = React.useState(false);
  const [messageType, setMessageType] = React.useState("Outgoing");
  const [showResponseForm, setShowResponseForm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Breadcrumb logic
  const segments = location.pathname.split("/").filter(Boolean);
  const labelMap = { 
    dashboard: "Dashboard", 
    grievance: "Grievances", 
    feedback: "Feedback",
    "new": "New",
    "incoming": "Incoming",
    "outgoing": "Outgoing",
    "chats": "Chat"
  };
  
  const crumbs = segments.map((seg, i) => ({ 
    to: "/" + segments.slice(0, i + 1).join("/"), 
    label: labelMap[seg] ?? decodeURIComponent(seg) 
  }));

  // Get pklCrmUserId from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const pklCrmUserId =
    urlParams.get("id") || localStorage.getItem("selectedUserId");

  // If no ID is provided, show error state
  if (!pklCrmUserId) {
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
                <div className="flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No User ID Provided
              </h2>
              <p className="text-gray-600 mb-4">
                Please select a grievance from the list to view the chat.
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Fetch chat data from API
  React.useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true);

        const result = await apiService.getChatData(pklCrmUserId);
        setChatData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [pklCrmUserId]);

  // Function to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      // Handle different date formats from API
      if (dateString.includes('/')) {
        // Format: "04/08/2025 05:00:28 pm" or "08/04/2025 05:25:20 pm"
        const datePart = dateString.split(' ')[0];
        const [day, month, year] = datePart.split('/');
        return new Date(year, month - 1, day).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      } else if (dateString.includes('-')) {
        // Format: "23-10-2025 07:34:00 pm" or "04-08-2025 03:08:00 PM"
        const datePart = dateString.split(' ')[0];
        const [day, month, year] = datePart.split('-');
        return new Date(year, month - 1, day).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }

      // Try to parse as ISO date
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }

      return dateString;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  // Function to format date for API (DD-MM-YYYY HH:mm:ss am/pm)
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

  // Function to handle response submission
  const handleResponseSubmit = async () => {
    if (!newMessage.trim()) {
      toast.error("Please enter a response message.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare API request data according to the specified format
      const replyData = {
        userId: parseInt(pklCrmUserId), // initial.pklCrmUserId
        replyChat: newMessage.trim(), // Response Message
        entryDateTime: formatDateForAPI(responseDateTime), // Date and Time in DD-MM-YYYY HH:mm:ss am/pm format
        entryType: messageType === "Outgoing" ? "Outgoing" : "Incoming", // Message Type
        status: isClosed ? 1 : 0, // Mark as Closed (0 or 1) - optional field
      };

      console.log("Sending chat reply:", replyData);

      // Call the API
      const response = await apiService.sendChatReply(replyData);

      if (response.status === "true" || response.status === true) {
        // Success - show API response message and refresh chat data
        toast.success(response.message || "Response added successfully!");

        // Refresh chat data to show the new response
        const result = await apiService.getChatData(pklCrmUserId);
        setChatData(result.data);

        // Reset form and close modal
        setNewMessage("");
        setResponseDateTime("");
        setIsClosed(false);
        setMessageType("Outgoing");
        setShowResponseForm(false);
      } else {
        // API returned error - show API error message
        toast.error(
          response.message || "Failed to add response. Please try again."
        );
      }
    } catch (error) {
      console.error("Failed to send chat reply:", error);
      toast.error(error.message || "Failed to add response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
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
                <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading chat data...</p>
            </div>
          </div>
        </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Error Loading Chat
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // No data state
  if (!chatData || !chatData.initial || chatData.initial.length === 0) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No Chat Data Found
              </h2>
              <p className="text-gray-600">
                No conversation data available for this user.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const initialQuery = chatData.initial[0];
  const chatHistory = chatData.chatHistory || [];

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

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 flex-grow">
          <div className="flex-grow">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Message header */}
              <div className="flex flex-col items-center gap-6 justify-between px-3 py-3">
                <div className="w-full">
                  {/* Header with Ticket ID Badge */}
                  <div className="flex items-center justify-between mb-2 gap-4">
                    <span className="flex gap-2 items-center mb-1 font-semibold text-gray-500 text-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-ticket-detailed"
                        viewBox="0 0 16 16"
                      >
                        <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M5 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2z" />
                        <path d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6zM1.5 4a.5.5 0 0 0-.5.5v1.05a2.5 2.5 0 0 1 0 4.9v1.05a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.05a2.5 2.5 0 0 1 0-4.9V4.5a.5.5 0 0 0-.5-.5z" />
                      </svg>
                      {initialQuery.vsTicketId}
                    </span>

                    <div className="flex items-center gap-1">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          initialQuery.vsEntryType === "Outgoing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {initialQuery.vsEntryType}
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          initialQuery.vsStatus === "Open"
                            ? "bg-green-100 text-green-700"
                            : initialQuery.vsStatus === "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : initialQuery.vsStatus === "Closed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {initialQuery.vsStatus === "In Progress" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-hourglass-split"
                            viewBox="0 0 16 16" className="scale-75"
                          >
                            <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-check-circle-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                          </svg>
                        )}
                        {initialQuery.vsStatus}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Query from {initialQuery.vsRoleName}
                  </h3>
                  
                  {/* Compact Query Description */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          fill="currentColor"
                          className="text-blue-600"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          Description
                        </h4>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {initialQuery.vsQueryDescription || 'No description provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                            </div>
                <div className="w-full">
                  {/* User Information - Improved Layout */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Name */}
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {initialQuery.vsUserName || 'N/A'}
                        </p>
                                </div>
                              </div>

                      {/* Mobile */}
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mobile</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {initialQuery.vsMobile || 'N/A'}
                        </p>
                                </div>
                              </div>

                      {/* Query Type */}
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Query Type</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {initialQuery.vsQueryType || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(initialQuery.vsEntryDateTime)}
                          </p>
                        </div>
                      </div>

                      {/* District */}
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">District</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {initialQuery.district || initialQuery.vsDistrictName || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2h1v2h-1v-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {initialQuery.address || initialQuery.vsAddress || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Questions Section - Only show if questions data exists */}
              {chatData.questions && chatData.questions.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                        className="bi bi-question-circle-fill text-blue-600"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z" />
                                  </svg>
                              </div>
                    <h3 className="text-lg font-bold text-gray-900">Interaction Questions</h3>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {chatData.questions.length} Questions
                      </span>
                              </div>
                            </div>

                  <div className="space-y-4">
                    {chatData.questions.map((question, index) => (
                      <div key={question.fklQuestionId} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {question.vsInteractionQuestion}
                            </h4>
                            
                            {/* Response Display */}
                            <div className="flex items-center gap-3">
                              {question.questionType === 'multipleChoice' ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-600">Response:</span>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    question.vsResponse === 'Yes' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {question.vsResponse === 'Yes' ? (
                                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                    {question.vsResponse}
                                  </span>
                                </div>
                              ) : question.questionType === 'rating' ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-600">Rating:</span>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <svg
                                        key={star}
                                        className={`w-5 h-5 ${
                                          star <= parseInt(question.vsResponse) 
                                            ? 'text-yellow-400' 
                                            : 'text-gray-300'
                                        }`}
                          fill="currentColor"
                                        viewBox="0 0 20 20"
                        >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                    ))}
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                      {question.vsResponse}/5
                                    </span>
                      </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-600">Response:</span>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                    {question.vsResponse}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Comment Display */}
                            {question.vsResponseComment && question.vsResponseComment.trim() && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-200">
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                      <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Additional Comment:</p>
                                    <p className="text-sm text-gray-600">{question.vsResponseComment}</p>
                      </div>
                    </div>
              </div>
                            )}
            </div>
          </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp and action */}
              <div className="flex items-center gap-6 justify-between pt-3 border-t border-gray-200 px-3 py-3">
                <p className="text-xs text-gray-600 italic text-xs">
                  NOTE: This is a active {initialQuery.vsEntryType?.toLowerCase() === 'outgoing' ? 'feedback' : 'grievance'}. Please respond to the
                  {initialQuery.vsEntryType?.toLowerCase() === 'outgoing' ? 'feedback' : 'grievance'} as soon as possible.
                </p>
                {/* Add Response Button - Fixed at bottom, always visible */}
                <div className="">
          {initialQuery.vsStatus !== "Closed" && initialQuery.vsEntryType !== "outgoing" ? (
                    <div className="text-center">
              <button
                onClick={() => setShowResponseForm(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 shadow-sm"
                      >
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                </svg>
                Add Response
              </button>
            </div>
          ) : (
                    <div className="text-center">
                      <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                </svg>
                This {initialQuery.vsEntryType?.toLowerCase() === 'outgoing' ? 'feedback' : 'grievance'} is closed - No further responses allowed
              </div>
            </div>
          )}
                </div>

          {/* Response Form Modal */}
          {showResponseForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                            <h3 className="text-lg font-medium text-gray-800">
                              Add Your Response
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Share your thoughts and keep the conversation going
                            </p>
                    </div>
                    <button
                      onClick={() => setShowResponseForm(false)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                            <svg
                              className="w-6 h-6"
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
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                            Response Message{" "}
                            <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows="4"
                        maxLength="500"
                        placeholder="Type your response to continue the timeline..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      ></textarea>
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {newMessage.length}/500
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date and Time{" "}
                            <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={responseDateTime}
                            onChange={(e) =>
                              setResponseDateTime(e.target.value)
                            }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Outgoing">Outgoing</option>
                      <option value="Incoming">Incoming</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="closedStatus"
                        checked={isClosed}
                        onChange={(e) => setIsClosed(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                            <label
                              htmlFor="closedStatus"
                              className="ml-2 block text-sm font-medium text-gray-700"
                            >
                        Mark as Closed
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowResponseForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResponseSubmit}
                            disabled={
                              !newMessage.trim() ||
                              !responseDateTime ||
                              isSubmitting
                            }
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Adding..." : "Add Response"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
              </div>
            </div>
          </div>
          {/* Chat History - Only show for incoming queries, not for outgoing feedback */}
          {initialQuery.vsEntryType !== "outgoing" && (
          <div className="w-full lg:w-1/3 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3 px-3 py-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-clock-history"
                viewBox="0 0 16 16"
              >
                <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z" />
                <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />
                <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Chat History</h3>
            </div>
            <div className="overflow-y-auto flex-grow space-y-3 l-2 border-t border-gray-200 px-3 py-3">
              {/* Chat History from API */}
              {chatHistory.map((chat) => (
                <div
                  key={chat.pklCrmChatId}
                  className="relative flex items-start border-l-2 border-gray-200"
                >
                  {/* Timeline dot and connector */}
                  <div className="flex flex-col items-center -ml-[9px]">
                    <div
                      className={`w-4 h-4 rounded-full border-2 bg-white z-10 ${
                        chat.vsEntryType === "Outgoing"
                          ? "border-blue-500"
                          : "border-green-500"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full m-0.5 ${
                          chat.vsEntryType === "Outgoing"
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Timeline content */}
                  <div className="ml-2 flex-1 text-xs">
                    <div
                      className={`rounded-lg shadow-sm ${
                        chat.vsEntryType === "Incoming"
                          ? "bg-green-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {/* Message header */}
                      <div className="flex items-start justify-between px-3 py-2">
                        <div className="flex items-center space-x-2">
                          {/* <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                              chat.vsEntryType === "Outgoing"
                                ? "bg-blue-500"
                                : "bg-green-500"
                            }`}
                          >
                            {chat.vsEntryType === "Outgoing" ? "A" : "U"}
                          </div> */}
                          <div>
                            <p className="font-medium text-gray-800 capitalize text-md">
                              {chat.vsEntryType === "Outgoing"
                                ? "Response by Administrator"
                                : "Query from User"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(chat.vsEntryDateTime)}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            chat.vsEntryType === "Outgoing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {chat.vsEntryType === "Outgoing" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              class="bi bi-arrow-up-right-circle-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="M0 8a8 8 0 1 0 16 0A8 8 0 0 0 0 8m5.904 2.803a.5.5 0 1 1-.707-.707L9.293 6H6.525a.5.5 0 1 1 0-1H10.5a.5.5 0 0 1 .5.5v3.975a.5.5 0 0 1-1 0V6.707z" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              class="bi bi-arrow-down-left-circle-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0m-5.904-2.803a.5.5 0 1 1 .707.707L6.707 10h2.768a.5.5 0 0 1 0 1H5.5a.5.5 0 0 1-.5-.5V6.525a.5.5 0 0 1 1 0v2.768z" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Message content */}
                      <div className="px-3 py-2 border-t border-inherit-400">
                        <p className="font-semibold text-gray-800">
                          Response:{" "}
                        </p>
                        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {chat.vsReplyChat}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
}
