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

import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap'

import '../i18n';
import { useTranslation } from 'react-i18next';

import useNavigation from '../misc/navigation';

import QRCode from 'qrcode.react';

import Spinner from './spinner/spinner.component';
import { EUDGC } from '../generated-files/dgc-combined-schema';
import genEDGCQR, {CertResult} from '../misc/edgcQRGenerator';

// import { usePostPatient } from '../api';

const ShowCertificate = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    const [isInit, setIsInit] = React.useState(false)
    const [eudgc, setEudgc] = React.useState<EUDGC>();
    const [qrCodeValue, setQrCodeValue] = React.useState('');
    const [dgci, setDGCI] = React.useState('');
    const [tan, setTAN] = React.useState('');


    // set patient data on mount and set hash from uuid
    React.useEffect(() => {
        if (isInit) {
            if (props.eudgc) {
                setEudgc(props.eudgc)
            }
            else
                props.setError({ error: '', message: t('translation:error-patient-data-load'), onCancel: navigation!.toLanding });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInit])

    React.useEffect(() => {
        if (eudgc) {
            // TODO catch errors and handle them du to possible server connection problems
            genEDGCQR(eudgc).then((certResult: CertResult) => {
                setQrCodeValue(certResult.qrCode);
                setTAN(certResult.tan);
                setDGCI(certResult.dgci);
            });
        }
    }, [eudgc])


    // set ready state for spinner
    React.useEffect(() => {
        if (navigation) {
            setTimeout(setIsInit, 200, true);
        }
    }, [navigation]);

    const finishProcess = () => {
        props.setEudgc(undefined);
        props.setNotificationShow(true);
        navigation!.toLanding();
    }

    const handleError = (error: any) => {
        let msg = '';

        if (error) {


            msg = error.message
        }
        props.setError({ error: error, message: msg, onCancel: navigation!.toLanding });
    }

    // const postPatient = usePostPatient(patientToPost, processId, finishProcess, handleError);

    return (
        !isInit ? <Spinner /> :
            <>
                {/* <Row id='process-row'>
                    <span className='font-weight-bold mr-2'>{t('translation:process')}</span>
                    <span>{processId}</span>
                </Row> */}
                <Card id='data-card'>

                    {/*
    content area with patient inputs and check box
    */}
                    <Card.Body id='data-header'>
                        <Row>
                            <Col sm='5'>
                                <Card.Title className='m-sm-0 jcc-xs-jcfs-sm' as={'h2'}>{t('translation:qr-code')}</Card.Title>
                                <hr />
                                <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >DGCI: {dgci}</Card.Text>
                                <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >TAN: {tan}</Card.Text>
                                {/* <Card.Text className='input-label font-weight-bold mt-4 jcc-xs-jcfs-sm' >{t('translation:process')}</Card.Text>
                                <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{processId}</Card.Text> */}
                                {/* <Card.Text className='input-label font-weight-bold mt-4 jcc-xs-jcfs-sm' >{t('translation:patient-data')}</Card.Text>
                                <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{patient?.firstName + ' ' + patient?.name}</Card.Text>
                                <Moment className='input-label mb-3 jcc-xs-jcfs-sm' locale='de' format='DD. MM. yyyy' >{patient?.dateOfBirth as Date}</Moment>
                                <Card.Text className='input-label jcc-xs-jcfs-sm' >{patient?.sex === Sex.MALE ? t('translation:male') : patient?.sex === Sex.FEMALE ? t('translation:female') : t('translation:diverse')}</Card.Text>
                                <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{patient?.street + ' ' + patient?.houseNumber}</Card.Text>
                                <Card.Text className='input-label jcc-xs-jcfs-sm' >{patient?.zip + ' ' + patient?.city}</Card.Text>
                                <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{patient?.phoneNumber}</Card.Text>
                                <Card.Text className='input-label jcc-xs-jcfs-sm' >{patient?.emailAddress}</Card.Text>
                                <Card.Text className='input-label jcc-xs-jcfs-sm' >{patient?.testId}</Card.Text> */}
                            </Col>
                            <Col sm='7' className='px-4'>
                                <Container id='qr-code-container'>
                                    {qrCodeValue ? <><QRCode id='qr-code' size={256} renderAs='svg' value={qrCodeValue} />
                                        {/* <Card.Text className='input-label' >{qrCodeValue}</Card.Text> */}
                                    </> : <></>}
                                    <pre>{qrCodeValue}</pre>
                                </Container>
                            </Col>
                        </Row>
                    </Card.Body>

                    {/*
    footer with correction and finish button
    */}
                    <Card.Footer id='data-footer'>
                        <Row>
                            <Col sm='6' md='4'>
                                <Button
                                    className='my-1 my-md-0 p-0'
                                    block
                                    onClick={navigation!.toRecordVac}
                                >
                                    {t('translation:patient-data-correction')}
                                </Button>
                            </Col>
                            <Col sm='6' md='3' className='pr-md-0'>
                                <Button
                                    className='my-1 my-md-0 p-0'
                                    block
                                    onClick={finishProcess}
                                >
                                    {t('translation:process-finish')}
                                </Button>
                            </Col>
                        </Row>
                    </Card.Footer>
                </Card>
            </>

    )
}

export default ShowCertificate;