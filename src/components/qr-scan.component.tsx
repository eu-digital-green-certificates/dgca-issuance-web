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

import React from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap'
import QrReader from 'react-qr-reader'
import Patient from '../misc/patient'

import '../i18n';
import { useTranslation } from 'react-i18next';

import useNavigation from '../misc/navigation';
import { getPatientFromScan } from '../misc/qr-code-value';
import CwaSpinner from './spinner/spinner.component';

//const testFull = 'https://s.coronwarn.app?v=1#eyJmbiI6IkdvcmRvbiIsImxuIjoiR3J1bmQiLCJkb2IiOiIxOTkwLTAxLTAzIiwiZ3VpZCI6ImQ3ZWM2MDU4LWUyMzEtNGU4Yy1hNDFmLTViZjg1ZDdmZTI3MiIsInRpbWVzdGFtcCI6MTYxNzk3ODg4NDY4NX0=';

const QrScan = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    const [message, setMessage] = React.useState('');
    const [isInit, setIsInit] = React.useState(false)

    React.useEffect(() => {
        if (navigation)
            setIsInit(true);
    }, [navigation])

    const handleScan = (data: string | null) => {
        if (props.setPatient && data) {
            try {
                console.log(data);
                
                const scannedPatient = getPatientFromScan(data);
                props.setPatient(scannedPatient);
                navigation!.toRecordPatient();

            } catch (e) {
                setMessage(t('translation:qr-code-no-patient-data'));
            }
        }
    }

    const handleError = (error: any) => {
        if (window.location.protocol == 'http:') {
            setMessage(t('translation:qr-scan-https-only'));
        } else {
            setMessage("Scan Error: " + error);
        }
    }

    var messageHtml = undefined;
    if (message.length > 0) {
        messageHtml = <div className="alert alert-warning">
            {message}
        </div>;
    }

    return (!isInit? <CwaSpinner />:
        <>
            <Card id='data-card'>
                <Card.Header id='data-header' className='pb-0'>
                    <Row>
                        <Col md='6'>
                            <Card.Title className='m-0 jcc-xs-jcfs-md' as={'h2'} >{t('translation:qr-scan')}</Card.Title>
                        </Col>
                    </Row>
                    <hr />
                </Card.Header>

                {/*
    content area with process number input and radios
    */}
                <Card.Body id='data-body' className='pt-0'>
                    <QrReader
                        delay={300}
                        onScan={handleScan}
                        onError={handleError}
                    />
                    {messageHtml}
                </Card.Body>

                {/*
    footer with cancel and submit button
    */}
                <Card.Footer id='data-footer'>
                    <Row>
                        <Col sm='6' md='3'>
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

export default QrScan;