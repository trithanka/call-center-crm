import React from "react";
import { toast } from "react-toastify";
import { useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import apiService from "../services/api";
import * as Lu from "react-icons/lu";
import * as Tb from "react-icons/tb";

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

            {/* Main content */}
            <main className="overflow-auto w-full flex-grow bg-neutral-100">
              <div className="max-w-7xl mx-auto py-6 px-6">
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
    if (!dateString) return "N/A";

    try {
      // Handle different date formats from API
      if (dateString.includes("/")) {
        // Format: "04/08/2025 05:00:28 pm" or "08/04/2025 05:25:20 pm"
        const datePart = dateString.split(" ")[0];
        const [day, month, year] = datePart.split("/");
        return new Date(year, month - 1, day).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } else if (dateString.includes("-")) {
        // Format: "23-10-2025 07:34:00 pm" or "04-08-2025 03:08:00 PM"
        const datePart = dateString.split(" ")[0];
        const [day, month, year] = datePart.split("-");
        return new Date(year, month - 1, day).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
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

      return dateString;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
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

            {/* Main content */}
            <main className="overflow-auto w-full flex-grow bg-neutral-100">
              <div className="max-w-7xl mx-auto py-6 px-6">
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

          {/* Main content */}
          <main className="overflow-auto w-full flex-grow bg-neutral-100">
            <div className="max-w-7xl mx-auto py-6 px-6">
              {/* Main Content */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Message header */}
                    <div className="flex flex-col items-center justify-between px-3 py-3">
                      <div className="w-full">
                        {/* Header Section */}
                        <div className="bg-white border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {`${
                                  initialQuery.vsEntryType?.toLowerCase() ===
                                  "incoming"
                                    ? "Complaint"
                                    : "Feedback"
                                }`}{" "}
                                by {initialQuery.vsUserName || "N/A"}
                              </h3>
                              <div
                                className={`inline-flex gap-1 items-center px-3 py-1 rounded-lg text-xs font-medium capitalize
                                      ${
                                        initialQuery.vsStatus === "Open"
                                          ? "bg-green-100 text-gray-700"
                                          : initialQuery.vsStatus ===
                                            "In Progress"
                                          ? "bg-amber-100 text-gray-700"
                                          : initialQuery.vsStatus === "Closed"
                                          ? "bg-gray-100 text-gray-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                              >
                                <Lu.LuHourglass />
                                {`${
                                  initialQuery.vsEntryType?.toLowerCase() ===
                                  "incoming"
                                    ? "Complaint"
                                    : "Feedback"
                                } ${
                                  initialQuery.vsStatus?.toLowerCase() ===
                                  "in progress"
                                    ? "in progress"
                                    : initialQuery.vsStatus?.toLowerCase()
                                }`}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Form-style Information Grid */}
                        <div className="bg-white">
                          <div className="grid text-sm">
                            {/* Description */}
                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="font-medium text-gray-600 flex gap-1.5 items-center">
                                <Lu.LuScanText className="text-emerald-600" />{" "}
                                Description
                              </span>
                              <span className="text-gray-800 font-medium text-right max-w-[60%]">
                                {initialQuery.vsQueryDescription ||
                                  "No description provided"}
                              </span>
                            </div>

                            {/* Complaint/Ticket ID */}
                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="font-medium text-gray-600 flex gap-1.5 items-center">
                                <Lu.LuHash className="text-emerald-600" />{" "}
                                {initialQuery.vsEntryType === "Incoming"
                                  ? "Complaint ID"
                                  : "Ticket ID"}
                              </span>
                              <span className="text-gray-800 font-medium font-semibold">
                                {initialQuery.vsTicketId}
                              </span>
                            </div>

                            {/* Email */}
                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="font-medium text-gray-600 flex gap-1.5 items-center">
                                <Lu.LuMail className="text-emerald-600" /> Email
                              </span>
                              <span className="text-gray-800 font-medium">
                                {initialQuery.vsEmail || "N/A"}
                              </span>
                            </div>

                            {/* Phone */}
                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="font-medium text-gray-600 flex gap-1.5 items-center">
                                <Lu.LuPhone className="text-emerald-600" /> Phone
                                No.
                              </span>
                              <span className="text-gray-800 font-medium">
                                {initialQuery.vsMobile || "N/A"}
                              </span>
                            </div>

                            {/* Query Type */}
                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="font-medium text-gray-600 flex gap-1.5 items-center">
                                <Lu.LuClipboardList className="text-emerald-600" />{" "}
                                Query Type
                              </span>
                              <span className="text-gray-800 font-medium">
                                {initialQuery.vsQueryType || "N/A"}
                              </span>
                            </div>

                            {/* Date */}
                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="font-medium text-gray-600 flex gap-1.5 items-center">
                                <Lu.LuCalendar className="text-emerald-600" />{" "}
                                Date
                              </span>
                              <span className="text-gray-800 font-medium">
                                {formatDate(initialQuery.vsEntryDateTime)}
                              </span>
                            </div>

                            {/* District */}
                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="font-medium text-gray-600 flex gap-1.5 items-center">
                                <Lu.LuMapPin className="text-emerald-600" />{" "}
                                District
                              </span>
                              <span className="text-gray-800 font-medium">
                                {initialQuery.district ||
                                  initialQuery.vsDistrictName ||
                                  "N/A"}
                              </span>
                            </div>

                            {/* Address */}
                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="font-medium text-gray-600 flex gap-1.5 items-center">
                                <Lu.LuHouse className="text-emerald-600" />{" "}
                                Address
                              </span>
                              <span className="text-gray-800 font-medium text-right max-w-[60%]">
                                {initialQuery.address ||
                                  initialQuery.vsAddress ||
                                  "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timestamp and action */}
                      <div className="w-full flex items-center justify-between py-3">
                        <p className="text-xs text-gray-600 italic text-xs">
                          NOTE: This is a active{" "}
                          {initialQuery.vsEntryType?.toLowerCase() === "outgoing"
                            ? "feedback"
                            : "grievance"}
                          . Please respond to the
                          {initialQuery.vsEntryType?.toLowerCase() === "outgoing"
                            ? "feedback"
                            : "grievance"}{" "}
                          as soon as possible.
                        </p>
                        
{/* Add Response Button - Fixed at bottom, always visible */}
                        <div className="">
                          {initialQuery.vsStatus !== "Closed" &&
                          initialQuery.vsEntryType !== "outgoing" ? (
                            <div className="text-center">
                              <button
                                onClick={() => setShowResponseForm(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1 font-medium"
                              >
                                <Lu.LuPlus />
                                Response
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-gray-700 rounded-lg text-xs font-medium font-medium">
                                <Lu.LuTriangleAlert />
                                This{" "}
                                {initialQuery.vsEntryType?.toLowerCase() ===
                                "outgoing"
                                  ? "feedback"
                                  : "grievance"}{" "}
                                is closed - No further responses allowed
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
                                      Share your thoughts and keep the
                                      conversation going
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
                                  <label className="block text-sm font-medium text-gray-700 flex gap-1 items-center mb-2">
                                    Response Message{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <div className="relative">
                                    <textarea
                                      value={newMessage}
                                      onChange={(e) =>
                                        setNewMessage(e.target.value)
                                      }
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
                                  <label className="block text-sm font-medium text-gray-700 flex gap-1 items-center mb-2">
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
                                  <label className="block text-sm font-medium text-gray-700 flex gap-1 items-center mb-2">
                                    Message Type{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={messageType}
                                    onChange={(e) =>
                                      setMessageType(e.target.value)
                                    }
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
                                      onChange={(e) =>
                                        setIsClosed(e.target.checked)
                                      }
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label
                                      htmlFor="closedStatus"
                                      className="ml-2 block text-sm font-medium text-gray-700 flex gap-1 items-center"
                                    >
                                      Mark as Closed
                                    </label>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end space-x-3">
                                  <button
                                    type="button"
                                    onClick={() => setShowResponseForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 flex gap-1 items-center bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
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
                </div>

                {/* Chat History - Only show for incoming queries, not for outgoing feedback */}
                {initialQuery.vsEntryType !== "outgoing" && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
                    <div className="flex items-center gap-2 px-3 py-3">
                      <Lu.LuHistory />
                      <h3 className="text-lg font-bold text-gray-900">
                        Chat History
                      </h3>
                    </div>
                    <div className="overflow-y-auto flex-grow space-y-3 l-2 border-t border-gray-200 px-3 py-3">
                      {/* Chat History from API */}
                      {chatHistory.map((chat) => (
                        <div
                          key={chat.pklCrmChatId}
                          className="relative flex items-start border-l border-gray-200 dark:border-neutral-700 pl-5 pb-6 last:pb-0"
                        >
                          {/* Timeline Dot */}
                          <div className="absolute -left-[7.5px] flex items-center justify-center">
                            <div
                              className={`w-3.5 h-3.5 rounded-full border-2 bg-white shadow-sm ${
                                chat.vsEntryType === "Outgoing"
                                  ? "border-blue-500"
                                  : "border-emerald-500"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full m-[2px] ${
                                  chat.vsEntryType === "Outgoing"
                                    ? "bg-blue-500"
                                    : "bg-emerald-500"
                                }`}
                              ></div>
                            </div>
                          </div>

                          {/* Chat Card */}
                          <div className="flex-1 text-sm">
                            <div
                              className={`rounded-lg border shadow-sm transition-all duration-200 ${
                                chat.vsEntryType === "Outgoing"
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-emerald-50 border-emerald-200"
                              }`}
                            >
                              {/* Header */}
                              <div
                                className={`flex justify-between items-center px-4 py-2.5 border-b ${
                                  chat.vsEntryType === "Outgoing"
                                    ? "border-blue-200"
                                    : "border-emerald-200"
                                }`}
                              >
                                <div>
                                  <p className="text-gray-900 font-semibold text-sm">
                                    {chat.vsEntryType === "Outgoing"
                                      ? "Administrator Response"
                                      : "User Query"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(chat.vsEntryDateTime)}
                                  </p>
                                </div>

                                <div
                                  className={`flex items-center gap-1 text-[0.7rem] px-1 py-1 rounded-full font-medium ${
                                    chat.vsEntryType === "Outgoing"
                                      ? "bg-blue-200 text-blue-700"
                                      : "bg-emerald-200 text-emerald-700"
                                  }`}
                                >
                                  {chat.vsEntryType === "Outgoing" ? (
                                    <Lu.LuArrowUpRight className="w-3 h-3" />
                                  ) : (
                                    <Lu.LuArrowDownLeft className="w-3 h-3" />
                                  )}
                                </div>
                              </div>

                              {/* Message Body */}
                              <div className="px-4 py-3 space-y-1">
                                {chat.vsSubject && (
                                  <p className="font-medium text-gray-800 text-sm">
                                    {chat.vsSubject}
                                  </p>
                                )}
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
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

                {/* Questions Section - Only show if questions data exists */}
                {chatData.questions && chatData.questions.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
                    <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center gap-1 justify-center">
                        <Tb.TbMessageQuestion />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Interaction Questions
                      </h3>
                      <div className="ml-auto">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {chatData.questions.length} Questions
                        </span>
                      </div>
                    </div>

                    <div className="divide-y border-gray-200">
                      {chatData.questions.map((question, index) => (
                        <div
                          key={question.fklQuestionId}
                          className="p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 rounded-full flex items-center justify-center text-xs font-semibold text-emerald-700 mt-1">
                              {index + 1}.
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2 text-sm">
                                {question.vsInteractionQuestion}
                              </h4>

                              {/* Response Display */}
                              <div className="flex items-center gap-3">
                                {question.questionType ===
                                "multipleChoice" ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">
                                      Response:
                                    </span>
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        question.vsResponse === "Yes"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {question.vsResponse === "Yes" ? (
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      ) : (
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                      {question.vsResponse}
                                    </span>
                                  </div>
                                ) : question.questionType === "rating" ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">
                                      Rating:
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                          key={star}
                                          className={`w-5 h-5 ${
                                            star <=
                                            parseInt(question.vsResponse)
                                              ? "text-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                      <span className="ml-2 text-sm font-medium text-gray-700 flex gap-1 items-center">
                                        {question.vsResponse}/5
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">
                                      Response:
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                      {question.vsResponse}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Comment Display */}
                              {question.vsResponseComment &&
                                question.vsResponseComment.trim() && (
                                  <div className="mt-3 p-2 bg-gray-50 rounded-lg border-l-4 border-emerald-600">
                                    <div className="flex items-start gap-2">
                                      <Lu.LuInfo className="mt-0.5"/>
                                      <div>
                                        <p className="text-sm font-medium text-gray-700 flex gap-1 items-center mb-1">
                                          Additional Comment:
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          {question.vsResponseComment}
                                        </p>
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
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
