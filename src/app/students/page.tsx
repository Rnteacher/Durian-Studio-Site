"use client";

import { useMemo, useState } from "react";
import { useStudents } from "@/hooks/useStudents";
import { useServices } from "@/hooks/useServices";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import StudentCard from "@/components/StudentCard";
import SearchFilter from "@/components/SearchFilter";

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { data: students = [], isLoading } = useStudents();
  const { data: services = [] } = useServices();

  const { data: allLinks = [] } = useQuery({
    queryKey: ["all-service-student-links"],
    queryFn: async () => {
      const { data } = await supabase.from("service_students").select("service_id, student_id");
      return data || [];
    },
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const q = searchQuery.trim().toLowerCase();
      const studentServiceIds = allLinks.filter(l => l.student_id === student.id).map(l => l.service_id);
      const studentServiceTitles = services.filter(s => studentServiceIds.includes(s.id)).map(s => s.title);
      const studentCategories = [...new Set(services.filter(s => studentServiceIds.includes(s.id)).map(s => s.category).filter(Boolean))];

      const matchesSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        studentServiceTitles.some((s) => s.toLowerCase().includes(q)) ||
        studentCategories.some((c) => c.toLowerCase().includes(q)) ||
        student.shortDescription.toLowerCase().includes(q);

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => studentServiceTitles.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [searchQuery, selectedTags, students, services, allLinks]);

  return (
    <main className="flex-1">
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-rubik text-4xl md:text-5xl font-extrabold text-heading mb-4">
            החניכים שלנו
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            הכירו את הכישרונות הצעירים שעומדים מאחורי השירותים
          </p>
        </div>
      </section>

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onClearFilters={() => setSelectedTags([])}
      />

      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">טוען...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStudents.map((student) => (
                <div key={student.id} className="animate-fade-in">
                  <StudentCard student={student} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">לא נמצאו תוצאות 😕</p>
              <p className="text-sm text-muted-foreground mt-2">נסו לחפש מונח אחר או לנקות את הסינון</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
