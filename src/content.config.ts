import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    pubDate: z.coerce.date(),
  }),
});

const examCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: "./src/content/exam" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    topic: z.string(), // e.g. "Anatomy", "Biomechanics"
    exams: z.string(), // e.g. "ACE · NASM · CSCS"
    duration: z.string(), // e.g. "10 min study"
  }),
});
const aceCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: "./src/content/ace" }),
  schema: z.object({
    title: z.string(),
    chapter: z.number(),
    description: z.string(),
  }),
});

export const collections = {
  blog: blogCollection,
  exam: examCollection,
  ace: aceCollection,
};
