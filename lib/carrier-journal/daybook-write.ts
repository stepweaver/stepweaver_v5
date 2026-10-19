import { computeFuelScore } from "@/lib/carrier-journal/fuel";
import { calculateDpsRatio } from "@/lib/carrier-journal/helpers";
import type { CarrierDaybookInput } from "@/lib/validation/carrier-log.schema";

export function mailDayContextToNotion(tags: string[] | undefined): Record<string, unknown> | null {
  if (tags === undefined) return null;
  const first = tags.find(Boolean);
  return {
    "Mail Day Context": first ? { select: { name: first } } : { select: null },
  };
}

/**
 * Notion properties for a daybook save.
 * Only fields present on the input are written. Omitted optionals are left untouched.
 */
export function buildCarrierDaybookProperties(
  input: CarrierDaybookInput
): Record<string, unknown> {
  const dpsPerMile =
    input.dpsCount !== undefined && input.miles !== undefined && input.miles > 0
      ? calculateDpsRatio(input.dpsCount, input.miles)
      : null;

  const properties: Record<string, unknown> = {
    "Publish Public": { checkbox: Boolean(input.published) },
  };

  if (input.miles !== undefined) {
    properties["Miles Walked"] = { number: input.miles };
  }

  if (input.dpsCount !== undefined) {
    properties["DPS Count"] = { number: input.dpsCount };
    properties["DPS Ratio"] = dpsPerMile != null ? { number: dpsPerMile } : { number: null };
  }

  if (input.mailDayContext !== undefined) {
    const mailDayContextProp = mailDayContextToNotion(input.mailDayContext);
    if (mailDayContextProp) Object.assign(properties, mailDayContextProp);
  }

  if (input.temperatureF !== undefined) {
    properties["Temperature F"] = { number: input.temperatureF };
  }

  if (input.heatIndexF !== undefined) {
    properties["Heat Index F"] = { number: input.heatIndexF };
  }

  if (input.avgHeatIndexF !== undefined) {
    properties["Average Heat Index F"] = { number: input.avgHeatIndexF };
  }

  if (input.precipitationIn !== undefined) {
    properties["Precipitation In"] = { number: input.precipitationIn };
  }

  if (input.rain !== undefined) {
    properties.Rain = { checkbox: input.rain };
  }

  if (input.steppedInDogPoop !== undefined) {
    properties["Stepped In Dog Poop"] = { checkbox: input.steppedInDogPoop };
  }

  if (input.waterOz !== undefined) {
    properties["Water Oz"] = { number: input.waterOz };
  }

  if (input.hydrationGoalOz !== undefined) {
    properties["Hydration Goal Oz"] = { number: input.hydrationGoalOz };
  }

  if (input.weightLbs !== undefined) {
    properties["Weight Lbs"] = { number: input.weightLbs };
  }

  if (input.movingMinutes !== undefined) {
    properties["Moving Minutes"] = { number: input.movingMinutes };
  }

  if (input.soreness !== undefined) {
    properties["Soreness (1-10)"] = { number: input.soreness };
  }

  if (input.mood !== undefined) {
    properties["Mood (1-10)"] = { number: input.mood };
  }

  if (input.energy !== undefined) {
    properties["Energy (1-10)"] = { number: input.energy };
  }

  if (input.publicNote !== undefined) {
    properties["Public Note"] = {
      rich_text: [{ text: { content: input.publicNote } }],
    };
  }

  if (input.parcels !== undefined) {
    properties.Parcels = { number: input.parcels };
  }

  if (input.privateNote !== undefined) {
    properties["Private Note"] = {
      rich_text: [{ text: { content: input.privateNote } }],
    };
  }

  if (input.fuel?.breakfastProtein !== undefined) {
    properties["Breakfast Protein"] = { checkbox: input.fuel.breakfastProtein };
  }
  if (input.fuel?.routeFoodPacked !== undefined) {
    properties["Route Food Packed"] = { checkbox: input.fuel.routeFoodPacked };
  }
  if (input.fuel?.routeFoodEaten !== undefined) {
    const labels = { none: "None", partial: "Partial", all: "All" } as const;
    properties["Route Food Eaten"] = { select: { name: labels[input.fuel.routeFoodEaten] } };
  }
  if (input.fuel?.proteinAnchors !== undefined) {
    properties["Protein Anchors"] = { number: input.fuel.proteinAnchors };
  }
  if (input.fuel?.fruitVegServings !== undefined) {
    properties["Fruit Veg Servings"] = { number: input.fuel.fruitVegServings };
  }
  if (input.fuel?.gatorade !== undefined) {
    properties["Gatorade Count"] = { number: input.fuel.gatorade };
  }
  if (input.fuel?.mountainDewOz !== undefined) {
    properties["Mountain Dew Oz"] = { number: input.fuel.mountainDewOz };
  }
  if (input.fuel?.postShiftMealQuality !== undefined) {
    const labels = { poor: "Poor", okay: "Okay", solid: "Solid" } as const;
    properties["Post Shift Meal Quality"] = {
      select: { name: labels[input.fuel.postShiftMealQuality] },
    };
  }
  if (input.fuel) {
    properties["Fuel Score"] = { number: computeFuelScore(input.fuel).score };
  }

  return properties;
}

export function daybookDpsPerMile(input: CarrierDaybookInput): number | null {
  if (input.dpsCount === undefined || input.miles === undefined || input.miles <= 0) return null;
  return calculateDpsRatio(input.dpsCount, input.miles);
}
