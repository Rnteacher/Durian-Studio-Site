"use client";

import Link from "next/link";
import { useServiceBySlug } from "@/hooks/useServices";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function ServicePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data: service, isLoading } = useServiceBySlug(slug);

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">טוען...</p>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-rubik text-3xl font-bold text-heading mb-4">שירות לא נמצא 😕</h1>
          <Button asChild>
            <Link href="/">חזרה לדף הבית</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {/* Back link */}
      <div className="container mx-auto px-4 pt-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowRight className="h-4 w-4" />
          חזרה לדף הבית
        </Link>
      </div>

      {/* Hero */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-96 h-64 rounded-2xl overflow-hidden bg-soft-bg shrink-0">
              <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="font-rubik text-4xl md:text-5xl font-extrabold text-heading mb-4">
                {service.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">{service.shortDescription}</p>
              <Button asChild className="bg-primary hover:bg-heading">
                <Link href={`/contact?service=${encodeURIComponent(service.title)}`}>
                  בקשת שירות
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-12 bg-soft-bg/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-rubik text-2xl font-bold text-heading mb-6">מה כולל השירות?</h2>
          <div className="prose prose-lg max-w-none text-foreground leading-relaxed">
            <p>{service.longDescription}</p>
          </div>
        </div>
      </section>

      {/* Students providing this service */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="font-rubik text-2xl font-bold text-heading mb-8">חניכים שנותנים את השירות</h2>
          {service.students.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {service.students.map((student) => (
                <Link key={student.id} href={`/student/${student.id}`}>
                  <Card className="group hover-scale cursor-pointer overflow-hidden border-border bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <div className="aspect-square bg-soft-bg overflow-hidden">
                      <img src={student.image} alt={student.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-rubik text-xl font-bold text-heading mb-1">{student.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{student.shortDescription}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-card rounded-xl">
              <p className="text-lg text-muted-foreground">כרגע אין חניכים שמוצגים לשירות הזה — בקרוב נוסיף.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
