import { rateLimit, clearRateLimit } from "@/lib/security/rate-limit";

describe("rate limiter", () => {
  afterEach(() => {
    clearRateLimit("test:limit");
  });

  it("allows requests within limit", async () => {
    const result = await rateLimit("test:limit", 3, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks after exceeding limit", async () => {
    await rateLimit("test:limit", 2, 60000);
    await rateLimit("test:limit", 2, 60000);
    const result = await rateLimit("test:limit", 2, 60000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", async () => {
    await rateLimit("test:limit", 1, 10);
    clearRateLimit("test:limit");
    const result = await rateLimit("test:limit", 1, 10);
    expect(result.allowed).toBe(true);
  });
});
