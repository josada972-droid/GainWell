# The nutrition engine (Stage 3)

Everything numeric about energy and macronutrients lives in `src/lib/nutrition/`.
Components, pages and Server Actions never compute a number; they call
`estimateNutritionPlan()` / `estimateNutritionProfile()` and render what comes
back. Nothing in these modules depends on React, Next or Supabase, so they are
unit-tested on their own (`tests/nutrition-engine.test.ts`).

This is educational arithmetic from published equations. It is not a diagnosis,
not medical advice, and not a measurement of any individual body.

## 1. Pipeline

```
raw form/DB values
  → parseNutritionInput()   validation: ranges, enums, missing (input.ts)
  → ageEligibility()        18+ gate (eligibility.ts)
  → restingEnergy()         Mifflin–St Jeor (energy.ts)
  → maintenanceEnergy()     × activity multiplier, rounded (energy.ts)
  → energyTarget()          goal surplus or professional number (goals.ts)
  → macroTargets()          protein / carbohydrate / fat grams (macronutrients.ts)
```

The result is a typed union (`NutritionPlan` in `index.ts`):

| status       | meaning                                           | numbers present |
| ------------ | ------------------------------------------------- | --------------- |
| `estimated`  | adult, all inputs valid                           | yes             |
| `minor`      | age under 18                                      | no              |
| `incomplete` | age missing/unverified, or inputs missing/invalid | no              |

An ineligible or incomplete result carries no calories, no surplus and no
grams — the engine never produces a number and then hides it. `missing` and
`invalid` list the fields by name, and `format.ts` turns them into message keys
(`missing.age`, `missing.sex`, …) for the UI.

## 2. Eligibility: 18+ only

`ADULT_MIN_AGE = 18`, enforced **inside** the engine, before any arithmetic:

- Age is stored as **completed years** (`age_years`), never a date of birth.
- Under 18 → `status: "minor"`. The dashboard shows supportive general guidance
  (eat regularly, include protein at each meal, drink enough water, talk with a
  parent or guardian and a professional you trust) and no personal numbers.
- Missing or non-numeric age → `status: "incomplete"`, `eligibility:
"unverified"`. No estimate is guessed from a default age.
- Minors are never offered the optional target-weight or professional-calorie
  fields in the onboarding form (the fields are built only for eligible adults).

**Age freshness.** The stored age is a snapshot. Time only ever makes a stored
age _younger_ than the person's real age, so drift cannot upgrade a minor to an
adult calculation — it errs conservative by construction, and a missing age
stays unverified forever. What drift does affect is estimate accuracy, so the
dashboard asks for a reconfirmation once the answers are over a year old
(`ANSWER_RECONFIRM_DAYS = 365`, based on the row's `updated_at`: any edit counts
as a confirmation). No exact birth date is ever collected to do this.

## 3. Resting energy — Mifflin–St Jeor

Mifflin MD, St Jeor ST, et al., "A new 'resting energy' equation for adults",
_American Journal of Clinical Nutrition_ 57(3), 1990, pp. 325–327:

```
men:   RMR = 10·kg + 6.25·cm − 5·years + 5
women: RMR = 10·kg + 6.25·cm − 5·years − 161
```

The study's participants were **19–78 years old**. GainWell applies the
equation from 18 by product policy; that one year below the sample is an
extrapolation, not something the study validated.

| Variable   | Unit              | Source                       | Range accepted           |
| ---------- | ----------------- | ---------------------------- | ------------------------ |
| `weightKg` | kilograms         | onboarding step 1            | 25–300                   |
| `heightCm` | centimetres       | onboarding step 1            | 90–250                   |
| `ageYears` | completed years   | onboarding step 1            | 0–120 (form 1–120)       |
| `sex`      | `female` / `male` | onboarding step 1 (optional) | required by the equation |

Output is kilocalories, unrounded until the maintenance step. Sex is **never
inferred** from names, appearance or other answers: without it the result is
`incomplete` and the dashboard says which answer is needed. The question asks
about the body the equation models (its two constants come from measured male
and female bodies), not about gender identity.

## 4. Maintenance energy — activity multiplier

```
maintenance (TDEE) = RMR × multiplier, rounded to the nearest 10 kcal
```

The multipliers are **GainWell's own simplified product values**, in the
tradition of the Harris–Benedict activity factors (1.2 sedentary … 1.725 very
active). They are **not** the PAL categories of FAO/WHO/UNU (_Human Energy
Requirements_, 2004), whose bands are higher and wider:

| FAO/WHO/UNU category          | PAL band  |
| ----------------------------- | --------- |
| Sedentary or light lifestyle  | 1.40–1.69 |
| Active or moderately active   | 1.70–1.99 |
| Vigorous or vigorously active | 2.00–2.40 |

GainWell's simplified values and their limits:

| Level       | Multiplier | Description in the form                             | Nearest FAO band |
| ----------- | ---------- | --------------------------------------------------- | ---------------- |
| `sedentary` | 1.2        | Mostly sitting — desk work, little planned exercise | below FAO light  |
| `light`     | 1.35       | Light — short walks, some standing                  | below FAO light  |
| `moderate`  | 1.5        | Moderate — exercise most days or regular walking    | FAO light        |
| `high`      | 1.7        | High — daily physical work or training              | FAO moderate     |

So the simplified values sit at or below FAO's light band: for genuinely active
people they **underestimate** TDEE, and a person whose real PAL falls in FAO's
vigorous band (2.00–2.40) has no matching choice here. Between two descriptions,
pick the higher one. This coarseness is a product simplification, not a claim
about the FAO classification.

Rounding to 10 kcal is deliberate: a multiplier is a band, not a measurement, so
kcal precision would be a lie.

## 5. Daily target — goals and the surplus

`goals.ts` is the single place a surplus is defined (`DEFAULT_SURPLUS_POLICY`),
so the policy can be reviewed and tuned in one file:

| Field                | Value | Reason                                                                                                                                     |
| -------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `gradualSurplusKcal` | 200   | ~0.2 kg/week using the common ~7700 kcal per kg of gained body weight approximation — deliberately below the 0.25–0.5 kg/week often quoted |
| `maxSurplusKcal`     | 300   | a mistaken or aggressive setting cannot encourage extreme intake                                                                           |
| `minTargetKcal`      | 1200  | a threshold for the "unusually low" note — **not** a floor applied to anyone, and never presented as a universal minimum safe intake       |
| `maxTargetKcal`      | 5000  | ceiling for GainWell's own suggestion (product policy, not a safety claim)                                                                 |

Surplus by goal:

| Goal                    | Surplus | Target                                |
| ----------------------- | ------- | ------------------------------------- |
| `gain_gradually`        | +200    | maintenance + surplus, capped at 5000 |
| `eating_consistency`    | 0       | maintenance (steadiness is the goal)  |
| `healthier_habits`      | 0       | maintenance (room to change habits)   |
| `professional_guidance` | 0       | maintenance, used for comparison only |

A **professional target wins outright**: `targetKcal` is the number the user
entered, used verbatim — never clamped, never rewritten, never averaged with the
estimate, and never flagged by the low-target logic. `targetSource` is
`"professional"` and GainWell's own suggestion is kept beside it
(`gainwellSuggestedKcal`) so the two are never confused. The database range
constraint (800–8000 kcal) is the documented input validation on that field.

A GainWell suggestion that computes **below 1200 kcal is shown as computed**,
with an explicit "unusually low" note explaining that it is arithmetic, not a
recommendation and not a sign that eating that little is safe. The engine never
raises a low number to meet the floor.

No universal fixed target exists. Every shown number is derived from that
person's answers.

## 6. Macronutrients

Atwater factors: protein 4 kcal/g, carbohydrate 4 kcal/g, fat 9 kcal/g.

```
proteinG = min(1.2 × weightKg, 150)          g/day
fatG     = 0.25 × targetKcal / 9             g/day (25 % of energy)
carbsG   = (targetKcal − 4·proteinG − 9·fatG) / 4   floored at 0
```

1.2 g/kg is the commonly used upper range for a person gaining weight; 150 g/day
caps it for very heavy inputs. 25 % of energy for fat sits inside the 20–35 %
range commonly quoted for adults. Both numbers are **GainWell's simplified
product assumptions**, chosen so the interface stays simple and the split stays
consistent — other valid splits exist, and the dashboard says the split is one
product assumption, not a requirement. Carbohydrate is the remainder, so the
three sum to the target, and unusual targets (very low or very high) still
produce internally consistent grams: protein keeps its cap, fat follows the
target, and carbohydrate floors at 0.

`macros.kcal` is recomputed from the rounded grams, and grams round to one
decimal only below 10 g. Rounded grams can therefore differ from the target by a
few kilocalories — the dashboard says this in plain words rather than pretending
the totals match exactly. Minors and incomplete results never receive macros at
all (no numbers exist to split).

## 7. Sanity limits

`plausibleBmi()` (input.ts) rejects body-measure combinations with BMI outside
12–60: the numbers exist but the combination is nonsense, so the result is
`incomplete` with `implausible: true` and no estimate. Ranges come from Zod at
the Server Action boundary (`src/lib/onboarding/schema.ts`) and from CHECK
constraints in `supabase/migrations/0002_nutrition_profiles.sql`, so a value
cannot reach the engine or the database from either side alone.

## 8. What the engine does not do

- No weight-loss targets, no BMI advice, no diagnoses, no diet prescription, no
  promised pace of gain, no micronutrients, no meal plans.
- No food database, no Open Food Facts, no logging (Stage 4).
- Estimates are recalculated from the stored answers on every dashboard render;
  only the answers and the optional professional target are stored. A stored
  professional target is never overwritten by a recalculation.
- Pregnancy, illness, eating-disorder history and growth are not modelled. A
  professional's number is the right answer for those cases, which is why the
  professional path exists and why minors get guidance instead of numbers.

## 9. Sources

- Mifflin & St Jeor, _Am. J. Clin. Nutr._ 57(3), 1990 — resting energy equation
  (study sample 19–78; GainWell's use from 18 is product policy, an
  extrapolation the study did not validate).
- FAO/WHO/UNU (_Human Energy Requirements_, 2004) — cited only as the reference
  PAL classification (light 1.40–1.69, moderate 1.70–1.99, vigorous 2.00–2.40)
  against which GainWell's own simplified multipliers are compared; the
  multipliers themselves are not FAO values.
- Harris–Benedict tradition of activity factors — the family GainWell's
  simplified multipliers (1.2–1.7) descend from.
- Atwater factors (4/4/9 kcal/g) — standard energy conversion for macros.
- ~7700 kcal per kg of gained weight — a common approximation, used only to
  explain why 200 kcal/day is gradual; it is not a promise.

No claim is made that these figures are individually validated for any user.
