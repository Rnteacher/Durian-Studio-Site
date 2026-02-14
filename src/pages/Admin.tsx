import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { useServices } from "@/hooks/useServices";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
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
import { Pencil, Trash2, Plus, LogOut, X, Upload, Loader2 } from "lucide-react";

// ─── Student Form ───
interface StudentForm {
  id: string;
  name: string;
  short_description: string;
  long_description: string;
  image: string;
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  portfolio_url: string;
  resume_url: string;
  linkedServiceIds: string[];
}

const emptyStudentForm: StudentForm = {
  id: "", name: "", short_description: "", long_description: "",
  image: "/placeholder.svg",
  email: "", phone: "", instagram: "", facebook: "", tiktok: "",
  portfolio_url: "", resume_url: "", linkedServiceIds: [],
};

// ─── Service Form ───
interface ServiceForm {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  long_description: string;
  image: string;
  category: string;
  linkedStudentIds: string[];
}

const emptyServiceForm: ServiceForm = {
  id: "", slug: "", title: "", short_description: "", long_description: "",
  image: "/placeholder.svg", category: "", linkedStudentIds: [],
};

// ─── Image Upload Helper ───
async function uploadImage(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("images").upload(path, file);
  if (error) return null;
  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}

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
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [uploadingStudentImage, setUploadingStudentImage] = useState(false);
  const studentImageRef = useRef<HTMLInputElement>(null);

  // Service state
  const [serviceEditOpen, setServiceEditOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState<ServiceForm>(emptyServiceForm);
  const [isNewService, setIsNewService] = useState(false);
  const [uploadingServiceImage, setUploadingServiceImage] = useState(false);
  const serviceImageRef = useRef<HTMLInputElement>(null);

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

  // ─── Image Upload Handlers ───
  const handleStudentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingStudentImage(true);
    const url = await uploadImage(file, "students");
    setUploadingStudentImage(false);
    if (url) {
      setStudentForm(prev => ({ ...prev, image: url }));
      toast({ title: "התמונה הועלתה בהצלחה!" });
    } else {
      toast({ title: "שגיאה בהעלאת תמונה", variant: "destructive" });
    }
  };

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingServiceImage(true);
    const url = await uploadImage(file, "services");
    setUploadingServiceImage(false);
    if (url) {
      setServiceForm(prev => ({ ...prev, image: url }));
      toast({ title: "התמונה הועלתה בהצלחה!" });
    } else {
      toast({ title: "שגיאה בהעלאת תמונה", variant: "destructive" });
    }
  };

  // ─── Student CRUD ───
  // Derive unique categories from services
  const existingCategories = [...new Set((services || []).map(s => s.category).filter(Boolean))];

  const openEditStudent = async (student: any) => {
    // Get linked service IDs
    const { data: links } = await supabase.from("service_students").select("service_id").eq("student_id", student.id);
    setStudentForm({
      id: student.id, name: student.name,
      short_description: student.shortDescription, long_description: student.longDescription,
      image: student.image,
      email: student.contact.email, phone: student.contact.phone,
      instagram: student.contact.socials?.instagram || "",
      facebook: student.contact.socials?.facebook || "",
      tiktok: student.contact.socials?.tiktok || "",
      portfolio_url: student.portfolioUrl || "",
      resume_url: student.resumeUrl || "",
      linkedServiceIds: (links || []).map((l: any) => l.service_id),
    });
    setIsNewStudent(false);
    setStudentEditOpen(true);
  };

  const openNewStudent = () => { setStudentForm(emptyStudentForm); setIsNewStudent(true); setStudentEditOpen(true); };

  const toggleServiceLink = (serviceId: string) => {
    setStudentForm(prev => ({
      ...prev,
      linkedServiceIds: prev.linkedServiceIds.includes(serviceId)
        ? prev.linkedServiceIds.filter(id => id !== serviceId)
        : [...prev.linkedServiceIds, serviceId],
    }));
  };

  const handleSaveStudent = async () => {
    // Derive categories from linked services
    const linkedServices = (services || []).filter(s => studentForm.linkedServiceIds.includes(s.id));
    const cats = [...new Set(linkedServices.map(s => s.category).filter(Boolean))];
    const svcMap: Record<string, string[]> = {};
    linkedServices.forEach(s => {
      if (s.category) {
        if (!svcMap[s.category]) svcMap[s.category] = [];
        svcMap[s.category].push(s.title);
      }
    });
    const payload = {
      id: studentForm.id, name: studentForm.name,
      short_description: studentForm.short_description, long_description: studentForm.long_description,
      image: studentForm.image, categories: cats, services: svcMap,
      email: studentForm.email, phone: studentForm.phone,
      instagram: studentForm.instagram || null, facebook: studentForm.facebook || null, tiktok: studentForm.tiktok || null,
      portfolio_url: studentForm.portfolio_url || null,
      resume_url: studentForm.resume_url || null,
    };
    const { error } = isNewStudent
      ? await supabase.from("students").insert(payload)
      : await supabase.from("students").update(payload).eq("id", studentForm.id);
    if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }

    // Update service_students links
    if (!isNewStudent) {
      await supabase.from("service_students").delete().eq("student_id", studentForm.id);
    }
    if (studentForm.linkedServiceIds.length > 0) {
      const rows = studentForm.linkedServiceIds.map(sid => ({ service_id: sid, student_id: studentForm.id }));
      await supabase.from("service_students").insert(rows);
    }

    toast({ title: isNewStudent ? "חניך נוסף!" : "עודכן בהצלחה!" });
    queryClient.invalidateQueries({ queryKey: ["students"] });
    queryClient.invalidateQueries({ queryKey: ["services"] });
    queryClient.invalidateQueries({ queryKey: ["student-services"] });
    setStudentEditOpen(false);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("למחוק את החניך?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); }
    else { toast({ title: "נמחק!" }); queryClient.invalidateQueries({ queryKey: ["students"] }); }
  };

  // ─── Service CRUD ───
  const openEditService = async (service: any) => {
    const { data: links } = await supabase.from("service_students").select("student_id").eq("service_id", service.id);
    setServiceForm({
      id: service.id, slug: service.slug, title: service.title,
      short_description: service.shortDescription, long_description: service.longDescription,
      image: service.image, category: service.category || "",
      linkedStudentIds: (links || []).map((l: any) => l.student_id),
    });
    setIsNewService(false);
    setServiceEditOpen(true);
  };

  const openNewService = () => { setServiceForm(emptyServiceForm); setIsNewService(true); setIsCreatingNewCategory(false); setServiceEditOpen(true); };

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
      image: serviceForm.image, category: serviceForm.category,
    };

    let serviceId = serviceForm.id;

    if (isNewService) {
      const { data, error } = await supabase.from("services").insert(payload).select("id").single();
      if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
      serviceId = data.id;
    } else {
      const { error } = await supabase.from("services").update(payload).eq("id", serviceForm.id);
      if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
      await supabase.from("service_students").delete().eq("service_id", serviceForm.id);
    }

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
              <Textarea placeholder="ביוגרפיה / תיאור מלא" value={studentForm.long_description} onChange={e => setStudentForm({...studentForm, long_description: e.target.value})} rows={4} />
              
              {/* Image upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-heading">תמונה</label>
                <div className="flex items-center gap-3">
                  {studentForm.image && studentForm.image !== "/placeholder.svg" && (
                    <img src={studentForm.image} alt="תצוגה מקדימה" className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 flex gap-2">
                    <Input placeholder="קישור תמונה" value={studentForm.image} onChange={e => setStudentForm({...studentForm, image: e.target.value})} dir="ltr" className="flex-1" />
                    <input type="file" accept="image/*" ref={studentImageRef} className="hidden" onChange={handleStudentImageUpload} />
                    <Button type="button" variant="outline" size="icon" onClick={() => studentImageRef.current?.click()} disabled={uploadingStudentImage}>
                      {uploadingStudentImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Service checkboxes grouped by category */}
              <div className="border rounded-lg p-3 space-y-3">
                <p className="text-sm font-semibold text-heading">שירותים מקושרים:</p>
                {existingCategories.map(cat => {
                  const catServices = (services || []).filter(s => s.category === cat);
                  if (catServices.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{cat}</p>
                      {catServices.map(svc => (
                        <label key={svc.id} className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-muted/50">
                          <Checkbox
                            checked={studentForm.linkedServiceIds.includes(svc.id)}
                            onCheckedChange={() => toggleServiceLink(svc.id)}
                          />
                          <span className="text-sm">{svc.title}</span>
                        </label>
                      ))}
                    </div>
                  );
                })}
                {(services || []).filter(s => !s.category).length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">ללא קטגוריה</p>
                    {(services || []).filter(s => !s.category).map(svc => (
                      <label key={svc.id} className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-muted/50">
                        <Checkbox
                          checked={studentForm.linkedServiceIds.includes(svc.id)}
                          onCheckedChange={() => toggleServiceLink(svc.id)}
                        />
                        <span className="text-sm">{svc.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-3 space-y-3">
                <p className="text-sm font-semibold text-heading">קישורים</p>
                <Input placeholder="קישור לתיק עבודות (אופציונלי)" value={studentForm.portfolio_url} onChange={e => setStudentForm({...studentForm, portfolio_url: e.target.value})} dir="ltr" />
                <Input placeholder="קישור לרזומה (אופציונלי)" value={studentForm.resume_url} onChange={e => setStudentForm({...studentForm, resume_url: e.target.value})} dir="ltr" />
              </div>

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

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-heading">קטגוריה</label>
                <select
                  value={isCreatingNewCategory ? "__new__" : serviceForm.category}
                  onChange={e => {
                    if (e.target.value === "__new__") {
                      setIsCreatingNewCategory(true);
                      setNewCategoryInput("");
                      setServiceForm({...serviceForm, category: ""});
                    } else {
                      setIsCreatingNewCategory(false);
                      setServiceForm({...serviceForm, category: e.target.value});
                    }
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">בחר קטגוריה...</option>
                  {existingCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__new__">+ קטגוריה חדשה</option>
                </select>
                {isCreatingNewCategory && (
                  <Input
                    placeholder="שם הקטגוריה החדשה"
                    value={newCategoryInput}
                    onChange={e => {
                      setNewCategoryInput(e.target.value);
                      setServiceForm({...serviceForm, category: e.target.value});
                    }}
                    autoFocus
                  />
                )}
              </div>
              
              {/* Image upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-heading">תמונה</label>
                <div className="flex items-center gap-3">
                  {serviceForm.image && serviceForm.image !== "/placeholder.svg" && (
                    <img src={serviceForm.image} alt="תצוגה מקדימה" className="w-16 h-10 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 flex gap-2">
                    <Input placeholder="קישור תמונה" value={serviceForm.image} onChange={e => setServiceForm({...serviceForm, image: e.target.value})} dir="ltr" className="flex-1" />
                    <input type="file" accept="image/*" ref={serviceImageRef} className="hidden" onChange={handleServiceImageUpload} />
                    <Button type="button" variant="outline" size="icon" onClick={() => serviceImageRef.current?.click()} disabled={uploadingServiceImage}>
                      {uploadingServiceImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

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
