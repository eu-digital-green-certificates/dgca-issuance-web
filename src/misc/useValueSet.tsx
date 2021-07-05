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
    baseURL: '/dgca-businessrule-service',
    headers: { 'Cache-Control': ' max-age=300' }
});

export interface IValueSet {
    [key: string]: IValue;
}

export interface IValueSetList {
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

export const useGetValueSets = (onInit?: (isInit: boolean) => void, onError?: (msg: string) => void) => {

    const [valueSetHashList, setValueSetHashList] = React.useState<IValueSetHashListItem[]>();

    const [valueSetList] = React.useState<IValueSetList>({});
    const [result, setResult] = React.useState<IValueSetList>();
    const [isInit, setIsInit] = React.useState<boolean>(false);

    // on mount load hash list
    React.useEffect(() => {
        const uri = '/valuesets';

        valueSetApi.get(uri).then((response) => {
            if (response && response.data && response.data.length > 0) {
                setValueSetHashList(response.data);
            }
            else {
                if (onError) {
                    onError('failed to request valuesets');
                }
            }
        })
            .catch((error) => {
                if (onError) {
                    onError(error.message);
                }
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (isInit) {
            setResult(valueSetList);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInit, onInit])

    const setValueSet = (hashListItem: IValueSetHashListItem) => {
        if (hashListItem && hashListItem.hash) {
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
        else {
            console.log('no valid valueset hash');
        }
    }

    return result;
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

// returns display value for key 
export const getValueSetDisplay = (key: string | undefined, valueSet: IValueSet | undefined): string | undefined => {
    let result = key;

    if (valueSet && key && valueSet[key]) {
        result = valueSet[key].display;
    }
    return result;
}
