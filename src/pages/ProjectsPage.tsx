import { lazy, Suspense, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";

const ProjectsSection = lazy(() => import("@/components/ProjectsSection"));
const ParticleBackground = lazy(() => import("@/components/ParticleBackground"));

const ProjectsPage = () => {
  const navigate = useNavigate();

  const handleProjectClick = useCallback((projectId: string) => {
    navigate(`/projects/${projectId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen relative">
      {/* Atmospheric Particles - lazy loaded */}
      <Suspense fallback={null}>
        <div className="fixed inset-0 z-0 pointer-events-none">
          <ParticleBackground />
        </div>
      </Suspense>

      <Header />
      
      <SEOHead
        title="Our Projects - M-Monogram | Bespoke Automotive Transformations"
        description="A curated collection of bespoke automotive transformations. Explore our signature projects including G900 M Monogram and exclusive customizations."
        path="/projects"
      />

      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ProjectsSection onProjectClick={handleProjectClick} />
      </Suspense>
    </div>
  );
};

export default ProjectsPage;
