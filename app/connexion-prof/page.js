import { Suspense } from "react";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import ConnexionProfForm from "./ConnexionProfForm";

export default function ConnexionProfPage() {
  return (
    <div>
      <AnnouncementBar />
      <Suspense fallback={null}>
        <ConnexionProfForm />
      </Suspense>
      <Footer />
    </div>
  );
}
