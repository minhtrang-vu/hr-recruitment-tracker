import React from "react";
import { Job, Candidate, Application } from "../../types";
import { Slicon } from "../Slicon";
import { motion } from "motion/react";

interface DashboardScreenProps {
  jobs: Job[];
  candidates: Candidate[];
  applications: Application[];
  onNavigateToTab: (tab: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  jobs,
  candidates,
  applications,
  onNavigateToTab,
}) => {
  const [selectedCohortJobId, setSelectedCohortJobId] = React.useState<string>("all");

  const openJobsOnly = jobs.filter((j) => j.status === "Open");
  const openJobIds = openJobsOnly.map((j) => j.jobId);

  // Filter cohortApplications: By default only open positions (F1.1), strictly isolated/partitioned by jobId
  const cohortApplications = applications.filter((app) => {
    if (selectedCohortJobId === "all") {
      return openJobIds.includes(app.jobId);
    } else {
      return app.jobId === selectedCohortJobId;
    }
  });

  const openJobs = openJobsOnly.length;
  const totalCandidates = candidates.length;
  const activeApps = cohortApplications.filter(
    (app) => app.stage !== "Hired" && app.stage !== "Rejected"
  ).length;
  const hiredApps = cohortApplications.filter((app) => app.stage === "Hired").length;

  const totalApplicationsCount = cohortApplications.length;

  // F1.2 CVR calculation & reached stage counts
  const stagesList = ["Applied", "Screening", "Interview", "Assessment", "Offer", "Hired"];

  const getStageNameForApp = (app: Application) => {
    if (app.stage === "Rejected") {
      return app.rejectedAtStage || "Applied";
    }
    return app.stage;
  };

  const getStageSurvivorsCount = (stageName: string) => {
    if (stageName === "Applied") return totalApplicationsCount;
    if (stageName === "Hired") {
      return cohortApplications.filter((app) => app.stage === "Hired").length;
    }
    const idx = stagesList.indexOf(stageName);
    if (idx === -1) return 0;

    const higherStages = stagesList.slice(idx + 1);

    // Candidates who reached higher stages (passed from S)
    const nPassed = cohortApplications.filter((app) => {
      const appStage = getStageNameForApp(app);
      return higherStages.includes(appStage);
    }).length;

    // Candidates currently active in stage S (not rejected)
    const nActive = cohortApplications.filter((app) => app.stage === stageName).length;

    return nPassed + nActive;
  };

  const appliedCount = totalApplicationsCount;
  const screeningCount = getStageSurvivorsCount("Screening");
  const interviewCount = getStageSurvivorsCount("Interview");
  const assessmentCount = getStageSurvivorsCount("Assessment");
  const offerCount = getStageSurvivorsCount("Offer");
  const hiredCount = getStageSurvivorsCount("Hired");
  const rejectedCount = cohortApplications.filter((app) => app.stage === "Rejected").length;

  const getCVR = (stageName: string) => {
    if (stageName === "Applied") return 100; // Standard Exception
    
    if (stageName === "Hired") {
      // Global Yield Rate Calculation specifically for the terminal Hired stage
      return totalApplicationsCount === 0 ? 0 : Math.round((hiredApps / totalApplicationsCount) * 100);
    }

    const idx = stagesList.indexOf(stageName);
    if (idx === -1) return 0;

    const higherStages = stagesList.slice(idx + 1);
    
    // Candidates who reached higher stages (passed from S)
    const nPassed = cohortApplications.filter((app) => {
      const appStage = getStageNameForApp(app);
      return higherStages.includes(appStage);
    }).length;

    // Candidates currently active in stage S (not rejected)
    const nActive = cohortApplications.filter((app) => app.stage === stageName).length;

    // Candidates rejected specifically at stage S
    const nRejected = cohortApplications.filter((app) => app.stage === "Rejected" && app.rejectedAtStage === stageName).length;

    const denominator = nPassed + nActive + nRejected;
    return denominator === 0 ? 0 : Math.round(((nPassed + nActive) / denominator) * 100);
  };

  // Determine Overall Recruitment Health Score / Throughput Ratio (F1.3)
  const countOfHired = cohortApplications.filter((app) => app.stage === "Hired").length;
  const countOfActive = cohortApplications.filter((app) =>
    ["Applied", "Screening", "Interview", "Assessment", "Offer"].includes(app.stage)
  ).length;
  const throughputRatio = totalApplicationsCount > 0 ? ((countOfHired + countOfActive) / totalApplicationsCount) * 100 : 0;
  const healthScore = Math.round(throughputRatio);

  // Dynamic Status & Gauge themes based on throughputRatio:
  let gaugeColor = "#52B788"; // Accent Green
  let statusText = "OPTIMAL RATE";
  let statusBgColor = "bg-[#52B788]";
  let statusTextColor = "text-[#52B788]";

  if (throughputRatio >= 70) {
    gaugeColor = "#74C69D"; // Accent Green theme
    statusText = "EXCELLENT VELOCITY";
    statusBgColor = "bg-[#74C69D]";
    statusTextColor = "text-[#74C69D]";
  } else if (throughputRatio >= 40) {
    gaugeColor = "#52B788"; // Balanced Green theme
    statusText = "OPTIMAL RATE";
    statusBgColor = "bg-[#52B788]";
    statusTextColor = "text-[#52B788]";
  } else {
    gaugeColor = "#EF4444"; // Warning Red/Amber theme
    statusText = "BOTTLENECK WARNING";
    statusBgColor = "bg-[#EF4444]";
    statusTextColor = "text-[#EF4444]";
  }

  // Success Placement logic within the selected cohort
  const resolvedOutcomes = hiredCount + rejectedCount;

  const stagesData = [
    { name: "Applied", count: appliedCount, color: "#3B82F6", prevCount: totalApplicationsCount },
    { name: "Screening", count: screeningCount, color: "#10B981", prevCount: appliedCount },
    { name: "Interview", count: interviewCount, color: "#F59E0B", prevCount: screeningCount },
    { name: "Assessment", count: assessmentCount, color: "#6366F1", prevCount: interviewCount },
    { name: "Offer", count: offerCount, color: "#EC4899", prevCount: assessmentCount },
    { name: "Hired", count: hiredCount, color: "#14B8A6", prevCount: offerCount },
  ];

  const hasData = jobs.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[460px] text-center max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#2D6A4F] flex items-center justify-center mb-5 animate-bounce-slow">
          <Slicon name="briefcase" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 tracking-tight mb-2">
          No recruitment data yet
        </h3>
        <p className="text-gray-500 text-sm max-w-sm mb-6 leading-relaxed">
          Start by creating your first job opening to publish positions, add prospective candidates, and manage pipelines.
        </p>
        <button
          onClick={() => onNavigateToTab("jobs")}
          className="py-3 px-6 rounded-xl bg-[#2D6A4F] hover:bg-[#1A3A2E] text-white text-sm font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Slicon name="plus" size={16} />
          Create First Job Opening
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hiring Cycle Cohort Selector (F1.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-150/80 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2 animate-fade-in">
            <span className="w-2.5 h-2.5 bg-[#2D6A4F] rounded-full animate-pulse" />
            Active Hiring Workspace
          </h2>
          <p className="text-xs text-gray-400">
            Real-time pipeline metrics strictly isolated to open job cohorts to eliminate historical bias.
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="cohort-select" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Hiring Cohort:
          </label>
          <select
            id="cohort-select"
            className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52B788] text-xs font-semibold text-gray-750 cursor-pointer min-w-[240px]"
            value={selectedCohortJobId}
            onChange={(e) => setSelectedCohortJobId(e.target.value)}
          >
            <option value="all">All Active Positions (Aggregated)</option>
            {openJobsOnly.map((j) => (
              <option key={j.jobId} value={j.jobId}>
                {j.title} ({j.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Open Jobs */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-gray-150/80 shadow-sm min-h-[110px] flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Open Jobs
            </span>
            <span className="text-3xl font-extrabold text-gray-950 mt-1 block leading-none">
              {openJobs}
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100/50 flex items-center gap-1 text-xs font-semibold text-[#2D6A4F]">
            <Slicon name="trending-up" size={14} className="text-[#52B788]" />
            <span>↑ 5% than last month</span>
          </div>
        </div>

        {/* Card 2: Total Candidates */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-gray-150/80 shadow-sm min-h-[110px] flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Total Candidates
            </span>
            <span className="text-3xl font-extrabold text-gray-950 mt-1 block leading-none">
              {totalCandidates}
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100/50 flex items-center gap-1 text-xs font-semibold text-[#2D6A4F]">
            <Slicon name="trending-up" size={14} className="text-[#52B788]" />
            <span>↑ 12% than last month</span>
          </div>
        </div>

        {/* Card 3: Active Apps */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-gray-150/80 shadow-sm min-h-[110px] flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Active Apps
            </span>
            <span className="text-3xl font-extrabold text-gray-950 mt-1 block leading-none">
              {activeApps}
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100/50 flex items-center gap-1 text-xs font-semibold text-[#2D6A4F]">
            <Slicon name="trending-up" size={14} className="text-[#52B788]" />
            <span>↑ 15% than last month</span>
          </div>
        </div>

        {/* Card 4: Hires Made */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-gray-150/80 shadow-sm min-h-[110px] flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Hired Applications
            </span>
            <span className="text-3xl font-extrabold text-gray-950 mt-1 block leading-none">
              {hiredApps}
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100/50 flex items-center gap-1 text-xs font-semibold text-[#2D6A4F]">
            <Slicon name="trending-up" size={14} className="text-[#52B788]" />
            <span>↑ 8% than last month</span>
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column 1-2: Conversion Funnel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150/80 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Hiring Funnel & Conversion Rates
              </h4>
              <p className="text-xs text-gray-400">
                Performance funnel tracking candidate count reductions through successive stages
              </p>
            </div>
            <span className="text-[11px] bg-[#F0FAF4] text-[#2D6A4F] px-2.5 py-1 rounded-lg border border-[#D8F3DC] font-semibold">
              Total Applicants: {totalApplicationsCount}
            </span>
          </div>

          {/* Funnel rows list */}
          <div className="space-y-4">
            {stagesData.map((stage, idx) => {
              // Calculate CVR using stage-specific attrition formula (F1.2)
              const convRate = getCVR(stage.name);

              // Percent width of bar (scaled against maximum stage value to maintain graphic logic)
              const maxCount = Math.max(...stagesData.map((s) => s.count)) || 1;
              const barPercent = Math.round((stage.count / maxCount) * 100) || 0;

              return (
                <div key={stage.name} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  {/* Stage Label name */}
                  <div className="w-24 md:text-right flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest block">
                      {stage.name}
                    </span>
                  </div>

                  {/* Stage row graphic */}
                  <div className="flex-grow flex items-center gap-3">
                    {/* The bar */}
                    <div className="flex-grow h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barPercent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full rounded-r-lg opacity-85 hover:opacity-100 transition-opacity flex items-center justify-end px-3"
                        style={{ background: "linear-gradient(90deg, #0B2B26 0%, #8EB69B 100%)" }}
                      >
                        {stage.count > 0 && barPercent > 12 && (
                          <span className="text-[11px] font-extrabold text-white text-right leading-none">
                            {stage.count}
                          </span>
                        )}
                      </motion.div>
                      {/* Count fallback if bar too narrow */}
                      {(stage.count === 0 || barPercent <= 12) && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11.5px] font-bold text-gray-400">
                          {stage.count}
                        </span>
                      )}
                    </div>

                    {/* Conversion Rate indicator */}
                    <div className="w-16 text-right flex-shrink-0">
                      <span className="text-xs font-mono font-bold text-gray-700 block">
                        {convRate}%
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium block uppercase tracking-tighter">
                        {idx === 0 ? "of total" : "stages conv."}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dedicated Rejected details */}
          <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 bg-red-50/50 rounded-xl border border-red-100 flex items-center gap-3 col-span-2">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <Slicon name="x" size={18} />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-red-800 uppercase tracking-wider">
                  Rejected Drop-Offs
                </span>
                <span className="text-xl font-extrabold text-red-955 leading-none block mt-0.5">
                  {rejectedCount} candidates
                </span>
              </div>
            </div>
            
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-3 col-span-2">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#2D6A4F] flex items-center justify-center flex-shrink-0">
                <Slicon name="check-circle" size={18} />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Success Placement Rate
                </span>
                <span className="text-xl font-extrabold text-[#2D6A4F] leading-none block mt-0.5">
                  {resolvedOutcomes > 0 ? Math.round((hiredCount / resolvedOutcomes) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Card: Circular Score Gauge (Radial Gauge) */}
        <div className="bg-[#0F1F18] p-6 rounded-2xl shadow-xl text-white relative overflow-hidden flex flex-col justify-between group">
          {/* Subtle Radial Glow from Top Left */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-radial from-[#2D6A4F]/40 to-transparent -translate-x-12 -translate-y-12 pointer-events-none rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />

          <div className="relative z-15">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#52B788] mb-1">
              Health Metric
            </h4>
            <h3 className="text-md font-bold tracking-tight text-white mb-6">
              Recruitment Throughput Ratio
            </h3>

            {/* Radial score gauge indicator */}
            <div className="flex flex-col items-center justify-center py-6 my-2 relative">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background tracks */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#1A3A2E"
                  strokeWidth="8"
                />
                {/* Foreground indicator filled path using gaugeColor (F1.3) */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={gaugeColor}
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * healthScore) / 100 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              {/* Score text inside circular gauge */}
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold tracking-tight block text-white leading-none">
                  {healthScore}%
                </span>
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider block mt-1">
                  Score Value
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-15 mt-4 pt-4 border-t border-[#1A3A2E]/80 space-y-2">
            <p className="text-xs text-[#D8F3DC] leading-relaxed">
              Based on placement conversion ratios, current pipeline loads, active open target rates, and interview round distributions.
            </p>
            <div className={`flex items-center gap-2 text-[10px] ${statusTextColor} font-bold uppercase tracking-wide`}>
              <span>Status: {statusText}</span>
              <span className={`w-1.5 h-1.5 ${statusBgColor} rounded-full animate-pulse`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
