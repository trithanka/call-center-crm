import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import QuestionsList from "../components/QuestionsList";
import apiService from "../services/api";

// Default fallback master data
const DEFAULT_ROLES = [
  { pklUserRoleId: 1, vsRoleName: "Candidate" },
  { pklUserRoleId: 2, vsRoleName: "Training Center" },
  { pklUserRoleId: 3, vsRoleName: "Trainer" },
  { pklUserRoleId: 4, vsRoleName: "Training Partner" },
  { pklUserRoleId: 5, vsRoleName: "Public" },
];

const DEFAULT_QUERY_TYPES = [
  { pklQueryTypeId: 1, vsQueryType: "Registration" },
  { pklQueryTypeId: 2, vsQueryType: "Course" },
  { pklQueryTypeId: 3, vsQueryType: "Training Center" },
  { pklQueryTypeId: 4, vsQueryType: "Placement" },
  { pklQueryTypeId: 5, vsQueryType: "Employment" },
  { pklQueryTypeId: 6, vsQueryType: "Others" },
];

const QUESTION_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "1", label: "Binary" },
  { value: "2", label: "Text" },
  { value: "3", label: "Number" },
  { value: "4", label: "Choice" },
];

const defaultFilters = {
  role: "all",
  queryType: "all",
  questionType: "all",
  search: "",
};

const defaultQuestionForm = {
  roleId: "",
  queryTypeId: "",
  vsInteractionQuestion: "",
  bQuestionType: "1",
  options: [],
};

const QuestionsManagement = () => {
  const [masterData, setMasterData] = useState({
    roles: [],
    queryTypes: [],
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMaster, setLoadingMaster] = useState(true);

  // Filters + pagination
  const [filters, setFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Modal
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState(defaultQuestionForm);

  // Load master data (static for now)
  useEffect(() => {
    const loadMaster = async () => {
      try {
        setLoadingMaster(true);
        setMasterData({
          roles: DEFAULT_ROLES,
          queryTypes: DEFAULT_QUERY_TYPES,
        });
      } finally {
        setLoadingMaster(false);
      }
    };
    loadMaster();
  }, []);

  // Fetch questions from API when filters/pagination change
  useEffect(() => {
    if (loadingMaster) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);

        const apiFilters = {
          userRoleId: filters.role !== "all" ? filters.role : "",
          queryTypeId: filters.queryType !== "all" ? filters.queryType : "",
          questionType: filters.questionType !== "all" ? filters.questionType : "",
          search: filters.search || "",
        };

        const response = await apiService.getQuestions(
          currentPage,
          pageSize,
          apiFilters
        );

        const list = response?.data?.queryType || [];

        const formatted = list.map((q) => ({
          ...q,
          roleId: q.fklUserRoleId,
          roleName:
            masterData.roles.find(
              (r) => r.pklUserRoleId == q.fklUserRoleId
            )?.vsRoleName || "",
          queryTypeId: q.fklQueryTypeId,
          queryTypeName:
            masterData.queryTypes.find(
              (t) => t.pklQueryTypeId == q.fklQueryTypeId
            )?.vsQueryType || "",
        }));

        setQuestions(formatted);
        setTotalCount(response?.count || list.length);
      } catch (err) {
        console.error("Error loading questions:", err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [filters, currentPage, pageSize, loadingMaster]);

  // Filter change
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  // Form actions
  const openCreateModal = () => {
    setQuestionForm({
      ...defaultQuestionForm,
      roleId: filters.role !== "all" ? filters.role : "",
      queryTypeId: filters.queryType !== "all" ? filters.queryType : "",
    });
    setEditingQuestionId(null);
    setShowQuestionForm(true);
  };

  const openEditModal = (q) => {
    setQuestionForm({
      roleId: q.roleId?.toString() || "",
      queryTypeId: q.queryTypeId?.toString() || "",
      vsInteractionQuestion: q.vsInteractionQuestion || "",
      bQuestionType: q.bQuestionType || "1",
      options:
        q.options?.split("||").map((o) => {
          const [id, value] = o.split(":");
          return { id, value };
        }) || [],
    });

    setEditingQuestionId(q.pklQuestionId);
    setShowQuestionForm(true);
  };

  const closeQuestionForm = () => {
    setShowQuestionForm(false);
    setEditingQuestionId(null);
    setQuestionForm(defaultQuestionForm);
  };

  // Delete
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      const res = await apiService.deleteQuestion(id);
      if (res.status === "true") {
        toast.success("Deleted successfully");
        setCurrentPage(1);
        setFilters({ ...filters });
      } else toast.error(res.message);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  // Save (create / update)
  const handleSaveQuestion = async () => {
    if (!questionForm.roleId) return toast.error("Role required");
    if (!questionForm.queryTypeId) return toast.error("Query type required");
    if (!questionForm.vsInteractionQuestion.trim())
      return toast.error("Question required");

    const isChoice = questionForm.bQuestionType === "4";

    if (isChoice && questionForm.options.some((o) => !o.value.trim())) {
      return toast.error("All choice values required");
    }

    const payload = {
      userRoleId: Number(questionForm.roleId),
      queryTypeId: Number(questionForm.queryTypeId),
      vsInteractionQuestion: questionForm.vsInteractionQuestion,
      bQuestionType: questionForm.bQuestionType,
      options: isChoice
        ? questionForm.options.map((o) => `${o.id}:${o.value}`).join("||")
        : "",
    };

    if (editingQuestionId) payload.questionId = editingQuestionId;

    try {
      const res = editingQuestionId
        ? await apiService.updateQuestion(payload)
        : await apiService.createQuestion(payload);

      if (res.status === "true") {
        toast.success(editingQuestionId ? "Updated" : "Created");

        closeQuestionForm();
        setCurrentPage(1);
        setFilters({ ...filters });
      } else toast.error(res.message);
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  return (
    <div className="">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />

          <main className="overflow-auto w-full flex-grow bg-neutral-100">
            <div className="max-w-7xl mx-auto py-6 px-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Questions</h1>
                  <p className="text-sm text-gray-500">
                    Manage questions for each role and query type.
                  </p>
                </div>

                <button
                  onClick={openCreateModal}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-xs"
                >
                  Create Question
                </button>
              </div>

              <QuestionsList
                masterData={masterData}
                filters={filters}
                questionTypeOptions={QUESTION_TYPE_OPTIONS}
                onFilterChange={handleFilterChange}
                onResetFilters={resetFilters}
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount}
                setCurrentPage={setCurrentPage}
                setPageSize={setPageSize}
                questions={questions}
                loading={loading}
                loadingMaster={loadingMaster}
                onEdit={openEditModal}
                onDelete={handleDeleteQuestion}
              />
            </div>
          </main>
        </div>
      </div>

      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          {/* Modal */}
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingQuestionId ? "Edit Question" : "Create Question"}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Form fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm mb-1">Role *</label>
                  <select
                    value={questionForm.roleId}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        roleId: e.target.value,
                      })
                    }
                    className="w-full border px-3 py-2 rounded-md"
                  >
                    <option value="">-- Select Role --</option>
                    {masterData.roles.map((role) => (
                      <option key={role.pklUserRoleId} value={role.pklUserRoleId}>
                        {role.vsRoleName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Query Type *</label>
                  <select
                    value={questionForm.queryTypeId}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        queryTypeId: e.target.value,
                      })
                    }
                    className="w-full border px-3 py-2 rounded-md"
                  >
                    <option value="">-- Select Query Type --</option>
                    {masterData.queryTypes.map((type) => (
                      <option
                        key={type.pklQueryTypeId}
                        value={type.pklQueryTypeId}
                      >
                        {type.vsQueryType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Question *</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows="3"
                  value={questionForm.vsInteractionQuestion}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      vsInteractionQuestion: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Type *</label>
                <select
                  value={questionForm.bQuestionType}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      bQuestionType: e.target.value,
                      options: e.target.value === "4" ? questionForm.options : [],
                    })
                  }
                  className="w-full border px-3 py-2 rounded-md"
                >
                  <option value="1">Binary</option>
                  <option value="2">Text</option>
                  <option value="3">Number</option>
                  <option value="4">Choice</option>
                </select>
              </div>

              {questionForm.bQuestionType === "4" && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Options *</span>
                    <button
                      onClick={() =>
                        setQuestionForm({
                          ...questionForm,
                          options: [
                            ...questionForm.options,
                            { id: "", value: "" },
                          ],
                        })
                      }
                      className="text-emerald-600 text-sm"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {questionForm.options.map((opt, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={opt.value}
                          onChange={(e) => {
                            const updated = [...questionForm.options];
                            updated[index].value = e.target.value;
                            setQuestionForm({
                              ...questionForm,
                              options: updated,
                            });
                          }}
                          className="flex-1 border rounded px-3 py-2"
                          placeholder={`Option ${index + 1}`}
                        />

                        <button
                          onClick={() => {
                            const updated = questionForm.options.filter(
                              (_, i) => i !== index
                            );
                            setQuestionForm({
                              ...questionForm,
                              options: updated,
                            });
                          }}
                          className="text-red-600 border rounded px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  onClick={closeQuestionForm}
                  className="border px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md"
                >
                  {editingQuestionId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsManagement;
