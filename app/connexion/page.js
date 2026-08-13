import { Suspense } from "react";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import ConnexionForm from "./ConnexionForm";

export default function ConnexionPage() {
  return (
    <div>
      <AnnouncementBar />
      <Suspense fallback={null}>
        <ConnexionForm />
      </Suspense>
      <Footer />
    </div>
  );
}
