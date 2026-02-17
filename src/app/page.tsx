import HeroSection from "@/components/HeroSection";
import StudentGrid from "@/components/StudentGrid"; // Import StudentGrid

export default function Home() {
  return (
    <main className="flex-1">
      <HeroSection />
      <StudentGrid /> {/* Render StudentGrid */}
    </main>
  );
}
