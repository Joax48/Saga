import type { Project, ProjectAssociatedProfile, ProjectDetail } from '../project.entity';
import { COORDINATOR_PARTICIPATION_ID } from './projects.queries';
import type {
  ProjectDetailRow,
  ProjectFilterValueRow,
  ProjectParticipationRow,
  ProjectRow,
} from './projects.repository.types';

export class ProjectsMapper {
  mapProject(row: ProjectRow, keywords: string[]): Project {
    return {
      id: row.id,
      projectManager: {
        id: row.projectManagerId,
        name: row.projectManagerName,
      },
      code: row.code,
      name: row.name,
      keywords,
      projectType: row.projectType,
      fundingType: row.fundingType,
      researchType: row.researchType,
      status: row.status,
      startDate: row.startDate,
      endDate: row.endDate,
    };
  }

  mapProjectDetail(
    row: ProjectDetailRow,
    associatedProfiles: ProjectAssociatedProfile[],
    disciplines: string[],
    keywords: string[],
  ): ProjectDetail {
    const projectManager = {
      ...(row.projectManagerId != null
        ? {
            id: row.projectManagerId,
            name: row.projectManagerName?.trim()
              ? row.projectManagerName.trim()
              : 'Sin nombre',
          }
        : {
            id: 0,
            name: 'Sin investigador principal',
          }),
      ...(row.principalParticipationStartDate?.trim()
        ? { participationStartDate: row.principalParticipationStartDate.trim() }
        : {}),
      ...(row.principalParticipationEndDate?.trim()
        ? { participationEndDate: row.principalParticipationEndDate.trim() }
        : {}),
    };

    const unit =
      row.unitId != null
        ? {
            id: row.unitId,
            name: row.unitName?.trim() ? row.unitName.trim() : 'Sin nombre',
          }
        : {
            id: 0,
            name: 'Sin unidad asignada',
          };

    return {
      id: row.id,
      projectManager,
      code: row.code,
      name: row.name,
      keywords,
      projectType: row.projectType ?? '',
      fundingType: row.fundingType ?? '',
      researchType: row.researchType ?? '',
      status: row.status ?? '',
      startDate: row.startDate ?? '',
      endDate: row.endDate ?? '',
      description: row.description ?? '',
      unit,
      disciplines,
      associatedProfiles,
    };
  }

  mapAssociatedProfiles(
    rows: ProjectParticipationRow[],
    projectManagerId: number | null,
  ): ProjectAssociatedProfile[] {
    const deduped = this.buildUniqueAssociatedProfiles(rows, projectManagerId);

    return deduped.map((row) => ({
      id: row.id,
      name: row.name,
      ...(row.role ? { role: row.role } : {}),
      ...(row.participationStartDate
        ? { participationStartDate: row.participationStartDate }
        : {}),
      ...(row.participationEndDate
        ? { participationEndDate: row.participationEndDate }
        : {}),
    }));
  }

  mapDistinctFilterOptions(rows: ProjectFilterValueRow[]) {
    return rows.map((row) => ({
      label: row.label,
      value: this.normalizeFacetValue(row.optionValue, row.label),
      count: row.optionCount,
    }));
  }

  mapKeywordFilterOptions(rows: ProjectFilterValueRow[]) {
    return rows.map((row) => ({
      label: this.toTitleCase(row.label ?? row.optionValue ?? ''),
      value: this.normalizeFacetValue(
        row.optionValue,
        row.label ?? row.optionValue ?? '',
      ),
      count: row.optionCount,
    }));
  }

  private buildUniqueAssociatedProfiles(
    rows: ProjectParticipationRow[],
    projectManagerId: number | null,
  ): ProjectParticipationRow[] {
    const rowsByProfileId = new Map<number, ProjectParticipationRow>();

    for (const row of rows) {
      if (projectManagerId != null && row.id === projectManagerId) {
        continue;
      }

      const current = rowsByProfileId.get(row.id);
      if (!current || this.compareParticipationRows(row, current) > 0) {
        rowsByProfileId.set(row.id, row);
      }
    }

    return Array.from(rowsByProfileId.values()).sort((a, b) => a.id - b.id);
  }

  private compareParticipationRows(
    a: ProjectParticipationRow,
    b: ProjectParticipationRow,
  ): number {
    const participationStartComparison = this.compareParticipationStart(
      a.participationStartTs,
      b.participationStartTs,
    );

    if (participationStartComparison !== 0) {
      return participationStartComparison;
    }

    const participationEndComparison = this.compareParticipationStart(
      a.participationEndTs,
      b.participationEndTs,
    );

    if (participationEndComparison !== 0) {
      return participationEndComparison;
    }

    if (
      a.participationTypeId === COORDINATOR_PARTICIPATION_ID &&
      b.participationTypeId !== COORDINATOR_PARTICIPATION_ID
    ) {
      return 1;
    }

    if (
      a.participationTypeId !== COORDINATOR_PARTICIPATION_ID &&
      b.participationTypeId === COORDINATOR_PARTICIPATION_ID
    ) {
      return -1;
    }

    return 0;
  }

  private compareParticipationStart(
    a: Date | string | null | undefined,
    b: Date | string | null | undefined,
  ): number {
    return this.toParticipationTime(a) - this.toParticipationTime(b);
  }

  private toParticipationTime(value: Date | string | null | undefined): number {
    if (value == null) {
      return Number.NEGATIVE_INFINITY;
    }

    const date = value instanceof Date ? value : new Date(value);
    const time = date.getTime();

    return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
  }

  private normalizeFacetValue(value: string | undefined, fallbackLabel: string): string {
    const normalizedValue = value?.trim();
    return normalizedValue ? normalizedValue : fallbackLabel;
  }

  private toTitleCase(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    return value
      .toLowerCase()
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
