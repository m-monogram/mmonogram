import { lazy, Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { useProjects, DBProject } from "@/hooks/useProjects";

const ProjectDetailView = lazy(() => import("@/components/ProjectDetailView"));
const ParticleBackground = lazy(() => import("@/components/ParticleBackground"));

const ProjectDetailPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<DBProject | null>(null);
  const [prefilledModel, setPrefilledModel] = useState("");

  useEffect(() => {
    if (loading) return;
    if (params.id) {
      const project = projects.find(p => p.slug === params.id || p.id === params.id);
      if (project) {
        setSelectedProject(project);
      } else {
        navigate("/projects");
      }
    }
  }, [params.id, navigate, projects, loading]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [params.id]);

  if (loading || !selectedProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Suspense fallback={null}>
        <div className="fixed inset-0 z-0 pointer-events-none">
          <ParticleBackground />
        </div>
      </Suspense>

      <Header />
      
      <SEOHead
        title={`${selectedProject.title} ${selectedProject.subtitle} - M-Monogram`}
        description={selectedProject.description || `Explore ${selectedProject.title} ${selectedProject.subtitle} - a bespoke automotive transformation by M-Monogram.`}
        path={`/projects/${selectedProject.slug}`}
      />

      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ProjectDetailView
          project={selectedProject}
          setCurrentView={undefined}
          setSelectedModel={setPrefilledModel}
          allProjects={projects}
        />
      </Suspense>
    </div>
  );
};

export default ProjectDetailPage;
