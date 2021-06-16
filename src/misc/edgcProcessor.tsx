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

import cbor from 'cbor'
import base45 from './wbase45'
import CryptoJS from 'crypto-js';

import zlib from 'browserify-zlib'
import { EUDCC1 } from '../generated-files/dgc-combined-schema';

const edgcPrefix = 'HC1:'

export interface CertificateMetaData {
    id: number,
    dgci: string,
    kid: string,
    algId: number,
    countryCode: string,
    expired: number,
    expiredDuration: number
}

export interface SignService {
    // result signature, need promise because the signature is done by REST call on the server
    (hash: string): Promise<string>;
}

const encodeCBOR = (certData: EUDCC1, certMetaData: CertificateMetaData): Buffer => {

    const cborMap = new cbor.Map();
    const issuedAtSec = Date.now() / 1000 | 0;
    const expiration = getExpiration(certData, certMetaData);

    // expiration
    cborMap.set((4 as number), expiration);
    // issued at
    cborMap.set((6 as number), issuedAtSec);
    // issuer country code
    cborMap.set((1 as number), certMetaData.countryCode);
    const v1 = new cbor.Map();
    v1.set((1 as number), certData)
    cborMap.set((-260 as number), v1);

    return cbor.encodeOne(cborMap, { omitUndefinedProperties: true });
}

const getExpiration = (certData: EUDCC1, certMetaData: CertificateMetaData) => {
    let result = certMetaData.expired;

    if (certData) {
        if (certData.r && certData.r[0] && certData.r[0].du) {
            result = new Date(certData.r[0].du).getTime() / 1000 | 0;
        }

        if (certData.v && certData.v[0] && certData.v[0].dt) {
            result = new Date(certData.v[0].dt).getTime() / 1000 + certMetaData.expiredDuration;
        }

        if (certData.t && certData.t[0] && certData.t[0].sc) {
            result = new Date(certData.t[0].sc).getTime() / 1000 + certMetaData.expiredDuration;
        }
    }

    return result;
}

const computeCOSEHash = (coseSigData: Buffer): string => {
    // console.log("data to sig: "+coseSigData.toString('base64'));
    const wordArray = CryptoJS.lib.WordArray.create((coseSigData as unknown) as number[]);

    return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Base64);
}


const coseSign = (cborData: Buffer, signService: SignService, kid64: string, algId: number): Promise<Buffer> => {
    // TODO see: https://github.com/erdtman/cose-js/blob/master/lib/sign.js
    let protectedData = new cbor.Map();
    // ALG - RSA_PSS_256(-37, 0, 0),
    // COSE.AlgorithmID
    protectedData.set(1, algId);
    // KID
    protectedData.set(4, Buffer.from(kid64, 'base64'));

    const protedctedDataBytes = cbor.encode(protectedData);
    // console.log("protectedData "+protedctedDataBytes.toString('hex'));
    let sigData = [
        'Signature1',
        protedctedDataBytes,
        Buffer.alloc(0),
        cborData
    ];

    const hash = computeCOSEHash(cbor.encode(sigData));
    // console.log("hash to sign " + hash);

    return signService(hash).then(sigBase64 => {
        // console.log("signature "+sigBase64);
        const sig = Buffer.from(sigBase64, 'base64');
        const unprotectedData = new cbor.Map();
        const signed = [protedctedDataBytes, unprotectedData, cborData, sig];

        return Promise.resolve(cbor.encode(new cbor.Tagged(18, signed)));
    })
}


const compress = (cose: Buffer): Buffer => {
    return zlib.deflateSync(cose);
}

const base45encode = (data: Buffer): string => {
    return base45.encode(data);
}


const dataPrefix = (data: string): string => {
    return edgcPrefix + data;
}


export const createCertificateQRData = (certData: EUDCC1, certMetaData: CertificateMetaData, signService: SignService): Promise<string> => {

    let cbor = encodeCBOR(certData, certMetaData);

    return coseSign(cbor, signService, certMetaData.kid, certMetaData.algId).then(coseData => {
        // console.log("cose raw: "+coseData.toString('base64'));
        let compressedCoseData = compress(coseData);
        let base45data = base45encode(compressedCoseData);
        let prefixedData = dataPrefix(base45data);

        return Promise.resolve(prefixedData);
    });
}