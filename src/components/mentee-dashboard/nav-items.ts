import {
  Activity,
  Calendar,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Settings,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Every id is a `?tab=` value the dashboard page understands. */
export type MenteeNavItem = {
  id: string;
  label: string;
  /** The mobile strip's shorter label, where it differs. */
  short?: string;
  icon: LucideIcon;
};

const overview: MenteeNavItem = { id: "overview", label: "Overview", icon: LayoutDashboard };
const sessions: MenteeNavItem = { id: "sessions", label: "Sessions", icon: Calendar };
const mentors: MenteeNavItem = { id: "mentors", label: "Find mentors", short: "Mentors", icon: Users };
const messages: MenteeNavItem = { id: "messages", label: "Messages", icon: MessageSquare };
const profile: MenteeNavItem = { id: "profile", label: "Profile", icon: User };
const activity: MenteeNavItem = { id: "activity", label: "Activity", icon: Activity };

/** The desktop rail, in label groups. */
export const RAIL_GROUPS: readonly { label: string; items: readonly MenteeNavItem[] }[] = [
  { label: "Your work", items: [overview, sessions, messages, activity] },
  { label: "Mentors", items: [mentors] },
  { label: "Account", items: [profile] },
];

/** The rail's foot. These ids have no tab of their own; the page falls back to Overview. */
export const RAIL_FOOT: readonly MenteeNavItem[] = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help & support", icon: HelpCircle },
];

/** The mobile strip: the same six tabs, without the foot. */
export const STRIP_ITEMS: readonly MenteeNavItem[] = [overview, sessions, mentors, messages, profile, activity];
