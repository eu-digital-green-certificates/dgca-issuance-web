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
import axios from 'axios'

interface CertInit {
    id: number,
    dgci: string,
    kid: string
}

const Cbor = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    const [isInit, setIsInit] = React.useState(false);
    const [test, setTest] = React.useState<any>();
    const [qrCode, setQrCode] = React.useState("");

    const data: any = {
        sub: {
            gn: "Gabriele",
            fn: "Musterfrau",
            id: [
                {
                    t: "PPN",
                    i: "12345ABC-321"
                }
            ],
            dob: "1998-02-26",
            gen: "female"
        },
        vac: [
            {
                dis: "840539006",
                vap: "1119305005",
                mep: "EU\/1\/20\/1528",
                aut: "ORG-100030215",
                seq: 1,
                tot: 2,
                dat: "2021-02-18",
                cou: "AT",
                lot: "C22-862FF-001",
                adm: "Vaccination centre Vienna 23"
            },
            {
                dis: "840539006",
                vap: "1119305005",
                mep: "EU\/1\/20\/1528",
                aut: "ORG-100030215",
                seq: 2,
                tot: 2,
                dat: "2021-03-12",
                cou: "AT",
                lot: "C22-H62FF-010",
                adm: "Vaccination centre Vienna 23"
            }
        ],
        cert: {
            is: "Ministry of Health, Austria",
            id: "01AT42196560275230427402470256520250042",
            vf: "2021-04-04",
            vu: "2021-10-04",
            co: "AT",
            vr: "v1.0"
        }
    }

    const api = axios.create({
        baseURL: ''
    });

    React.useEffect(() => {
        if (navigation) {

            const cbor = require('cbor');

            console.log("start cbor");
            
            const vac = { "sub": { "gn": "Gabriele", "fn": "Musterfrau", "id": [ { "t": "PP", "i": "12345ABC-321", "c": "AT" } ], "dob": "1998-02-26" }, "vac": [ { "dis": "840539006", "vap": "1119305005", "mep": "EU\/1\/20\/1528", "aut": "ORG-100030215", "seq": 1, "tot": 2, "dat": "2021-02-18", "cou": "AT", "lot": "C22-862FF-001", "adm": "Vaccination centre Vienna 23" }, { "dis": "840539006", "vap": "1119305005", "mep": "EU\/1\/20\/1528", "aut": "ORG-100030215", "seq": 2, "tot": 2, "dat": "2021-03-12", "cou": "AT", "lot": "C22-H62FF-010", "adm": "Vaccination centre Vienna 23" } ], "v": "v1.0.0", "dgcid": "01AT42196560275230427402470256520250042" }

            api.post('/dgci', {lot: 'dummy'}).then(response  => {
                createCertificateQRData(vac,{countryCode: 'DE', kid: 'eeeeee', algId: -37}, (hash) => {
                    return api.put('/dgci/'+response.data.id.toString(),{hash:hash}).then(res => res.data.signature);
                }).then( c => setQrCode(c));
            });
                        
            console.log("finished");
            

            //setTest(cbor.decode('a4041a6262bc45061a608188c501624154390103a101a6637473748063737562a462696481a361696c31323334354142432d3332316163624154617462505062666e6a4d75737465726672617562676e684761627269656c6563646f626a313939382d30322d32366376616382aa6361646d781c56616363696e6174696f6e2063656e747265205669656e6e61203233637661706a31313139333035303035636175746d4f52472d313030303330323135636d65706c45552f312f32302f313532386373657101636469736938343035333930303663636f75624154636c6f746d4332322d38363246462d303031636461746a323032312d30322d313863746f7402aa6361646d781c56616363696e6174696f6e2063656e747265205669656e6e61203233637661706a31313139333035303035636175746d4f52472d313030303330323135636d65706c45552f312f32302f313532386373657102636469736938343035333930303663636f75624154636c6f746d4332322d48363246462d303130636461746a323032312d30332d313263746f740261766676312e302e3063726563806564676369647827303141543432313936353630323735323330343237343032343730323536353230323530303432'));


            setIsInit(true);
        }
    }, [navigation])

    React.useEffect(() => {
        if (test) {
            /*
            console.log(test);
            console.log(JSON.stringify(test));

            const payload = new Map();
            payload.set(1, data);

            const gen = new Encoder();

            const map = new Map();
            map.set(new Simple(4).encodeCBOR(gen), 1650637893);
            map.set(6, 1619101893);
            map.set(1, 'AT');
            map.set(-260, payload);

            console.log(map);

            console.log(cbor.encode(map).toString('base64'));
            */
        }


    }, [test])


    return (
        !isInit ? <Spinner /> :
            <>
                <Card id='data-card'>
                    <Card.Header id='data-header' className='pb-0'>
                        <Row>
                            <Col md='6'>
                                <Card.Title className='m-0 jcc-xs-jcfs-md' as={'h2'} >{t('translation:failed-report')}</Card.Title>
                            </Col>
                        </Row>
                        <hr />
                    </Card.Header>

                    {/*
    content area
    */}
                    <Card.Body id='data-header'>
                        <Row>
                        QRCode
                            <pre>
                                 {qrCode}</pre>
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
                                    onClick={navigation!.toLanding}
                                >
                                    {t('translation:cancel')}
                                </Button>
                            </Col>
                        </Row>
                    </Card.Footer>
                </Card>
            </>

    )
}

export default Cbor;