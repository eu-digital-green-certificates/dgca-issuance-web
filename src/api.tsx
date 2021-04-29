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


// Medical Products
interface medicalProduct {
    active: boolean,
    display: string,
    lang: string,
    system: string,
    version: string
}

interface medicalProductsData {
    [key: string]: medicalProduct;
}

export const useGetVaccinMedicalData = () => {
    const [medicalProducts, setMedicalProducts] = React.useState<medicalProductsData>();
    React.useEffect(() => {

        // get object via api
        // const medicalProductsData = getApiData('/medicalProducts');

        // get object via public
        const medicalProductsData = MedicalProducts.valueSetValues;
        setMedicalProducts(medicalProductsData);
        console.log({ medicalProductsData }); // !TODO: remove debugging statement
    }, [])

    return medicalProducts;
}


// Disease Agents
interface diseaseAgent {
    active: boolean,
    display: string,
    lang: string,
    system: string,
    version: string
}

interface diseaseAgents {
    [key: string]: diseaseAgent;
}

export const useGetDiseaseAgents = () => {
    const [diseaseAgents, setDiseaseAgents] = React.useState<diseaseAgents>();
    React.useEffect(() => {

        // get object via api
        // const diseaseAgentsData = getApiData('/diseaseAgents');

        // get object via public
        const diseaseAgentsData = DiseaseAgents.valueSetValues;
        setDiseaseAgents(diseaseAgentsData);
        console.log({ diseaseAgentsData }); // !TODO: remove debugging statement
    }, [])
    return diseaseAgents;
}

// Vaccine Manufacturers
interface vaccineManufacturer {
    active: boolean,
    display: string,
    lang: string,
    system: string,
    version: string,
    valueSetId: string,
}

interface vaccineManufacturers {
    [key: string]: vaccineManufacturer;
}

export const useGetVaccineManufacturers = () => {
    const [vaccineManufacturers, setVaccineManufacturers] = React.useState<diseaseAgents>();
    React.useEffect(() => {

        // get object via api
        // const vaccineManufacturersData = getApiData('/vaccineManufacturers');

        // get object via public
        const vaccineManufacturersData = VaccineManufacturers.valueSetValues;
        setVaccineManufacturers(vaccineManufacturersData);
        console.log({ vaccineManufacturersData }); // !TODO: remove debugging statement
    }, [])
    return vaccineManufacturers;
}

// Vaccine / Prophylaxis
interface vaccine {
    active: boolean,
    display: string,
    lang: string,
    system: string,
    version: string,
}

interface vaccines {
    [key: string]: vaccine;
}

export const useGetVaccines = () => {
    const [vaccines, setVaccines] = React.useState<diseaseAgents>();
    React.useEffect(() => {

        // get object via api
        // const vaccinesData = getApiData('/vaccines');


        // get object via public
        const vaccinesData = Vaccines.valueSetValues;
        setVaccines(vaccinesData);
        console.log({ vaccinesData }); // !TODO: remove debugging statement
    }, [])
    return vaccines;
}

export const useStatistics = (onSuccess?: (status: number) => void, onError?: (error: any) => void) => {
    const { keycloak, initialized } = useKeycloak();
    const [statisticData, setStatisticData] = React.useState<StatisticData>();

    const header = {
        "Authorization": initialized ? `Bearer ${keycloak.token}` : "",
        'Content-Type': 'application/json'
    };

    React.useEffect(() => {
        /* setStatisticData({totalTestCount: 20, positiveTestCount: 5}); */
        if (!statisticData) {
            api.get('/api/quickteststatistics', { headers: header })
                .then(response => {
                    setStatisticData(response.data);
                    if (onSuccess) {
                        onSuccess(response?.status);
                    }
                })
                .catch(error => {
                    if (onError) {
                        onError(error);
                    }
                });
        }
    }, []);

    return statisticData;
}