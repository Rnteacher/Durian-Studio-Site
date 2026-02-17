"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useServices } from "@/hooks/useServices";

export default function Contact() {
  const { toast } = useToast();
  const { data: services = [] } = useServices();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          category: selectedCategory === "__other__" ? "אחר" : selectedCategory,
          service: formData.service === "__other__" ? "" : formData.service,
          message: formData.message,
        },
      });
      if (error) throw error;
      toast({ title: "ההודעה נשלחה!", description: "תודה שפנית אלינו, נחזור אליך בהקדם." });
      setFormData({ name: "", email: "", phone: "", service: "", message: "" });
      setSelectedCategory("");
    } catch (err) {
      console.error("Failed to send email:", err);
      toast({ title: "שגיאה בשליחה", description: "משהו השתבש, נסו שוב מאוחר יותר.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex-1 py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="font-rubik text-4xl md:text-5xl font-extrabold text-heading text-center mb-4">
          יצירת קשר
        </h1>
        <p className="text-center text-muted-foreground mb-10">
          רוצים לשמוע עוד? יש לכם פרויקט? נשמח לשמוע!
        </p>

        {/* Studio email */}
        <div className="flex items-center justify-center gap-2 bg-card rounded-xl p-4 shadow-sm mb-10">
          <Mail className="h-5 w-5 text-primary" />
          <span className="font-medium">studio@chamama.org</span>
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
          <Input
            type="tel"
            placeholder="טלפון"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="bg-card"
          />
          {/* Category & Service selection */}
          {(() => {
            const categoryMap = new Map<string, string[]>();
            services.forEach(s => {
              const cat = s.category || "כללי";
              if (!categoryMap.has(cat)) categoryMap.set(cat, []);
              categoryMap.get(cat)!.push(s.title);
            });
            const categories = [...categoryMap.keys()];
            const servicesInCategory = selectedCategory ? categoryMap.get(selectedCategory) || [] : [];

            return (
              <>
                <select
                  value={selectedCategory}
                  onChange={e => {
                    setSelectedCategory(e.target.value);
                    setFormData({ ...formData, service: "" });
                  }}
                  className="flex h-12 w-full rounded-xl border border-input bg-card px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">בחרו קטגוריה...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__other__">אחר</option>
                </select>

                {selectedCategory && selectedCategory !== "__other__" && servicesInCategory.length > 0 && (
                  <select
                    value={formData.service}
                    onChange={e => setFormData({ ...formData, service: e.target.value })}
                    className="flex h-12 w-full rounded-xl border border-input bg-card px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">בחרו שירות...</option>
                    {servicesInCategory.map(svc => (
                      <option key={svc} value={svc}>{svc}</option>
                    ))}
                    <option value="__other__">אחר</option>
                  </select>
                )}

                {(selectedCategory === "__other__" || formData.service === "__other__") && (
                  <Input
                    placeholder="פרטו את השירות המבוקש"
                    value={selectedCategory === "__other__" ? formData.service : ""}
                    onChange={e => setFormData({ ...formData, service: e.target.value })}
                    className="bg-card"
                  />
                )}
              </>
            );
          })()}
          <Textarea
            placeholder="הודעה"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            rows={5}
            className="bg-card"
          />
          <Button type="submit" disabled={sending} className="w-full bg-primary hover:bg-heading text-lg h-12">
            {sending ? "שולח..." : "שליחה"}
          </Button>
        </form>
      </div>
    </main>
  );
}
