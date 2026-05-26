import { Locale, Project } from "@/lib/types";
import { pick, t } from "@/lib/i18n";

interface ProjectProgressBoardProps {
  projects: Project[];
  language: Locale;
  showClientSummary?: boolean;
}

export const ProjectProgressBoard = ({
  projects,
  language,
  showClientSummary = false,
}: ProjectProgressBoardProps) => {
  if (projects.length === 0) {
    return <p className="rounded-xl bg-white p-5 text-sm text-slate-600 shadow-sm">{t(language, "noData")}</p>;
  }

  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <article key={project.id} className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{pick(language, project.name)}</h3>
              <p className="text-sm text-slate-600">
                {pick(language, project.location)} • {pick(language, project.status)}
              </p>
            </div>
            <div className="text-sm text-slate-600">
              <p>
                {t(language, "startDate")}: {project.startDate}
              </p>
              <p>
                {t(language, "endDate")}: {project.endDate}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>{t(language, "timeline")}</span>
              <span>{project.progressPercent}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200">
              <div className="h-3 rounded-full bg-blue-900" style={{ width: `${Math.min(project.progressPercent, 100)}%` }} />
            </div>
            <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              <p>
                {t(language, "costVisibility")}: ৳ {project.spentCost.toLocaleString()} / ৳ {project.budget.toLocaleString()}
              </p>
              {showClientSummary && <p>{pick(language, project.clientSummary)}</p>}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {project.stages.map((stage) => (
              <div key={stage.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{pick(language, stage.name)}</p>
                    <p className="text-xs text-slate-500">
                      {stage.startDate} → {stage.endDate}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-900">
                    {stage.progressPercent}%
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{pick(language, stage.status)}</p>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(stage.progressPercent, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
};
