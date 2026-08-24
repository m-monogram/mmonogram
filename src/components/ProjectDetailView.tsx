import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { DBProject } from "@/hooks/useProjects";
import ProjectTemplate from "@/components/projects/ProjectTemplate";
import ProjectEditionGrid from "@/components/ProjectEditionGrid";
import type { ProjectTemplateSpec, ProjectTemplateGalleryImage, ProjectTemplateNavItem } from "@/components/projects/ProjectTemplate";
import {
  getGWagenEditionsFrom,
  getListingProjects,
  isGWagenHubId,
  projectKey,
} from "@/data/projects";

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
  navProjects: DBProject[],
  onBack: () => void,
  onOrderClick: () => void
) {
  const index = navProjects.findIndex((p) => projectKey(p) === projectKey(project));
  const prevProject = index > 0 ? navProjects[index - 1] : null;
  const nextProject = index >= 0 && index < navProjects.length - 1 ? navProjects[index + 1] : null;

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
  const navigate = useNavigate();
  const { navigateToView } = useNavigation({ setCurrentView });
  const editions = useMemo(() => getGWagenEditionsFrom(allProjects), [allProjects]);
  const listing = useMemo(() => getListingProjects(allProjects), [allProjects]);
  const isHub = project.isHub || isGWagenHubId(projectKey(project));

  const handleBack = () => {
    if (project.editionOf) {
      navigate(`/projects/${project.editionOf}`);
      return;
    }
    navigateToView("projects");
  };

  const handleOrderClick = () => {
    setSelectedModel(`${project.title} — ${project.subtitle}`);
    navigateToView("contact");
  };

  if (isHub) {
    return (
      <section className="relative z-10 min-h-screen bg-white pt-[calc(env(safe-area-inset-top,0px)+7rem)] pb-20 sm:pb-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => navigateToView("projects")}
            className="mb-10 sm:mb-14 flex items-center gap-2 text-black/55 hover:text-black transition-colors font-body text-xs sm:text-sm uppercase tracking-widest cursor-pointer"
            aria-label="Back to projects"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <h1 className="font-display text-center text-lg sm:text-2xl md:text-3xl tracking-widest uppercase text-black mb-10 sm:mb-14">
            {project.title}
          </h1>

          <ProjectEditionGrid
            projects={editions}
            onProjectClick={(id) => navigate(`/projects/${id}`)}
          />
        </div>
      </section>
    );
  }

  const navProjects = project.editionOf ? editions : listing;
  const templateProps = projectToTemplateProps(project, navProjects, handleBack, handleOrderClick);

  return <ProjectTemplate {...templateProps} />;
});

export default ProjectDetailView;
