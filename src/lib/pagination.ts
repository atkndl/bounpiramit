// src/lib/pagination.ts
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];

/** İlk sayfa: newest-first + planned count (hızlı) */
export async function fetchFirstPage(
  table: TableName,
  selectCols: string,
  pageSize = 20,
  orderColumn: string = "created_at"
) {
  const { data, count, error } = await supabase
    .from(table as any)
    .select(selectCols, { count: "planned" }) // exact değil → hızlı
    .order(orderColumn as any, { ascending: false })
    .limit(pageSize);
  if (error) throw error;

  const last = data && data.length ? (data[data.length - 1] as any)[orderColumn] : null;
  return { data: data ?? [], nextCursor: last, hasMore: (data?.length ?? 0) === pageSize, count: count ?? 0 };
}

/** Sonraki sayfa: keyset (cursor) */
export async function fetchNextPage(
  table: TableName,
  cursor: string | null,
  selectCols: string,
  pageSize = 20,
  orderColumn: string = "created_at"
) {
  if (!cursor) return { data: [], nextCursor: null, hasMore: false };
  const { data, error } = await supabase
    .from(table as any)
    .select(selectCols)
    .lt(orderColumn as any, cursor)
    .order(orderColumn as any, { ascending: false })
    .limit(pageSize);
  if (error) throw error;

  const last = data && data.length ? (data[data.length - 1] as any)[orderColumn] : null;
  return { data: data ?? [], nextCursor: last, hasMore: (data?.length ?? 0) === pageSize };
}
