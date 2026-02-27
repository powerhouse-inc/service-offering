import type { MpaStatus } from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";

const STATUS_CONFIG: Record<
  NonNullable<MpaStatus>,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border-gray-300",
  },
  PENDING_SIGNATURE: {
    label: "Pending Signature",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  TERMINATED: {
    label: "Terminated",
    className: "bg-red-100 text-red-800 border-red-300",
  },
};

interface StatusBadgeProps {
  status: MpaStatus | null | undefined;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = status ? STATUS_CONFIG[status] : null;
  if (!config) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
