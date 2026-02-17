"use client";

import { useServices } from "@/hooks/useServices";
import ServiceCard from "@/components/ServiceCard";

const ServicesSection = () => {
  const { data: services = [], isLoading } = useServices();

  return (
    <section className="py-16" id="services">
      <div className="container mx-auto px-4">
        <h2 className="font-rubik text-3xl md:text-4xl font-extrabold text-heading text-center mb-4">
          השירותים שלנו
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          שירותים מקצועיים מכישרונות צעירים — בחרו שירות וגלו מה אנחנו יכולים לעשות בשבילכם
        </p>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">טוען...</p>
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="animate-fade-in">
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">אין שירותים כרגע</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
