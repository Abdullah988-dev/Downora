import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import SupportedPlatforms from "./components/SupportedPlatforms";
import HowItWorks from "./components/HowItWorks";
import Stats from "./components/Stats";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main>
        <Hero />
        <Features />
        <SupportedPlatforms />
        <HowItWorks />
        <Stats />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  );
}

export default App;