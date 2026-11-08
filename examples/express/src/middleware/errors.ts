import type { ErrorRequestHandler, RequestHandler } from "express";
import { NamecheapError, NamecheapHttpError, NamecheapParseError } from "@fwgapps/namecheap";

/** Raised by the example's own routes when a query/path parameter is missing or invalid. */
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { message: "Not found" } });
};

/**
 * The single error handler.
 * - NamecheapError (the API answered with an error): 400, with the API error code.
 * - NamecheapParseError / NamecheapHttpError (bad or unreachable upstream): 502.
 * - anything else: 500 with a generic message.
 * The body never contains the request URL, the request body or the API key.
 */
export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof BadRequestError) {
    res.status(400).json({ error: { message: error.message } });
    return;
  }

  if (error instanceof NamecheapError) {
    res.status(400).json({ error: { code: error.code, message: error.message } });
    return;
  }

  if (error instanceof NamecheapParseError || error instanceof NamecheapHttpError) {
    res.status(502).json({ error: { message: error.message } });
    return;
  }

  // Log the name and message only: never the whole error object, which may carry request data.
  const { name, message } =
    error instanceof Error ? error : { name: "UnknownError", message: String(error) };
  console.error(`Unhandled error: ${name}: ${message}`);
  res.status(500).json({ error: { message: "Internal server error" } });
};
