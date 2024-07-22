import { Navbar, Hero, Projects, Contact, Footer } from "./sections";

export default function App() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <Projects />
      <Contact />
      <Footer />
    </main>
  );
}
