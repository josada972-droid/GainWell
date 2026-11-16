"use client";

import {
  useEffect,
  useActionState,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useFormatter, useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  type Food,
  type NutritionBasis,
  type QuantityUnit,
} from "@/lib/nutrition/food";
import {
  addEntryAction,
  lookupBarcodeAction,
  searchCustomFoodsAction,
  searchOffFoodsAction,
  type TrackerState,
} from "@/lib/tracker/actions";

/**
 * The add-food interaction (Stage 4): search Open Food Facts or the user's
 * own custom foods, pick one, record a quantity. Text search is debounced
 * (~300 ms — never a request per keystroke) and a sequence guard keeps a
 * slow stale response from overwriting a newer one. Barcode-shaped input is
 * looked up instead of searched.
 */

const SEARCH_DEBOUNCE_MS = 300;

/** Units a basis can be recorded in — only matching pairs compute. */
const UNITS_BY_BASIS: Record<NutritionBasis, QuantityUnit[]> = {
  per_100g: ["g"],
  per_100ml: ["ml"],
  per_serving: ["serving"],
};

const BARCODE_RE = /^\d{8,14}$/;

type SearchMode = "off" | "custom";

export function AddFoodDialog({
  mealDate,
  mealType,
  mealLabel,
  locale,
}: {
  mealDate: string;
  mealType: string;
  mealLabel: string;
  locale: string;
}) {
  const t = useTranslations("tracker");
  const format = useFormatter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchSeq = useRef(0);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<SearchMode>("off");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<{
    status: "idle" | "loading" | "error";
    errorKey?: string;
    foods: Food[];
  }>({ status: "idle", foods: [] });
  const [selected, setSelected] = useState<Food | null>(null);

  const [addState, addFormAction] = useActionState<TrackerState, FormData>(
    addEntryAction,
    {},
  );

  // Close the dialog once the entry is saved; the page revalidates itself.
  useEffect(() => {
    if (addState.ok) {
      dialogRef.current?.close();
    }
  }, [addState.ok]);

  // Debounced search with a stale-response guard. The synchronous part of the
  // effect derives only (sequence bookkeeping); every state update happens
  // inside the async timer, and a query too short to search renders as idle.
  useEffect(() => {
    if (!open || selected) return;
    const seq = ++searchSeq.current;
    const trimmed = query.trim();
    const isBarcode = mode === "off" && BARCODE_RE.test(trimmed);
    if (trimmed.length < 2 && !isBarcode) return;
    const timer = setTimeout(async () => {
      setSearch({ status: "loading", foods: [] });
      const result = isBarcode
        ? await lookupBarcodeAction(trimmed)
        : mode === "off"
          ? await searchOffFoodsAction(trimmed)
          : await searchCustomFoodsAction(trimmed);
      if (seq !== searchSeq.current) return; // a newer search superseded us
      if (result.ok) {
        setSearch({ status: "idle", foods: result.foods });
      } else {
        setSearch({ status: "error", errorKey: result.errorKey, foods: [] });
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, mode, open, selected]);

  // A query too short to search always shows an idle, empty list.
  const trimmedQuery = query.trim();
  const queryTooShort =
    trimmedQuery.length < 2 &&
    !(mode === "off" && BARCODE_RE.test(trimmedQuery));
  const shownSearch =
    !selected && queryTooShort
      ? { status: "idle" as const, errorKey: undefined, foods: [] as Food[] }
      : search;

  function resetDialog() {
    setQuery("");
    setMode("off");
    setSearch({ status: "idle", foods: [] });
    setSelected(null);
  }

  function handleOpen() {
    resetDialog(); // every opening starts a fresh search, never stale results
    setOpen(true);
    dialogRef.current?.showModal();
  }

  function handleCancel(event: FormEvent<HTMLDialogElement>) {
    event.preventDefault();
    closeDialog();
  }

  function closeDialog() {
    setOpen(false);
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        className="btn btn--quiet"
        onClick={handleOpen}
        aria-haspopup="dialog"
      >
        {t("add.title")}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onCancel={handleCancel}
        className="well"
        aria-labelledby="add-food-heading"
        style={{
          maxWidth: "min(92vw, 34rem)",
          width: "100%",
          border: "none",
          padding: "var(--space-lg)",
        }}
      >
        <h3 id="add-food-heading">{t("add.heading", { meal: mealLabel })}</h3>
        <p role="status">{t("add.modeLabel")}</p>

        <div className="groove" role="tablist" aria-label={t("add.modeLabel")}>
          {(["off", "custom"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              className={mode === value ? "chip chip--sample" : "chip"}
              onClick={() => {
                setMode(value);
                setSelected(null);
              }}
            >
              {t(value === "off" ? "add.modeOff" : "add.modeCustom")}
            </button>
          ))}
        </div>

        {!selected ? (
          <>
            <label
              htmlFor={`food-query-${mealType}`}
              className="block pt-(--space-md)"
            >
              {t("add.searchLabel")}
            </label>
            <input
              id={`food-query-${mealType}`}
              type="search"
              className="field w-full"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(
                mode === "off"
                  ? "add.searchPlaceholderOff"
                  : "add.searchPlaceholderCustom",
              )}
              autoComplete="off"
            />

            <div aria-live="polite" className="pt-(--space-md)">
              {shownSearch.status === "loading" ? (
                <p>{t("search.loading")}</p>
              ) : shownSearch.status === "error" ? (
                <p role="alert">{t(`errors.${shownSearch.errorKey}`)}</p>
              ) : shownSearch.foods.length === 0 ? (
                queryTooShort ? null : (
                  <p>{t("search.empty")}</p>
                )
              ) : (
                <ul className="list-none p-0 flex flex-col gap-(--space-3xs)">
                  {shownSearch.foods.map((food) => (
                    <li key={food.source.code ?? food.source.customFoodId}>
                      <button
                        type="button"
                        className="well hairline w-full text-left p-(--space-sm)"
                        onClick={() => setSelected(food)}
                      >
                        <span className="block font-medium">{food.name}</span>
                        {food.brand ? (
                          <span className="block text-(--color-ink-2)">
                            {food.brand}
                          </span>
                        ) : null}
                        <span className="block text-(--color-ink-2)">
                          {t(`basis.${food.basis}`)}
                          {food.values.kcal !== null
                            ? ` · ${format.number(food.values.kcal, {
                                maximumFractionDigits: 1,
                              })} ${t("totals.units.kcal")}`
                            : ""}
                          {missingCount(food) > 0
                            ? ` · ${t("search.incomplete", { count: missingCount(food) })}`
                            : ""}
                        </span>
                        {mode === "off" && food.source.attribution ? (
                          <span className="block text-(--color-ink-2)">
                            {t("entry.sourceOff")}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <form
            action={addFormAction}
            className="flex flex-col gap-(--space-sm) pt-(--space-md)"
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="mealDate" value={mealDate} />
            <input type="hidden" name="mealType" value={mealType} />
            <input
              type="hidden"
              name="source"
              value={selected.source.kind === "custom" ? "custom" : "off"}
            />
            {selected.source.kind === "custom" ? (
              <input
                type="hidden"
                name="customFoodId"
                value={selected.source.customFoodId ?? ""}
              />
            ) : (
              <input
                type="hidden"
                name="food"
                value={JSON.stringify(selected)}
              />
            )}

            <p className="font-medium">{selected.name}</p>
            <p className="text-(--color-ink-2)">
              {t(`basis.${selected.basis}`)}
              {selected.source.kind === "open_food_facts"
                ? ` · ${t("entry.sourceOff")}`
                : ` · ${t("entry.sourceCustom")}`}
            </p>

            <label htmlFor={`quantity-${mealType}`}>
              {t("entry.quantityLabel")} (
              {t(`units.${UNITS_BY_BASIS[selected.basis][0]}`)})
            </label>
            <input
              id={`quantity-${mealType}`}
              name="quantity"
              type="number"
              inputMode="decimal"
              step="0.001"
              min="0.001"
              max="100000"
              className="field"
              defaultValue={selected.basis === "per_serving" ? 1 : 100}
              required
            />
            <input
              type="hidden"
              name="unit"
              value={UNITS_BY_BASIS[selected.basis][0]}
            />

            <FormAlert errorKey={addState.errorKey} namespace="tracker" />

            <div className="flex flex-wrap gap-(--space-3xs)">
              <SubmitButton>{t("add.submit")}</SubmitButton>
              <button
                type="button"
                className="btn btn--quiet"
                onClick={() => setSelected(null)}
              >
                {t("add.back")}
              </button>
              <button
                type="button"
                className="btn btn--quiet"
                onClick={closeDialog}
              >
                {t("add.close")}
              </button>
            </div>
          </form>
        )}

        {!selected ? (
          <div className="flex gap-(--space-3xs) pt-(--space-md)">
            <button
              type="button"
              className="btn btn--quiet"
              onClick={closeDialog}
            >
              {t("add.close")}
            </button>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

function missingCount(food: Food): number {
  return Object.values(food.values).filter((value) => value === null).length;
}
