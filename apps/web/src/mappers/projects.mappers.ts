import type { ProjectSummaryApiDto, ProjectSummaryItem } from '@/types/projects.types';

export function mapProjectSummaryToProject(
  item: ProjectSummaryApiDto,
): ProjectSummaryItem {
  const managerName = item.projectManager?.name?.trim() || 'Sin responsable';

  return {
    id: String(item.id),
    code: item.code,
    title: item.name,
    manager: managerName,
    researchType: item.researchType,
    projectType: item.projectType,
    startDate: item.startDate,
    endDate: item.endDate,
    keywords: [],
    associatedProfiles: item.projectManager
      ? [
          {
            id: String(item.projectManager.id),
            name: managerName,
            role: 'Persona encargada del proyecto',
          },
        ]
      : [],
  };
}
