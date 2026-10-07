import type { Metadata } from "next";
import medici from "@/assets/illustrations/sezione-medici.webp";
import { BookingInfo } from "@/components/doctors/booking-info";
import { DoctorFinder } from "@/components/doctors/doctor-finder";
import { PageHeader } from "@/components/ui/page-header";
import { conditionSpecialists } from "@/lib/conditions/catalog";

export const metadata: Metadata = { title: "Medici" };

export default function MediciPage() {
  return (
    <>
      <PageHeader title="Medici" lead="Trova professionisti vicino a te e contattali con un tocco." illustration={medici} />
      <div className="space-y-8">
        <DoctorFinder conditions={conditionSpecialists()} />
        <BookingInfo />
      </div>
    </>
  );
}
