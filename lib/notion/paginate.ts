type QueryResult = {
  results?: unknown[];
  has_more?: boolean;
  next_cursor?: string | null;
};

export async function paginate<T>(
  queryFn: (_cursor: string | undefined) => Promise<QueryResult>,
  options: { limit?: number } = {}
): Promise<T[]> {
  let cursor: string | undefined;
  const items: T[] = [];
  const { limit } = options;

  while (true) {
    const res = await queryFn(cursor);
    const batch = (res.results ?? []) as T[];
    items.push(...batch);

    if (limit && items.length >= limit) {
      return items.slice(0, limit);
    }

    if (!res.has_more || !res.next_cursor) {
      return items;
    }

    cursor = res.next_cursor;
  }
}
