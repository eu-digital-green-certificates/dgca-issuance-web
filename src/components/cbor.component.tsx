/*
 * eu-digital-green-certificates/ dgca-issuance-web
 *
 * (C) 2021, T-Systems International GmbH
 *
 * Deutsche Telekom AG and all other contributors /
 * copyright owners license this file to you under the Apache
 * License, Version 2.0 (the License); you may not use this
 * file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * AS IS BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap'

import '../i18n';
import { useTranslation } from 'react-i18next';

import useNavigation from '../misc/navigation';
import Spinner from './spinner/spinner.component';
import { createCertificateQRData } from '../misc/edgcProcessor'
import axios from 'axios';
import QRCode from 'qrcode.react';

interface CertInit {
    id: number,
    dgci: string,
    kid: string
}

const Cbor = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    const vac = { "sub": { "gn": "Gabriele", "fn": "Musterfrau", "id": [ { "t": "PP", "i": "12345ABC-321", "c": "AT" } ], "dob": "1998-02-26" }, "vac": [ { "dis": "840539006", "vap": "1119305005", "mep": "EU\/1\/20\/1528", "aut": "ORG-100030215", "seq": 1, "tot": 2, "dat": "2021-02-18", "cou": "AT", "lot": "C22-862FF-001", "adm": "Vaccination centre Vienna 23" }, { "dis": "840539006", "vap": "1119305005", "mep": "EU\/1\/20\/1528", "aut": "ORG-100030215", "seq": 2, "tot": 2, "dat": "2021-03-12", "cou": "AT", "lot": "C22-H62FF-010", "adm": "Vaccination centre Vienna 23" } ], "v": "v1.0.0", "dgcid": "01AT42196560275230427402470256520250042" }

    const [isInit, setIsInit] = React.useState(true);
    const [certData, setCertData] = React.useState<any>(vac);
    const [qrCode, setQrCode] = React.useState("");
  
    const api = axios.create({
        baseURL: ''
    });

    function generateQR() {
        api.post('/dgci', {lot: 'dummy'}).then(response  => {
            createCertificateQRData(certData,{countryCode: response.data.countryCode, kid: response.data.kid, algId: response.data.algId}, (hash) => {
                return api.put('/dgci/'+response.data.id.toString(),{hash:hash}).then(res => res.data.signature);
            }).then( c => setQrCode(c));
        });
    }

    function updateData(event : any) {
        setCertData(JSON.parse(event.target.value));
    }

    function resetQRCode() {
        setQrCode('');
    }

    return (
        !isInit ? <Spinner /> :
            <>
                <Card id='data-card'>
                    <Card.Header id='data-header' className='pb-0'>
                        <Row>
                            <Col md='6'>
                                <Card.Title className='m-0 jcc-xs-jcfs-md' as={'h2'} >EDGC Generator</Card.Title>
                            </Col>
                        </Row>
                        <hr />
                    </Card.Header>

                    {/*
    content area
    */}
                    <Card.Body id='data-header'>
                        <Row>
                            <textarea rows={40} cols={250} onChange={updateData}>
                                {JSON.stringify(certData,null,4)}
                            </textarea>
                        </Row>
                        <Row>
                        QRCode
                            <pre>
                                 {qrCode}</pre>
                        </Row>
                        <Row>
                            {qrCode ? <><QRCode id='qr-code' size={256} renderAs='svg' value={qrCode} />
                                        {/* <Card.Text className='input-label' >{qrCodeValue}</Card.Text> */}
                                    </> : <></>}
                        </Row>
                    </Card.Body>

                    {/*
    footer
    */}
                    <Card.Footer id='data-footer'>
                        <Row>
                            <Col sm='6' md='3' className='pr-md-0'>
                                <Button
                                    className='my-1 my-md-0 p-0'
                                    block
                                    onClick={generateQR}
                                >
                                    Generate QR
                                </Button>
                            </Col>
                            <Col sm='6' md='3' className='pr-md-0'>
                                <Button
                                    className='my-1 my-md-0 p-0'
                                    block
                                    onClick={resetQRCode}
                                >
                                    Reset
                                </Button>
                            </Col>
                        </Row>
                    </Card.Footer>
                </Card>
            </>

    )
}

export default Cbor;