import { Suspense } from "react";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import InscriptionForm from "./InscriptionForm";

export default function InscriptionPage() {
  return (
    <div>
      <AnnouncementBar />
      <Suspense fallback={null}>
        <InscriptionForm />
      </Suspense>
      <Footer />
    </div>
  );
}
