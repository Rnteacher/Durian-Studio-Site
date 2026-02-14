import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
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
import { Pencil, Trash2, Plus, LogOut } from "lucide-react";

interface StudentForm {
  id: string;
  name: string;
  short_description: string;
  long_description: string;
  image: string;
  categories: string;
  services: string;
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  tiktok: string;
}

const emptyForm: StudentForm = {
  id: "", name: "", short_description: "", long_description: "",
  image: "/placeholder.svg", categories: "", services: "",
  email: "", phone: "", instagram: "", facebook: "", tiktok: "",
};

const Admin = () => {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const { data: students, isLoading } = useStudents();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [isNew, setIsNew] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  if (!user) { navigate("/admin/login"); return null; }
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">אין לך הרשאות מנהל</p>
      </main>
      <Footer />
    </div>
  );

  const openEdit = (student: any) => {
    setForm({
      id: student.id,
      name: student.name,
      short_description: student.shortDescription,
      long_description: student.longDescription,
      image: student.image,
      categories: student.categories.join(", "),
      services: student.services.join(", "),
      email: student.contact.email,
      phone: student.contact.phone,
      instagram: student.contact.socials?.instagram || "",
      facebook: student.contact.socials?.facebook || "",
      tiktok: student.contact.socials?.tiktok || "",
    });
    setIsNew(false);
    setEditOpen(true);
  };

  const openNew = () => {
    setForm(emptyForm);
    setIsNew(true);
    setEditOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      id: form.id,
      name: form.name,
      short_description: form.short_description,
      long_description: form.long_description,
      image: form.image,
      categories: form.categories.split(",").map(s => s.trim()).filter(Boolean),
      services: form.services.split(",").map(s => s.trim()).filter(Boolean),
      email: form.email,
      phone: form.phone,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      tiktok: form.tiktok || null,
    };

    const { error } = isNew
      ? await supabase.from("students").insert(payload)
      : await supabase.from("students").update(payload).eq("id", form.id);

    if (error) {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isNew ? "חניך נוסף!" : "עודכן בהצלחה!" });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setEditOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק את החניך?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "נמחק!" });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-rubik text-3xl font-bold text-heading">ניהול חניכים</h1>
          <div className="flex gap-2">
            <Button onClick={openNew} className="gap-1"><Plus className="h-4 w-4" />חניך חדש</Button>
            <Button variant="outline" onClick={handleLogout} className="gap-1"><LogOut className="h-4 w-4" />יציאה</Button>
          </div>
        </div>

        {isLoading ? (
          <p>טוען...</p>
        ) : (
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
                  <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isNew ? "הוספת חניך" : "עריכת חניך"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {isNew && (
                <Input placeholder="מזהה (אנגלית)" value={form.id} onChange={e => setForm({...form, id: e.target.value})} dir="ltr" />
              )}
              <Input placeholder="שם" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <Input placeholder="תיאור קצר" value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} />
              <Textarea placeholder="תיאור מלא" value={form.long_description} onChange={e => setForm({...form, long_description: e.target.value})} rows={3} />
              <Input placeholder="קישור תמונה" value={form.image} onChange={e => setForm({...form, image: e.target.value})} dir="ltr" />
              <Input placeholder="קטגוריות (מופרדות בפסיק)" value={form.categories} onChange={e => setForm({...form, categories: e.target.value})} />
              <Input placeholder="שירותים (מופרדים בפסיק)" value={form.services} onChange={e => setForm({...form, services: e.target.value})} />
              <Input placeholder="אימייל" value={form.email} onChange={e => setForm({...form, email: e.target.value})} dir="ltr" />
              <Input placeholder="טלפון" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} dir="ltr" />
              <Input placeholder="אינסטגרם (אופציונלי)" value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} dir="ltr" />
              <Input placeholder="פייסבוק (אופציונלי)" value={form.facebook} onChange={e => setForm({...form, facebook: e.target.value})} dir="ltr" />
              <Input placeholder="טיקטוק (אופציונלי)" value={form.tiktok} onChange={e => setForm({...form, tiktok: e.target.value})} dir="ltr" />
              <Button onClick={handleSave} className="w-full">{isNew ? "הוסף" : "שמור"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
