import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  image: string;
  category: string;
}

export interface ServiceWithStudents extends Service {
  students: { id: string; name: string; image: string; shortDescription: string }[];
}

function mapRow(row: any): Service {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    image: row.image,
    category: row.category || "",
  };
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []).map(mapRow);
    },
  });
}

export function useServiceBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["services", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      // Get linked students
      const { data: links } = await supabase
        .from("service_students")
        .select("student_id")
        .eq("service_id", data.id);

      const studentIds = (links || []).map((l: any) => l.student_id);
      let students: any[] = [];
      if (studentIds.length > 0) {
        const { data: studentsData } = await supabase
          .from("students")
          .select("id, name, image, short_description")
          .in("id", studentIds);
        students = (studentsData || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          image: s.image,
          shortDescription: s.short_description,
        }));
      }

      return { ...mapRow(data), students } as ServiceWithStudents;
    },
  });
}

export function useStudentServices(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student-services", studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data: links, error } = await supabase
        .from("service_students")
        .select("service_id")
        .eq("student_id", studentId!);
      if (error) throw error;
      if (!links?.length) return [];

      const serviceIds = links.map((l: any) => l.service_id);
      const { data: services } = await supabase
        .from("services")
        .select("*")
        .in("id", serviceIds);

      return (services || []).map(mapRow);
    },
  });
}
