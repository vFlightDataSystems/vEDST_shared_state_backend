import { Plan } from "./plan";

export class PlanState {
  planQueue: Plan[] = [];
  selectedPlanIndex: number | null = null;
}