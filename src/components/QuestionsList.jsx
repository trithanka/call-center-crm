import React, { useState } from "react";
import * as Lu from "react-icons/lu";

const QuestionsList = ({
  masterData,
  filters,
  questionTypeOptions,
  onFilterChange,
  onResetFilters,

  // NEW: now coming from parent (server-driven)
  questions,
  currentPage,
  pageSize,
  totalCount,
  setCurrentPage,
  setPageSize,

  loading,
  loadingMaster,

  onEdit,
  onDelete,
}) => {

  const isResetDisabled =
    filters.role === "all" &&
    filters.queryType === "all" &&
    filters.questionType === "all" &&
    filters.search === "";

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const [openDropdown, setOpenDropdown] = useState(null);

  const DropdownFilter = ({
    id,
    label,
    options,
    selectedValue,
    onSelect,
    openDropdown,
    setOpenDropdown,
  }) => {
    const isOpen = openDropdown === id;

    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <span>{label}</span>
          <svg
            className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-10">
            <div className="py-1">
              {options.map((opt) => {
                const isSelected = selectedValue === opt.value;

                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onSelect(opt.value);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100
                      ${isSelected ? "bg-emerald-50 text-emerald-600 font-semibold" : ""}
                    `}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };



  return (
    <>
      {/* FILTER BAR */}
      <div className="bg-white rounded-xl border border-neutral-200 p-3 mb-4">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* SEARCH */}
          <div className="flex-1">
            <div className="flex gap-2 relative">
              <span className="absolute left-0 top-0 bottom-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>

              <input
                type="text"
                value={filters.search}
                onChange={(e) => onFilterChange("search", e.target.value)}
                placeholder="Search questions..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-72"
              />
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap gap-2">

            {/* Role */}
            <DropdownFilter
              id="role"
              label={
                masterData.roles.find(r => r.pklUserRoleId == filters.role)?.vsRoleName ||
                "All Roles"
              }
              options={[
                { label: "All Roles", value: "all" },
                ...masterData.roles.map(r => ({
                  label: r.vsRoleName,
                  value: r.pklUserRoleId.toString(),
                })),
              ]}
              selectedValue={filters.role}
              onSelect={(val) => onFilterChange("role", val)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />

            {/* Query Type */}
            <DropdownFilter
              id="queryType"
              label={
                masterData.queryTypes.find(q => q.pklQueryTypeId == filters.queryType)?.vsQueryType ||
                "All Category"
              }
              options={[
                { label: "All Category", value: "all" },
                ...masterData.queryTypes.map(q => ({
                  label: q.vsQueryType,
                  value: q.pklQueryTypeId.toString(),
                })),
              ]}
              selectedValue={filters.queryType}
              onSelect={(val) => onFilterChange("queryType", val)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />

            {/* Question Type */}
            <DropdownFilter
              id="questionType"
              label={
                questionTypeOptions.find(t => t.value === filters.questionType)?.label ||
                "All Types"
              }
              options={questionTypeOptions}
              selectedValue={filters.questionType}
              onSelect={(val) => onFilterChange("questionType", val)}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            />

            {/* Clear Filters */}
            <button
              onClick={onResetFilters}
              className="py-2 text-xs flex items-center text-gray-600 hover:text-gray-800 rounded"
            >
              <Lu.LuX className="w-4 h-4" />
              <span className="text-xs">Clear All</span>
            </button>

          </div>


        </div>
      </div>

      {/* LIST */}
      <div>
        {loading ? (
          <div className="bg-white border rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8">

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
            <h3 className="text-xl font-semibold">No Questions Found</h3>
            <p className="text-gray-500 text-sm">
              Create a question to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-white border-b border-neutral-100">
                    <tr>
                      {["#", "Question", "Role", "Category", "Type", "Options", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-100">
                    {questions.map((q, index) => (
                      <tr key={q.pklQuestionId} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">{(currentPage - 1) * pageSize + index + 1}</td>
                        <td className="px-4 py-3 font-semibold">{q.vsInteractionQuestion}</td>
                        <td className="px-4 py-3">{q.roleName}</td>
                        <td className="px-4 py-3">{q.queryTypeName}</td>
                        <td className="px-4 py-3">
                          {questionTypeOptions.find(t => t.value === q.bQuestionType)?.label}
                        </td>

                        <td className="px-4 py-3">
                          {q.bQuestionType === "4" && q.options ? (
                            <div className="flex flex-wrap gap-1">
                              {q.options.split("||").map((opt, i) => (
                                <span key={i} className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-[11px]">
                                  {opt.split(":")[1]}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-neutral-400 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => onEdit(q)}
                              className="text-gray-500 hover:text-blue-600"
                              title="Edit"
                            >
                              <Lu.LuPencil />
                            </button>

                            <button
                              onClick={() => onDelete(q.pklQuestionId)}
                              className="text-gray-500 hover:text-red-600"
                              title="Delete"
                            >
                              <Lu.LuDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="px-4 py-3 border-t bg-neutral-50 flex justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="border rounded px-2 py-1"
                  >
                    {[10, 25, 50, 100].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-40"
                  >
                    Prev
                  </button>

                  <span>
                    Page <b>{currentPage}</b> of <b>{totalPages}</b>
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* FOOTER SUMMARY */}
      {totalCount > 0 && (
        <div className="mt-4 text-xs text-neutral-600">
          Showing {questions.length} of {totalCount} questions
          {!isResetDisabled && (
            <span className="ml-2 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
              Filters Applied
            </span>
          )}
        </div>
      )}
    </>
  );
};

export default QuestionsList;
