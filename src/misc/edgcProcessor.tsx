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

import cbor, { Map, Simple, Encoder } from 'cbor'
/*
need to fix following file for type script
node_modules/base45-js/index.d.ts

import {encode, decode} './lib/base45-js'

export function encode(buffer: ArrayBuffer): string;
export function decode(str: string): ArrayBuffer;
*/
import base45 from 'base45-js'
import sha256 from 'crypto-js/sha256';
import CryptoJS from 'crypto-js';

import zlib from 'browserify-zlib'


const expiredSeconds = 60*60*24*364;
const edgcPrefix = 'HC1:'

export interface CertificateMetaData {
    countryCode: string,
    kid: string,
    algId: number,
}

export interface SignService {
    // result signature, need promise because the signature is done by REST call on the server
    (hash: string) : Promise<string>;
}

function encodeCBOR(certData: any, certMetaData: CertificateMetaData) : Buffer {
    const cborMap = new cbor.Map();
    const issuedAtSec = Date.now() / 1000 | 0;
    // expiration
    cborMap.set((4 as number),issuedAtSec+expiredSeconds);
    // issued at
    cborMap.set((6 as number),issuedAtSec);
    // issuer country code
    cborMap.set((1 as number),certMetaData.countryCode);
    cborMap.set((-260 as number),certData);
    return cbor.encode(cborMap);
}

function computeCOSEHash(coseSigData: Buffer) : string {
    const wordArray = CryptoJS.lib.WordArray.create((coseSigData as unknown) as number[]);
    return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Base64);
}

function coseSign(cborData : Buffer, signService : SignService, kid64: string, algId: number) : Promise<Buffer> {
    // TODO see: https://github.com/erdtman/cose-js/blob/master/lib/sign.js
    var protectedData = new cbor.Map();
    // ALG - RSA_PSS_256(-37, 0, 0),
    // COSE.AlgorithmID
    protectedData.set(1,algId);
    // KID
    protectedData.set(4,Buffer.from(kid64,'base64'))
    var sigData = [
        'Signature',
        cbor.encode(protectedData),
        Buffer.alloc(0),
        cborData
    ]
    const hash = computeCOSEHash(cbor.encode(sigData));
    return signService(hash).then( sigBase64 => {
        const sig = Buffer.from(sigBase64,'base64');
        const unprotectedData = new cbor.Map();
        const signed = [cbor.encode(protectedData), unprotectedData, cborData, sig];
        return Promise.resolve(cbor.encode(new cbor.Tagged(18,signed)));
    })
}

function compress(cose: Buffer) : Buffer {
    return zlib.deflateSync(cose);
}

function base45encode(data: Buffer) : string {
    return base45.encode(data);

}

function dataPrefix(data: string) : string {
    return edgcPrefix+data;
}

export function createCertificateQRData(certData: any, certMetaData: CertificateMetaData, signService: SignService) : Promise<string> {
    var cbor = encodeCBOR(certData, certMetaData);
    return coseSign(cbor, signService, certMetaData.kid, certMetaData.algId).then( coseData => {
        console.log("cose raw: "+coseData.toString('base64'));
        var compressedCoseData = compress(coseData);
        var base45data = base45encode(compressedCoseData);
        var prefixedData = dataPrefix(base45data);
        return Promise.resolve(prefixedData);
    });
}