"use client";

import { useEffect, useRef, useState } from "react";
import { getAllBrandsList } from "@/lib/brands";
import {
  getAllAutosForBrandAndFamily,
  getAllModelFamiliesForBrand,
} from "@/lib/modelFamilies";
import { getAllEnginesForAutoIdList, getAutoById } from "@/lib/autos";
import { getEngineById } from "@/lib/engines";
import styles from "./CompareDetails.module.css";

const SLOT_COUNT = 3;
const REQUEST_STAGES = ["models", "autos", "engines", "details"];
const SPEC_GROUP_ORDER = [
  "Engine Specs",
  "Performance Specs",
  "Transmission Specs",
  "Brakes Specs",
  "Tires Specs",
  "Dimensions",
  "Weight Specs",
  "Fuel Economy",
];

function createSlot() {
  return {
    brandId: "",
    familyKey: "",
    autoId: "",
    engineId: "",
    models: [],
    autos: [],
    engines: [],
    auto: null,
    engine: null,
    loadingStage: null,
    error: null,
  };
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getErrorMessage(error, fallbackMessage) {
  return error instanceof Error && error.message ? error.message : fallbackMessage;
}

function getOptionName(option) {
  return option.displayName ?? option.name;
}

function getSpecValue(engine, groupName, fieldName) {
  const group = engine?.specs?.[groupName];
  const value = isRecord(group) ? group[fieldName] : fieldName === "Value" ? group : undefined;

  if (value === undefined || value === null || value === "") {
    return "—";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "—";
  }

  return isRecord(value) ? JSON.stringify(value) : String(value);
}

function buildSpecificationGroups(completedSlots) {
  const fieldsByGroup = new Map();

  completedSlots.forEach(({ slot }) => {
    const specs = isRecord(slot.engine?.specs) ? slot.engine.specs : {};

    Object.entries(specs).forEach(([groupName, groupValue]) => {
      const fields = fieldsByGroup.get(groupName) ?? [];
      const incomingFields = isRecord(groupValue) ? Object.keys(groupValue) : ["Value"];

      incomingFields.forEach((fieldName) => {
        if (!fields.includes(fieldName)) {
          fields.push(fieldName);
        }
      });

      fieldsByGroup.set(groupName, fields);
    });
  });

  const priority = new Map(SPEC_GROUP_ORDER.map((groupName, index) => [groupName, index]));

  return Array.from(fieldsByGroup, ([name, fields]) => ({ name, fields })).sort((a, b) => {
    const aPriority = priority.get(a.name) ?? Number.POSITIVE_INFINITY;
    const bPriority = priority.get(b.name) ?? Number.POSITIVE_INFINITY;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return a.name.localeCompare(b.name);
  });
}

export default function CompareDetails() {
  const [brands, setBrands] = useState([]);
  const [brandsStatus, setBrandsStatus] = useState("loading");
  const [brandsError, setBrandsError] = useState("");
  const [brandsRetryKey, setBrandsRetryKey] = useState(0);
  const [slots, setSlots] = useState(() =>
    Array.from({ length: SLOT_COUNT }, createSlot),
  );

  const isMountedRef = useRef(false);
  const requestVersionsRef = useRef(
    Array.from({ length: SLOT_COUNT }, () =>
      Object.fromEntries(REQUEST_STAGES.map((stage) => [stage, 0])),
    ),
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchBrands() {
      try {
        setBrandsStatus("loading");
        setBrandsError("");
        const response = await getAllBrandsList({ sort: "name,asc" });

        if (!cancelled) {
          setBrands(response);
          setBrandsStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setBrands([]);
          setBrandsError(getErrorMessage(error, "Unable to load automobile brands."));
          setBrandsStatus("error");
        }
      }
    }

    fetchBrands();

    return () => {
      cancelled = true;
    };
  }, [brandsRetryKey]);

  function updateSlot(slotIndex, update) {
    setSlots((currentSlots) =>
      currentSlots.map((slot, index) =>
        index === slotIndex ? update(slot) : slot,
      ),
    );
  }

  function invalidateRequests(slotIndex, stages = REQUEST_STAGES) {
    stages.forEach((stage) => {
      requestVersionsRef.current[slotIndex][stage] += 1;
    });
  }

  function beginRequest(slotIndex, stage) {
    requestVersionsRef.current[slotIndex][stage] += 1;
    return requestVersionsRef.current[slotIndex][stage];
  }

  function isCurrentRequest(slotIndex, stage, version) {
    return (
      isMountedRef.current &&
      requestVersionsRef.current[slotIndex][stage] === version
    );
  }

  async function loadModels(slotIndex, brandId) {
    const version = beginRequest(slotIndex, "models");
    updateSlot(slotIndex, (slot) => ({
      ...slot,
      loadingStage: "models",
      error: null,
    }));

    try {
      const response = await getAllModelFamiliesForBrand(brandId, {
        sort: "name,asc",
      });

      if (isCurrentRequest(slotIndex, "models", version)) {
        updateSlot(slotIndex, (slot) => ({
          ...slot,
          models: response,
          loadingStage: null,
        }));
      }
    } catch (error) {
      if (isCurrentRequest(slotIndex, "models", version)) {
        updateSlot(slotIndex, (slot) => ({
          ...slot,
          models: [],
          loadingStage: null,
          error: {
            stage: "models",
            message: getErrorMessage(error, "Unable to load models for this brand."),
          },
        }));
      }
    }
  }

  async function loadAutos(slotIndex, brandId, familyKey) {
    const version = beginRequest(slotIndex, "autos");
    updateSlot(slotIndex, (slot) => ({
      ...slot,
      loadingStage: "autos",
      error: null,
    }));

    try {
      const response = await getAllAutosForBrandAndFamily(brandId, familyKey);

      if (isCurrentRequest(slotIndex, "autos", version)) {
        updateSlot(slotIndex, (slot) => ({
          ...slot,
          autos: response,
          loadingStage: null,
        }));
      }
    } catch (error) {
      if (isCurrentRequest(slotIndex, "autos", version)) {
        updateSlot(slotIndex, (slot) => ({
          ...slot,
          autos: [],
          loadingStage: null,
          error: {
            stage: "autos",
            message: getErrorMessage(error, "Unable to load automobiles for this model."),
          },
        }));
      }
    }
  }

  async function loadEngines(slotIndex, autoId) {
    const version = beginRequest(slotIndex, "engines");
    updateSlot(slotIndex, (slot) => ({
      ...slot,
      loadingStage: "engines",
      error: null,
    }));

    try {
      const response = await getAllEnginesForAutoIdList({
        autoId,
        sort: "name,asc",
      });

      if (isCurrentRequest(slotIndex, "engines", version)) {
        updateSlot(slotIndex, (slot) => ({
          ...slot,
          engines: response,
          loadingStage: null,
        }));
      }
    } catch (error) {
      if (isCurrentRequest(slotIndex, "engines", version)) {
        updateSlot(slotIndex, (slot) => ({
          ...slot,
          engines: [],
          loadingStage: null,
          error: {
            stage: "engines",
            message: getErrorMessage(error, "Unable to load engines for this automobile."),
          },
        }));
      }
    }
  }

  async function loadDetails(slotIndex, autoId, engineId) {
    const version = beginRequest(slotIndex, "details");
    updateSlot(slotIndex, (slot) => ({
      ...slot,
      loadingStage: "details",
      error: null,
    }));

    try {
      const [auto, engine] = await Promise.all([
        getAutoById(autoId),
        getEngineById(engineId),
      ]);

      if (String(engine.automobileId) !== String(autoId)) {
        throw new Error("The selected engine does not belong to this automobile.");
      }

      if (isCurrentRequest(slotIndex, "details", version)) {
        updateSlot(slotIndex, (slot) => ({
          ...slot,
          auto,
          engine,
          loadingStage: null,
        }));
      }
    } catch (error) {
      if (isCurrentRequest(slotIndex, "details", version)) {
        updateSlot(slotIndex, (slot) => ({
          ...slot,
          auto: null,
          engine: null,
          loadingStage: null,
          error: {
            stage: "details",
            message: getErrorMessage(error, "Unable to load the selected comparison details."),
          },
        }));
      }
    }
  }

  function handleBrandChange(slotIndex, brandId) {
    invalidateRequests(slotIndex);
    updateSlot(slotIndex, () => ({
      ...createSlot(),
      brandId,
    }));

    if (brandId) {
      loadModels(slotIndex, brandId);
    }
  }

  function handleModelChange(slotIndex, brandId, familyKey) {
    invalidateRequests(slotIndex, ["autos", "engines", "details"]);
    updateSlot(slotIndex, (slot) => ({
      ...slot,
      familyKey,
      autoId: "",
      engineId: "",
      autos: [],
      engines: [],
      auto: null,
      engine: null,
      loadingStage: null,
      error: null,
    }));

    if (familyKey) {
      loadAutos(slotIndex, brandId, familyKey);
    }
  }

  function handleAutoChange(slotIndex, autoId) {
    invalidateRequests(slotIndex, ["engines", "details"]);
    updateSlot(slotIndex, (slot) => ({
      ...slot,
      autoId,
      engineId: "",
      engines: [],
      auto: null,
      engine: null,
      loadingStage: null,
      error: null,
    }));

    if (autoId) {
      loadEngines(slotIndex, autoId);
    }
  }

  function handleEngineChange(slotIndex, autoId, engineId) {
    invalidateRequests(slotIndex, ["details"]);
    updateSlot(slotIndex, (slot) => ({
      ...slot,
      engineId,
      auto: null,
      engine: null,
      loadingStage: null,
      error: null,
    }));

    if (engineId) {
      loadDetails(slotIndex, autoId, engineId);
    }
  }

  function retrySlot(slotIndex) {
    const slot = slots[slotIndex];

    switch (slot.error?.stage) {
      case "models":
        loadModels(slotIndex, slot.brandId);
        break;
      case "autos":
        loadAutos(slotIndex, slot.brandId, slot.familyKey);
        break;
      case "engines":
        loadEngines(slotIndex, slot.autoId);
        break;
      case "details":
        loadDetails(slotIndex, slot.autoId, slot.engineId);
        break;
      default:
        break;
    }
  }

  const completedSlots = slots
    .map((slot, index) => ({ slot, index }))
    .filter(({ slot }) => slot.auto && slot.engine);
  const specificationGroups = buildSpecificationGroups(completedSlots);

  if (brandsStatus === "error") {
    return (
      <main className={styles.compare}>
        <section className={styles.statePanel} role="alert">
          <p className={styles.eyebrow}>Vehicle comparison</p>
          <h1>Brands are unavailable</h1>
          <p>{brandsError}</p>
          <button
            type="button"
            onClick={() => setBrandsRetryKey((currentKey) => currentKey + 1)}
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.compare}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Vehicle comparison</p>
        <h1>Compare engines side by side</h1>
        <p>
          Build up to three automobile selections, then review every available
          engine specification in one aligned table.
        </p>
      </header>

      <section className={styles.slotGrid} aria-label="Comparison selections">
        {slots.map((slot, slotIndex) => {
          const slotNumber = slotIndex + 1;
          const loadingLabel = slot.loadingStage
            ? `Loading ${slot.loadingStage === "details" ? "comparison details" : slot.loadingStage}`
            : "";

          return (
            <fieldset
              className={styles.slot}
              key={slotNumber}
              aria-busy={Boolean(slot.loadingStage)}
            >
              <legend>Vehicle {slotNumber}</legend>

              <label htmlFor={`compare-brand-${slotNumber}`}>Brand</label>
              <select
                id={`compare-brand-${slotNumber}`}
                value={slot.brandId}
                disabled={brandsStatus === "loading"}
                onChange={(event) =>
                  handleBrandChange(slotIndex, event.target.value)
                }
              >
                <option value="">
                  {brandsStatus === "loading" ? "Loading brands…" : "Select brand"}
                </option>
                {brands.map((brand) => (
                  <option value={brand.id} key={brand.id}>
                    {getOptionName(brand)}
                  </option>
                ))}
              </select>

              <label htmlFor={`compare-model-${slotNumber}`}>Model</label>
              <select
                id={`compare-model-${slotNumber}`}
                value={slot.familyKey}
                disabled={!slot.brandId || slot.loadingStage === "models"}
                onChange={(event) =>
                  handleModelChange(slotIndex, slot.brandId, event.target.value)
                }
              >
                <option value="">
                  {slot.loadingStage === "models" ? "Loading models…" : "Select model"}
                </option>
                {slot.models.map((model) => (
                  <option value={model.familyKey} key={model.familyKey}>
                    {getOptionName(model)}
                  </option>
                ))}
              </select>

              <label htmlFor={`compare-auto-${slotNumber}`}>Automobile</label>
              <select
                id={`compare-auto-${slotNumber}`}
                value={slot.autoId}
                disabled={!slot.familyKey || slot.loadingStage === "autos"}
                onChange={(event) =>
                  handleAutoChange(slotIndex, event.target.value)
                }
              >
                <option value="">
                  {slot.loadingStage === "autos" ? "Loading automobiles…" : "Select automobile"}
                </option>
                {slot.autos.map((auto) => (
                  <option value={auto.id} key={auto.id}>
                    {getOptionName(auto)}
                  </option>
                ))}
              </select>

              <label htmlFor={`compare-engine-${slotNumber}`}>Engine</label>
              <select
                id={`compare-engine-${slotNumber}`}
                value={slot.engineId}
                disabled={!slot.autoId || slot.loadingStage === "engines"}
                onChange={(event) =>
                  handleEngineChange(slotIndex, slot.autoId, event.target.value)
                }
              >
                <option value="">
                  {slot.loadingStage === "engines" ? "Loading engines…" : "Select engine"}
                </option>
                {slot.engines.map((engine) => (
                  <option value={engine.id} key={engine.id}>
                    {getOptionName(engine)}
                  </option>
                ))}
              </select>

              <div className={styles.slotStatus} aria-live="polite">
                {slot.loadingStage && (
                  <p className={styles.loadingStatus}>
                    <span aria-hidden="true" />
                    {loadingLabel}
                  </p>
                )}
                {slot.error && (
                  <div className={styles.slotError} role="alert">
                    <p>{slot.error.message}</p>
                    <button type="button" onClick={() => retrySlot(slotIndex)}>
                      Retry
                    </button>
                  </div>
                )}
                {slot.auto && slot.engine && !slot.loadingStage && !slot.error && (
                  <p className={styles.readyStatus}>Ready to compare</p>
                )}
              </div>
            </fieldset>
          );
        })}
      </section>

      {completedSlots.length === 0 ? (
        <section className={styles.emptyState}>
          <h2>Your comparison will appear here</h2>
          <p>Complete at least one vehicle selection to load its specifications.</p>
        </section>
      ) : (
        <section className={styles.results} aria-labelledby="comparison-results-heading">
          <div className={styles.resultsHeading}>
            <p className={styles.eyebrow}>Selected specifications</p>
            <h2 id="comparison-results-heading">Comparison results</h2>
          </div>

          {specificationGroups.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No specifications available</h3>
              <p>The selected engines do not include structured specification data.</p>
            </div>
          ) : (
            <div
              className={styles.tableScroll}
              role="region"
              aria-label="Scrollable vehicle specification comparison"
              tabIndex={0}
            >
              <table>
                <thead>
                  <tr>
                    <th scope="col">Specification</th>
                    {completedSlots.map(({ slot, index }) => (
                      <th scope="col" key={index}>
                        <span>Vehicle {index + 1}</span>
                        <strong>{getOptionName(slot.auto)}</strong>
                        <small>{getOptionName(slot.engine)}</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specificationGroups.map((group) => (
                    <FragmentGroup
                      key={group.name}
                      group={group}
                      completedSlots={completedSlots}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function FragmentGroup({ group, completedSlots }) {
  return (
    <>
      <tr className={styles.groupRow}>
        <th scope="rowgroup" colSpan={completedSlots.length + 1}>
          {group.name}
        </th>
      </tr>
      {group.fields.map((fieldName) => (
        <tr key={`${group.name}-${fieldName}`}>
          <th scope="row">{fieldName}</th>
          {completedSlots.map(({ slot, index }) => (
            <td key={index}>{getSpecValue(slot.engine, group.name, fieldName)}</td>
          ))}
        </tr>
      ))}
    </>
  );
}
