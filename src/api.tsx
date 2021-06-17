/*
 * eu-digital-green-certificates/ dgca-issuance-web
 *
 * (C) 2021, T-Systems International GmbH
 *
 * Deutsche Telekom AG and all other contributors /
 * copyright owners license this file to you under the Apache
 * License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import axios from 'axios';

import { useTranslation } from 'react-i18next';

interface IValueSetHashListItem {
    id: string;
    hash: string;
}

export enum Value_Sets {
    CountryCodes = 'country-2-codes',
    TestResult = 'covid-19-lab-result',
    TestManufacturer = 'covid-19-lab-test-manufacturer-and-name',
    TestType = 'covid-19-lab-test-type',
    DiseaseAgent = 'disease-agent-targeted',
    VaccineType = 'sct-vaccines-covid-19',
    VaccinesManufacturer = 'vaccines-covid-19-auth-holders',
    Vaccines = 'vaccines-covid-19-names'
}

interface IValue {
    active: boolean,
    display: string,
    lang: string,
    system: string,
    version: string
    valueSetId?: string,
}

const valueSetApi = axios.create({
    baseURL: 'https://dgca-businessrule-service.cfapps.eu10.hana.ondemand.com',
    headers: { 'Cache-Control': ' max-age=300' }
});

export interface IValueSet {
    [key: string]: IValue;
}

export interface IValueSetListItem {
    [key: string]: IValueSet;
}

// Date of Birth Formats
export const useGetDateFormats = () => {
    const { t } = useTranslation();
    const [dateFormats] = React.useState({
        "yyyy-MM-dd": {
            "display": t('translation:date-full')
        },
        "yyyy-MM": {
            "display": t('translation:date-no-day')
        },
        "yyyy": {
            "display": t('translation:date-year')
        }
    });
    return dateFormats
}

export const useGetValueSets = (onInit?: (isInit: boolean) => void) => {

    const [valueSetHashList, setValueSetHashList] = React.useState<IValueSetHashListItem[]>();

    const [valueSetList] = React.useState<IValueSetListItem>({});
    const [isInit, setIsInit] = React.useState<boolean>(false);

    // on mount load hash list
    React.useEffect(() => {
        const uri = '/valuesets';

        valueSetApi.get(uri).then((response) => {
            setValueSetHashList(response.data);
        });

    }, [])

    // 4 hashlist load all valueSets
    React.useEffect(() => {
        if (valueSetHashList) {
            for (const hashListitem of valueSetHashList) {
                setValueSet(hashListitem);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valueSetHashList])

    React.useEffect(() => {
        if (onInit) {
            onInit(isInit);
        }
    }, [isInit, onInit])

    const setValueSet = (hashListItem: IValueSetHashListItem) => {
        if (hashListItem) {
            const uri = '/valuesets/' + hashListItem.hash;

            valueSetApi.get(uri)
                .then((response) => {
                    valueSetList[hashListItem.id] = response.data.valueSetValues;
                })
                .catch((error) => {
                    valueSetList[hashListItem.id] = {};
                    console.log(error);
                })
                .finally(() => {
                    // if all keys added to list --> init = true
                    if (valueSetHashList && valueSetHashList.length === Object.keys(valueSetList).length) {
                        setIsInit(true);
                    }
                });
        }
    }

    return valueSetList;
}

// ValueSetList
export const useGetValueSetHashList = () => {

    const [valueSetList, setValueSetList] = React.useState<IValueSetHashListItem[]>();

    React.useEffect(() => {
        const uri = '/valuesets';

        valueSetApi.get(uri).then((response) => {
            console.log(response.data);

            setValueSetList(response.data);
        });

    }, [])

    return valueSetList;
}

/////////////////////                        /////////////////////
/////////////////////        Single          /////////////////////
/////////////////////                        /////////////////////

// generic ValueSet
export const useGetValueSet = (id: string, valueSetList: IValueSetHashListItem[] | undefined, onError?: (error: any) => void) => {

    const [valueSet, setValueSet] = React.useState<IValueSet>();

    React.useEffect(() => {
        if (id && valueSetList && valueSetList) {
            const find = valueSetList.find((item) => id === item.id);

            if (find && find.hash) {
                const uri = '/valuesets/' + find.hash;

                valueSetApi.get(uri)
                    .then((response) => {
                        setValueSet(response.data.valueSetValues);
                    })
                    .catch((error) => {
                        console.log(error);
                        if (onError) {
                            onError(error);
                        }
                    });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, valueSetList])

    return valueSet;
}

// Medical Products
export const useGetVaccinMedicalData = () => {

    const valueSet = useGetValueSet(Value_Sets.Vaccines, useGetValueSetHashList())
    const [result, setResult] = React.useState<IValueSet>();

    React.useEffect(() => {
        if (valueSet) {
            setResult(valueSet);
        }
    }, [valueSet])

    return result;
}


// Disease Agents
export const useGetDiseaseAgents = () => {

    const valueSet = useGetValueSet(Value_Sets.DiseaseAgent, useGetValueSetHashList())
    const [result, setResult] = React.useState<IValueSet>();

    React.useEffect(() => {
        if (valueSet) {
            setResult(valueSet);
        }
    }, [valueSet])

    return result;
}


// Vaccine Manufacturers
export const useGetVaccineManufacturers = () => {

    const valueSet = useGetValueSet(Value_Sets.VaccinesManufacturer, useGetValueSetHashList())
    const [result, setResult] = React.useState<IValueSet>();

    React.useEffect(() => {
        if (valueSet) {
            setResult(valueSet);
        }
    }, [valueSet])

    return result;
}


// Vaccine / Prophylaxis
export const useGetVaccines = () => {

    const valueSet = useGetValueSet(Value_Sets.VaccineType, useGetValueSetHashList())
    const [result, setResult] = React.useState<IValueSet>();

    React.useEffect(() => {
        if (valueSet) {
            setResult(valueSet);
        }
    }, [valueSet])

    return result;
}

// TestType
export const useGetTestType = () => {

    const valueSet = useGetValueSet(Value_Sets.TestType, useGetValueSetHashList())
    const [result, setResult] = React.useState<IValueSet>();

    React.useEffect(() => {
        if (valueSet) {
            setResult(valueSet);
        }
    }, [valueSet])

    return result;
}

// TestManufacturers
export const useGetTestManufacturers = () => {

    const valueSet = useGetValueSet(Value_Sets.TestManufacturer, useGetValueSetHashList())
    const [result, setResult] = React.useState<IValueSet>();

    React.useEffect(() => {
        if (valueSet) {
            setResult(valueSet);
        }
    }, [valueSet])

    return result;
}

// TestResult
export const useGetTestResult = () => {

    const valueSet = useGetValueSet(Value_Sets.TestResult, useGetValueSetHashList())
    const [result, setResult] = React.useState<IValueSet>();

    React.useEffect(() => {
        if (valueSet) {
            setResult(valueSet);
        }
    }, [valueSet])

    return result;
}
