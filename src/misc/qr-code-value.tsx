/*
 * Corona-Warn-App / cwa-quick-test-frontend
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

import { timeStamp } from 'node:console';
import Patient from './patient';
import CryptoJS from 'crypto-js';

export interface IQRCodeValue {
    fn: string,
    ln: string,
    dob: string, //"1990-01-01",   - >day of birth
    testid: string,
    timestamp: number,
    salt: string, // 32 Bit random in HEX
    hash?: string // SHA256 Hash
}

const baseUrl = 'https://s.coronawarn.app?v=1#';

export const getQrCodeValueString = (guid: string, fn: string = '', ln: string = '', dob?: Date) => {

    let encodedJson = '';

    const value: IQRCodeValue = {
        fn: fn,
        ln: ln,
        dob: dob ? dob.toISOString().split('T')[0] : '',
        testid: guid,
        timestamp: Date.now() / 1000 | 0,
        salt:  CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex)
    }

    // const value: IQRCodeValue = { "fn": "Erika", "ln": "Mustermann", "dob": "1990-12-23", "timestamp": 1618386548, "testid": "52cddd8e-ff32-4478-af64-cb867cea1db5", "salt": "759F8FF3554F0E1BBF6EFF8DE298D9E9" }

    const shaEntry = `${value.dob}#${value.fn}#${value.ln}#${value.timestamp.toString()}#${value.testid}#${value.salt}`;
    value.hash = CryptoJS.SHA256(shaEntry).toString(CryptoJS.enc.Hex);

    // console.log("The hash: "+value.hash);


    const json = JSON.stringify(value);
    encodedJson = btoa(json);

    return (baseUrl + encodedJson);
}

export const getQrCodeValue = (valueString: string) => {

    if (valueString) {
        const encodedJson = valueString.split('#')[1];

        const json = atob(encodedJson);

        const value: IQRCodeValue = JSON.parse(json);

        return (value);
    }
}

export const getPatientFromScan = (data: string | null) => {
    let result: Patient | null = null;

    if (data) {
        try {
            const scanData = getQrCodeValue(data);


            if (scanData) {

                result = {
                    name: scanData.ln,
                    firstName: scanData.fn,
                    dateOfBirth: new Date(scanData.dob)
                }
            }
        } catch (e) {

            result = null;
        }
    }

    return result;
}

