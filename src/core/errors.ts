export type ApiErrorItem = { code: number; message: string };

/** Thrown when the Namecheap API answers with `Status="ERROR"`. */
export class NamecheapError extends Error {
  readonly code: number;
  readonly errors: readonly ApiErrorItem[];

  constructor(errors: readonly ApiErrorItem[]) {
    const first = errors[0];
    super(
      first === undefined
        ? "Unknown Namecheap error"
        : first.message.trim() === ""
          ? `Namecheap error ${first.code}`
          : first.message,
    );
    this.name = "NamecheapError";
    this.code = first?.code ?? -1;
    this.errors = errors;
  }
}

/** Thrown when the HTTP request fails or answers with a non-2xx status. */
export class NamecheapHttpError extends Error {
  readonly status: number | undefined;
  readonly statusText: string;

  constructor(message: string, init?: { status?: number; statusText?: string; cause?: unknown }) {
    super(message, init?.cause === undefined ? undefined : { cause: init.cause });
    this.name = "NamecheapHttpError";
    this.status = init?.status;
    this.statusText = init?.statusText ?? "";
  }
}

/** Thrown when a response body cannot be parsed or has an unexpected shape. */
export class NamecheapParseError extends Error {
  constructor(message: string, init?: { cause?: unknown }) {
    super(message, init?.cause === undefined ? undefined : { cause: init.cause });
    this.name = "NamecheapParseError";
  }
}
