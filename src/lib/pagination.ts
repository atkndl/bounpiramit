// src/lib/pagination.ts
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];

/** İlk sayfa: newest-first + planned count (hızlı) */
export async function fetchFirstPage<T = any>(
  table: TableName,
  selectCols: string,
  pageSize = 20,
  orderColumn: string = "created_at"
): Promise<{ data: T[]; count: number; nextCursor: string | null; hasMore: boolean }> {
  const { data, count, error } = await supabase
    .from(table)
    .select(selectCols, { count: "planned" }) // exact değil → hızlı
    .order(orderColumn as any, { ascending: false })
    .limit(pageSize);

  if (error) throw error;
  const nextCursor =
    data && data.length ? (data[data.length - 1] as any)[orderColumn] : null;
  const hasMore = (data?.length ?? 0) === pageSize;
  return { data: (data as unknown as T[]) ?? [], count: count ?? 0, nextCursor, hasMore };
}

/** Sonraki sayfa: keyset (cursor) */
export async function fetchNextPage<T = any>(
  table: TableName,
  cursor: string | null,
  selectCols: string,
  pageSize = 20,
  orderColumn: string = "created_at"
): Promise<{ data: T[]; nextCursor: string | null; hasMore: boolean }> {
  if (!cursor) return { data: [], nextCursor: null, hasMore: false };

  const { data, error } = await supabase
    .from(table)
    .select(selectCols)
    .lt(orderColumn as any, cursor) // keyset 🔑
    .order(orderColumn as any, { ascending: false })
    .limit(pageSize);

  if (error) throw error;
  const nextCursor =
    data && data.length ? (data[data.length - 1] as any)[orderColumn] : null;
  const hasMore = (data?.length ?? 0) === pageSize;
  return { data: (data as unknown as T[]) ?? [], nextCursor, hasMore };
}
