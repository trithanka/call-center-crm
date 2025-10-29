import React from "react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import apiService from "../services/api";

export function Chat() {
  const [chatData, setChatData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [newMessage, setNewMessage] = React.useState("");
  const [responseDateTime, setResponseDateTime] = React.useState("");
  const [isClosed, setIsClosed] = React.useState(false);
  const [messageType, setMessageType] = React.useState("Outgoing");
  const [showResponseForm, setShowResponseForm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Get pklCrmUserId from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const pklCrmUserId =
    urlParams.get("id") || localStorage.getItem("selectedUserId");

  // If no ID is provided, show error state
  if (!pklCrmUserId) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center bg-gray-50">
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
      </>
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
      <>
        <Navbar />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading chat data...</p>
            </div>
          </div>
        </div>
      </>
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
    <>
      <Navbar />
      <div className="flex h-screen bg-gray-50">
        <Sidebar />

        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Chat Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">{initialQuery.vsUserName}</h1>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-600">{initialQuery.vsRoleName}</p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-600">{initialQuery.vsMobile}</p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-600">{formatDate(initialQuery.vsEntryDateTime)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      #{initialQuery.vsTicketId}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          initialQuery.vsEntryType === "Outgoing"
                        ? "bg-blue-100 text-blue-800 border border-blue-200" 
                        : "bg-green-100 text-green-800 border border-green-200"
                    }`}>
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                        {initialQuery.vsEntryType}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      initialQuery.vsStatus === "In Progress" 
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
                            : initialQuery.vsStatus === "Closed"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-green-100 text-green-800 border border-green-200"
                    }`}>
                        {initialQuery.vsStatus === "In Progress" ? (
                        <svg className="w-4 h-4 mr-1 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                        ) : (
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {initialQuery.vsStatus}
                    </span>
                  </div>
                  
                  {initialQuery.vsStatus !== "Closed" && (
                    <button
                      onClick={() => setShowResponseForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Response
                    </button>
                  )}
                </div>
                      </div>
                    </div>
                  </div>

          {/* Chat Content with Sidebar */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Initial Query Card */}
              <div className="bg-white border-b border-gray-200 p-6">
                <div className="max-w-5xl">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">Initial Query</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              New
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{formatDate(initialQuery.vsEntryDateTime)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Query Type</p>
                              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{initialQuery.vsQueryType}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Priority</p>
                              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">Normal</p>
                            </div>
                                </div>
                                <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                            <div className="bg-gray-50 rounded-md p-3">
                              <p className="text-sm text-gray-900 leading-relaxed">{initialQuery.vsQueryDescription}</p>
                            </div>
                          </div>
                        </div>
                                </div>
                              </div>
                                </div>
                                </div>
                              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-6">
                  <div className="max-w-5xl space-y-6">
                    {chatHistory.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
                        <p className="text-gray-500 mb-6">Be the first to respond to this query and start the conversation.</p>
                        <button
                          onClick={() => setShowResponseForm(true)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Start Conversation
                        </button>
                      </div>
                    ) : (
                      chatHistory.map((chat, index) => (
                        <div key={chat.pklCrmChatId} className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                              chat.vsEntryType === "Outgoing" 
                                ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                                : "bg-gradient-to-br from-green-500 to-green-600"
                            }`}>
                              {chat.vsEntryType === "Outgoing" ? (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                              )}
                            </div>
                              </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-semibold text-gray-900">
                                  {chat.vsEntryType === "Outgoing" ? "Administrator" : "User"}
                                </p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  chat.vsEntryType === "Outgoing" 
                                    ? "bg-blue-100 text-blue-800" 
                                    : "bg-green-100 text-green-800"
                                }`}>
                                  {chat.vsEntryType}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">{formatDate(chat.vsEntryDateTime)}</p>
                            </div>
                            <div className={`rounded-xl p-4 shadow-sm border ${
                              chat.vsEntryType === "Outgoing" 
                                ? "bg-blue-50 border-blue-200" 
                                : "bg-green-50 border-green-200"
                            }`}>
                              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{chat.vsReplyChat}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Query Information</p>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium text-gray-900">{initialQuery.vsQueryType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Entry Type:</span>
                        <span className="text-sm font-medium text-gray-900">{initialQuery.vsEntryType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`text-sm font-medium ${
                          initialQuery.vsStatus === "In Progress" ? "text-yellow-600" : 
                          initialQuery.vsStatus === "Closed" ? "text-red-600" : "text-green-600"
                        }`}>
                          {initialQuery.vsStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">User Information</p>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium text-gray-900">{initialQuery.vsUserName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Role:</span>
                        <span className="text-sm font-medium text-gray-900">{initialQuery.vsRoleName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mobile:</span>
                        <span className="text-sm font-medium text-gray-900">{initialQuery.vsMobile}</span>
                      </div>
                    </div>
                  </div>

                      <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Timeline</p>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(initialQuery.vsEntryDateTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Responses:</span>
                        <span className="text-sm font-medium text-gray-900">{chatHistory.length}</span>
                      </div>
                    </div>
              </div>
            </div>
          </div>

              <div className="flex-1 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  {initialQuery.vsStatus !== "Closed" && (
              <button
                onClick={() => setShowResponseForm(true)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Response
                    </button>
                  )}
                  
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>
                  
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
              </button>
            </div>
              </div>
            </div>
          </div>
        </div>
                </div>

          {/* Response Form Modal */}
          {showResponseForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                  <h3 className="text-lg font-medium text-gray-800">Add Response</h3>
                  <p className="text-sm text-gray-600 mt-1">Share your response to continue the conversation</p>
                    </div>
                    <button
                      onClick={() => setShowResponseForm(false)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Message <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows="4"
                        maxLength="500"
                    placeholder="Type your response here..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {newMessage.length}/500
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date and Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={responseDateTime}
                  onChange={(e) => setResponseDateTime(e.target.value)}
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
                  <label htmlFor="closedStatus" className="ml-2 block text-sm font-medium text-gray-700">
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
                  disabled={!newMessage.trim() || !responseDateTime || isSubmitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Adding..." : "Add Response"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
    </>
  );
}
