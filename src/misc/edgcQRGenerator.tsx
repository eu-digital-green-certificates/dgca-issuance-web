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

import { createCertificateQRData, CertificateMetaData } from '../misc/edgcProcessor'
import axios from 'axios';
import { EUDGC } from '../generated-files/dgc-schema-object';
import qrcode from 'qrcode.react';

const api = axios.create({
    baseURL: ''
});


export interface CertResult {
    qrCode: string,
    dgci: string,
    tan: string
}

enum CertType {
    Vaccination = 'Vaccination',
    Recovery = 'Recovery',
    Test = 'Test'
}


interface CertificateInit {
    type: CertType,
}

interface SigResponse {
    signature : string,
    tan: string
}

function signerCall(id: string, hash : string) : Promise<SigResponse> {
    return api.put('/dgci/'+id,{hash:hash}).then(res => {
        const sigResponse : SigResponse = res.data;
        return sigResponse;
    });
}

export default function generateQRCode(edgcPayload: EUDGC) : Promise<CertResult> {
    // TODO set right cert type from EUDGC
    const certInit: CertificateInit = {
        type: CertType.Vaccination
    }
    var tan: string = '';
    return api.post('/dgci', certInit).then(response  => {
        const certMetaData: CertificateMetaData = response.data;
        // TODO copy dgci to EUDGC
        return createCertificateQRData(edgcPayload,certMetaData, (hash) => {
            return signerCall(response.data.id.toString(),hash).then(sigResponse => {
                tan = sigResponse.tan;
                return sigResponse.signature;
            });
        }).then((qrCode: string) => {
            return {
                qrCode: qrCode,
                dgci: certMetaData.dgci,
                tan: tan
            }
        });
    });
}