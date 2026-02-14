import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { useServices } from "@/hooks/useServices";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus, LogOut, X } from "lucide-react";

// ─── Student Form ───
interface StudentForm {
  id: string;
  name: string;
  short_description: string;
  long_description: string;
  image: string;
  categories: string;
  services: Record<string, string[]>;
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  tiktok: string;
}

const emptyStudentForm: StudentForm = {
  id: "", name: "", short_description: "", long_description: "",
  image: "/placeholder.svg", categories: "", services: {},
  email: "", phone: "", instagram: "", facebook: "", tiktok: "",
};

// ─── Service Form ───
interface ServiceForm {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  long_description: string;
  image: string;
  linkedStudentIds: string[];
}

const emptyServiceForm: ServiceForm = {
  id: "", slug: "", title: "", short_description: "", long_description: "",
  image: "/placeholder.svg", linkedStudentIds: [],
};

const Admin = () => {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: services, isLoading: servicesLoading } = useServices();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Student state
  const [studentEditOpen, setStudentEditOpen] = useState(false);
  const [studentForm, setStudentForm] = useState<StudentForm>(emptyStudentForm);
  const [isNewStudent, setIsNewStudent] = useState(false);
  const [newServiceInputs, setNewServiceInputs] = useState<Record<string, string>>({});

  // Service state
  const [serviceEditOpen, setServiceEditOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState<ServiceForm>(emptyServiceForm);
  const [isNewService, setIsNewService] = useState(false);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">אין לך הרשאות מנהל</p>
      </main>
      <Footer />
    </div>
  );

  const handleLogout = async () => { await signOut(); navigate("/"); };

  // ─── Student CRUD ───
  const categoriesList = studentForm.categories.split(",").map(s => s.trim()).filter(Boolean);

  const openEditStudent = (student: any) => {
    setStudentForm({
      id: student.id, name: student.name,
      short_description: student.shortDescription, long_description: student.longDescription,
      image: student.image, categories: student.categories.join(", "),
      services: student.services,
      email: student.contact.email, phone: student.contact.phone,
      instagram: student.contact.socials?.instagram || "",
      facebook: student.contact.socials?.facebook || "",
      tiktok: student.contact.socials?.tiktok || "",
    });
    setNewServiceInputs({});
    setIsNewStudent(false);
    setStudentEditOpen(true);
  };

  const openNewStudent = () => { setStudentForm(emptyStudentForm); setNewServiceInputs({}); setIsNewStudent(true); setStudentEditOpen(true); };

  const addStudentService = (category: string) => {
    const value = (newServiceInputs[category] || "").trim();
    if (!value) return;
    setStudentForm(prev => ({ ...prev, services: { ...prev.services, [category]: [...(prev.services[category] || []), value] } }));
    setNewServiceInputs(prev => ({ ...prev, [category]: "" }));
  };

  const removeStudentService = (category: string, service: string) => {
    setStudentForm(prev => ({ ...prev, services: { ...prev.services, [category]: (prev.services[category] || []).filter(s => s !== service) } }));
  };

  const handleSaveStudent = async () => {
    const cats = categoriesList;
    const cleanServices: Record<string, string[]> = {};
    cats.forEach(cat => { if (studentForm.services[cat]?.length) cleanServices[cat] = studentForm.services[cat]; });
    const payload = {
      id: studentForm.id, name: studentForm.name,
      short_description: studentForm.short_description, long_description: studentForm.long_description,
      image: studentForm.image, categories: cats, services: cleanServices,
      email: studentForm.email, phone: studentForm.phone,
      instagram: studentForm.instagram || null, facebook: studentForm.facebook || null, tiktok: studentForm.tiktok || null,
    };
    const { error } = isNewStudent
      ? await supabase.from("students").insert(payload)
      : await supabase.from("students").update(payload).eq("id", studentForm.id);
    if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); }
    else { toast({ title: isNewStudent ? "חניך נוסף!" : "עודכן בהצלחה!" }); queryClient.invalidateQueries({ queryKey: ["students"] }); setStudentEditOpen(false); }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("למחוק את החניך?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); }
    else { toast({ title: "נמחק!" }); queryClient.invalidateQueries({ queryKey: ["students"] }); }
  };

  // ─── Service CRUD ───
  const openEditService = async (service: any) => {
    // Fetch linked students
    const { data: links } = await supabase.from("service_students").select("student_id").eq("service_id", service.id);
    setServiceForm({
      id: service.id, slug: service.slug, title: service.title,
      short_description: service.shortDescription, long_description: service.longDescription,
      image: service.image, linkedStudentIds: (links || []).map((l: any) => l.student_id),
    });
    setIsNewService(false);
    setServiceEditOpen(true);
  };

  const openNewService = () => { setServiceForm(emptyServiceForm); setIsNewService(true); setServiceEditOpen(true); };

  const toggleStudentLink = (studentId: string) => {
    setServiceForm(prev => ({
      ...prev,
      linkedStudentIds: prev.linkedStudentIds.includes(studentId)
        ? prev.linkedStudentIds.filter(id => id !== studentId)
        : [...prev.linkedStudentIds, studentId],
    }));
  };

  const handleSaveService = async () => {
    const payload = {
      slug: serviceForm.slug, title: serviceForm.title,
      short_description: serviceForm.short_description, long_description: serviceForm.long_description,
      image: serviceForm.image,
    };

    let serviceId = serviceForm.id;

    if (isNewService) {
      const { data, error } = await supabase.from("services").insert(payload).select("id").single();
      if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
      serviceId = data.id;
    } else {
      const { error } = await supabase.from("services").update(payload).eq("id", serviceForm.id);
      if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
      // Clear existing links
      await supabase.from("service_students").delete().eq("service_id", serviceForm.id);
    }

    // Insert new links
    if (serviceForm.linkedStudentIds.length > 0) {
      const rows = serviceForm.linkedStudentIds.map(sid => ({ service_id: serviceId, student_id: sid }));
      await supabase.from("service_students").insert(rows);
    }

    toast({ title: isNewService ? "שירות נוסף!" : "שירות עודכן!" });
    queryClient.invalidateQueries({ queryKey: ["services"] });
    queryClient.invalidateQueries({ queryKey: ["student-services"] });
    setServiceEditOpen(false);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("למחוק את השירות?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); }
    else { toast({ title: "נמחק!" }); queryClient.invalidateQueries({ queryKey: ["services"] }); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-rubik text-3xl font-bold text-heading">ניהול</h1>
          <Button variant="outline" onClick={handleLogout} className="gap-1"><LogOut className="h-4 w-4" />יציאה</Button>
        </div>

        <Tabs defaultValue="services" dir="rtl">
          <TabsList className="mb-6">
            <TabsTrigger value="services">שירותים</TabsTrigger>
            <TabsTrigger value="students">חניכים</TabsTrigger>
          </TabsList>

          {/* ─── Services Tab ─── */}
          <TabsContent value="services">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-rubik text-xl font-semibold text-heading">שירותים</h2>
              <Button onClick={openNewService} className="gap-1"><Plus className="h-4 w-4" />שירות חדש</Button>
            </div>
            {servicesLoading ? <p>טוען...</p> : (
              <div className="grid gap-3">
                {services?.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-sm">
                    <img src={s.image} alt={s.title} className="w-16 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-heading">{s.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{s.shortDescription}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{s.slug}</Badge>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => openEditService(s)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteService(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── Students Tab ─── */}
          <TabsContent value="students">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-rubik text-xl font-semibold text-heading">חניכים</h2>
              <Button onClick={openNewStudent} className="gap-1"><Plus className="h-4 w-4" />חניך חדש</Button>
            </div>
            {studentsLoading ? <p>טוען...</p> : (
              <div className="grid gap-3">
                {students?.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-sm">
                    <img src={s.image} alt={s.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-heading">{s.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{s.shortDescription}</p>
                    </div>
                    <div className="flex gap-1">
                      {s.categories.map(c => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => openEditStudent(s)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteStudent(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ─── Student Edit Dialog ─── */}
        <Dialog open={studentEditOpen} onOpenChange={setStudentEditOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isNewStudent ? "הוספת חניך" : "עריכת חניך"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {isNewStudent && (
                <Input placeholder="מזהה (אנגלית)" value={studentForm.id} onChange={e => setStudentForm({...studentForm, id: e.target.value})} dir="ltr" />
              )}
              <Input placeholder="שם" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
              <Input placeholder="תיאור קצר" value={studentForm.short_description} onChange={e => setStudentForm({...studentForm, short_description: e.target.value})} />
              <Textarea placeholder="תיאור מלא" value={studentForm.long_description} onChange={e => setStudentForm({...studentForm, long_description: e.target.value})} rows={3} />
              <Input placeholder="קישור תמונה" value={studentForm.image} onChange={e => setStudentForm({...studentForm, image: e.target.value})} dir="ltr" />
              <Input placeholder="קטגוריות (מופרדות בפסיק)" value={studentForm.categories} onChange={e => setStudentForm({...studentForm, categories: e.target.value})} />
              
              {categoriesList.length > 0 && (
                <div className="space-y-4 border rounded-lg p-3">
                  <p className="text-sm font-semibold text-heading">שירותים לפי קטגוריה:</p>
                  {categoriesList.map(cat => (
                    <div key={cat} className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{cat}</p>
                      <div className="flex flex-wrap gap-1">
                        {(studentForm.services[cat] || []).map(service => (
                          <Badge key={service} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeStudentService(cat, service)}>
                            {service}<X className="h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="הוסף שירות..." value={newServiceInputs[cat] || ""}
                          onChange={e => setNewServiceInputs(prev => ({ ...prev, [cat]: e.target.value }))}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addStudentService(cat); } }} className="text-sm" />
                        <Button type="button" size="sm" variant="outline" onClick={() => addStudentService(cat)}><Plus className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Input placeholder="אימייל" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} dir="ltr" />
              <Input placeholder="טלפון" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} dir="ltr" />
              <Input placeholder="אינסטגרם (אופציונלי)" value={studentForm.instagram} onChange={e => setStudentForm({...studentForm, instagram: e.target.value})} dir="ltr" />
              <Input placeholder="פייסבוק (אופציונלי)" value={studentForm.facebook} onChange={e => setStudentForm({...studentForm, facebook: e.target.value})} dir="ltr" />
              <Input placeholder="טיקטוק (אופציונלי)" value={studentForm.tiktok} onChange={e => setStudentForm({...studentForm, tiktok: e.target.value})} dir="ltr" />
              <Button onClick={handleSaveStudent} className="w-full">{isNewStudent ? "הוסף" : "שמור"}</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ─── Service Edit Dialog ─── */}
        <Dialog open={serviceEditOpen} onOpenChange={setServiceEditOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isNewService ? "הוספת שירות" : "עריכת שירות"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <Input placeholder="Slug (אנגלית, לדוגמה: video-editing)" value={serviceForm.slug} onChange={e => setServiceForm({...serviceForm, slug: e.target.value})} dir="ltr" />
              <Input placeholder="שם השירות" value={serviceForm.title} onChange={e => setServiceForm({...serviceForm, title: e.target.value})} />
              <Input placeholder="תיאור קצר" value={serviceForm.short_description} onChange={e => setServiceForm({...serviceForm, short_description: e.target.value})} />
              <Textarea placeholder="תיאור מלא" value={serviceForm.long_description} onChange={e => setServiceForm({...serviceForm, long_description: e.target.value})} rows={4} />
              <Input placeholder="קישור תמונה" value={serviceForm.image} onChange={e => setServiceForm({...serviceForm, image: e.target.value})} dir="ltr" />

              {/* Link students */}
              <div className="border rounded-lg p-3 space-y-2">
                <p className="text-sm font-semibold text-heading">חניכים מקושרים:</p>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {students?.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-muted/50">
                      <Checkbox
                        checked={serviceForm.linkedStudentIds.includes(s.id)}
                        onCheckedChange={() => toggleStudentLink(s.id)}
                      />
                      <img src={s.image} alt={s.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-sm">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveService} className="w-full">{isNewService ? "הוסף" : "שמור"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
