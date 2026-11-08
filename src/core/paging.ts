import type { El } from "./element";

export interface Paging {
  totalItems: number;
  currentPage: number;
  pageSize: number;
}

/** Reads a `<Paging>` element whose fields are child elements holding plain numbers. */
export function parsePaging(el: El): Paging {
  return {
    totalItems: el.one("TotalItems").numberText(),
    currentPage: el.one("CurrentPage").numberText(),
    pageSize: el.one("PageSize").numberText(),
  };
}
