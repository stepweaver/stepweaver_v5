import {
  randomIntInclusive,
  rollSingleDie,
  rollDice,
  parseDiceNotation,
  roll,
  formatRollResult,
} from "@/lib/roller";

describe("roller", () => {
  describe("randomIntInclusive", () => {
    it("returns a number within the inclusive range", () => {
      for (let i = 0; i < 50; i++) {
        const result = randomIntInclusive(1, 6);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
      }
    });

    it("throws on invalid ranges", () => {
      expect(() => randomIntInclusive(5, 4)).toThrow();
    });
  });

  describe("rollSingleDie", () => {
    it("returns between 1 and sides", () => {
      for (let i = 0; i < 30; i++) {
        const result = rollSingleDie(6);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
      }
    });

    it("throws for invalid sides", () => {
      expect(() => rollSingleDie(1)).toThrow();
    });
  });

  describe("parseDiceNotation", () => {
    it("parses 3d6", () => {
      const result = parseDiceNotation("3d6");
      expect(result.groups).toHaveLength(1);
      expect(result.groups[0]).toEqual({ sides: 6, count: 3 });
      expect(result.modifier).toBe(0);
    });

    it("parses multiple groups and modifier", () => {
      const result = parseDiceNotation("3d6+1d20+2");
      expect(result.groups).toHaveLength(2);
      expect(result.modifier).toBe(2);
    });

    it("parses negative modifier", () => {
      const result = parseDiceNotation("1d20-3");
      expect(result.modifier).toBe(-3);
    });
  });

  describe("roll + formatRollResult", () => {
    it("produces stable shape for 2d6+1", () => {
      const result = roll("2d6+1");
      expect(result.breakdown).toHaveLength(1);
      expect(result.total).toBe(result.subtotal + result.modifier);
      const text = formatRollResult(result);
      expect(text).toContain("Rolling 2d6+1:");
      expect(text).toMatch(/Total: \d+/);
    });
  });
});
