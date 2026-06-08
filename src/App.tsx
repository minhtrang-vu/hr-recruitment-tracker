import { useState, useEffect, useCallback } from "react";
import {
  getJobs,
  saveJob,
  deleteJob,
  getCandidates,
  saveCandidate,
  deleteCandidate,
  getApplications,
  saveApplication,
  deleteApplication,
  getFeedbacks,
  saveFeedback,
  handleUpdate,
} from "./lib/db";
import { auth, database } from "./lib/firebase";
import { ref, onValue } from "firebase/database";
import { signInAnonymously } from "firebase/auth";
import { Job, Candidate, Application, Feedback } from "./types";
import { Slicon, SliconName } from "./components/Slicon";
import { ToastProvider, useToast } from "./components/Toast";

// Core Screen Imports
import { DashboardScreen } from "./components/screens/DashboardScreen";
import { JobsScreen } from "./components/screens/JobsScreen";
import { CandidatesScreen } from "./components/screens/CandidatesScreen";
import { PipelineScreen } from "./components/screens/PipelineScreen";
import { FeedbackScreen } from "./components/screens/FeedbackScreen";
import { AiGeneratorScreen } from "./components/screens/AiGeneratorScreen";
import { ApplicationDetailScreen } from "./components/screens/ApplicationDetailScreen";
import { EmailDispenserScreen } from "./components/screens/EmailDispenserScreen";

// Modal Imports
import { ModalBase } from "./components/ModalBase";
import {
  ConfirmModal,
  JobModal,
  CandidateModal,
  ApplyJobModal,
  FeedbackModal,
  StageTransitionModal,
  BatchEmailDispatcherModal,
} from "./components/Modals";

function AppContent() {
  const { showToast } = useToast();

  // Primary Collections State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [feedbacksMap, setFeedbacksMap] = useState<Record<string, Feedback[]>>({});
  const [loading, setLoading] = useState(true);

  // Layout & Navigation State
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [selectedPipelineJobId, setSelectedPipelineJobId] = useState("");
  const [selectedFeedbackAppId, setSelectedFeedbackAppId] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  // Modal Visibility States
  const [modalType, setModalType] = useState<
    | null
    | "create_job"
    | "edit_job"
    | "close_job"
    | "delete_job"
    | "create_cand"
    | "edit_cand"
    | "delete_cand"
    | "link_job"
    | "feedback"
    | "transition"
    | "reject_app"
    | "cycle_email"
    | "delete_app"
    | "unlink_app"
  >(null);

  // Reference payload entities for modals
  const [editingJobRef, setEditingJobRef] = useState<Job | null>(null);
  const [editingCandRef, setEditingCandRef] = useState<Candidate | null>(null);
  const [targetCandIdRef, setTargetCandIdRef] = useState("");
  const [targetCandNameRef, setTargetCandNameRef] = useState("");
  const [targetAppIdRef, setTargetAppIdRef] = useState("");
  const [targetAppRef, setTargetAppRef] = useState<Application | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState("");

  // ==========================================
  // REAL TIME DATABASE STATE LOADER (REST GET)
  // ==========================================
  const reloadState = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const fetchedJobs = await getJobs();
      const fetchedCandidates = await getCandidates();
      const fetchedApps = await getApplications();

      // Deduplicate fetched content key-wise to prevent duplicate key rendering issues
      const deduplicatedJobsMap: Record<string, Job> = {};
      fetchedJobs.forEach((job) => {
        if (job && job.jobId) {
          deduplicatedJobsMap[job.jobId] = job;
        }
      });
      const uniqueJobs = Object.values(deduplicatedJobsMap);

      const deduplicatedCandidatesMap: Record<string, Candidate> = {};
      fetchedCandidates.forEach((cand) => {
        if (cand && cand.candidateId) {
          deduplicatedCandidatesMap[cand.candidateId] = cand;
        }
      });
      const uniqueCandidates = Object.values(deduplicatedCandidatesMap);

      const deduplicatedAppsMap: Record<string, Application> = {};
      fetchedApps.forEach((app) => {
        if (app && app.applicationId) {
          deduplicatedAppsMap[app.applicationId] = app;
        }
      });
      const uniqueApps = Object.values(deduplicatedAppsMap);

      setJobs(uniqueJobs);
      setCandidates(uniqueCandidates);
      setApplications(uniqueApps);

      const map: Record<string, Feedback[]> = {};
      await Promise.all(
        uniqueApps.map(async (app) => {
          const rawApp = app as any;
          if (rawApp.feedbacks) {
            map[app.applicationId] = Object.values(rawApp.feedbacks);
          } else {
            const fbs = await getFeedbacks(app.applicationId);
            map[app.applicationId] = fbs;
          }
        })
      );
      setFeedbacksMap(map);
    } catch (err) {
      console.error("Failed synchronizing RTDB state:", err);
      showToast("Error updating storage links", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showToast]);

  // Boot logic with Anonymous Auth & Real-time Database subscription
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    signInAnonymously(auth)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
          console.log("Anonymously authenticated successfully! User ID:", user.uid);
          
          // Once signed in, listen to the root path (/)
          const rootRef = ref(database, "/");
          unsubscribe = onValue(
            rootRef,
            (snapshot) => {
              const val = snapshot.val();
              if (val) {
                // Parse jobs safely
                const rawJobs = val.jobs || {};
                const fetchedJobs = Object.keys(rawJobs).map((key) => {
                  const item = rawJobs[key];
                  return {
                    ...item,
                    jobId: item.jobId || key,
                  };
                }) as Job[];

                const deduplicatedJobsMap: Record<string, Job> = {};
                fetchedJobs.forEach((job) => {
                  if (job && job.jobId) {
                    deduplicatedJobsMap[job.jobId] = job;
                  }
                });
                setJobs(Object.values(deduplicatedJobsMap));

                // Parse candidates safely
                const rawCandidates = val.candidates || {};
                const fetchedCandidates = Object.keys(rawCandidates).map((key) => {
                  const item = rawCandidates[key];
                  return {
                    ...item,
                    candidateId: item.candidateId || key,
                  };
                }) as Candidate[];

                const deduplicatedCandidatesMap: Record<string, Candidate> = {};
                fetchedCandidates.forEach((cand) => {
                  if (cand && cand.candidateId) {
                    deduplicatedCandidatesMap[cand.candidateId] = cand;
                  }
                });
                setCandidates(Object.values(deduplicatedCandidatesMap));

                // Parse applications safely
                const rawApplications = val.applications || {};
                const fetchedApps = Object.keys(rawApplications).map((key) => {
                  const item = rawApplications[key];
                  return {
                    ...item,
                    applicationId: item.applicationId || key,
                  };
                }) as Application[];

                const deduplicatedAppsMap: Record<string, Application> = {};
                fetchedApps.forEach((app) => {
                  if (app && app.applicationId) {
                    deduplicatedAppsMap[app.applicationId] = app;
                  }
                });
                const uniqueApps = Object.values(deduplicatedAppsMap);
                setApplications(uniqueApps);

                // Parse feedback mapping (e.g. key feedbacks)
                const map: Record<string, Feedback[]> = {};
                uniqueApps.forEach((app) => {
                  const appObj = rawApplications[app.applicationId] || {};
                  if (appObj.feedbacks) {
                    map[app.applicationId] = Object.values(appObj.feedbacks);
                  } else {
                    map[app.applicationId] = [];
                  }
                });
                setFeedbacksMap(map);
              } else {
                setJobs([]);
                setCandidates([]);
                setApplications([]);
                setFeedbacksMap({});
              }
              setLoading(false);
            },
            (dbErr) => {
              console.error("Database subscription error:", dbErr);
              setLoading(false);
            }
          );
        }
      })
      .catch((error) => {
        console.log("Authentication failed:", error);
        setLoading(false);
      });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Reactive hash location router (R1.5)
  useEffect(() => {
    const parseUrlHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#applications/")) {
        const appId = hash.replace("#applications/", "");
        setSelectedApplicationId(appId);
        setCurrentScreen("application-detail");
      } else if (hash.startsWith("#") && hash.length > 1) {
        const screenKey = hash.slice(1);
        setCurrentScreen(screenKey);
        setSelectedApplicationId("");
      } else {
        setCurrentScreen("dashboard");
        setSelectedApplicationId("");
      }
    };

    window.addEventListener("hashchange", parseUrlHash);
    parseUrlHash();

    return () => window.removeEventListener("hashchange", parseUrlHash);
  }, []);

  const navigateTo = (screenKey: string) => {
    window.location.hash = screenKey;
  };

  // ==========================================
  // UNIFIED DECOUPLED CUSTOM EVENT ENGINE (R7.5)
  // ==========================================
  useEffect(() => {
    const handleTriggerAddJob = () => {
      setEditingJobRef(null);
      setModalType("create_job");
    };
    const handleTriggerAddCandidate = () => {
      setEditingCandRef(null);
      setModalType("create_cand");
    };
    const handleTriggerAddFeedback = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail || {};
      setTargetAppIdRef(detail.appId || "");
      setTargetCandNameRef(detail.candidateName || "");
      setModalType("feedback");
    };
    const handleTriggerRefreshDiagnostics = async () => {
      showToast("Running database diagnostics...", "success");
      await reloadState();
      showToast("Database diagnostics complete: telemetry states synchronized.", "success");
    };

    window.addEventListener("trigger-add-job", handleTriggerAddJob);
    window.addEventListener("trigger-add-candidate", handleTriggerAddCandidate);
    window.addEventListener("trigger-add-feedback", handleTriggerAddFeedback);
    window.addEventListener("trigger-refresh-diagnostics", handleTriggerRefreshDiagnostics);

    return () => {
      window.removeEventListener("trigger-add-job", handleTriggerAddJob);
      window.removeEventListener("trigger-add-candidate", handleTriggerAddCandidate);
      window.removeEventListener("trigger-add-feedback", handleTriggerAddFeedback);
      window.removeEventListener("trigger-refresh-diagnostics", handleTriggerRefreshDiagnostics);
    };
  }, [reloadState, showToast]);

  // ==========================================
  // STATE MUTATIONS SYNCS
  // ==========================================

  // Job Save
  const handleSaveJob = async (job: Job) => {
    const isEdit = !!editingJobRef;
    const success = await saveJob(job);
    if (success) {
      showToast(
        isEdit ? `Job ${job.jobId} details updated` : `Job Sourcing Position ${job.jobId} generated successfully!`,
        "success"
      );
      reloadState(true);
    } else {
      showToast("Failed to save Job position", "error");
    }
    setEditingJobRef(null);
  };

  // Job Close cycle
  const handleConfirmCloseJob = async () => {
    if (!editingJobRef) return;
    const updatedJob: Job = { ...editingJobRef, status: "Closed" };
    const success = await saveJob(updatedJob);
    if (success) {
      showToast(`Position Sourcing ${editingJobRef.jobId} marked as Closed`, "success");
      
      // Auto-trigger custom dialog prompt choice to set end-of-cycle emails right away (R6.11 loop)
      setTargetCandIdRef(editingJobRef.jobId);
      setTargetCandNameRef(editingJobRef.title);
      setModalType("cycle_email");
      reloadState(true);
    } else {
      showToast("Failed updating job closure", "error");
    }
    setEditingJobRef(null);
  };

  // Job Cascade Delete
  const handleConfirmDeleteJob = async () => {
    if (!deleteTargetId) return;
    const success = await deleteJob(deleteTargetId);
    if (success) {
      showToast(`Job ${deleteTargetId} and associated candidate submissions cascade deleted!`, "success");
      reloadState(true);
    } else {
      showToast("Removal failed", "error");
    }
    setDeleteTargetId("");
  };

  // Candidate Save
  const handleSaveCandidate = async (candidate: Candidate) => {
    const isEdit = !!editingCandRef;
    const success = await saveCandidate(candidate);
    if (success) {
      showToast(isEdit ? `Profile details sync success` : `Master candidate profile created.`, "success");
      reloadState(true);
    } else {
      showToast("Failed to save profile on ledger", "error");
    }
    setEditingCandRef(null);
  };

  // Candidate Deletions & checks
  const handleConfirmDeleteCand = async () => {
    if (!deleteTargetId) return;
    const res = await deleteCandidate(deleteTargetId);
    if (res.success) {
      showToast("Profile and cascade applications wiped.", "success");
      reloadState(true);
    } else {
      // Hired Candidate Deletion Protection (R3.5 / CD8)
      showToast(res.error || "Deletions restricted.", "error");
    }
    setDeleteTargetId("");
  };

  // Create Application (Linking Candidate to Job Position)
  const handleCreateApplication = async (data: { jobId: string; jobTitle: string; cvLink: string }) => {
    const candidateName = targetCandNameRef;
    const candidateId = targetCandIdRef;

    // R3.2 Strict ongoing duplicate validation check
    const activeStages = ["Applied", "Screening", "Interview", "Assessment", "Offer"];
    const ongoingDupe = applications.find(
      (app) => app.candidateId === candidateId && app.jobId === data.jobId
    );
    if (ongoingDupe && activeStages.includes(ongoingDupe.stage)) {
      showToast("This candidate has already applied for this position and their application is currently active.", "error");
      return;
    }
    
    const newApp: Application = {
      applicationId: "APP" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      candidateId,
      candidateName,
      jobId: data.jobId,
      jobTitle: data.jobTitle,
      stage: "Applied",
      cvLink: data.cvLink,
      applicationDate: new Date().toISOString(),
      lastActivityDate: new Date().toISOString(),
    };

    const success = await saveApplication(newApp);
    if (success) {
      showToast(`Linked ${candidateName} to ${data.jobTitle}`, "success");
      reloadState(true);
    } else {
      showToast("Failed saving application entry", "error");
    }
  };

  // Pass Candidate Round (R4.4)
  const handlePassApplication = (app: Application) => {
    const stagesList = ["Applied", "Screening", "Interview", "Assessment", "Offer", "Hired"];
    const idx = stagesList.indexOf(app.stage);
    if (idx === -1 || idx === stagesList.length - 1) return;

    const nextStg = stagesList[idx + 1];
    setTargetAppRef(app);
    setTargetCandNameRef(nextStg); // temporary slot reuse
    setModalType("transition");
  };

  const handleConfirmTransition = async () => {
    if (!targetAppRef) return;
    const stagesList = ["Applied", "Screening", "Interview", "Assessment", "Offer", "Hired"];
    const idx = stagesList.indexOf(targetAppRef.stage);
    const nextStg = stagesList[idx + 1];

    const updatedApp: Application = {
      ...targetAppRef,
      stage: nextStg,
      lastActivityDate: new Date().toISOString(),
    };

    const success = await saveApplication(updatedApp);
    if (success) {
      showToast(`Candidate advanced to: ${nextStg}`, "success");
      reloadState(true);
    } else {
      showToast("Advancement error", "error");
    }
    setTargetAppRef(null);
  };

  // Reject Candidate Confirm triggers
  const handleRejectApplication = (app: Application) => {
    setTargetAppRef(app);
    setModalType("reject_app");
  };

  const handleConfirmReject = async () => {
    if (!targetAppRef) return;
    const updatedApp: Application = {
      ...targetAppRef,
      stage: "Rejected",
      rejectedAtStage: targetAppRef.stage,
      lastActivityDate: new Date().toISOString(),
    };

    const success = await saveApplication(updatedApp);
    if (success) {
      showToast("Candidate marked as Rejected", "success");
      reloadState(true);
    } else {
      showToast("Rejection update failed", "error");
    }
    setTargetAppRef(null);
  };

  // Delete / Unlink Application action triggers
  const handleDeleteApplication = (app: Application) => {
    if (app.stage === "Hired" || app.stage === "Offer") {
      showToast("Blocked: Applications in Offer or Hired stages cannot be deleted.", "error");
      return;
    }
    setTargetAppRef(app);
    setModalType("delete_app");
  };

  const handleConfirmDeleteApp = async () => {
    if (!targetAppRef) return;
    if (targetAppRef.stage === "Hired" || targetAppRef.stage === "Offer") {
      showToast("Blocked: Applications in Offer or Hired stages cannot be deleted.", "error");
      return;
    }
    const success = await deleteApplication(targetAppRef.applicationId);
    if (success) {
      showToast("Application deleted completely", "success");
      reloadState(true);
      if (selectedApplicationId === targetAppRef.applicationId) {
        setSelectedApplicationId("");
        const prev = sessionStorage.getItem("active_back_tab") || "candidates";
        navigateTo(prev);
      }
    } else {
      showToast("Application deletion failed", "error");
    }
    setTargetAppRef(null);
    setModalType(null);
  };

  const handleUnlinkApplication = (app: Application) => {
    if (app.stage === "Hired" || app.stage === "Offer") {
      showToast("Blocked: Applications in Offer or Hired stages cannot be unlinked.", "error");
      return;
    }
    setTargetAppRef(app);
    setModalType("unlink_app");
  };

  const handleConfirmUnlinkApp = async () => {
    if (!targetAppRef) return;
    if (targetAppRef.stage === "Hired" || targetAppRef.stage === "Offer") {
      showToast("Blocked: Applications in Offer or Hired stages cannot be unlinked.", "error");
      return;
    }
    const success = await deleteApplication(targetAppRef.applicationId);
    if (success) {
      showToast("Candidate successfully unlinked from job position", "success");
      reloadState(true);
      if (selectedApplicationId === targetAppRef.applicationId) {
        setSelectedApplicationId("");
        const prev = sessionStorage.getItem("active_back_tab") || "candidates";
        navigateTo(prev);
      }
    } else {
      showToast("Unlink operation failed", "error");
    }
    setTargetAppRef(null);
    setModalType(null);
  };

  // Save Interview Round Feedback Assessment
  const handleSaveFeedback = async (feedback: Feedback) => {
    const appId = targetAppIdRef;
    const success = await saveFeedback(appId, feedback);
    if (success) {
      showToast(`Core review assessment filed of interviewer: ${feedback.interviewer}!`, "success");
      reloadState(true);
    } else {
      showToast("Evaluation log failed to persist", "error");
    }
  };

  // Batch Email Dispatch trigger
  const handleDispatchBatchEmails = async (appIds: string[], targetStage: "Hired" | "Rejected") => {
    let changeCount = 0;
    for (const appId of appIds) {
      const app = applications.find((a) => a.applicationId === appId);
      if (!app) continue;

      const logsObj = app.batchEmailLogs || {};
      const updatedLogs =
        targetStage === "Hired"
          ? { ...logsObj, hiredOfferSent: true, hiredOfferSentDate: new Date().toISOString() }
          : { ...logsObj, rejectedNotificationSent: true, rejectedNotificationSentDate: new Date().toISOString() };

      const updatedApp: Application = {
        ...app,
        batchEmailLogs: updatedLogs,
        // F7.4 Auto advance intermediate active candidates to Rejected terminal stage
        stage: targetStage === "Rejected" ? "Rejected" : app.stage,
        rejectedAtStage: targetStage === "Rejected" ? app.stage : app.rejectedAtStage,
        lastActivityDate: new Date().toISOString(),
      };

      await saveApplication(updatedApp);
      changeCount++;
    }

    showToast(`Batch email loop processed! Logs written to ${changeCount} lines.`, "success");
    reloadState(true);
  };

  // Close cycle popup choice to open batch dispenser
  const handleTriggerCycleEmailFromClosedChoice = (launchDispenser: boolean) => {
    setModalType(null);
    if (launchDispenser) {
      navigateTo("email-dispenser");
    }
  };

  // ==========================================
  // SIDEBAR & HEADER BAR RENDERS
  // ==========================================
  const sidebarItems: { key: string; label: string; icon: SliconName }[] = [
    { key: "dashboard", label: "Dashboard", icon: "trending-up" },
    { key: "jobs", label: "Jobs", icon: "briefcase" },
    { key: "candidates", label: "Candidates", icon: "users" },
    { key: "pipeline", label: "Pipeline", icon: "folder" },
    { key: "feedback", label: "Feedback", icon: "edit" },
    { key: "ai-generator", label: "AI JD Generator", icon: "sparkles" },
    { key: "email-dispenser", label: "Mailing cycle", icon: "mail" },
  ];

  const getScreenTitle = () => {
    switch (currentScreen) {
      case "dashboard":
        return "Insight Hub";
      case "jobs":
        return "Sourcing Openings";
      case "candidates":
        return "Candidate Directory";
      case "pipeline":
        return "Hiring Flow Kanban";
      case "feedback":
        return "Assessments Ledger";
      case "ai-generator":
        return "Generative Sourcing Bot";
      case "email-dispenser":
        return "Mailing Campaign Dispatcher";
      case "application-detail":
        return "Submission Overview Cases";
      default:
        return "Insight Hub";
    }
  };

  const activeAppDetail = applications.find((a) => a.applicationId === selectedApplicationId);
  const activeCandidateForDetail = candidates.find((c) => c.candidateId === activeAppDetail?.candidateId);
  const activeFeedbacksForDetail = activeAppDetail ? feedbacksMap[activeAppDetail.applicationId] || [] : [];

  const mobileTabItems = [
    { key: "dashboard", label: "Dash", icon: "trending-up" as SliconName },
    { key: "jobs", label: "Jobs", icon: "briefcase" as SliconName },
    { key: "candidates", label: "Users", icon: "users" as SliconName },
    { key: "pipeline", label: "Stages", icon: "folder" as SliconName },
    { key: "more", label: "More", icon: "more-horizontal" as SliconName },
  ];

  const getFabConfig = () => {
    switch (currentScreen) {
      case "dashboard":
        return {
          icon: "refresh" as SliconName,
          title: "Run Diagnostics",
          event: "trigger-refresh-diagnostics",
        };
      case "jobs":
        return {
          icon: "plus" as SliconName,
          title: "Add Position",
          event: "trigger-add-job",
        };
      case "candidates":
        return {
          icon: "user-plus" as SliconName,
          title: "Add Profile",
          event: "trigger-add-candidate",
        };
      case "feedback":
        return {
          icon: "message-square" as SliconName,
          title: "Grading Sheet",
          event: "trigger-add-feedback",
        };
      default:
        return null;
    }
  };

  const fabConfig = getFabConfig();

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#13241C] flex flex-col md:flex-row relative">
      
      {/* ==========================================
          1. DESKTOP FIXED SIDEBAR MENU (R1.1)
          ========================================== */}
      <aside
        className={`hidden md:flex flex-col justify-between sticky top-0 left-0 h-screen bg-[#1A3A2E] border-r border-[#2D6A4F]/25 transition-all duration-305 shrink-0 z-40 select-none shadow-xl ${
          isSidebarCollapsed ? "w-16" : "w-[220px]"
        }`}
      >
        <div>
          {/* Logo brand box */}
          <div className="flex items-center justify-between px-4 h-18 border-b border-[#2D6A4F]/45">
            {!isSidebarCollapsed && (
              <span className="text-sm font-black tracking-wider uppercase text-[#D8F3DC] inline-flex items-center gap-1.5 font-sans">
                <Slicon name="briefcase" size={18} className="text-[#52B788]" />
                Sourced.AI
              </span>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1 hover:bg-[#2D6A4F]/55 text-gray-300 hover:text-white rounded transition-colors ml-auto shrink-0 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              <Slicon name={isSidebarCollapsed ? "chevron-right" : "chevron-left"} size={16} />
            </button>
          </div>

          {/* Links lists bar */}
          <nav className="p-3 space-y-1.5">
            {sidebarItems.map((item) => {
              const active = currentScreen === item.key;
              return (
                <button
                   key={item.key}
                  onClick={() => {
                    navigateTo(item.key);
                    setSelectedApplicationId("");
                  }}
                  title={isSidebarCollapsed ? item.label : ""}
                  className={`w-full h-10 px-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer select-none text-left font-semibold text-xs border ${
                    active
                      ? "bg-[#0F1F18] text-white border-white/5 shadow-md font-semibold"
                      : "bg-transparent text-gray-300 hover:text-white border-transparent hover:bg-[#2D6A4F]/20"
                  }`}
                >
                  <Slicon name={item.icon} size={20} className={active ? "text-white" : "text-gray-300"} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom indicator info */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-[#2D6A4F]/45 bg-[#0F1F18] text-center">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#D8F3DC] block">Connected</span>
            <span className="text-[9px] text-[#52B788] font-bold uppercase tracking-wider block mt-1 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#52B788] inline-block animate-pulse" />
              Direct Firebase REST
            </span>
          </div>
        )}
      </aside>

      {/* ==========================================
          2. MOBILE NAVIGATION BOTTOM BAR (R1.3)
          ========================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1A3A2E] border-t border-[#2D6A4F]/50 z-40 flex items-center justify-around px-2 shadow-2xl select-none">
        {mobileTabItems.map((item) => {
          const active = item.key === "more"
            ? (isMobileMoreOpen || ["ai-generator", "email-dispenser", "feedback"].includes(currentScreen))
            : (currentScreen === item.key);

          return (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === "more") {
                  setIsMobileMoreOpen(true);
                } else {
                  navigateTo(item.key);
                  setSelectedApplicationId("");
                  setIsMobileMoreOpen(false);
                }
              }}
              className="flex flex-col items-center justify-center flex-1 h-full relative cursor-pointer min-h-[44px] min-w-[44px]"
            >
              <Slicon name={item.icon} size={20} className={active ? "text-[#52B788]" : "text-gray-300"} />
              <span
                className={`text-[9px] font-bold tracking-tight mt-1 ${
                  active ? "text-[#52B788]" : "text-gray-300"
                }`}
              >
                {item.label}
              </span>

              {/* Accent green underline (R1.3) */}
              {active && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#52B788] rounded-t-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ==========================================
          MOBILE FLOATING ACTION BUTTON (FAB)
          ========================================== */}
      {fabConfig && !selectedApplicationId && (
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent(fabConfig.event, { detail: {} }));
          }}
          title={fabConfig.title}
          className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-tr from-[#1A3A2E] to-[#2D6A4F] text-[#D8F3DC] border border-[#52B788]/50 rounded-full shadow-2xl flex items-center justify-center z-45 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Slicon name={fabConfig.icon} size={24} className="text-[#52B788]" />
        </button>
      )}

      {/* ==========================================
          FROSTED BOTTOM SHEET MENU (MORE TAB)
          ========================================== */}
      {isMobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop blur click to close */}
          <div 
            className="absolute inset-0 bg-[#0F1F18]/70 backdrop-blur-md transition-opacity"
            onClick={() => setIsMobileMoreOpen(false)}
          />
          {/* Sheet body */}
          <div className="relative w-full bg-[#1A3A2E]/95 backdrop-blur-lg border-t border-[#2D6A4F]/40 rounded-t-[28px] p-6 text-white shadow-2xl z-10 max-h-[80vh] overflow-y-auto duration-300">
            {/* Grabber indicator line */}
            <div className="w-12 h-1.5 bg-gray-500/30 rounded-full mx-auto mb-5" />
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-[#D8F3DC]">
                  More Sourcing Tools
                </h3>
                <p className="text-[10px] text-gray-300 font-medium">Select an advanced workspace application</p>
              </div>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-1 px-2.5 rounded-lg border border-[#2D6A4F]/50 text-gray-300 hover:text-white hover:bg-[#2D6A4F]/40 transition-all cursor-pointer min-h-[36px]"
              >
                <Slicon name="x" size={14} />
              </button>
            </div>

            <div className="space-y-3 pb-6">
              {[
                {
                  key: "ai-generator",
                  title: "AI JD Generator",
                  desc: "Draft job descriptions programmatically",
                  icon: "sparkles" as SliconName,
                  color: "bg-purple-500/10 text-purple-300 border-purple-500/20"
                },
                {
                  key: "email-dispenser",
                  title: "Email Batch Dispenser",
                  desc: "Dispatch campaign updates to pipeline candidates",
                  icon: "mail" as SliconName,
                  color: "bg-blue-500/10 text-blue-300 border-blue-500/20"
                },
                {
                  key: "feedback",
                  title: "Assessments Ledger",
                  desc: "Grade candidates and verify reviewer scoreboards",
                  icon: "edit" as SliconName,
                  color: "bg-amber-500/10 text-amber-300 border-amber-500/20"
                }
              ].map((tool) => {
                const active = currentScreen === tool.key;
                return (
                  <button
                    key={tool.key}
                    onClick={() => {
                      navigateTo(tool.key);
                      setSelectedApplicationId("");
                      setIsMobileMoreOpen(false);
                    }}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all text-left border cursor-pointer active:scale-[0.98] ${
                      active
                        ? "bg-[#0F1F18] border-emerald-500/35 text-white shadow-lg"
                        : "bg-[#2D6A4F]/20 border-transparent text-gray-200 hover:bg-[#2D6A4F]/35 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${tool.color}`}>
                        <Slicon name={tool.icon} size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-sans">{tool.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-medium leading-relaxed">{tool.desc}</p>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <Slicon name="chevron-right" size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          3. MAIN CONTENT SCANNABLE SHELL
          ========================================== */}
      <main className="flex-grow flex flex-col min-h-screen pb-20 md:pb-6 overflow-x-hidden">
        {/* Top Header bar carries Context button CTAs (R1.4) */}
        <header className="h-18 px-5 md:px-8 border-b border-[#F0FAF4] bg-white flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0 select-none">
          <div>
            <h1 className="text-md md:text-lg font-black tracking-tight text-[#13241C] font-sans uppercase flex items-center gap-2">
              {["ai-generator", "email-dispenser", "feedback"].includes(currentScreen) && (
                <button
                  onClick={() => navigateTo("dashboard")}
                  className="p-1 px-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg transition-all cursor-pointer flex items-center justify-center min-h-[32px] min-w-[32px] shrink-0"
                  title="Back to Dashboard"
                >
                  <Slicon name="arrow-left" size={15} className="text-[#2D6A4F]" />
                </button>
              )}
              {getScreenTitle()}
            </h1>
            <p className="hidden sm:block text-[9.5px] uppercase font-mono tracking-wider font-semibold text-[#2D6A4F] mt-0.5">
              HR Recruitment Tracking Panel
            </p>
          </div>

          {/* Sourcing active buttons mapping according to screen contexts */}
          <div className="flex items-center gap-2">
            {/* Context: Jobs screen */}
            {currentScreen === "jobs" && !selectedApplicationId && (
              <button
                onClick={() => {
                  setEditingJobRef(null);
                  setModalType("create_job");
                }}
                className="hidden md:flex py-2 px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#1A3A2E] text-white text-xs font-bold uppercase tracking-wider shadow transition-all items-center gap-1.5 cursor-pointer min-h-[40px]"
              >
                <Slicon name="plus" size={14} />
                Add Position
              </button>
            )}

            {/* Context: Candidates screen */}
            {currentScreen === "candidates" && !selectedApplicationId && (
              <button
                onClick={() => {
                  setEditingCandRef(null);
                  setModalType("create_cand");
                }}
                className="hidden md:flex py-2 px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#1A3A2E] text-white text-xs font-bold uppercase tracking-wider shadow transition-all items-center gap-1.5 cursor-pointer min-h-[40px]"
              >
                <Slicon name="user-plus" size={14} />
                Add Profile
              </button>
            )}

            {/* General sync refresh indicator */}
            <button
              onClick={() => reloadState()}
              disabled={loading}
              title="Synchronize Database"
              className="hidden md:flex p-2 border border-gray-200 hover:bg-slate-50 text-gray-550 rounded-xl transition-all min-h-[40px] min-w-[40px] items-center justify-center cursor-pointer shrink-0"
            >
              <Slicon name="refresh" size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {/* Core content payload padded beautifully inside containers */}
        <section className="p-0 sm:p-3 md:p-4 flex-grow bg-[#F3F4F6]">
          <div className="max-w-7xl mx-auto w-full h-full bg-white shadow-2xl rounded-[24px] border border-[#D8F3DC] p-4 sm:p-6 md:p-8 min-h-[480px]">
            {loading ? (
              <div className="h-[360px] flex flex-col items-center justify-center text-center text-gray-400">
                <Slicon name="loader" size={32} className="animate-spin text-[#2D6A4F] mb-3" />
                <span className="text-xs uppercase font-mono tracking-wider font-bold text-gray-500">
                  Syncing Firestore Registries...
                </span>
              </div>
            ) : selectedApplicationId && activeAppDetail ? (
              /* ==========================================
                  DEDICATED APPLICATION DETAIL PAGE
                  ========================================== */
              <ApplicationDetailScreen
                applicationId={selectedApplicationId}
                application={activeAppDetail}
                candidate={activeCandidateForDetail}
                feedbacks={activeFeedbacksForDetail}
                onBackClick={() => {
                  // back path preservation
                  const prev = sessionStorage.getItem("active_back_tab") || "candidates";
                  navigateTo(prev);
                }}
                onAddFeedbackClick={(appId, candName) => {
                  setTargetAppIdRef(appId);
                  setTargetCandNameRef(candName);
                  setModalType("feedback");
                }}
                onDeleteApplicationClick={(app) => handleDeleteApplication(app)}
                onUnlinkApplicationClick={(app) => handleUnlinkApplication(app)}
                onPassApplicationClick={handlePassApplication}
                onRejectApplicationClick={handleRejectApplication}
                isJobClosed={jobs.find((j) => j.jobId === activeAppDetail.jobId)?.status === "Closed"}
              />
            ) : (
              /* ==========================================
                  STANDARD SCREEN SHIFT CONFIGURATION
                  ========================================== */
              (() => {
                switch (currentScreen) {
                  case "dashboard":
                    return (
                      <DashboardScreen
                        jobs={jobs}
                        candidates={candidates}
                        applications={applications}
                        onNavigateToTab={(tab) => navigateTo(tab)}
                      />
                    );
                  case "jobs":
                    return (
                      <JobsScreen
                        jobs={jobs}
                        onAddJobClick={() => {
                          setEditingJobRef(null);
                          setModalType("create_job");
                        }}
                        onEditJobClick={(job) => {
                          setEditingJobRef(job);
                          setModalType("edit_job");
                        }}
                        onCloseJobClick={(job) => {
                          setEditingJobRef(job);
                          setModalType("close_job");
                        }}
                        onDeleteJobClick={(id) => {
                          setDeleteTargetId(id);
                          setModalType("delete_job");
                        }}
                        onPipelineClick={(jobId) => {
                          setSelectedPipelineJobId(jobId);
                          navigateTo("pipeline");
                        }}
                      />
                    );
                  case "candidates":
                    sessionStorage.setItem("active_back_tab", "candidates");
                    return (
                      <CandidatesScreen
                        candidates={candidates}
                        applications={applications}
                        jobs={jobs}
                        feedbacksMap={feedbacksMap}
                        onAddCandidateClick={() => {
                          setEditingCandRef(null);
                          setModalType("create_cand");
                        }}
                        onEditCandidateClick={(cand) => {
                          setEditingCandRef(cand);
                          setModalType("edit_cand");
                        }}
                        onDeleteCandidateClick={(id) => {
                          setDeleteTargetId(id);
                          setModalType("delete_cand");
                        }}
                        onApplyToJobClick={(id, name) => {
                          setTargetCandIdRef(id);
                          setTargetCandNameRef(name);
                          setModalType("link_job");
                        }}
                        onNavigateToApplication={(id) => {
                          navigateTo("applications/" + id);
                        }}
                        onDeleteApplicationClick={(app) => handleDeleteApplication(app)}
                        onUnlinkApplicationClick={(app) => handleUnlinkApplication(app)}
                      />
                    );
                  case "pipeline":
                    sessionStorage.setItem("active_back_tab", "pipeline");
                    return (
                      <PipelineScreen
                        jobs={jobs}
                        applications={applications}
                        selectedJobId={selectedPipelineJobId}
                        onSelectJobId={(id) => setSelectedPipelineJobId(id)}
                        onPassApplication={(app) => handlePassApplication(app)}
                        onRejectApplication={(app) => handleRejectApplication(app)}
                        onNavigateToApplication={(id) => {
                          navigateTo("applications/" + id);
                        }}
                      />
                    );
                  case "feedback":
                    return (
                      <FeedbackScreen
                        jobs={jobs}
                        applications={applications}
                        feedbacksMap={feedbacksMap}
                        selectedAppId={selectedFeedbackAppId}
                        onSelectAppId={(id) => setSelectedFeedbackAppId(id)}
                        onAddFeedbackClick={(appId, Name) => {
                          setTargetAppIdRef(appId);
                          setTargetCandNameRef(Name);
                          setModalType("feedback");
                        }}
                      />
                    );
                  case "ai-generator":
                    return (
                      <AiGeneratorScreen
                        onSaveAsJob={(title, desc) => {
                          setEditingJobRef({
                            jobId: "",
                            title,
                            department: "Engineering",
                            location: "Onsite",
                            employmentType: "Full-time",
                            headcount: 1,
                            hired_count: 0,
                            requiredSkills: [],
                            description: desc,
                            deadline: "",
                            status: "Open",
                            createdDate: "",
                          });
                          setModalType("create_job");
                        }}
                      />
                    );
                  case "email-dispenser":
                    return (
                      <EmailDispenserScreen
                        jobs={jobs}
                        applications={applications}
                        candidates={candidates}
                        onDispatchBatch={(appIds, targetStage) =>
                          handleDispatchBatchEmails(appIds, targetStage)
                        }
                      />
                    );
                  default:
                    return (
                      <DashboardScreen
                        jobs={jobs}
                        candidates={candidates}
                        applications={applications}
                        onNavigateToTab={(tab) => navigateTo(tab)}
                      />
                    );
                }
              })()
            )}
          </div>
        </section>
      </main>

      {/* ==========================================
          DYNAMIC OVERLAYS MODALS ROUTING
          ========================================== */}

      {/* Create / Edit Job Modal */}
      {(modalType === "create_job" || modalType === "edit_job") && (
        <JobModal
          isOpen={true}
          onClose={() => {
            setModalType(null);
            setEditingJobRef(null);
          }}
          existingJobs={jobs}
          editingJob={editingJobRef}
          onSave={(job) => handleSaveJob(job)}
        />
      )}

      {/* Close Job selection loop prompt */}
      {modalType === "close_job" && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModalType(null)}
          onConfirm={() => handleConfirmCloseJob()}
          title="Archive Sourcing Position"
          message={`Are you sure you want to CLOSE the job opening "${editingJobRef?.title}"? This freeze progress actions.`}
          isDestructive={true}
        />
      )}

      {/* Cascade Delete Job */}
      {modalType === "delete_job" && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModalType(null)}
          onConfirm={() => handleConfirmDeleteJob()}
          title="Cascade Delete Job Position"
          message={`Are you sure? Removing this entry permanently purges all candidates linked under this role along with score assessments.`}
          isDestructive={true}
        />
      )}

      {/* Post-Closure choose Cycle email launcher custom Modal */}
      {modalType === "cycle_email" && (
        <ModalBase
          isOpen={true}
          onClose={() => setModalType(null)}
          title="Sourcing Closed - Next Step Checklist"
        >
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#2D6A4F] flex items-center justify-center mx-auto">
              <Slicon name="mail" size={24} />
            </div>
            <h4 className="text-sm font-bold text-gray-800">Configure End-of-Cycle Notifications?</h4>
            <p className="text-xs text-gray-500 leading-normal">
              Closing position: <strong>{targetCandNameRef} ({targetCandIdRef})</strong>. 
              Launch the batch dispatcher now to email rejected candidate pipelines and auto-advance their statuses?
            </p>
            <div className="flex items-center gap-3 w-full pt-4">
              <button
                type="button"
                onClick={() => handleTriggerCycleEmailFromClosedChoice(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-650 bg-white"
              >
                No, close cycle
              </button>
              <button
                type="button"
                onClick={() => handleTriggerCycleEmailFromClosedChoice(true)}
                className="flex-grow py-2.5 px-4 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold"
              >
                Launch Dispatcher
              </button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* Add / Edit Candidate Profile */}
      {(modalType === "create_cand" || modalType === "edit_cand") && (
        <CandidateModal
          isOpen={true}
          onClose={() => {
            setModalType(null);
            setEditingCandRef(null);
          }}
          existingCandidates={candidates}
          editingCandidate={editingCandRef}
          onSave={(cand) => handleSaveCandidate(cand)}
        />
      )}

      {/* Delete Candidate profile */}
      {modalType === "delete_cand" && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModalType(null)}
          onConfirm={() => handleConfirmDeleteCand()}
          title="Delete Master Candidate"
          message="Are you absolutely sure you want to wipe this candidate file and cascade delete their applications?"
          isDestructive={true}
        />
      )}

      {/* Link Candidate to Job Modal */}
      {modalType === "link_job" && (
        <ApplyJobModal
          isOpen={true}
          onClose={() => setModalType(null)}
          candidateId={targetCandIdRef}
          candidateName={targetCandNameRef}
          jobs={jobs}
          applications={applications}
          onApply={(data) => handleCreateApplication(data)}
        />
      )}

      {/* Add round feedback evaluation assessment */}
      {modalType === "feedback" && (
        <FeedbackModal
          isOpen={true}
          onClose={() => setModalType(null)}
          applicationId={targetAppIdRef}
          candidateName={targetCandNameRef}
          onSaveFeedback={(feedback) => handleSaveFeedback(feedback)}
        />
      )}

      {/* Pipeline promotion confirm */}
      {modalType === "transition" && targetAppRef && (
        <StageTransitionModal
          isOpen={true}
          onClose={() => setModalType(null)}
          candidateName={targetAppRef.candidateName}
          currentStage={targetAppRef.stage}
          nextStage={targetCandNameRef} // Temporary slot reuse
          onConfirm={() => handleConfirmTransition()}
        />
      )}

      {/* Pipeline Rejection trigger */}
      {modalType === "reject_app" && targetAppRef && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModalType(null)}
          onConfirm={() => handleConfirmReject()}
          title="Reject Candidate application"
          message={`Confirm moving "${targetAppRef.candidateName}" out of pipelines into Rejected stage?`}
          isDestructive={true}
        />
      )}

      {/* Delete Application confirmation */}
      {modalType === "delete_app" && targetAppRef && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModalType(null)}
          onConfirm={() => handleConfirmDeleteApp()}
          title="Delete Candidate Application"
          message={`Are you sure you want to delete this application permanently for candidate "${targetAppRef.candidateName}"? This will remove all associated evaluations, but will keep the candidate profile.`}
          isDestructive={true}
        />
      )}

      {/* Unlink Application confirmation */}
      {modalType === "unlink_app" && targetAppRef && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModalType(null)}
          onConfirm={() => handleConfirmUnlinkApp()}
          title="Unlink Candidate"
          message="Are you sure you want to unlink this candidate from the job? This will remove the application and its interview feedback history but will preserve the candidate's master profile details."
          isDestructive={true}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
