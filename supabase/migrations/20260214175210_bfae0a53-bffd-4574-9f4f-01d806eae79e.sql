
-- Add category column to services
ALTER TABLE public.services ADD COLUMN category text NOT NULL DEFAULT '';

-- Update existing services with categories
UPDATE public.services SET category = 'עריכה והפקה' WHERE slug = 'video-editing';
UPDATE public.services SET category = 'צילום' WHERE slug = 'event-photography';
UPDATE public.services SET category = 'מוזיקה' WHERE slug = 'music-editing';

-- Clean all old categories and services from students (they'll use service_students links)
UPDATE public.students SET categories = '{}', services = '{}'::jsonb;
