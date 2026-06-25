export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function uniqueSlug(
  title: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(title) || 'contest';
  let slug = base;
  let suffix = 1;

  while (await exists(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
