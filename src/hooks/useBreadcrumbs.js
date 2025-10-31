import { useLocation } from "react-router-dom";
import { useBreadcrumbMetadata } from "../context/BreadcrumbContext";

/**
 * Custom hook to generate breadcrumbs from the current route
 * @returns {Array} Array of breadcrumb objects with { to, label } structure
 */
export const useBreadcrumbs = () => {
  const location = useLocation();
  const { metadata = {} } = useBreadcrumbMetadata();
  const segments = location.pathname.split("/").filter(Boolean);

  // Label mapping for route segments
  const labelMap = {
    dashboard: "Dashboard",
    grievance: "Grievances",
    feedback: "Feedback",
    new: "New",
    incoming: "Incoming",
    outgoing: "Outgoing",
    chats: "Chats",
  };

  // Special handling for outgoing forms - show Feedback instead of Grievances
  const getBreadcrumbLabel = (seg, index, segments) => {
    if (seg === "grievance" && segments.includes("outgoing")) {
      return "Feedback";
    }
    return labelMap[seg] ?? decodeURIComponent(seg);
  };

  // Create breadcrumbs array
  const crumbs = [];

  // Always include Dashboard as first item when not on dashboard
  if (segments.length > 0 && segments[0] !== "dashboard") {
    crumbs.push({
      to: "/dashboard",
      label: "Dashboard",
    });
  }

  // Process segments
  segments.forEach((seg, i) => {
    const prev = segments[i - 1];
    const isChat = seg === "chats";
    
    // Skip "incoming" and "outgoing" segments when they appear after "new"
    // This will hide them from breadcrumb: /grievance/new/incoming → Dashboard > Grievances > New
    if ((seg === "incoming" || seg === "outgoing") && prev === "new") {
      return; // Skip this segment
    }

    let path = "/" + segments.slice(0, i + 1).join("/");

    // For outgoing routes, update the grievance path to point to feedback
    if (seg === "grievance" && segments.includes("outgoing")) {
      path = "/feedback";
    }

    // Handle chats appearing under grievance or feedback dynamically
    if (isChat && !["grievance", "feedback"].includes(prev)) {
      // Infer parent dynamically based on:
      // 1. Current route path
      // 2. Referrer (where user came from)
      // 3. URL search params
      let parent = "grievance"; // Default to grievance
      
      // Check if URL path contains feedback
      if (location.pathname.includes("/feedback/")) {
        parent = "feedback";
      } 
      // Check referrer to see if user came from feedback page
      else if (typeof document !== "undefined" && document.referrer) {
        const referrer = document.referrer.toLowerCase();
        if (referrer.includes("/feedback") && !referrer.includes("/grievance")) {
          parent = "feedback";
        }
      }
      // Check URL search params for source indicator
      else if (location.search) {
        const params = new URLSearchParams(location.search);
        // If there's a source param, use it
        const source = params.get("source");
        if (source === "feedback") {
          parent = "feedback";
        }
      }

      // Insert parent breadcrumb only if not already there
      if (!crumbs.some((c) => c.label === labelMap[parent])) {
        crumbs.push({
          to: `/${parent}`,
          label: labelMap[parent],
        });
      }

      path = `/${parent}/${seg}`;
    }

    // Fix: remove /dashboard prefix from non-dashboard paths
    if (path.startsWith("/dashboard/") && seg !== "dashboard") {
      path = "/" + segments.slice(1, i + 1).join("/");
    }

    // Get label with special handling
    const label = getBreadcrumbLabel(seg, i, segments);

    // Make "Chats" non-clickable when on the chats route (current page)
    const isOnChatsRoute = location.pathname === "/chats" || location.pathname.startsWith("/chats");
    const isClickable = !(isChat && isOnChatsRoute);

    crumbs.push({
      to: path,
      label: label,
      clickable: isClickable,
    });

    // If this is the chats route (last segment) and we have a ticket number, add it as a separate breadcrumb
    if (isChat && i === segments.length - 1 && metadata.ticketNumber) {
      crumbs.push({
        to: path, // Keep same path (not clickable)
        label: metadata.ticketNumber,
        clickable: false,
      });
    }
  });

  return crumbs;
};

