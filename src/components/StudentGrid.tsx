import { useMemo, useState } from "react";
import { useStudents } from "@/hooks/useStudents";
import StudentCard from "@/components/StudentCard";
import SearchFilter from "@/components/SearchFilter";

const StudentGrid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { data: students = [], isLoading } = useStudents();

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.services.some((s) => s.toLowerCase().includes(q)) ||
        student.categories.some((c) => c.toLowerCase().includes(q)) ||
        student.shortDescription.toLowerCase().includes(q);

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => student.services.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [searchQuery, selectedTags, students]);

  return (
    <>
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
    </>
  );
};

export default StudentGrid;
