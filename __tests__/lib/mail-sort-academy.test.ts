import { evaluateAnswer, buildRoundDeck, filterDeckForMode, shuffleDeck } from "@/lib/mail-sort-academy/gameLogic";
import { mailCards } from "@/lib/mail-sort-academy/mailCards";
import type { MailCard } from "@/lib/mail-sort-academy/types";

// Helper to find a card by id
function card(id: string): MailCard {
  const c = mailCards.find((m) => m.id === id);
  if (!c) throw new Error(`Card ${id} not found`);
  return c;
}

// ─── UBBM / Not UBBM ─────────────────────────────────────────────────────────

describe("UBBM rules", () => {
  test("First-Class old resident (MSA-013) is NOT UBBM", () => {
    const c = card("MSA-013");
    expect(c.class).toBe("first_class");
    expect(c.isUBBM).toBe(false);
  });

  test("Marketing Mail unendorsed vacant address (MSA-011) IS UBBM", () => {
    const c = card("MSA-011");
    expect(c.class).toBe("usps_marketing_mail");
    expect(c.mailerEndorsement).toBe("none");
    expect(c.isUBBM).toBe(true);
  });

  test("Marketing Mail Return Service Requested (MSA-016) is NOT UBBM", () => {
    const c = card("MSA-016");
    expect(c.mailerEndorsement).toBe("return_service_requested");
    expect(c.isUBBM).toBe(false);
  });

  test("Periodical for moved addressee (MSA-014) is NOT UBBM", () => {
    const c = card("MSA-014");
    expect(c.class).toBe("periodicals");
    expect(c.isUBBM).toBe(false);
  });

  test("Marketing Mail ESR undeliverable (MSA-020) IS UBBM", () => {
    const c = card("MSA-020");
    expect(c.mailerEndorsement).toBe("electronic_service_requested");
    expect(c.isUBBM).toBe(true);
  });
});

// ─── Accountable mail ────────────────────────────────────────────────────────

describe("Accountable mail flags", () => {
  test("Certified letter (MSA-031) is accountable", () => {
    const c = card("MSA-031");
    expect(c.isAccountable).toBe(true);
    expect(c.extraService).toBe("certified");
  });

  test("Registered Mail (MSA-032) is accountable", () => {
    const c = card("MSA-032");
    expect(c.isAccountable).toBe(true);
    expect(c.extraService).toBe("registered");
  });

  test("Certified letter (MSA-031) is NOT UBBM", () => {
    const c = card("MSA-031");
    expect(c.isUBBM).toBe(false);
  });

  test("Registered Mail (MSA-032) is NOT UBBM", () => {
    const c = card("MSA-032");
    expect(c.isUBBM).toBe(false);
  });
});

// ─── evaluateAnswer – UBBM mode ──────────────────────────────────────────────

describe("evaluateAnswer – ubbm_or_not", () => {
  test("correct UBBM answer scores +100", () => {
    const c = card("MSA-011"); // Marketing Mail vacant, no endorsement → UBBM
    const result = evaluateAnswer(c, "ubbm_or_not", "ubbm");
    expect(result.correct).toBe(true);
    expect(result.points).toBe(100);
    expect(result.criticalMistake).toBe(false);
  });

  test("correct Not-UBBM answer scores +100", () => {
    const c = card("MSA-013"); // First-Class, not UBBM
    const result = evaluateAnswer(c, "ubbm_or_not", "not_ubbm");
    expect(result.correct).toBe(true);
    expect(result.points).toBe(100);
    expect(result.criticalMistake).toBe(false);
  });

  test("wrong answer scores -50", () => {
    const c = card("MSA-011"); // UBBM card, wrong answer
    const result = evaluateAnswer(c, "ubbm_or_not", "not_ubbm");
    expect(result.correct).toBe(false);
    expect(result.points).toBe(-50);
    expect(result.criticalMistake).toBe(false);
  });

  test("sorting First-Class mail into UBBM is a CRITICAL MISTAKE (-100)", () => {
    const c = card("MSA-013"); // First-Class
    const result = evaluateAnswer(c, "ubbm_or_not", "ubbm");
    expect(result.correct).toBe(false);
    expect(result.criticalMistake).toBe(true);
    expect(result.points).toBe(-100);
  });

  test("sorting Certified mail into UBBM is a CRITICAL MISTAKE", () => {
    const c = card("MSA-031"); // Certified, accountable
    const result = evaluateAnswer(c, "ubbm_or_not", "ubbm");
    expect(result.criticalMistake).toBe(true);
    expect(result.points).toBe(-100);
  });

  test("sorting Registered Mail into UBBM is a CRITICAL MISTAKE", () => {
    const c = card("MSA-032"); // Registered, accountable
    const result = evaluateAnswer(c, "ubbm_or_not", "ubbm");
    expect(result.criticalMistake).toBe(true);
    expect(result.points).toBe(-100);
  });

  test("sorting Return Service Requested Marketing Mail into UBBM is CRITICAL", () => {
    const c = card("MSA-016"); // RSR Marketing Mail
    const result = evaluateAnswer(c, "ubbm_or_not", "ubbm");
    expect(result.criticalMistake).toBe(true);
    expect(result.points).toBe(-100);
  });
});

// ─── evaluateAnswer – accountable_chain (UBBM bin) ───────────────────────────

describe("evaluateAnswer – accountable_chain UBBM critical mistake", () => {
  test("putting Certified mail into UBBM bin is CRITICAL", () => {
    const c = card("MSA-031");
    const result = evaluateAnswer(c, "accountable_chain", "ubbm");
    expect(result.criticalMistake).toBe(true);
    expect(result.points).toBe(-100);
  });

  test("putting Registered Mail into UBBM bin is CRITICAL", () => {
    const c = card("MSA-032");
    const result = evaluateAnswer(c, "accountable_chain", "ubbm");
    expect(result.criticalMistake).toBe(true);
    expect(result.points).toBe(-100);
  });
});

// ─── evaluateAnswer – class_sort ─────────────────────────────────────────────

describe("evaluateAnswer – class_sort", () => {
  test("correct class answer for birthday card scores +100", () => {
    const c = card("MSA-001"); // first_class
    const result = evaluateAnswer(c, "class_sort", "first_class");
    expect(result.correct).toBe(true);
    expect(result.points).toBe(100);
  });

  test("wrong class answer scores -50", () => {
    const c = card("MSA-001"); // first_class
    const result = evaluateAnswer(c, "class_sort", "periodicals");
    expect(result.correct).toBe(false);
    expect(result.points).toBe(-50);
  });

  test("speed bonus awarded when answered under 7 seconds", () => {
    const c = card("MSA-001");
    const result = evaluateAnswer(c, "class_sort", "first_class", 3000);
    expect(result.correct).toBe(true);
    expect(result.isSpeedBonus).toBe(true);
    expect(result.points).toBe(125);
  });

  test("no speed bonus when answered over 7 seconds", () => {
    const c = card("MSA-001");
    const result = evaluateAnswer(c, "class_sort", "first_class", 8000);
    expect(result.correct).toBe(true);
    expect(result.isSpeedBonus).toBe(false);
    expect(result.points).toBe(100);
  });
});

// ─── evaluateAnswer – endorsement_drill ──────────────────────────────────────

describe("evaluateAnswer – endorsement_drill", () => {
  test("NSN is correct for apt-doesn't-exist scenario (MSA-021)", () => {
    const c = card("MSA-021");
    const result = evaluateAnswer(c, "endorsement_drill", "nsn");
    expect(result.correct).toBe(true);
    expect(result.points).toBe(100);
  });

  test("ANK is correct for addressee-never-lived-here (MSA-023)", () => {
    const c = card("MSA-023");
    const result = evaluateAnswer(c, "endorsement_drill", "ank");
    expect(result.correct).toBe(true);
  });

  test("IA is correct for letter with no street address (MSA-024)", () => {
    const c = card("MSA-024");
    const result = evaluateAnswer(c, "endorsement_drill", "ia");
    expect(result.correct).toBe(true);
  });

  test("NSS is correct for street-doesn't-exist (MSA-022)", () => {
    const c = card("MSA-022");
    const result = evaluateAnswer(c, "endorsement_drill", "nss");
    expect(result.correct).toBe(true);
  });

  test("wrong endorsement scores -50", () => {
    const c = card("MSA-021"); // NSN
    const result = evaluateAnswer(c, "endorsement_drill", "ank");
    expect(result.correct).toBe(false);
    expect(result.points).toBe(-50);
  });
});

// ─── Deck filtering ───────────────────────────────────────────────────────────

describe("filterDeckForMode", () => {
  test("endorsement_drill returns only cards with a carrier endorsement", () => {
    const filtered = filterDeckForMode(mailCards, "endorsement_drill");
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach((c) => {
      expect(c.correctCarrierEndorsement).toBeDefined();
      expect(c.correctCarrierEndorsement).not.toBe("none");
    });
  });

  test("accountable_chain returns only accountable or extra-service cards", () => {
    const filtered = filterDeckForMode(mailCards, "accountable_chain");
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach((c) => {
      const hasService = c.isAccountable || c.extraService !== "none";
      expect(hasService).toBe(true);
    });
  });

  test("class_sort returns all cards", () => {
    const filtered = filterDeckForMode(mailCards, "class_sort");
    expect(filtered.length).toBe(mailCards.length);
  });
});

// ─── buildRoundDeck ───────────────────────────────────────────────────────────

describe("buildRoundDeck", () => {
  test("returns at most 10 cards", () => {
    const deck = buildRoundDeck("class_sort", 10);
    expect(deck.length).toBeLessThanOrEqual(10);
    expect(deck.length).toBeGreaterThan(0);
  });

  test("endorsement_drill deck only contains endorsed cards", () => {
    const deck = buildRoundDeck("endorsement_drill", 10);
    deck.forEach((c) => {
      expect(c.correctCarrierEndorsement).toBeDefined();
    });
  });
});

// ─── shuffleDeck ─────────────────────────────────────────────────────────────

describe("shuffleDeck", () => {
  test("returns same number of cards", () => {
    const result = shuffleDeck(mailCards);
    expect(result.length).toBe(mailCards.length);
  });

  test("does not mutate original array", () => {
    const original = [...mailCards];
    shuffleDeck(mailCards);
    expect(mailCards).toEqual(original);
  });
});

// ─── Data integrity checks ────────────────────────────────────────────────────

describe("mailCards data integrity", () => {
  test("all cards have required fields", () => {
    mailCards.forEach((c) => {
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(c.scenario).toBeTruthy();
      expect(c.explanation).toBeTruthy();
      expect(c.class).toBeTruthy();
      expect(c.correctBin).toBeTruthy();
      expect(Array.isArray(c.tags)).toBe(true);
    });
  });

  test("there are at least 40 cards", () => {
    expect(mailCards.length).toBeGreaterThanOrEqual(40);
  });

  test("no two cards share the same id", () => {
    const ids = mailCards.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test("all First-Class cards have isUBBM = false", () => {
    const fc = mailCards.filter((c) => c.class === "first_class");
    fc.forEach((c) => {
      expect(c.isUBBM).toBe(false);
    });
  });

  test("all Priority Mail cards have isUBBM = false", () => {
    const pm = mailCards.filter(
      (c) => c.class === "priority_mail" || c.class === "priority_mail_express"
    );
    pm.forEach((c) => {
      expect(c.isUBBM).toBe(false);
    });
  });

  test("all Periodicals cards have isUBBM = false", () => {
    mailCards
      .filter((c) => c.class === "periodicals")
      .forEach((c) => {
        expect(c.isUBBM).toBe(false);
      });
  });

  test("accountable cards are not UBBM", () => {
    mailCards
      .filter((c) => c.isAccountable)
      .forEach((c) => {
        expect(c.isUBBM).toBe(false);
      });
  });
});
