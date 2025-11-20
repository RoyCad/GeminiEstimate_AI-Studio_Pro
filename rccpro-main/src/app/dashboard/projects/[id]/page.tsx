
import ProjectDetailClient from '@/components/project-detail-client';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const projectId = params.id;

  return <ProjectDetailClient projectId={projectId} />;
}
