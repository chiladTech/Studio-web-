import { z } from 'zod';

export const InquirySchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Valid phone number is required'),
  contactMethod: z.string().default('email'),
  service: z.string().optional(),
  package: z.string().optional(),
  preferredDate: z.string().optional(),
  alternativeDate: z.string().optional(),
  location: z.string().optional(),
  expectedGuests: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(5, 'Message must be at least 5 characters long'),
});

export const LoginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const PortfolioProjectSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  story: z.string().optional(),
  location: z.string().optional(),
  projectDate: z.string().optional(),
  coverImage: z.string().optional(),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
});

export const ServiceSchema = z.object({
  name: z.string().min(2, 'Service name is required'),
  shortDesc: z.string().min(5, 'Short description is required'),
  longDesc: z.string().optional(),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
  features: z.string().optional(),
  isPublished: z.boolean().default(true),
});

export const PackageSchema = z.object({
  name: z.string().min(2, 'Package name is required'),
  priceDisplay: z.string().min(1, 'Price display is required'),
  description: z.string().min(5, 'Description is required'),
  duration: z.string().optional(),
  deliverables: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});
