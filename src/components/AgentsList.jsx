import { useState, useEffect } from "react";
import apiService from "../services/api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const AgentsList = () => {
  const [agents, setAgents] = useState([]);
  const [rawResponse, setRawResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getAgents();

        if (response && response.data && response.data.queryType) {
          setAgents(response.data.queryType);
          setRawResponse(response.data);
        } else {
          setAgents([]);
          setRawResponse(response?.data ?? null);
        }
      } catch (err) {
        console.error("Error fetching agents:", err);
        setError(err.message || "Failed to fetch agents");
        setAgents([]);
        setRawResponse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "--";

    try {
      // Handle different date formats from API
      if (dateString.includes("/")) {
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
        const datePart = dateString.split(" ")[0];
        const [day, month, year] = dateString.split("-");
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

      return "--";
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "--";
    }
  };

  // Handle enable/disable agent
  const handleToggleStatus = async (agent) => {
    const newStatus = agent.bEnabled === 1 ? 0 : 1;
    const action = newStatus === 1 ? "enable" : "disable";

    try {
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${action} ${
          agent.vsLoginName || agent.vsEntityUserName
        }?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        // Update agent status
        await apiService.updateAgentStatus(
          agent.pklLoginId || agent.pklEntityUserId,
          newStatus
        );

        // Update local state
        setAgents((prevAgents) =>
          prevAgents.map((a) =>
            a.pklLoginId === agent.pklLoginId ||
            a.pklEntityUserId === agent.pklEntityUserId
              ? { ...a, bEnabled: newStatus }
              : a
          )
        );

        toast.success(`Agent ${action}d successfully!`);
      }
    } catch (err) {
      console.error(`Error ${action}ing agent:`, err);
      toast.error(`Failed to ${action} agent: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agents...</p>
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
              Error Loading Agents
            </p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-center text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider w-6">
                  #
                </th>
                <th className="px-4 py-4 text-left text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-4 text-left text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-4 py-4 text-left text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-4 text-left text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-4 text-center text-[0.65rem] font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No agents found
                  </td>
                </tr>
              ) : (
                agents.map((agent, keyIndex) => (
                  <tr
                    key={agent.pklLoginId || agent.pklEntityUserId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {keyIndex + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {agent.vsEntityUserName || agent.vsLoginName || "N/A"}
                      </div>
                      {agent.vsLoginName &&
                        agent.vsLoginName !== agent.vsEntityUserName && (
                          <div className="text-sm text-gray-500">
                            {agent.vsLoginName}
                          </div>
                        )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {agent.vsMobile1 || "--"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {agent.vsEmail1 || "--"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-[0.6rem] font-semibold rounded-full ${
                          agent.bEnabled === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            agent.bEnabled === 1 ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                        {agent.bEnabled === 1 ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex gap-2 items-center justify-center">
                        <a
                          className="inline-flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors 
                      duration-150"
                          title="View Ticket"
                          href={`/chats?id=${
                            agent.pklLoginId || agent.pklEntityUserId
                          }`}
                          data-discover="true"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" >
                            <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path>
                            <path
                              d="m21 3-9 9"
                            ></path>
                            <path d="M15 3h6v6"></path>
                          </svg>
                        </a>

                        <button
                          onClick={() => handleToggleStatus(agent)}
                          className={`relative inline-flex h-3.5 w-6 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                            agent.bEnabled === 1
                              ? "bg-emerald-600"
                              : "bg-gray-300"
                          }`}
                          role="switch"
                          aria-checked={agent.bEnabled === 1}
                        >
                          <span
                            className={`inline-block size-2 mx-0.5 transform rounded-full bg-white transition-transform absolute ${
                              agent.bEnabled === 1
                                ? "right-0"
                                : "left-0"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default AgentsList;
