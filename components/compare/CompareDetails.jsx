"use client";

import { useEffect, useState } from "react";
import {getAllBrandsList } from "@/lib/brands";
import { getAllAutosForBrandAndFamily, getAllModelFamiliesForBrand } from "@/lib/modelFamilies";
import { getAllEnginesForAutoIdList, getAutoById } from "@/lib/autos";
import { getEngineById } from "@/lib/engines";
import styles from "./CompareDetails.module.css";

    const initialData = {
        "brands":[],
        "models":[],
        "autos":[],
        "engines": [],
        "details": {
            auto:[],
            engine:[],
        },
    }

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

const SPEC_FIELD_ORDER = {
    "Engine Specs": ["Cylinders:", "Displacement:", "Power:", "Torque:", "Fuel System:", "Fuel:"],
    "Transmission Specs": ["Drive Type:", "Gearbox:"],
    "Brakes Specs": ["Front:", "Rear:"],
    Dimensions: ["Length:", "Width:", "Height:", "Front/Rear Track:", "Wheelbase:", "Ground Clearance:"],
    "Weight Specs": ["Unladen Weight:"],
};

function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function buildSpecificationGroups(comparisons) {
    const groups = new Map();

    comparisons.forEach(({engine}) => {
        const specs = isRecord(engine?.specs) ? engine.specs : {};

        Object.entries(specs).forEach(([groupName, groupValue]) => {
            const fields = groups.get(groupName) ?? [];
            const incomingFields = isRecord(groupValue) ? Object.keys(groupValue) : ["Value"];

            incomingFields.forEach((fieldName) => {
                if(!fields.includes(fieldName)){
                    fields.push(fieldName);
                }
            });

            groups.set(groupName, fields);
        });
    });

    const groupPriority = new Map(SPEC_GROUP_ORDER.map((groupName, index) => [groupName, index]));

    return Array.from(groups, ([name, fields], groupIndex) => {
        const preferredFields = SPEC_FIELD_ORDER[name] ?? [];
        const fieldPriority = new Map(preferredFields.map((fieldName, index) => [fieldName, index]));

        return {
            name,
            groupIndex,
            fields: fields
                .map((fieldName, fieldIndex) => ({fieldName, fieldIndex}))
                .sort((a, b) => {
                    const aPriority = fieldPriority.get(a.fieldName) ?? Number.POSITIVE_INFINITY;
                    const bPriority = fieldPriority.get(b.fieldName) ?? Number.POSITIVE_INFINITY;

                    return aPriority - bPriority || a.fieldIndex - b.fieldIndex;
                })
                .map(({fieldName}) => fieldName),
        };
    })
    .sort((a, b) => {
        const aPriority = groupPriority.get(a.name) ?? Number.POSITIVE_INFINITY;
        const bPriority = groupPriority.get(b.name) ?? Number.POSITIVE_INFINITY;

        return aPriority - bPriority || a.groupIndex - b.groupIndex;
    });
}

function getSpecificationValue(engine, groupName, fieldName) {
    const group = engine?.specs?.[groupName];
    const value = isRecord(group) ? group[fieldName] : fieldName === "Value" ? group : undefined;

    if(value === undefined || value === null || (typeof value === "string" && value.trim() === "")){
        return "No data";
    }

    if(Array.isArray(value)){
        return value.length > 0 ? value.join(", ") : "No data";
    }

    return isRecord(value) ? JSON.stringify(value) : String(value);
}

function updateListValue(list, index, value) {
    const updatedList = [...list];
    updatedList[index] = value;
    return updatedList;
}

export default function CompareDetails({preSelectedAuto}) {

    const [compareData, setCompareData] = useState(initialData);

    const [selectedData, setSelectedData] = useState(initialData);

    const preSelectedBrand = preSelectedAuto?.brand;
    const preSelectedModel = preSelectedAuto?.model;
    const preSelectedAutomobile = preSelectedAuto?.auto;
    const preSelectedEngine = preSelectedAuto?.engine;

    useEffect(() => {
        let canceled = false;
        const fetchBrands = async () => {
            try {
                const response = await getAllBrandsList()
                if(!canceled){
                    setCompareData((prev) => ({...prev, brands:response}));
                }
            } catch (error) {
                if(!canceled){
                    console.error(error);
                }
            }
        };
        fetchBrands();
        return () => {
            canceled = true;
        }
    },[])

    function validatePreSelectedAuto(models, autos, engines){
        const modelIds = models.map((model) => (String(model.familyKey)))
        const autoIds = autos.map((auto) => (String(auto.id)))
        const engineIds = engines.map((engine) => (String(engine.id)))

        if(!modelIds.includes(String(preSelectedModel))
            || !autoIds.includes(String(preSelectedAutomobile))
            || !engineIds.includes(String(preSelectedEngine))){
            return null;
        }
        return 1;
    }

    useEffect(() => {
        let canceled = false;

        const setUpPreSelect = async () => {
            if(!preSelectedBrand
                || !preSelectedModel
                || !preSelectedAutomobile
                || !preSelectedEngine
            ){
                return;
            }

            try {
                const [models, autos, engines, auto, engine] = await Promise.all([
                    getAllModelFamiliesForBrand(preSelectedBrand),
                    getAllAutosForBrandAndFamily(preSelectedBrand, preSelectedModel),
                    getAllEnginesForAutoIdList({autoId: preSelectedAutomobile}),
                    getAutoById(preSelectedAutomobile),
                    getEngineById(preSelectedEngine),
                ]);

                if(canceled){
                    return;
                }

                if(!validatePreSelectedAuto(models, autos, engines)){
                    return null;
                }

                setSelectedData((prev) => ({
                    ...prev,
                    brands: updateListValue(prev.brands, 0, preSelectedBrand),
                    models: updateListValue(prev.models, 0, preSelectedModel),
                    autos: updateListValue(prev.autos, 0, preSelectedAutomobile),
                    engines: updateListValue(prev.engines, 0, preSelectedEngine),
                }));

                setCompareData((prev) => ({
                    ...prev,
                    models: updateListValue(prev.models, 0, models),
                    autos: updateListValue(prev.autos, 0, autos),
                    engines: updateListValue(prev.engines, 0, engines),
                    details: {
                        ...prev.details,
                        auto: updateListValue(prev.details.auto, 0, auto),
                        engine: updateListValue(prev.details.engine, 0, engine),
                    },
                }));
            } catch (error) {
                if(!canceled){
                    console.error("Unable to set up the preselected automobile", error);
                }
            }
        }

        setUpPreSelect();

        return () => {
            canceled = true;
        }
    }, [preSelectedBrand, preSelectedModel, preSelectedAutomobile, preSelectedEngine])

    function handleDropdownUpdate(index, level){
        if(level > 0){
            setCompareData((prev) => {
                const updatedDetails = {...prev.details};
                updatedDetails.auto[index] = null;
                updatedDetails.engine[index] = null;

                return {
                    ...prev,
                    details: updatedDetails,
                };
            });
        }
        if(level > 1){
            handleCompareDataChange("engines", null, index);
        }
        if(level > 2){
            handleCompareDataChange("autos", null, index);
        }
        if(level > 3){
            handleCompareDataChange("models", null, index);
        }
    }

    function handleSelectDataChange(type, value, index){
        setSelectedData((prev) => {
            const updatedList = [...prev[type]];
            updatedList[index] = value;

            return {
                ...prev,
                [type]: updatedList,
            };
        });
    }

    function handleCompareDataChange(type, value, index) {
        setCompareData((prev) => {
            const updatedList = [...prev[type]];
            updatedList[index] = value;

            return {
                ...prev,
                [type]: updatedList,
            };
        });
    }

    async function handleBrandSelect(index, value) {
        handleDropdownUpdate(index, 4)
        handleSelectDataChange("brands", value, index)
        if(value){
            const response = await getAllModelFamiliesForBrand(value);
            handleCompareDataChange("models", response, index);
        }
    }

    async function handleModelSelect(index, value) {
        handleDropdownUpdate(index, 3)
        handleSelectDataChange("models", value, index)
        if(value){
            const response = await getAllAutosForBrandAndFamily(selectedData.brands[index], value);
            handleCompareDataChange("autos", response, index);
        }
    }

    async function handleAutoSelect(index, value) {
        handleDropdownUpdate(index, 2);
        handleSelectDataChange("autos", value, index);
        if(value){
            const response = await getAllEnginesForAutoIdList({autoId:value});
            handleCompareDataChange("engines", response, index);
        }
    }

    async function handleEngineSelect(index, value) {
        handleDropdownUpdate(index, 1)
        handleSelectDataChange("engines", value, index);
        Promise.all([
            getAutoById(selectedData.autos[index]),
            getEngineById(value)
        ])
        .then(([auto, engine]) => {
            setCompareData((prev) => {
                const updatedDetails = {...prev.details};
                updatedDetails.auto[index] = auto;
                updatedDetails.engine[index] = engine;

                return {
                    ...prev,
                    details: updatedDetails,
                };
            });
        })
        .catch((error) => {
            console.log(error)
        });
    }

    const completedComparisons = Array.from({length: 3}, (_, index) => ({
        index,
        auto: compareData.details.auto[index],
        engine: compareData.details.engine[index],
    })).filter(({index, auto, engine}) => selectedData.engines[index] && auto && engine);

    const specificationGroups = buildSpecificationGroups(completedComparisons);

  return (
    <div className={styles.compare}>
        <header className={styles.hero}>
            <p className={styles.eyebrow}>Auto Scope comparison studio</p>
            <h1>Build your ideal three-car comparison.</h1>
            <p className={styles.intro}>
                Select a brand, model, automobile, and engine for each slot. Your chosen specifications will appear below for a clear side-by-side review.
            </p>
        </header>

        {compareData.brands &&
        <section className={styles.selectionSection} aria-labelledby="comparison-builder-heading">
            <div className={styles.sectionHeading}>
                <div>
                    <p className={styles.sectionEyebrow}>Selection</p>
                    <h2 id="comparison-builder-heading">Configure vehicles</h2>
                </div>
                <p>Complete any slot independently.</p>
            </div>

            <div className={styles.slotGrid}>
                {Array.from({ length: 3 }, (_, index) => {
                    const models = compareData.models[index];
                    const autos = compareData.autos[index];
                    const engines = compareData.engines[index];

                    return (
                        <article className={styles.slotCard} key={index}>
                            <div className={styles.slotHeader}>
                                <div>
                                    <p>Comparison slot</p>
                                    <h3>Vehicle {index + 1}</h3>
                                </div>
                                <span className={styles.slotNumber}>0{index + 1}</span>
                            </div>

                            <div className={styles.slotProgress} aria-hidden="true">
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>

                            <div className={styles.fields}>
                                <label className={styles.field} htmlFor={`compare-brand-${index}`}>
                                    <span>Brand</span>
                                    <select id={`compare-brand-${index}`}
                                        value={selectedData.brands[index]}
                                        onChange={(e) => {handleBrandSelect(index, e.target.value)}}>
                                        <option value="">Select Brand</option>
                                        {compareData.brands.map((brand) => (
                                            <option value={brand.id} key={brand.id}>{brand.name}</option>
                                        ))}
                                    </select>
                                </label>

                                {selectedData.brands[index] && models && (
                                    <label className={styles.field} htmlFor={`compare-model-${index}`}>
                                        <span>Model</span>
                                        <select id={`compare-model-${index}`}
                                            value={selectedData.models[index]}
                                            onChange={(e) => {
                                                handleModelSelect(index, e.target.value);
                                            }}
                                        >
                                            <option value="">Select Model</option>
                                            {models.map((model) => (
                                                <option value={model.familyKey} key={model.familyKey}>
                                                    {model.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                {selectedData.models[index] && autos && (
                                    <label className={styles.field} htmlFor={`compare-auto-${index}`}>
                                        <span>Automobile</span>
                                        <select id={`compare-auto-${index}`}
                                            value={selectedData.autos[index]}
                                            onChange={(e) => {
                                                handleAutoSelect(index, e.target.value)
                                            }}
                                        >
                                            <option value="">Select Auto</option>
                                            {autos.map((auto) => (
                                                <option value={auto.id} key={auto.id}>
                                                    {auto.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                {selectedData.autos[index] && engines && (
                                    <label className={styles.field} htmlFor={`compare-engine-${index}`}>
                                        <span>Engine</span>
                                        <select id={`compare-engine-${index}`}
                                            value={selectedData.engines[index]}
                                            onChange={(e) => {
                                                handleEngineSelect(index, e.target.value)
                                            }}
                                        >
                                            <option value="">Select Engine</option>
                                            {engines.map((engine) => (
                                                <option value={engine.id} key={engine.id}>
                                                    {engine.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
        }

        <section className={styles.resultsSection} aria-labelledby="comparison-results-heading">
            <div className={styles.sectionHeading}>
                <div>
                    <p className={styles.sectionEyebrow}>Specifications</p>
                    <h2 id="comparison-results-heading">Selected comparisons</h2>
                </div>
                <p>Detailed engine data for each completed slot.</p>
            </div>

            {completedComparisons.length === 0 ? (
                <div className={styles.comparisonState}>
                    Complete an engine selection to reveal its specifications.
                </div>
            ) : specificationGroups.length === 0 ? (
                <div className={styles.comparisonState}>
                    The selected engines do not include specification data.
                </div>
            ) : (
                <div className={styles.tableScroll} role="region"
                    aria-label="Scrollable vehicle specification comparison" tabIndex={0}>
                    <table className={styles.comparisonTable}
                        style={{minWidth: `${220 + completedComparisons.length * 260}px`}}>
                        <colgroup>
                            <col className={styles.specificationColumn}/>
                            {completedComparisons.map(({index}) => <col key={index}/>)}
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col">Specification</th>
                                {completedComparisons.map(({index, auto, engine}) => (
                                    <th scope="col" key={index}>
                                        <span className={styles.vehicleSlot}>Vehicle {index + 1}</span>
                                        <strong>{auto.displayName ?? auto.name}</strong>
                                        <small>{engine.displayName ?? engine.name}</small>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        {specificationGroups.map((group) => (
                            <tbody key={group.name}>
                                <tr className={styles.groupRow}>
                                    <th scope="rowgroup" colSpan={completedComparisons.length + 1}>
                                        {group.name}
                                    </th>
                                </tr>
                                {group.fields.map((fieldName) => (
                                    <tr key={`${group.name}-${fieldName}`}>
                                        <th scope="row">{fieldName}</th>
                                        {completedComparisons.map(({index, engine}) => {
                                            const value = getSpecificationValue(engine, group.name, fieldName);

                                            return (
                                                <td className={value === "No data" ? styles.missingValue : undefined}
                                                    key={index}>
                                                    {value}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        ))}
                    </table>
                </div>
            )}
        </section>
    </div>

  )
}
