/**
 * Submits data to a Netlify Form. The form must also exist as a hidden,
 * static <form> in index.html so Netlify can detect it at deploy time.
 */
export async function submitNetlifyForm(
  formName: string,
  data: Record<string, string>
): Promise<void> {
  const body = new URLSearchParams({ "form-name": formName, ...data }).toString();
  const res = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`Form submission failed (${res.status})`);
  }
}

export const SERVICES = [
  "Shopify store / theme",
  "Shopify app / Plus / headless",
  "Web app / SaaS",
  "AI / ML solution",
  "HRMS / business software",
  "Something else",
];
