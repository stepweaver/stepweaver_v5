import { Client } from "@notionhq/client";

let notion: Client | null = null;

export function getNotion(): Client {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("Missing env var: NOTION_API_KEY");
  }
  if (!notion) {
    notion = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return notion;
}
