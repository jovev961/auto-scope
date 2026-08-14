"use client";

import { useEffect, useState } from "react";
import {getAllBrandsList } from "@/lib/brands";
import { getAllAutosForBrandAndFamily, getAllModelFamilies, getAllModelFamiliesForBrand } from "@/lib/modelFamilies";
import { getAllEnginesForAutoIdList, getAutoById } from "@/lib/autos";
import { getEngineById } from "@/lib/engines";

export default function CompareDetails({preSelectedAuto}) {

    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState({});
    const [autos, setAutos] = useState({});
    const [engines, setEngines] = useState({});
    const [details, setDetails] = useState({});

    const [selectedBrands, setSelectedBrands] = useState({});
    const [selectedModels, setSelectedModels] = useState({});
    const [selectedAutos, setSelectedAutos] = useState({});
    const [selectedEngines, setSelectedEngines] = useState({});

    useEffect(() => {
        let canceled = false;
        const fetchBrands = async () => {
            try {
                const response = await getAllBrandsList()
                if(!canceled){
                    setBrands(response);
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

    useEffect(() => {
        const fetchModels = async() => {
            for (let index = 1; index < 4; index++) {
                const select = `select${index}`
                const selectBrand = `select${index}Brand`
                if(selectedBrands[select] && (!models[selectBrand] || models[selectBrand] !== selectedBrands[select])){
                    if(models[selectBrand] !== selectedBrands[select]){
                        setSelectedModels((prev) => ({...prev, [select]:null}))
                        setSelectedAutos((prev) => ({...prev, [select]:null}))
                        setDetails((prev) => ({...prev, [`${select}Auto`]:null, [`${select}Engine`]:null}))
                    }
                    const response = await getAllModelFamiliesForBrand(selectedBrands[select], {})
                    console.log(response)
                    setModels((prev) => ({...prev, [select]:response, [selectBrand]:selectedBrands[select]}))
                }
            }
        }

        fetchModels();
    }, [selectedBrands])

    useEffect(() => {
        const fetchAutos = async() => {
            for (let index = 1; index < 4; index++) {
                const select = `select${index}`
                const selectModel = `select${index}Model`
                if(selectedModels[select] && (!autos[selectModel] || autos[selectModel] !== selectedModels[select])){
                    if(autos[selectModel] !== selectedModels[select]){
                        setSelectedAutos((prev) => ({...prev, [select]:null}))
                        setDetails((prev) => ({...prev, [`${select}Auto`]:null, [`${select}Engine`]:null}))

                    }
                    const response = await getAllAutosForBrandAndFamily(selectedBrands[select], selectedModels[select])
                    console.log(response)
                    setAutos((prev) => ({...prev, [select]:response, [selectModel]:selectedModels[select]}))
                }
            }
        }

        fetchAutos();
    }, [selectedModels])

    useEffect(() => {
        const fetchEngines = async() => {
            for (let index = 1; index < 4; index++) {
                const select = `select${index}`
                const selectAuto = `select${index}Auto`
                if(selectedAutos[select] && (!engines[selectAuto] || engines[selectAuto] !== selectedAutos[select])){
                    if(engines[selectAuto] !== selectedAutos[select]){
                        setDetails((prev) => ({...prev, [`${select}Auto`]:null, [`${select}Engine`]:null}))

                    }
                    const response = await getAllEnginesForAutoIdList({"autoId":selectedAutos[select]})
                    console.log(response)
                    setEngines((prev) => ({...prev, [select]:response, [selectAuto]:selectedAutos[select]}))
                }
            }
        }

        fetchEngines();
    }, [selectedAutos])

        useEffect(() => {
        const fetchDetails = async() => {
            for (let index = 1; index < 4; index++) {
                const select = `select${index}`
                const selectEngine = `select${index}Engine`
                if(selectedEngines[select] && (!details[selectEngine] || details[selectEngine] !== selectedEngines[select])){
                    Promise.all([
                          getAutoById(selectedAutos[select]),
                          getEngineById(selectedEngines[select]),
                        ])
                          .then(([auto, engineResponse]) => {
                                setDetails((prev) => ({...prev, [`${select}Auto`]:auto, [`${select}Engine`]:engineResponse}))
                                console.log(auto)
                                console.log(engineResponse)
                          })
                          .catch((error) => {
                            console.log(error)
                          });
                }
            }
        }

        fetchDetails();
    }, [selectedEngines])

  return (
    <div>
        {brands &&
        <div>
            {Array.from({ length: 3 }, (_, index) => (
                <select key={index} size={brands.length >= 10 ? 10 : brands.length + 1} onChange={(e) => {setSelectedBrands((prev) => ({...prev, [`select${index+1}`]:e.target.value}))}}>
                    <option value={null}>Select Brand</option>
                    {brands.map((brand) => (
                        <option value={brand.id} key={brand.id}>{brand.name}</option>
                    ))}
                </select>
            ))}
        </div>
        }
        <div>
            {Array.from({ length: 3 }, (_, index) => {
                const selectKey = `select${index + 1}`;
                const modelList = models[selectKey];

                if (!selectedBrands?.[selectKey] || !modelList || modelList.length === 0) {
                    return null;
                }

                return (
                    <select key={selectKey} size={Math.min(modelList.length + 1, 10)}
                        onChange={(e) => {
                            setSelectedModels((prev) => ({
                                ...prev,
                                [selectKey]: e.target.value,
                            }));
                        }}
                    >
                        <option value="">Select Model</option>
                        {modelList.map((model) => (
                            <option value={model.familyKey} key={model.familyKey}>
                                {model.name}
                            </option>
                        ))}
                    </select>
                );
            })}
        </div>
        <div>
            {Array.from({ length: 3 }, (_, index) => {
                const selectKey = `select${index + 1}`;
                const autoList = autos[selectKey];

                if (!selectedModels?.[selectKey] || !autoList || autoList.length === 0) {
                    return null;
                }

                return (
                    <select key={selectKey} size={Math.min(autoList.length + 1, 10)}
                        onChange={(e) => {
                            setSelectedAutos((prev) => ({
                                ...prev,
                                [selectKey]: e.target.value,
                            }));
                        }}
                    >
                        <option value="">Select Auto</option>
                        {autoList.map((auto) => (
                            <option value={auto.id} key={auto.id}>
                                {auto.name}
                            </option>
                        ))}
                    </select>
                );
            })}
        </div>
        <div>
            {Array.from({ length: 3 }, (_, index) => {
                const selectKey = `select${index + 1}`;
                const engineList = engines[selectKey];

                if (!selectedAutos?.[selectKey] || !engineList || engineList.length === 0) {
                    return null;
                }

                return (
                    <select key={selectKey} size={Math.min(engineList.length + 1, 10)}
                        onChange={(e) => {
                            setSelectedEngines((prev) => ({
                                ...prev,
                                [selectKey]: e.target.value,
                            }));
                        }}
                    >
                        <option value="">Select Auto</option>
                        {engineList.map((engine) => (
                            <option value={engine.id} key={engine.id}>
                                {engine.name}
                            </option>
                        ))}
                    </select>
                );
            })}
        </div>
        <div>
            {Array.from({ length: 3 }, (_, index) => {
                const selectKey = `select${index + 1}`;
                const auto = details[`${selectKey}Auto`];
                const engine = details[`${selectKey}Engine`]
                const engineSpecs = engine?.specs ?? {};


                if (!selectedEngines?.[selectKey] || !auto || !engine) {
                    return null;
                }

                return (
                    <section key={index}>
                        <p>Selected engine</p>
                        <h2 id="selected-engine-heading">
                            {engine.displayName ?? engine.name}
                        </h2>
                        <div>
                            <h3>Specifications</h3>
                            {engineSpecs["Engine Specs"] && (
                            <div>
                                <h2>Engine Specs</h2>
                                <p>Cylinders: {engineSpecs["Engine Specs"]["Cylinders:"] || "No data"}</p>
                                <p>Displacement: {engineSpecs["Engine Specs"]["Displacement:"] || "No data"}</p>
                                <p>Power: {engineSpecs["Engine Specs"]["Power:"] || "No data"}</p>
                                <p>Torque: {engineSpecs["Engine Specs"]["Torque:"] || "No data"}</p>
                                <p>Fuel System: {engineSpecs["Engine Specs"]["Fuel System:"] || "No data"}</p>
                                <p>Fuel: {engineSpecs["Engine Specs"]["Fuel:"] || "No data"}</p>
                            </div>
                            )}
                            {engineSpecs["Transmission Specs"] && (
                            <div>
                                <h2>Transmission Specs</h2>
                                <p>Drive Type: {engineSpecs["Transmission Specs"]["Drive Type:"] || "No data"}</p>
                                <p>Gearbox: {engineSpecs["Transmission Specs"]["Gearbox:"] || "No data"}</p>
                            </div>
                            )}
                            {engineSpecs["Brakes Specs"] && (
                            <div>
                                <h2>Brakes Specs</h2>
                                <p>Front: {engineSpecs["Brakes Specs"]["Front:"] || "No data"}</p>
                                <p>Rear: {engineSpecs["Brakes Specs"]["Rear:"] || "No data"}</p>
                            </div>
                            )}
                            {engineSpecs.Dimensions && (
                            <div>
                                <h2>Dimensions</h2>
                                <p>Length: {engineSpecs.Dimensions["Length:"] || "No data"}</p>
                                <p>Width: {engineSpecs.Dimensions["Width:"] || "No data"}</p>
                                <p>Height: {engineSpecs.Dimensions["Height:"] || "No data"}</p>
                                <p>Front/Rear Track: {engineSpecs.Dimensions["Front/Rear Track:"] || "No data"}</p>
                                <p>Wheelbase: {engineSpecs.Dimensions["Wheelbase:"] || "No data"}</p>
                                <p>Ground Clearance: {engineSpecs.Dimensions["Ground Clearance:"] || "No data"}</p>
                            </div>
                            )}
                            {engineSpecs["Weight Specs"] && (
                            <div>
                                <h2>Weight Specs</h2>
                                <p>Unladen Weight: {engineSpecs["Weight Specs"]["Unladen Weight:"] || "No data"}</p>
                            </div>
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    </div>

  )
}
