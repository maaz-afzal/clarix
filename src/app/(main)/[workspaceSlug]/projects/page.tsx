import ProjectCard from "@/components/projects/project-card";
import { Plus } from "lucide-react";

const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of the company website with modern design",
    status: "active",
    color: "#6366f1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Build iOS and Android apps for the platform",
    status: "active",
    color: "#22c55e",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "API Integration",
    description: "Integrate third-party payment and analytics APIs",
    status: "active",
    color: "#f59e0b",
    createdAt: new Date().toISOString(),
  },
];

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export default async function ProjectsPage({ params }: Props) {
  const { workspaceSlug } = await params;

  const projects = MOCK_PROJECTS;

  return (
    <div className="p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm mt-1">Create your first project</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              workspaceSlug={workspaceSlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
