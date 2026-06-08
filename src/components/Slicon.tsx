import React from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Save,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Folder,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Paperclip,
  Link,
  Sparkles,
  Loader2,
  Inbox,
  FileText,
  Mail,
  User,
  Users,
  Settings,
  ChevronDown,
  Clock,
  ExternalLink,
  HelpCircle,
  Unlink,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";

export type SliconName =
  | "plus"
  | "edit"
  | "trash"
  | "x"
  | "arrow-right"
  | "arrow-left"
  | "refresh"
  | "save"
  | "search"
  | "warning"
  | "check-circle"
  | "trending-up"
  | "trending-down"
  | "briefcase"
  | "folder"
  | "user-plus"
  | "chevron-right"
  | "chevron-left"
  | "paperclip"
  | "link"
  | "sparkles"
  | "loader"
  | "inbox"
  | "file"
  | "mail"
  | "user"
  | "users"
  | "settings"
  | "chevron-down"
  | "clock"
  | "external-link"
  | "help"
  | "unlink"
  | "message-square"
  | "more-horizontal";

interface SliconProps extends React.SVGProps<SVGSVGElement> {
  name: SliconName;
  size?: number | string;
  className?: string;
}

const iconComponentMap: Record<SliconName, React.ComponentType<any>> = {
  plus: Plus,
  edit: Edit2,
  trash: Trash2,
  x: X,
  "arrow-right": ArrowRight,
  "arrow-left": ArrowLeft,
  refresh: RefreshCw,
  save: Save,
  search: Search,
  warning: AlertTriangle,
  "check-circle": CheckCircle2,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  briefcase: Briefcase,
  folder: Folder,
  "user-plus": UserPlus,
  "chevron-right": ChevronRight,
  "chevron-left": ChevronLeft,
  paperclip: Paperclip,
  link: Link,
  sparkles: Sparkles,
  loader: Loader2,
  inbox: Inbox,
  file: FileText,
  mail: Mail,
  user: User,
  users: Users,
  settings: Settings,
  "chevron-down": ChevronDown,
  clock: Clock,
  "external-link": ExternalLink,
  help: HelpCircle,
  unlink: Unlink,
  "message-square": MessageSquare,
  "more-horizontal": MoreHorizontal,
};

export const Slicon: React.FC<SliconProps> = ({
  name,
  size = 20,
  className = "",
  style,
  ...props
}) => {
  const IconComponent = iconComponentMap[name];
  if (!IconComponent) {
    console.warn(`Slicon "${name}" not found. Falling back to default HelpCircle.`);
    const Fallback = HelpCircle;
    return (
      <Fallback
        size={size}
        className={className}
        strokeWidth={1.75}
        style={{ strokeLinejoin: "round", strokeLinecap: "round", ...style }}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      size={size}
      className={className}
      strokeWidth={1.75} // consistent outer-stroke weight
      style={{ strokeLinejoin: "round", strokeLinecap: "round", ...style }}
      {...props}
    />
  );
};
