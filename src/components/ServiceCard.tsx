import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Service } from "@/hooks/useServices";

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <Card className="group hover-scale cursor-pointer overflow-hidden border-border bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video bg-soft-bg flex items-center justify-center overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="font-rubik text-2xl font-bold text-heading mb-3">
          {service.title}
        </h3>
        <p className="text-muted-foreground mb-5 line-clamp-2">
          {service.shortDescription}
        </p>
        <Button asChild className="w-full bg-primary hover:bg-heading gap-2">
          <Link href={`/services/${service.slug}`}>
            לפרטים
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
