import { InventoryItem, Project, WorkLog } from "@/lib/types";

export const calculateRemainingStock = (item: InventoryItem) => item.quantityReceived - item.quantityConsumed;

export const averageProjectProgress = (projects: Project[]) => {
  if (projects.length === 0) {
    return 0;
  }

  const total = projects.reduce((sum, project) => sum + project.progressPercent, 0);
  return Math.round(total / projects.length);
};

export const sortWorkLogsByDate = (items: WorkLog[]) =>
  [...items].sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
