import { describe, it, expect, vi, afterEach } from "vitest";
import express from "express";
import request from "supertest";
import errorHandler from "../../src/middleware/errorHandler.js";

describe("Global Error Handler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return a 500 error response", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const app = express();

    app.get("/test-error", (_req, _res, next) => {
      next(new Error("Test error"));
    });

    app.use(errorHandler);

    const response = await request(app).get("/test-error");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: "error",
      message: "Internal server error",
    });

    expect(consoleSpy).toHaveBeenCalled();
  });
});