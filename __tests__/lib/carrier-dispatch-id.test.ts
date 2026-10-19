import { publicCarrierDispatchId } from "@/lib/notion/public-dispatch-id";

describe("publicCarrierDispatchId", () => {
  it("keeps records created close together distinct", () => {
    const earlier = publicCarrierDispatchId("3fbbc620-1111-4222-8333-aaaabbbbcccc");
    const later = publicCarrierDispatchId("3fbbc620-1111-4222-8333-ddddeeeeffff");

    expect(earlier).not.toBe(later);
    expect(earlier.startsWith("cj-")).toBe(true);
    expect(later.endsWith("ddddeeeeffff")).toBe(true);
  });

  it("ignores dashes and stays stable for the same page", () => {
    expect(publicCarrierDispatchId("ABCDEF12-3456-7890-abcd-ef1234567890")).toBe(
      publicCarrierDispatchId("abcdef1234567890abcdef1234567890")
    );
  });
});
