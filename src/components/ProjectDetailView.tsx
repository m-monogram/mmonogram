import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { DBProject } from "@/hooks/useProjects";
import ProjectTemplate from "@/components/projects/ProjectTemplate";
import ProjectEditionGrid from "@/components/ProjectEditionGrid";
import type { ProjectTemplateSpec, ProjectTemplateGalleryImage, ProjectTemplateNavItem } from "@/components/projects/ProjectTemplate";
import {
  getEditionsOf,
  getListingProjects,
  isHubProject,
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
  const editions = useMemo(
    () => getEditionsOf(project.editionOf || projectKey(project), allProjects),
    [allProjects, project]
  );
  const listing = useMemo(() => getListingProjects(allProjects), [allProjects]);
  const isHub = isHubProject(project);

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
    const statement =
      project.description?.split(".").map((s) => s.trim()).filter(Boolean).slice(0, 2).join(". ").trim();
    const intro = statement ? `${statement}.` : project.description;

    return (
      <div className="relative z-10 min-h-screen bg-black">
        <div
          className="absolute left-4 sm:left-6 md:left-12 z-20"
          style={{ top: `calc(env(safe-area-inset-top, 0px) + 6rem)` }}
        >
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 font-body text-xs sm:text-sm uppercase tracking-widest cursor-pointer touch-target border border-white/20 hover:border-white/40 px-4 py-2.5 sm:px-5 sm:py-3 bg-black/50 backdrop-blur-md rounded-none"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <section
          className="relative px-4 sm:px-8 lg:px-10 pb-10 sm:pb-12"
          style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 9rem)` }}
        >
          <div className="max-w-[1400px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="w-20 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent mx-auto mb-8"
            />
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="font-display font-bold uppercase tracking-[0.18em] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-5 sm:mb-6"
            >
              {project.title}
            </motion.h1>
            {intro ? (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="font-body text-sm sm:text-base md:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto tracking-wide"
              >
                {intro}
              </motion.p>
            ) : null}
          </div>
        </section>

        <section className="relative px-4 sm:px-8 lg:px-10 pb-24 sm:pb-32">
          <div className="max-w-[1400px] mx-auto">
            <ProjectEditionGrid
              variant="dark"
              columns={3}
              projects={editions}
              onProjectClick={(id) => navigate(`/projects/${id}`)}
            />
          </div>
        </section>
      </div>
    );
  }

  const navProjects = project.editionOf ? editions : listing;
  const templateProps = projectToTemplateProps(project, navProjects, handleBack, handleOrderClick);

  return <ProjectTemplate {...templateProps} />;
});

export default ProjectDetailView;
