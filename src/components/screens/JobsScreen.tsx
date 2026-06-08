import React, { useState } from "react";
import { Job } from "../../types";
import { Slicon } from "../Slicon";

interface JobsScreenProps {
  jobs: Job[];
  onAddJobClick: () => void;
  onEditJobClick: (job: Job) => void;
  onCloseJobClick: (job: Job) => void;
  onDeleteJobClick: (jobId: string) => void;
  onPipelineClick?: (jobId: string) => void;
}

export const JobsScreen: React.FC<JobsScreenProps> = ({
  jobs,
  onAddJobClick,
  onEditJobClick,
  onCloseJobClick,
  onDeleteJobClick,
  onPipelineClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDeptFilter("all");
  };

  // Combining filters and sorting chronologically descending (R2.12)
  const filteredJobs = jobs
    .filter((job) => {
      const jobTitle = (job?.title || "").toLowerCase();
      const matchesSearch = jobTitle.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      const matchesDept = deptFilter === "all" || job.department === deptFilter;
      return matchesSearch && matchesStatus && matchesDept;
    })
    .sort((a, b) => {
      const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
      const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
      return dateB - dateA;
    });

  const uniqueDepts = Array.from(new Set(jobs.map((j) => j.department)));

  return (
    <div className="space-y-6">
      {/* Top filter bar toolbar layout */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-150/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left filters search panel */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow">
          {/* Search */}
          <div className="relative flex-grow max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
              <Slicon name="search" size={16} />
            </span>
            <input
              type="text"
              placeholder="Search positions..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-205 focus:outline-none focus:ring-2 focus:ring-[#52B788] text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sourcing Status */}
          <div className="min-w-[120px]">
            <select
              className="w-full h-10 px-3 bg-white border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Departments */}
          <div className="min-w-[140px]">
            <select
              className="w-full h-10 px-3 bg-white border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-sm"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              {uniqueDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters Button */}
          {(searchQuery || statusFilter !== "all" || deptFilter !== "all") && (
            <button
              onClick={clearFilters}
              className="px-3.5 h-10 rounded-xl border border-[#FECACA] text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px]"
            >
              <Slicon name="x" size={14} />
              Clear
            </button>
          )}
        </div>

        {/* Right header active info counter */}
        <div className="text-right text-xs text-gray-400 font-medium">
          Showing {filteredJobs.length} of {jobs.length} job openings
        </div>
      </div>

      {/* Structured data table card - hidden on mobile, visible on desktop */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-150/80 overflow-hidden">
        <div className="overflow-x-auto w-full scrollbar-thin">
          <table className="w-full border-collapse text-left text-sm table-auto">
            <thead>
              <tr className="bg-[#F0FAF4]/60 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                {/* Fixed first column for mobile pinned-left layout */}
                <th className="py-4 px-6 font-semibold sticky left-0 bg-white md:bg-transparent z-10">
                  Job Title
                </th>
                <th className="py-4 px-6 font-semibold">Department</th>
                <th className="py-4 px-6 font-semibold">Location</th>
                <th className="py-4 px-6 font-semibold">Fulfillment Ratio</th>
                <th className="py-4 px-6 font-semibold">Deadline</th>
                <th className="py-4 px-6 font-semibold">Sourcing</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                      <Slicon name="folder" size={44} className="text-gray-300 mb-3" />
                      <p className="font-semibold text-gray-700 text-sm mb-1">
                        No matches found
                      </p>
                      <p className="text-xs text-gray-400">
                        Try clearing or modifying the department or search query filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                 filteredJobs.map((job) => {
                  const isClosed = job.status === "Closed";
                  return (
                    <tr
                      key={job.jobId}
                      className={`transition-colors border-b ${
                        isClosed
                          ? "bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] shadow-none hover:bg-[#F9FAFB]"
                          : "hover:bg-[#F0FAF4]/20 border-gray-50 text-gray-808"
                      }`}
                    >
                      {/* Title column pinned left for horizontal scroll details on mobile */}
                      <td className={`py-4 px-6 font-semibold sticky left-0 z-10 shadow-sm md:shadow-none min-w-[180px] ${
                        isClosed ? "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280] md:bg-transparent" : "bg-white hover:bg-slate-50 md:bg-transparent text-gray-800"
                      }`}>
                        <div>
                          <span className={`block text-sm font-bold ${isClosed ? "text-[#6B7280]" : "text-gray-900 group-hover:text-[#2D6A4F]"}`}>
                            {job.title}
                          </span>
                          <span className={`text-[10px] uppercase font-mono tracking-wider font-semibold ${isClosed ? "text-gray-400" : "text-gray-400"}`}>
                            {job.jobId}
                          </span>
                        </div>
                      </td>

                      <td className={`py-4 px-6 font-medium ${isClosed ? "text-[#6B7280]" : "text-gray-600"}`}>
                        {job.department}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isClosed
                              ? "bg-gray-100 text-gray-400 border border-gray-200 shadow-none hover:bg-gray-100"
                              : job.location === "Remote"
                              ? "bg-sky-50 text-sky-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? "bg-gray-400" : job.location === "Remote" ? "bg-sky-500" : "bg-orange-500"}`} />
                          {job.location}
                        </span>
                      </td>

                      {/* Headcount filled / target ratio */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5 max-w-[120px]">
                          <div className={`flex items-center justify-between text-xs font-semibold ${isClosed ? "text-gray-400" : "text-gray-655"}`}>
                            <span>{job.hired_count} / {job.headcount} Hired</span>
                            <span>{Math.round((job.hired_count / job.headcount) * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                               className={`h-full rounded-full ${isClosed ? "bg-gray-300" : "bg-[#52B788]"}`}
                              style={{ width: `${Math.min((job.hired_count / job.headcount) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className={`py-4 px-6 text-xs font-mono ${isClosed ? "text-gray-400" : "text-gray-500"}`}>
                        {new Date(job.deadline).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-none ${
                            isClosed
                              ? "bg-gray-100 text-gray-500 border-gray-200"
                              : "bg-[#D8F3DC] text-[#2D6A4F] border border-emerald-205"
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full inline-block bg-gray-400"
                          />
                          {isClosed ? "CLOSED" : job.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className={`flex items-center justify-end gap-1.5 ${isClosed ? "pointer-events-none opacity-40" : ""}`}>
                          {/* Close Position */}
                          {!isClosed && (
                            <button
                              onClick={() => onCloseJobClick(job)}
                              title="Close Job opening"
                              className="p-1 text-gray-400 hover:text-orange-600 rounded hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Slicon name="x" size={16} />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => onEditJobClick(job)}
                            title="Edit Job details"
                            className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Slicon name="edit" size={16} />
                          </button>

                          {/* Cascade Delete */}
                          <button
                            onClick={() => onDeleteJobClick(job.jobId)}
                            title="Cascade Delete Job"
                            className="p-1 text-gray-400 hover:text-red-655 rounded hover:bg-gray-150 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Slicon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table footer paging details */}
        <div className="bg-[#F3F4F6]/20 py-3.5 px-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>
            Total active jobs in system: <strong className="text-gray-755">{jobs.length}</strong>
          </span>
          <span>
            Showing <strong className="text-gray-755">{filteredJobs.length}</strong> entries
          </span>
        </div>
      </div>

      {/* Mobile Card View (md:hidden) */}
      <div className="md:hidden space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-150">
            <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
              <Slicon name="folder" size={44} className="text-gray-300 mb-3" />
              <p className="font-semibold text-gray-700 text-sm mb-1">
                No matches found
              </p>
              <p className="text-xs text-gray-400">
                Try clearing or modifying the department or search query filters.
              </p>
            </div>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isClosed = job.status === "Closed";
            return (
              <div
                key={job.jobId}
                className={`p-5 rounded-2xl border transition-all duration-300 ${
                  isClosed
                    ? "bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] shadow-none hover:shadow-none hover:border-[#E5E7EB]"
                    : "bg-white/80 backdrop-blur-md border-gray-150/80 hover:border-emerald-300 shadow-sm"
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-0.5">
                    <h3 className={`text-sm font-bold leading-tight ${isClosed ? "text-[#6B7280]" : "text-gray-900"}`}>
                      {job.title}
                    </h3>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold block text-gray-400">
                      {job.jobId}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isClosed
                        ? "bg-gray-100 text-gray-500 border-gray-200 shadow-none"
                        : "bg-[#D8F3DC] text-[#2D6A4F] border border-emerald-250 shadow-sm"
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block bg-gray-400"
                    />
                    {isClosed ? "CLOSED" : job.status}
                  </span>
                </div>

                {/* Metadata Group */}
                <div className="space-y-2 mb-4">
                  {/* Location Row with map pin icon */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-650">
                    <span className="w-4 h-4 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <Slicon name="help" size={11} className="text-gray-400" />
                    </span>
                    <span className={isClosed ? "text-gray-400 font-medium" : "text-gray-600 font-medium"}>Location: {job.location}</span>
                  </div>

                  {/* Department with highlighted desaturated or green typography */}
                  <div className="text-xs flex items-center gap-1.5">
                    <span className="text-gray-400 font-medium">Dept: </span>
                    <span className={`font-bold px-2 py-0.5 rounded border transition-colors ${
                      isClosed
                        ? "text-[#6B7280] bg-gray-100 border-[#E5E7EB]"
                        : "text-[#2D6A4F] bg-[#F0FAF4] border border-emerald-100"
                    }`}>
                      {job.department}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-3" />

                {/* Footer Action Row */}
                <div className={`flex items-center justify-between ${isClosed ? "pointer-events-none opacity-40" : ""}`}>
                  {/* PIPELINE contextual text link */}
                  {onPipelineClick ? (
                    <button
                      onClick={() => onPipelineClick(job.jobId)}
                      className={`text-xs font-black tracking-wider flex items-center gap-1 cursor-pointer transition-all active:translate-x-1 ${
                        isClosed ? "text-[#6B7280]" : "text-[#2D6A4F] hover:text-[#1A3A2E]"
                      }`}
                    >
                      PIPELINE →
                    </button>
                  ) : (
                    <div />
                  )}

                  {/* Standard Management Controls */}
                  <div className="flex items-center gap-1.5">
                    {/* Close Action if open */}
                    {!isClosed && (
                      <button
                        onClick={() => onCloseJobClick(job)}
                        title="Close Job opening"
                        className="w-11 h-11 border border-gray-100 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
                      >
                        <Slicon name="x" size={15} />
                      </button>
                    )}

                    {/* Edit Option */}
                    <button
                      onClick={() => onEditJobClick(job)}
                      title="Edit Job details"
                      className="w-11 h-11 border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
                    >
                      <Slicon name="edit" size={15} />
                    </button>

                    {/* Cascade Delete */}
                    <button
                      onClick={() => onDeleteJobClick(job.jobId)}
                      title="Cascade Delete Job"
                      className="w-11 h-11 border border-gray-100 rounded-xl text-gray-400 hover:text-red-655 hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
                    >
                      <Slicon name="trash" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
