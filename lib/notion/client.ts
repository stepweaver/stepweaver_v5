import { Client } from "@notionhq/client";

let notion: Client | null = null;

export function getNotion(): Client {
  const key = process.env.NOTION_API_KEY?.trim();
  if (!key) {
    throw new Error("Missing env var: NOTION_API_KEY");
  }
  if (!notion) {
    notion = new Client({ auth: key });
  }
  return notion;
}
