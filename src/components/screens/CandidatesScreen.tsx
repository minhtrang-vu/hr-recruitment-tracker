import React, { useState } from "react";
import { Candidate, Application, Job, Feedback } from "../../types";
import { Slicon } from "../Slicon";

interface CandidatesScreenProps {
  candidates: Candidate[];
  applications: Application[];
  jobs: Job[];
  feedbacksMap: Record<string, Feedback[]>; // applicationId -> Feedbacks Array
  onAddCandidateClick: () => void;
  onEditCandidateClick: (candidate: Candidate) => void;
  onDeleteCandidateClick: (candidateId: string) => void;
  onApplyToJobClick: (candidateId: string, candidateName: string) => void;
  onNavigateToApplication: (applicationId: string) => void;
  onDeleteApplicationClick?: (app: Application) => void;
  onUnlinkApplicationClick?: (app: Application) => void;
}

export const CandidatesScreen: React.FC<CandidatesScreenProps> = ({
  candidates,
  applications,
  jobs,
  feedbacksMap,
  onAddCandidateClick,
  onEditCandidateClick,
  onDeleteCandidateClick,
  onApplyToJobClick,
  onNavigateToApplication,
  onDeleteApplicationClick,
  onUnlinkApplicationClick,
}) => {
  const [activeTab, setActiveTab] = useState<"candidates" | "applications">("candidates");

  // Candidates Filters
  const [candSearch, setCandSearch] = useState("");
  // Applications Filters
  const [appSearch, setAppSearch] = useState("");
  const [appJobFilter, setAppJobFilter] = useState("all");
  const [appStageFilter, setAppStageFilter] = useState("all");
  const [appRecFilter, setAppRecFilter] = useState("all");

  const [expandedCandRows, setExpandedCandRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const toggleCandidateRow = (id: string) => {
    setExpandedCandRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getStageColorDot = (stage: string) => {
    switch (stage) {
      case "Applied":
        return "#3B82F6";
      case "Screening":
        return "#10B981";
      case "Interview":
        return "#F59E0B";
      case "Assessment":
        return "#6366F1";
      case "Offer":
        return "#EC4899";
      case "Hired":
        return "#14B8A6";
      case "Rejected":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const clearCandidateFilters = () => {
    setCandSearch("");
  };

  const clearApplicationFilters = () => {
    setAppSearch("");
    setAppJobFilter("all");
    setAppStageFilter("all");
    setAppRecFilter("all");
    setCurrentPage(1);
  };

  // Filtered Candidates, sorted chronologically descending by createdDate (R3.7)
  const filteredCandidates = candidates
    .filter((cand) => {
      const term = candSearch.trim().toLowerCase();
      if (!term) return true;
      const fullName = (cand?.fullName || "").toLowerCase();
      const email = (cand?.email || "").toLowerCase();
      const phone = (cand?.phone || "").toLowerCase();
      return (
        fullName.includes(term) ||
        email.includes(term) ||
        phone.includes(term)
      );
    })
    .sort((a, b) => {
      const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
      const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
      return dateB - dateA;
    });

  // Calculate Application level details (like feedback score and recommendation) for filtering
  const getAppFeedbackDetails = (appId: string) => {
    const fbs = feedbacksMap[appId] || [];
    if (fbs.length === 0) return { avgScore: 0, roundedAvg: "NA", count: 0, rec: "Pending" };
    
    const sum = fbs.reduce((acc, f) => acc + (f.technicalScore + f.communicationScore + f.cultureFitScore) / 3, 0);
    const avgScore = sum / fbs.length;

    // Use latest feedback recommendation as current state or compute it
    const rec = fbs[fbs.length - 1].recommendation;
    return {
      avgScore,
      roundedAvg: avgScore.toFixed(1),
      count: fbs.length,
      rec,
    };
  };

  // Filtered Applications List, sorted chronologically descending by applicationDate (R3.7)
  const filteredApplications = applications
    .filter((app) => {
      const term = appSearch.trim().toLowerCase();
      const candidateName = (app?.candidateName || "").toLowerCase();
      const jobTitle = (app?.jobTitle || "").toLowerCase();
      const matchesSearch = term ? candidateName.includes(term) || jobTitle.includes(term) : true;
      const matchesJob = appJobFilter === "all" || app.jobId === appJobFilter;
      const matchesStage = appStageFilter === "all" || app.stage === appStageFilter;

      let matchesRec = true;
      if (appRecFilter !== "all") {
        const details = getAppFeedbackDetails(app.applicationId);
        matchesRec = details.rec === appRecFilter;
      }

      return matchesSearch && matchesJob && matchesStage && matchesRec;
    })
    .sort((a, b) => {
      const dateA = a.applicationDate ? new Date(a.applicationDate).getTime() : 0;
      const dateB = b.applicationDate ? new Date(b.applicationDate).getTime() : 0;
      return dateB - dateA;
    });

  // Pagination for Applications
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage) || 1;
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Tab Selector Links Header */}
      <div className="border-b border-gray-150 flex items-center gap-6">
        <button
          onClick={() => setActiveTab("candidates")}
          className={`pb-4 text-sm font-semibold tracking-wide uppercase transition-all relative border-b-2 ${
            activeTab === "candidates"
              ? "border-[#52B788] text-[#2D6A4F] font-bold"
              : "border-transparent text-gray-400 hover:text-gray-655"
          }`}
        >
          Master Candidates DB ({candidates.length})
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-4 text-sm font-semibold tracking-wide uppercase transition-all relative border-b-2 ${
            activeTab === "applications"
              ? "border-[#52B788] text-[#2D6A4F] font-bold"
              : "border-transparent text-gray-400 hover:text-gray-655"
          }`}
        >
          Linked Applications ({applications.length})
        </button>
      </div>

      {/* ==========================================
          TAB 1: CANDIDATES DATABASE VIEW
          ========================================== */}
      {activeTab === "candidates" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-150/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-grow sm:flex-initial sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                  <Slicon name="search" size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-205 focus:outline-none focus:ring-2 focus:ring-[#52B788] text-sm"
                  value={candSearch}
                  onChange={(e) => setCandSearch(e.target.value)}
                />
              </div>

              {candSearch && (
                <button
                  onClick={clearCandidateFilters}
                  className="px-3 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-500"
                >
                  Clear
                </button>
              )}
            </div>

            <span className="text-xs text-gray-400 font-medium">
              Registered Candidates: {filteredCandidates.length}
            </span>
          </div>

          {/* Master Table listing */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-150/80 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full border-collapse text-left text-sm table-auto">
                <thead>
                  <tr className="bg-[#F0FAF4]/60 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-4 px-6 w-10"></th>
                    <th className="py-4 px-6 sticky left-0 bg-white md:bg-transparent z-10 w-[180px]">
                      Candidate Name
                    </th>
                    <th className="py-4 px-6">Email / Phone</th>
                    <th className="py-4 px-6">Active Tracking Pill / Status</th>
                    <th className="py-4 px-6 text-right">Master Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-gray-400">
                        <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-center">
                          <Slicon name="users" size={44} className="text-gray-300 mb-3" />
                          <p className="font-semibold text-gray-700 text-sm mb-1">
                            No profiles on ledger
                          </p>
                          <p className="text-xs text-gray-400">
                            Create profiles first, then link them to open job openings.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((cand) => {
                      const expanded = expandedCandRows.includes(cand.candidateId);
                      
                      // Get all candidate's applications
                      const candApps = applications
                        .filter((app) => app.candidateId === cand.candidateId)
                        .sort((a, b) => new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime());

                      // Primary App is first (most recently active)
                      const primaryApp = candApps.length > 0 ? candApps[0] : null;
                      const primaryJob = primaryApp ? jobs.find((j) => j.jobId === primaryApp.jobId) : null;
                      const isPrimaryJobClosed = primaryJob?.status === "Closed";

                      return (
                        <React.Fragment key={cand.candidateId}>
                          <tr className={`transition-colors border-b hover:bg-[#F0FAF4]/10 border-gray-50 text-gray-805 ${expanded ? "bg-[#F0FAF4]/20" : ""}`}>
                            {/* Expand Row chevron trigger */}
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => toggleCandidateRow(cand.candidateId)}
                                className="p-1 hover:bg-gray-100 rounded min-h-[36px] min-w-[36px] text-gray-400 hover:text-gray-700"
                              >
                                <Slicon name={expanded ? "chevron-down" : "chevron-right"} size={16} />
                              </button>
                            </td>

                            {/* Name pinned left */}
                            <td className="py-4 px-6 font-bold sticky left-0 z-10 shadow-sm md:shadow-none min-w-[180px] bg-white hover:bg-slate-50 md:bg-transparent text-gray-900">
                              <div>
                                <span className="text-gray-900">{cand.fullName}</span>
                                <span className="block text-[10px] font-mono font-medium mt-0.5 text-gray-400">
                                  {cand.candidateId}
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="text-xs leading-relaxed">
                                <span className="block font-medium text-gray-705">{cand.email}</span>
                                <span className="block text-gray-400 font-mono">{cand.phone}</span>
                              </div>
                            </td>

                            {/* Active tracking pill details (R3.7 / CD6) */}
                            <td className="py-4 px-6">
                              {primaryApp ? (
                                <div className="flex items-center gap-2">
                                  {/* Pinned pill */}
                                  <button
                                    onClick={() => onNavigateToApplication(primaryApp.applicationId)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-semibold shadow-sm transition-all bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-800"
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full inline-block"
                                      style={{ backgroundColor: getStageColorDot(primaryApp.stage) }}
                                    />
                                    <span className="truncate max-w-[100px]" title={primaryApp.jobTitle}>
                                      {primaryApp.jobTitle}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-100 text-slate-800">
                                      {primaryApp.stage}
                                    </span>
                                  </button>

                                  {/* If candidate has multiple applications, append a "+n" tag */}
                                  {candApps.length > 1 && (
                                    <span
                                      className="px-2 py-0.5 rounded-full border text-[10px] font-bold select-none cursor-default bg-gray-100 border-gray-200 text-gray-600"
                                      title={`${candApps.length - 1} more application${candApps.length > 2 ? 's' : ''}`}
                                    >
                                      +{candApps.length - 1}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No applications linked yet</span>
                              )}
                            </td>

                            {/* Actions panel */}
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Create application Link button */}
                                <button
                                  onClick={() => onApplyToJobClick(cand.candidateId, cand.fullName)}
                                  title="Link application to open Job Position"
                                  className="py-1 px-2.5 rounded-lg border border-emerald-205 text-xs font-semibold text-[#2D6A4F] bg-white hover:bg-emerald-50 transition-all min-h-[44px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Slicon name="link" size={14} />
                                  Link Job
                                </button>

                                {/* Edit profile info details */}
                                <button
                                  onClick={() => onEditCandidateClick(cand)}
                                  title="Edit profile information"
                                  className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <Slicon name="edit" size={16} />
                                </button>

                                {/* Cascade Delete profiles */}
                                <button
                                  onClick={() => onDeleteCandidateClick(cand.candidateId)}
                                  disabled={cand.hasHiredApplication}
                                  title={cand.hasHiredApplication ? "Deletions blocked: Candidate hired in position." : "Delete candidate completely"}
                                  className="p-1 text-gray-400 hover:text-red-655 rounded hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <Slicon name="trash" size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* ==========================================
                              EXPAND REVIEWS SUB-ROW DETAIL (R3.7)
                              ========================================== */}
                          {expanded && (
                            <tr className="bg-gray-50/50">
                              <td colSpan={5} className="px-6 py-4 border-l-4 border-emerald-500 bg-emerald-50/10">
                                <div className="space-y-3.5">
                                  <h5 className="text-[11px] font-bold text-[#2D6A4F] uppercase tracking-widest flex items-center gap-1.5">
                                    <Slicon name="folder" size={14} />
                                    Chronological linked submissions ({candApps.length})
                                  </h5>

                                  {candApps.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">This candidate profile has not applied to any positions yet.</p>
                                  ) : (
                                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden">
                                      {candApps.map((app) => {
                                        const details = getAppFeedbackDetails(app.applicationId);
                                        const assocJob = jobs.find((j) => j.jobId === app.jobId);
                                        const isJobClosed = assocJob?.status === "Closed";
                                        return (
                                          <div
                                            key={app.applicationId}
                                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 text-xs gap-3 transition-colors ${
                                              isJobClosed
                                                ? "bg-gray-50 border border-gray-200 shadow-none hover:bg-gray-50"
                                                : "hover:bg-gray-50/80 bg-white border-b border-gray-100 text-gray-855"
                                            }`}
                                          >
                                            {/* Left details */}
                                            <div className="space-y-1">
                                              <p className={`font-bold ${isJobClosed ? "text-gray-500" : "text-gray-808"}`}>
                                                Position Applied:{" "}
                                                <span className={isJobClosed ? "text-gray-500 font-bold" : "text-[#2D6A4F]"}>
                                                  {app.jobTitle}
                                                </span>
                                              </p>
                                              <p className={`text-[10px] font-mono ${isJobClosed ? "text-gray-500" : "text-gray-400"}`}>
                                                App ID: {app.applicationId} · Applied on: {new Date(app.applicationDate).toLocaleDateString()}
                                              </p>
                                            </div>

                                            {/* Stage Badge & Scores indicator */}
                                            <div className="flex flex-wrap items-center gap-3">
                                              {/* Stage */}
                                              {isJobClosed ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 text-gray-400 rounded-full font-bold text-[10px] uppercase tracking-wider border border-gray-200 shadow-none">
                                                  <span
                                                    className="w-1.5 h-1.5 rounded-full inline-block bg-gray-400"
                                                  />
                                                  {app.stage}
                                                </span>
                                              ) : (
                                                <span
                                                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[10px] uppercase tracking-wider text-white"
                                                  style={{ backgroundColor: getStageColorDot(app.stage) }}
                                                >
                                                  <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
                                                  {app.stage}
                                                </span>
                                              )}

                                              {/* Evaluation */}
                                              <span className={`px-2 py-0.5 rounded-md font-mono font-medium border ${
                                                isJobClosed
                                                  ? "bg-gray-100 text-gray-400 border-gray-200"
                                                  : "bg-gray-100 text-gray-600 border-gray-205"
                                              }`}>
                                                Avg Score:{" "}
                                                <strong className={isJobClosed ? "text-gray-400" : "text-gray-800"}>
                                                  {details.roundedAvg}
                                                </strong>{" "}
                                                ({details.count} evals)
                                              </span>

                                              {/* Outcome Badge system */}
                                              <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${
                                                isJobClosed
                                                  ? "bg-gray-100 text-gray-400 border-gray-200"
                                                  : details.rec === "Strong Hire" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                                                    details.rec === "Hire" ? "bg-green-50 text-green-800 border-green-200" :
                                                    details.rec === "Hold" ? "bg-amber-50 text-amber-800 border-amber-205" :
                                                    details.rec === "Reject" ? "bg-red-50 text-red-800 border-red-200" : "bg-gray-100 text-gray-500 border-gray-200"
                                              }`}>
                                                {details.rec}
                                              </span>
                                            </div>

                                            {/* Details and Deletion/Unlink Button Group */}
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                              <button
                                                onClick={() => onNavigateToApplication(app.applicationId)}
                                                className={`py-1.5 px-3 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[36px] ${
                                                  isJobClosed
                                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                                    : "bg-slate-100 hover:bg-[#D8F3DC] hover:text-[#2D6A4F] text-gray-800"
                                                }`}
                                              >
                                                View Details
                                                <Slicon name="chevron-right" size={13} />
                                              </button>

                                              <button
                                                disabled={app.stage === "Hired" || app.stage === "Offer"}
                                                onClick={() => {
                                                  if (onDeleteApplicationClick) onDeleteApplicationClick(app);
                                                }}
                                                title={app.stage === "Hired" || app.stage === "Offer" ? "Blocked: Offer/Hired application cannot be deleted" : "Delete application permanently"}
                                                className={`p-1 px-2.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[36px] flex items-center gap-1 transition-all text-[11px] font-semibold ${
                                                  isJobClosed
                                                    ? "border-gray-200 text-gray-400 bg-slate-50 pointer-events-none opacity-40"
                                                    : "border-red-205 text-red-655 bg-white hover:bg-red-50"
                                                }`}
                                              >
                                                <Slicon name="trash" size={13} />
                                                Delete
                                              </button>

                                              <button
                                                disabled={app.stage === "Hired" || app.stage === "Offer"}
                                                onClick={() => {
                                                  if (onUnlinkApplicationClick) onUnlinkApplicationClick(app);
                                                }}
                                                title={app.stage === "Hired" || app.stage === "Offer" ? "Blocked: Offer/Hired application cannot be unlinked" : "Unlink candidate from job"}
                                                className={`p-1 px-2.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[36px] flex items-center gap-1 transition-all text-[11px] font-semibold ${
                                                  isJobClosed
                                                    ? "border-gray-200 text-gray-400 bg-slate-50 pointer-events-none opacity-40"
                                                    : "border-amber-205 text-amber-705 bg-white hover:bg-amber-50"
                                                }`}
                                              >
                                                <Slicon name="unlink" size={13} />
                                                Unlink
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-[#F3F4F6]/20 py-3.5 px-6 border-t border-gray-100 text-xs text-gray-400 font-medium">
              Click the row chevron expand arrows to view evaluation histories, average interview scores, and detail breakdowns.
            </div>
          </div>

          {/* Mobile Dossier Card View for Candidates */}
          <div className="md:hidden space-y-4">
            {filteredCandidates.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center text-gray-400 border border-gray-150 shadow-sm">
                <Slicon name="users" size={44} className="text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-700 text-sm mb-1">No candidates match</p>
                <p className="text-xs text-gray-400">Modify name filters or expand active sourcing targets.</p>
              </div>
            ) : (
              filteredCandidates.map((cand) => {
                const candApps = applications
                  .filter((app) => app.candidateId === cand.candidateId)
                  .sort((a, b) => new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime());

                const primaryApp = candApps.length > 0 ? candApps[0] : null;
                const primaryJob = primaryApp ? jobs.find((j) => j.jobId === primaryApp.jobId) : null;
                const isPrimaryJobClosed = primaryJob?.status === "Closed";

                return (
                  <div
                    key={cand.candidateId}
                    className="p-5 rounded-2xl border transition-all duration-300 bg-white/80 backdrop-blur-md border-gray-150/80 hover:border-emerald-300 text-gray-600 shadow-sm"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold leading-tight text-gray-900">
                          {cand.fullName}
                        </h4>
                        <span className="text-[10px] font-mono font-medium block text-gray-400">
                          {cand.candidateId}
                        </span>
                      </div>
                      
                      {primaryApp ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm"
                          style={{ backgroundColor: getStageColorDot(primaryApp.stage) }}
                        >
                          <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
                          {primaryApp.stage}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-full text-[10px] font-semibold uppercase">
                          UNASSIGNED
                        </span>
                      )}
                    </div>

                    {/* Metadata Group */}
                    <div className="space-y-1.5 mb-4 text-xs text-gray-600">
                      {/* Bold fields indicator */}
                      <div>
                        {primaryApp ? (
                          <span>
                            <strong>Job:</strong>{" "}
                            <span className="font-bold px-1.5 py-0.5 rounded border transition-colors text-[#2D6A4F] bg-[#F0FAF4] border-emerald-100">{primaryApp.jobTitle}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Job: No linked applications</span>
                        )}
                      </div>

                      {/* Exact milestone date */}
                      <div>
                        {primaryApp ? (
                          <span className="text-gray-550 font-mono">
                            <strong>Date:</strong> {new Date(primaryApp.applicationDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-mono"><strong>Date:</strong> N/A</span>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="text-[11px] text-gray-400 font-medium">
                        <span>{cand.fullName}</span>
                        <span className="mx-1.5">|</span>
                        <span>{cand.email}</span>
                        {cand.phone && <span className="mx-1.5">|</span>}
                        <span>{cand.phone}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 mb-3" />

                    {/* Footer Action Row */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
                      {/* View dossier full details button/link */}
                      {primaryApp ? (
                        <button
                          onClick={() => onNavigateToApplication(primaryApp.applicationId)}
                          className="text-xs font-black tracking-wider flex items-center gap-1 cursor-pointer transition-all active:translate-x-1 py-1 text-[#2D6A4F] hover:text-[#1A3A2E]"
                        >
                          VIEW FULL APPLICATION DOSSIER →
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic py-1">No application files available</span>
                      )}

                      {/* Standard management controls packed beautifully */}
                      <div className="flex items-center justify-end gap-1.5 mt-2 sm:mt-0">
                        {/* Link Job button */}
                        <button
                          onClick={() => onApplyToJobClick(cand.candidateId, cand.fullName)}
                          title="Apply to active position"
                          className="p-1 px-2.5 rounded-lg border border-emerald-250 text-xs font-bold text-[#2D6A4F] bg-white hover:bg-emerald-50 flex items-center gap-1 cursor-pointer min-h-[44px]"
                        >
                          <Slicon name="link" size={13} />
                          Link
                        </button>

                        {/* Edit profile */}
                        <button
                          onClick={() => onEditCandidateClick(cand)}
                          title="Edit profile"
                          className="w-11 h-11 border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all cursor-pointer min-h-[44px] min-w-[44px]"
                        >
                          <Slicon name="edit" size={15} />
                        </button>

                        {/* Cascade Delete */}
                        <button
                          onClick={() => onDeleteCandidateClick(cand.candidateId)}
                          disabled={cand.hasHiredApplication}
                          title={cand.hasHiredApplication ? "Deletions blocked: Candidate hired in position." : "Delete candidate completely"}
                          className="w-11 h-11 border border-gray-100 rounded-xl text-gray-400 hover:text-red-655 hover:bg-red-50 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[44px] min-w-[44px]"
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
      )}

      {/* ==========================================
          TAB 2: APPLICATIONS LIST VIEW (R3.7)
          ========================================== */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {/* Applications Combinatorial Filter panel */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-150/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search text query */}
              <div className="relative w-full sm:w-60">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                  <Slicon name="search" size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Filter candidate/job..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-205 focus:outline-none focus:ring-2 focus:ring-[#52B788] text-sm"
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                />
              </div>

              {/* Jobs */}
              <div className="min-w-[130px]">
                <select
                  className="w-full h-10 px-3 bg-white border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-sm"
                  value={appJobFilter}
                  onChange={(e) => setAppJobFilter(e.target.value)}
                >
                  <option value="all">All Jobs</option>
                  {jobs.map((j) => (
                    <option key={j.jobId} value={j.jobId}>
                      {j.title} ({j.jobId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stages list */}
              <div className="min-w-[110px]">
                <select
                  className="w-full h-10 px-3 bg-white border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-sm"
                  value={appStageFilter}
                  onChange={(e) => setAppStageFilter(e.target.value)}
                >
                  <option value="all">All Stages</option>
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Interview">Interview</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Offer">Offer</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Outcomes recommendations */}
              <div className="min-w-[120px]">
                <select
                  className="w-full h-10 px-3 bg-white border border-gray-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-sm"
                  value={appRecFilter}
                  onChange={(e) => setAppRecFilter(e.target.value)}
                >
                  <option value="all">All Recs</option>
                  <option value="Strong Hire">Strong Hire</option>
                  <option value="Hire">Hire</option>
                  <option value="Hold">Hold</option>
                  <option value="Reject">Reject</option>
                </select>
              </div>

              {/* Clear */}
              {(appSearch || appJobFilter !== "all" || appStageFilter !== "all" || appRecFilter !== "all") && (
                <button
                  onClick={clearApplicationFilters}
                  className="px-3.5 h-10 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Slicon name="x" size={14} />
                  Clear
                </button>
              )}
            </div>

            <span className="text-xs text-gray-400 font-medium">
              Filtered: {filteredApplications.length} cases
            </span>
          </div>

          {/* Applications Data Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-150/80 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full border-collapse text-left text-sm table-auto">
                <thead>
                  <tr className="bg-[#F0FAF4]/60 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-4 px-6 sticky left-0 bg-white md:bg-transparent z-10 w-[160px]">
                      Candidate Name
                    </th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">Opening Job Tracker</th>
                    <th className="py-4 px-6">Pipeline Stage</th>
                    <th className="py-4 px-6 font-mono">Date</th>
                    <th className="py-4 px-6 text-right">View Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-400">
                        <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                          <Slicon name="inbox" size={44} className="text-gray-300 mb-3" />
                          <p className="font-semibold text-gray-700 text-sm mb-1">No applications</p>
                          <p className="text-xs text-gray-400">Modify combined filters or publish openings.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedApplications.map((app, index) => {
                      // Determine consecutive candidate duplicates
                      const isSameCandidate =
                        index > 0 &&
                        paginatedApplications[index - 1].candidateId === app.candidateId;

                      const assocJob = jobs.find((j) => j.jobId === app.jobId);
                      const isJobClosed = assocJob?.status === "Closed";
                      return (
                        <tr
                          key={app.applicationId}
                          onClick={() => onNavigateToApplication(app.applicationId)}
                          className={`transition-colors cursor-pointer border-b ${
                            isJobClosed
                              ? "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-50 shadow-none font-medium"
                              : "hover:bg-[#F0FAF4]/10 border-gray-100 text-gray-855"
                          }`}
                        >
                          {/* Name pinned left */}
                          <td className={`py-4 px-6 sticky left-0 z-10 font-bold shadow-sm md:shadow-none min-w-[160px] ${
                            isJobClosed
                              ? "bg-gray-50 border-gray-200 text-gray-500 md:bg-transparent"
                              : "bg-white hover:bg-slate-50 md:bg-transparent text-gray-900"
                          }`}>
                            <div className="flex items-center gap-2">
                              <div>
                                <span className={isJobClosed ? "text-gray-500" : "text-gray-900"}>{app.candidateName}</span>
                                <span className={`block text-[9px] font-mono font-medium ${
                                  isJobClosed ? "text-gray-400" : "text-gray-400"
                                }`}>
                                  {app.applicationId}
                                </span>
                              </div>
                              {isSameCandidate && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wide border font-mono ${
                                  isJobClosed
                                    ? "bg-gray-100 text-gray-400 border-gray-200 shadow-none"
                                    : "bg-slate-150 text-gray-500 border-gray-200"
                                }`}>
                                  same
                                </span>
                              )}
                            </div>
                          </td>

                          <td className={`py-4 px-6 ${isJobClosed ? "text-gray-400" : "text-gray-600"}`}>
                            {/* Fetch candidate's email directly or fallback */}
                            {candidates.find((c) => c.candidateId === app.candidateId)?.email || "N/A"}
                          </td>

                          <td className="py-4 px-6">
                            <div>
                              <span className={`block font-semibold ${isJobClosed ? "text-gray-500" : "text-gray-805"}`}>
                                {app.jobTitle}
                              </span>
                              <span className={`text-[10px] font-mono font-semibold block ${
                                isJobClosed ? "text-gray-400" : "text-gray-400"
                              }`}>
                                {app.jobId}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {isJobClosed ? (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase tracking-wider shadow-none border border-gray-200"
                              >
                                <span className="w-1.5 h-1.5 rounded-full inline-block bg-gray-400" />
                                {app.stage}
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-sm"
                                style={{ backgroundColor: getStageColorDot(app.stage) }}
                              >
                                <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
                                {app.stage}
                              </span>
                            )}
                          </td>

                          <td className={`py-4 px-6 font-mono text-xs ${isJobClosed ? "text-gray-400" : "text-gray-400"}`}>
                            {new Date(app.applicationDate).toLocaleDateString()}
                          </td>

                          <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className={`flex items-center justify-end gap-1.5 font-sans ${isJobClosed ? "pointer-events-none opacity-40" : ""}`}>
                              <button
                                onClick={() => {
                                  onNavigateToApplication(app.applicationId);
                                }}
                                className={`py-1.5 px-3 rounded-lg font-bold text-xs transition-all inline-flex items-center gap-1 cursor-pointer min-h-[38px] ${
                                  isJobClosed
                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-705 border border-slate-200"
                                    : "bg-slate-100 hover:bg-[#D8F3DC] hover:text-[#2D6A4F] text-gray-855"
                                }`}
                              >
                                Detail Page
                                <Slicon name="chevron-right" size={12} />
                              </button>

                              {/* Delete Application */}
                              <button
                                disabled={app.stage === "Hired" || app.stage === "Offer"}
                                onClick={() => {
                                  if (onDeleteApplicationClick) onDeleteApplicationClick(app);
                                }}
                                title={app.stage === "Hired" || app.stage === "Offer" ? "Blocked: Offer/Hired application cannot be deleted" : "Delete application permanently"}
                                className={`p-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center transition-all ${
                                  isJobClosed
                                    ? "border-red-200 text-red-500 bg-slate-50 hover:bg-red-50"
                                    : "border-red-200 text-red-655 bg-white hover:bg-red-50"
                                }`}
                              >
                                <Slicon name="trash" size={14} />
                              </button>

                              {/* Unlink Application */}
                              <button
                                disabled={app.stage === "Hired" || app.stage === "Offer"}
                                onClick={() => {
                                  if (onUnlinkApplicationClick) onUnlinkApplicationClick(app);
                                }}
                                title={app.stage === "Hired" || app.stage === "Offer" ? "Blocked: Offer/Hired application cannot be unlinked" : "Unlink candidate from job"}
                                className={`p-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center transition-all ${
                                  isJobClosed
                                    ? "border-amber-200 text-amber-600 bg-slate-50 hover:bg-amber-50"
                                    : "border-amber-200 text-amber-705 bg-white hover:bg-amber-50"
                                }`}
                              >
                                <Slicon name="unlink" size={14} />
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-[#F3F4F6]/20 py-4 px-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredApplications.length} total entries)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    className="p-1 px-3.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[38px] flex items-center justify-center gap-1"
                  >
                    <Slicon name="chevron-left" size={14} />
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                    className="p-1 px-3.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-650 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[38px] flex items-center justify-center gap-1"
                  >
                    Next
                    <Slicon name="chevron-right" size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile applications dossier cards list (md:hidden) */}
          <div className="md:hidden space-y-4">
            {paginatedApplications.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center text-gray-400 border border-gray-150 shadow-sm">
                <Slicon name="inbox" size={44} className="text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-700 text-sm mb-1">No applications found</p>
                <p className="text-xs text-gray-400">Modify combined filters or publish openings.</p>
              </div>
            ) : (
              paginatedApplications.map((app) => {
                const assocJob = jobs.find((j) => j.jobId === app.jobId);
                const isJobClosed = assocJob?.status === "Closed";

                return (
                  <div
                    key={app.applicationId}
                    className={`p-5 rounded-2xl border transition-all duration-305 ${
                      isJobClosed
                        ? "bg-gray-50 text-gray-500 border-gray-200 shadow-none hover:border-gray-200"
                        : "bg-white/80 backdrop-blur-md border-gray-150-80 hover:border-emerald-300 text-gray-650"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="space-y-0.5">
                        <h4 className={`text-sm font-bold leading-tight ${isJobClosed ? "text-gray-500" : "text-gray-900"}`}>
                          {app.candidateName}
                        </h4>
                        <span className={`text-[10px] uppercase font-mono tracking-wider font-semibold block ${isJobClosed ? "text-gray-400" : "text-gray-400"}`}>
                          {app.candidateId}
                        </span>
                      </div>
                      
                      {isJobClosed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gray-200 shadow-none">
                          <span className="w-1.5 h-1.5 rounded-full inline-block bg-gray-400" />
                          {app.stage}
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm"
                          style={{ backgroundColor: getStageColorDot(app.stage) }}
                        >
                          <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
                          {app.stage}
                        </span>
                      )}
                    </div>

                    {/* Metadata Group */}
                    <div className="space-y-1.5 mb-4 text-xs text-gray-600">
                      {/* Bold field indicator detailing linked Job title being pursued */}
                      <div>
                        <strong>Job:</strong>{" "}
                        <span className={`font-bold px-1.5 py-0.5 rounded border transition-colors ${
                          isJobClosed
                            ? "text-gray-500 bg-gray-100 border-gray-200"
                            : "text-[#2D6A4F] bg-[#F0FAF4] border border-emerald-100"
                        }`}>{app.jobTitle}</span>
                      </div>

                      {/* Exact milestone tracking date */}
                      <div>
                        <strong>Date:</strong> <span className={`font-mono ${isJobClosed ? "text-gray-400" : "text-gray-505"}`}>{new Date(app.applicationDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}</span>
                      </div>

                      {/* Optional Contact Context */}
                      <div className="text-[11px] text-gray-400 font-mono">
                        {app.email}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 mb-3" />

                    {/* Footer Action Row */}
                    <div className="flex items-center justify-between">
                      {/* Full-width aligned secondary action link at the bottom right */}
                      <button
                        onClick={() => onNavigateToApplication(app.applicationId)}
                        className={`text-xs font-black tracking-wider flex items-center gap-1 cursor-pointer transition-all active:translate-x-1 py-1 ${
                          isJobClosed ? "text-gray-400 hover:text-gray-500" : "text-[#2D6A4F] hover:text-[#1A3A2E]"
                        }`}
                      >
                        VIEW FULL APPLICATION DOSSIER →
                      </button>

                      {/* Management Delete/Unlink controls if any */}
                      <div className={`flex items-center gap-1.5 ${isJobClosed ? "pointer-events-none opacity-40 animate-none shadow-none" : ""}`}>
                        {onUnlinkApplicationClick && (
                          <button
                            onClick={() => onUnlinkApplicationClick(app)}
                            title="Unlink Candidate Profile from Job"
                            className="w-11 h-11 border border-gray-100 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
                          >
                            <Slicon name="unlink" size={15} />
                          </button>
                        )}
                        {onDeleteApplicationClick && (
                          <button
                            onClick={() => onDeleteApplicationClick(app)}
                            title="Delete Application and Feedback evaluations"
                            className="w-11 h-11 border border-gray-100 rounded-xl text-gray-400 hover:text-red-650 hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
                          >
                            <Slicon name="trash" size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Mobile query paging controls */}
            {totalPages > 1 && (
              <div className="py-2 flex items-center justify-between">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((c) => Math.max(c - 1, 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="p-1 px-3.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-650 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px] flex items-center justify-center gap-1"
                >
                  <Slicon name="chevron-left" size={14} />
                  Prev
                </button>
                <span className="text-xs text-gray-400 font-bold font-mono">
                  {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((c) => Math.min(c + 1, totalPages));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="p-1 px-3.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#2D6A4F] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px] flex items-center justify-center gap-1"
                >
                  Next
                  <Slicon name="chevron-right" size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
