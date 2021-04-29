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

import axios from 'axios';
import { useKeycloak } from '@react-keycloak/web';
import React from 'react';
import StatisticData from './misc/statistic-data';
import ITestResult from './misc/test-result';


// json data from schema (will be replaced by API later)
import MedicalProducts from './assets/json-res/vaccine-medicinal-product.json';
import DiseaseAgents from './assets/json-res/disease-agent-targeted.json';
import VaccineManufacturers from './assets/json-res/vaccine-mah-manf.json';
import Vaccines from './assets/json-res/vaccine-prophylaxis.json';

export const api = axios.create({
    baseURL: ''
});


const TRYS = 2;

/* const getApiData = async (route: string) => {
    const res = await fetch(`http://localhost:5000/api/v1/medicalProducts`);
    const data = res.json();
    return data;
} */

interface IValue {
    active: boolean,
    display: string,
    lang: string,
    system: string,
    version: string
    valueSetId?: string,
}

interface IValueSet {
    [key: string]: IValue;
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

