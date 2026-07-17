import { EmptyState } from "@/components/shared/empty-state";

/**
 * Dev Sandbox Architecture Playground
 *
 * Retains the original Sprint 1 structural architecture readiness preview card
 * exclusively for internal developer reference. Excluded from global navigation.
 */
export default function DevArchitecturePage() {
  return (
    <main className="flex flex-1 items-center justify-center min-h-screen bg-background p-6">
      <EmptyState
        title="Architecture Ready"
        description="Sprint 1 structural foundation is complete. The project shell, design system tokens, infrastructure layer, and Stitch UI primitives are all configured and operational. Future sprints will build feature routes on top of this foundation."
        icon={
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        }
      />
    </main>
  );
}
