import { carrierDaybookSchema } from "@/lib/validation/carrier-log.schema";
import {
  issueCarrierSession,
  verifyCarrierPassphrase,
  verifyCarrierSession,
} from "@/lib/carrier-journal/auth";

describe("carrier daybook publication defaults", () => {
  it("defaults published to true when omitted", () => {
    const parsed = carrierDaybookSchema.parse({
      date: "2026-08-05",
      miles: 8,
    });
    expect(parsed.published).toBe(true);
  });

  it("respects explicit published false", () => {
    const parsed = carrierDaybookSchema.parse({
      date: "2026-08-05",
      published: false,
    });
    expect(parsed.published).toBe(false);
  });

  it("strips legacy logSecret from validated daybook bodies", () => {
    const parsed = carrierDaybookSchema.parse({
      date: "2026-08-05",
      logSecret: "should-be-ignored",
    });
    expect(parsed).not.toHaveProperty("logSecret");
    expect(parsed.published).toBe(true);
  });
});

describe("carrier session auth", () => {
  const previousLog = process.env.CARRIER_JOURNAL_LOG_SECRET;
  const previousSign = process.env.CARRIER_SESSION_SIGNING_SECRET;

  afterEach(() => {
    if (previousLog === undefined) delete process.env.CARRIER_JOURNAL_LOG_SECRET;
    else process.env.CARRIER_JOURNAL_LOG_SECRET = previousLog;
    if (previousSign === undefined) delete process.env.CARRIER_SESSION_SIGNING_SECRET;
    else process.env.CARRIER_SESSION_SIGNING_SECRET = previousSign;
  });

  it("verifies passphrase with timing-safe compare", () => {
    process.env.CARRIER_JOURNAL_LOG_SECRET = "test-passphrase-value";
    expect(verifyCarrierPassphrase("test-passphrase-value")).toBe(true);
    expect(verifyCarrierPassphrase("wrong")).toBe(false);
    expect(verifyCarrierPassphrase("")).toBe(false);
  });

  it("issues and verifies a signed session token", () => {
    process.env.CARRIER_JOURNAL_LOG_SECRET = "test-passphrase-value";
    process.env.CARRIER_SESSION_SIGNING_SECRET = "test-signing-secret-value";
    const token = issueCarrierSession();
    expect(verifyCarrierSession(token)).toBe(true);
    expect(verifyCarrierSession("not.a.token")).toBe(false);
    expect(verifyCarrierSession(undefined)).toBe(false);
  });
});
