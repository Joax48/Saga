import type {
  Project,
  ProjectDetailApiDto,
  ProjectSummaryApiDto,
  ProjectSummaryItem,
} from '@/types/projects.types';

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
    keywords: item.keywords ?? [],
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

export function mapProjectDetailToProject(item: ProjectDetailApiDto): Project {
  const managerName = item.manager?.name?.trim() || 'Sin responsable';
  const instituteName = item.unit?.name?.trim() || 'Sin unidad asociada';

  return {
    id: item.id,
    code: item.code,
    title: item.title,
    description: item.description,
    manager: managerName,
    managerId: item.manager?.id ? String(item.manager.id) : undefined,
    managerParticipationStartDate: item.manager?.participationStartDate,
    managerParticipationEndDate: item.manager?.participationEndDate,
    institute: instituteName,
    disciplines: (item.disciplines ?? []).map((discipline) => discipline.trim()),
    researchType: item.researchType,
    projectType: item.projectType,
    fundingType: item.fundingType,
    status: item.status,
    startDate: item.startDate,
    endDate: item.endDate,
    keywords: item.keywords ?? [],
    associatedProfiles: (item.associatedProfiles ?? []).map((profile) => ({
      id: profile.id,
      name: profile.name,
      ...(profile.role ? { role: profile.role } : {}),
      ...(profile.participationStartDate
        ? { participationStartDate: profile.participationStartDate }
        : {}),
      ...(profile.participationEndDate
        ? { participationEndDate: profile.participationEndDate }
        : {}),
    })),
  };
}
