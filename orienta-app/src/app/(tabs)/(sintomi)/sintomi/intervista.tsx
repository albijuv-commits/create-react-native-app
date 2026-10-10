import { interviewConditions } from "@/lib/conditions/knowledge-base";
import { Interview } from "~/components/triage/interview";

const CONDITIONS = interviewConditions();

export default function IntervistaScreen() {
  return <Interview conditions={CONDITIONS} />;
}
