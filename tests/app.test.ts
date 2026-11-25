import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Express App", () => {
  it("should parse JSON requests correctly", async () => {
    app.post("/test-json", (req, res) => {
      res.status(200).json({
        received: req.body,
      });
    });

    const response = await request(app)
      .post("/test-json")
      .send({ name: "Escala Pay" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      received: { name: "Escala Pay" },
    });
  });
});