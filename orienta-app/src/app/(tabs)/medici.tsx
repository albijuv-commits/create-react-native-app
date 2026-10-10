import medici from "@/assets/illustrations/sezione-medici.webp";
import { conditionSpecialists } from "@/lib/conditions/knowledge-base";
import { BookingInfo } from "~/components/doctors/booking-info";
import { DoctorFinder } from "~/components/doctors/doctor-finder";
import { PageHeader, Screen } from "~/components/ui/layout";

const CONDITIONS = conditionSpecialists();

export default function MediciScreen() {
  return (
    <Screen>
      <PageHeader title="Medici" lead="Trova professionisti vicino a te e contattali con un tocco." illustration={medici} />
      <DoctorFinder conditions={CONDITIONS} />
      <BookingInfo />
    </Screen>
  );
}
