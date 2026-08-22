import { memo } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { DBProject } from "@/hooks/useProjects";
import ProjectTemplate from "@/components/projects/ProjectTemplate";
import type { ProjectTemplateSpec, ProjectTemplateGalleryImage, ProjectTemplateNavItem } from "@/components/projects/ProjectTemplate";

interface ProjectDetailViewProps {
  project: DBProject;
  setCurrentView?: (view: string) => void;
  setSelectedModel: (model: string) => void;
  allProjects?: DBProject[];
}

const SPEC_LABELS: Record<string, string> = {
  exterior: "Exterior",
  interior: "Interior",
  carbon: "Carbon",
  spoilers: "Spoilers",
  wheels: "Wheels",
  aeroKit: "Aero Kit",
};

function projectToTemplateProps(
  project: DBProject,
  allProjects: DBProject[],
  onBack: () => void,
  onOrderClick: () => void
) {
  const index = allProjects.findIndex((p) => p.id === project.id);
  const prevProject = index > 0 ? allProjects[index - 1] : null;
  const nextProject = index >= 0 && index < allProjects.length - 1 ? allProjects[index + 1] : null;

  const parts = project.description.split(".").map((s) => s.trim()).filter(Boolean).slice(0, 2);
  const statement = parts.length ? parts.join(". ").trim() + "." : project.description;

  const galleryImages: ProjectTemplateGalleryImage[] = (project.images || []).map((img) => ({
    src: img.src,
    alt: img.title || "",
  }));

  const specs: ProjectTemplateSpec[] = Object.keys(SPEC_LABELS).map(
    (key) => ({ label: SPEC_LABELS[key], value: (project.specs as Record<string, string>)?.[key] || "—" })
  );

  const prev: ProjectTemplateNavItem | undefined = prevProject
    ? { slug: prevProject.slug, title: prevProject.title }
    : undefined;
  const next: ProjectTemplateNavItem | undefined = nextProject
    ? { slug: nextProject.slug, title: nextProject.title }
    : undefined;

  return {
    title: project.title,
    subtitle: project.subtitle,
    heroImage: project.cover_image,
    statement,
    galleryImages,
    specs,
    prev,
    next,
    onBack,
    onOrderClick,
    videoUrl: project.video_url || undefined,
    modifications: project.modifications,
  };
}

const ProjectDetailView = memo(function ProjectDetailView({
  project,
  setCurrentView,
  setSelectedModel,
  allProjects = [],
}: ProjectDetailViewProps) {
  const { navigateToView } = useNavigation({ setCurrentView });

  const handleBack = () => navigateToView("projects");
  const handleOrderClick = () => {
    setSelectedModel(`${project.title} — ${project.subtitle}`);
    navigateToView("contact");
  };

  const templateProps = projectToTemplateProps(project, allProjects, handleBack, handleOrderClick);

  return <ProjectTemplate {...templateProps} />;
});

export default ProjectDetailView;
