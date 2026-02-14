import { useParams, Link } from "react-router-dom";
import { useStudent } from "@/hooks/useStudents";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const StudentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { data: student, isLoading } = useStudent(id);
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-xl text-muted-foreground">טוען...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-rubik text-3xl font-bold text-heading mb-4">לא נמצא 😕</h1>
            <Button asChild>
              <Link to="/">חזרה לדף הבית</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "ההודעה נשלחה!", description: `תודה ${formData.name}, נחזור אליך בהקדם.` });
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Back link */}
        <div className="container mx-auto px-4 pt-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowRight className="h-4 w-4" />
            חזרה לכל החניכים
          </Link>
        </div>

        {/* Hero */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-80 h-80 rounded-2xl overflow-hidden bg-soft-bg shrink-0">
                <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h1 className="font-rubik text-4xl md:text-5xl font-extrabold text-heading mb-3">
                  {student.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">{student.shortDescription}</p>
                <p className="text-base leading-relaxed text-foreground">{student.longDescription}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-12 bg-soft-bg/40">
          <div className="container mx-auto px-4">
            <h2 className="font-rubik text-2xl font-bold text-heading mb-6">שירותים</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.categories.map((cat) => (
                <div key={cat} className="bg-card rounded-xl p-5 shadow-sm">
                  <h3 className="font-rubik font-semibold text-heading mb-3">{cat}</h3>
                  <div className="flex flex-wrap gap-2">
                    {student.services.map((service) => (
                      <Badge key={service} variant="secondary" className="bg-tag text-foreground">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="font-rubik text-2xl font-bold text-heading mb-6">יצירת קשר</h2>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center gap-2 bg-card rounded-xl p-4 shadow-sm flex-1">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-sm">{student.contact.email}</span>
              </div>
              <div className="flex items-center gap-2 bg-card rounded-xl p-4 shadow-sm flex-1">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm">{student.contact.phone}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="שם מלא"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-card"
              />
              <Input
                type="email"
                placeholder="אימייל"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-card"
              />
              <Textarea
                placeholder="הודעה"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={4}
                className="bg-card"
              />
              <Button type="submit" className="w-full bg-primary hover:bg-heading">
                שליחה
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default StudentProfile;
