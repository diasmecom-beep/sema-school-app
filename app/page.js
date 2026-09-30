import AnnouncementBar from "./components/AnnouncementBar";
import Hero from "./components/Hero";
import Schedule from "./components/Schedule";
import Steps from "./components/Steps";
import RemiseFamille from "./components/RemiseFamille";
import Community from "./components/Community";
import Footer from "./components/Footer";
import PopupInscription from "./components/PopupInscription";

export default function HomePage() {
  return (
    <div>
      <PopupInscription />
      <AnnouncementBar />
      <Hero />
      <Schedule />
      <Steps />
      <RemiseFamille />
      <Community />
      <Footer />
    </div>
  );
}
