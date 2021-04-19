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

import {Sex, IdentifierType} from './enum';

export default interface Vaccine {
    // TODO: Braucht man das
    privacyAgreement?: boolean;
    processingConsens?: boolean;

    // "The given name(s) of the person addressed in the certificate" e.g. "T\u00f6lvan"
    firstName: string;

    //The family name(s) of the person addressed in the certificate e.g. "T\u00f6lvansson"
    name: string;

    // The given name(s) of the person addressed in the certificate transliterated 
    // into the OCR-B Characters from ISO 1073-2 according to the ICAO Doc 9303 part 3. e.g. "Toelvan"
    firstNameTrans?: string;

    // The family name(s) of the person addressed in the certificate transliterated
    //  into the OCR-B Characters from ISO 1073-2 according to the ICAO Doc 9303 part 3. "Toelvansson"
    nameTrans?: string;

    identifierType: IdentifierType;
    country?: string;
    //TODO: event. Regex
    identifierNumber: string;

    dateOfBirth: Date;
    sex?:Sex;
    //TODO: Die oberen Attribute sind für alle drei Fälle Impfstoff, Testergebnis und Recovery statement gleich
    // besser extra klasse und vererben
    
    // Disease or agent targeted (viz. VS-2021-04-14), e.g. "840539006"
    disease: string;

    //Generic description of the vaccine/prophylaxis or its component(s), (viz. VS-2021-04-14), e.g. "1119305005"
    vaccine:string;

    // Code of the medicinal product (viz. VS-2021-04-14), e.g. "EU/1/20/1528"
    medicalProduct: string;

    // Code as defined in EMA SPOR - Organisations Management System (viz. VS-2021-04-14), e.g. "ORG-100030215"
    marketingHolder: string;

    // Dose sequence number
    // Number of dose administered in a cycle  (viz. VS-2021-04-14), e.g. "1"
    sequence: number;

    // Number of expected doses for a complete cycle (specific for a person at the time of administration) (viz. VS-2021-04-14), e.g. "1"
    tot: number;

    // The date of the vaccination event, e.g. "2021-02-20"
    vacLastDate: Date; 

    //TODO: Event. Enum mit den ganzen Staaten
    //Country (member state) of vaccination (ISO 3166-1 alpha-2 Country Code) (viz. VS-2021-04-14), e.g. "SE"
    vacCountry: string;

    // A distinctive combination of numbers and/or letters which specifically identifies a batch, optional
    lot?: string;

    // Name/code of administering centre or a health authority responsible for the vaccination event, optional, e.g. "Region Halland"
    adm?: string;
}