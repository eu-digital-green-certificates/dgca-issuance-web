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

// import axios from 'axios';
import React from 'react';


// json data from schema (will be replaced by API later)
import MedicalProducts from './assets/json-res/vaccine-medicinal-product.json';
import DiseaseAgents from './assets/json-res/disease-agent-targeted.json';
import VaccineManufacturers from './assets/json-res/vaccine-mah-manf.json';
import Vaccines from './assets/json-res/vaccine-prophylaxis.json';
import TestManufacturers from './assets/json-res/test-manf.json';
import TestResult from './assets/json-res/test-result.json';
import TestType from './assets/json-res/test-type.json';
import { useTranslation } from 'react-i18next';

interface IValue {
    active: boolean,
    display: string,
    lang: string,
    system: string,
    version: string
    valueSetId?: string,
}

export interface IValueSet {
    [key: string]: IValue;
}

// Date of Birth Formats
export const useGetDateFormats = () => {
    const {t} = useTranslation();
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


// Medical Products
export const useGetVaccinMedicalData = () => {

    const [medicalProducts, setMedicalProducts] = React.useState<IValueSet>();

    React.useEffect(() => {
        // get object via api
        // const medicalProductsData = getApiData('/medicalProducts');

        // get object via public
        const medicalProductsData = MedicalProducts.valueSetValues;
        setMedicalProducts(medicalProductsData);
    }, [])

    return medicalProducts;
}


// Disease Agents
export const useGetDiseaseAgents = () => {

    const [diseaseAgents, setDiseaseAgents] = React.useState<IValueSet>();

    React.useEffect(() => {
        // get object via api
        // const diseaseAgentsData = getApiData('/diseaseAgents');

        // get object via public
        const diseaseAgentsData = DiseaseAgents.valueSetValues;
        setDiseaseAgents(diseaseAgentsData);
    }, [])

    return diseaseAgents;
}


// Vaccine Manufacturers
export const useGetVaccineManufacturers = () => {

    const [vaccineManufacturers, setVaccineManufacturers] = React.useState<IValueSet>();

    React.useEffect(() => {
        // get object via api
        // const vaccineManufacturersData = getApiData('/vaccineManufacturers');

        // get object via public
        const vaccineManufacturersData = VaccineManufacturers.valueSetValues;
        setVaccineManufacturers(vaccineManufacturersData);
    }, [])

    return vaccineManufacturers;
}


// Vaccine / Prophylaxis
export const useGetVaccines = () => {

    const [vaccines, setVaccines] = React.useState<IValueSet>();

    React.useEffect(() => {
        // get object via api
        // const vaccinesData = getApiData('/vaccines');

        // get object via public
        const vaccinesData = Vaccines.valueSetValues;
        setVaccines(vaccinesData);
    }, [])

    return vaccines;
}

// TestType
export const useGetTestType = () => {

    const [testType, setTestType] = React.useState<IValueSet>();

    React.useEffect(() => {
        // get object via api
        // const testManufacturers = getApiData('/testManufacturers');

        // get object via public
        const testType = TestType.valueSetValues;
        setTestType(testType);
    }, [])

    return testType;
}

// TestManufacturers
export const useGetTestManufacturers = () => {

    const [testManufacturers, setTestManufacturers] = React.useState<IValueSet>();

    React.useEffect(() => {
        // get object via api
        // const testManufacturers = getApiData('/testManufacturers');

        // get object via public
        const testManufacturers = TestManufacturers.valueSetValues;
        setTestManufacturers(testManufacturers);
    }, [])

    return testManufacturers;
}

// TestResult
export const useGetTestResult = () => {

    const [testResult, setTestResult] = React.useState<IValueSet>();

    React.useEffect(() => {
        // get object via api
        // const testManufacturers = getApiData('/testManufacturers');

        // get object via public
        const testResult = TestResult.valueSetValues;
        setTestResult(testResult);
    }, [])

    return testResult;
}
