import { Inbox } from "lucide-react";

const EmptyState = ({
  title = "No records found",
  description = "Try adjusting your search filters or check again later.",
  icon: Icon = Inbox,
  action = null,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <div>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gray-700)", marginBottom: "0.25rem" }}>
          {title}
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--gray-400)", maxWidth: "320px", margin: "0 auto" }}>
          {description}
        </p>
      </div>
      {action && (
        <div style={{ marginTop: "0.5rem" }}>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
