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
import { EUDGC, RecoveryEntry, TestEntry, VaccinationEntry } from '../generated-files/dgc-combined-schema';
import genEDGCQR, { CertResult } from '../misc/edgcQRGenerator';
import { useGetDiseaseAgents, useGetVaccineManufacturers, useGetVaccines, useGetVaccinMedicalData, useGetTestManufacturers, useGetTestResult, IValueSet } from '../api';

import ShowCertificateData from '../misc/ShowCertificateData';

// import { usePostPatient } from '../api';

const ShowCertificate = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    const vacMedsData = useGetVaccinMedicalData();
    const diseaseAgentsData = useGetDiseaseAgents();
    const vaccineManufacturers = useGetVaccineManufacturers();
    const vaccines = useGetVaccines();
    const testManufacturersValueSet = useGetTestManufacturers();
    const testResultValueSet = useGetTestResult();

    const [isInit, setIsInit] = React.useState(false)
    const [eudgc, setEudgc] = React.useState<EUDGC>();
    const [vaccinationSet, setVaccinationSet] = React.useState<VaccinationEntry>();
    const [testSet, setTestSet] = React.useState<TestEntry>();
    const [recoverySet, setRecoverySet] = React.useState<RecoveryEntry>();
    const [qrCodeValue, setQrCodeValue] = React.useState('');

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
            setVaccinationSet(eudgc.v ? eudgc.v[0] : undefined);
            setTestSet(eudgc.t ? eudgc.t[0] : undefined);
            setRecoverySet(eudgc.r ? eudgc.r[0] : undefined);

            // TODO catch errors and handle them du to possible server connection problems
            genEDGCQR(eudgc)
                .then((certResult: CertResult) => {
                    //console.log("qrcode: " + certResult.qrCode);
                    setQrCodeValue(certResult.qrCode);
                    setTAN(certResult.tan);
                })
                .catch(error => {
                    handleError(error);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eudgc])


    // set ready state for spinner
    React.useEffect(() => {
        if (navigation) {
            setTimeout(setIsInit, 200, true);
        }
    }, [navigation]);

    const finishProcess = () => {
        props.setEudgc(undefined);
        navigation!.toLanding();
    }

    const handleError = (error: any) => {
        let msg = '';

        if (error) {
            msg = error.message
        }
        props.setError({ error: error, message: msg, onCancel: navigation!.toLanding });
    }

    const handleBack = () => {
        if (eudgc) {
            if (eudgc.v) {
                navigation!.toRecordVac();
            }
            if (eudgc.t) {
                navigation!.toRecordTest();
            }
            if (eudgc.r) {
                navigation!.toRecordRecovery();
            }
        }
        else {
            navigation!.toLanding();
        }
    }

    const getDataOutputElement = (dataSet: IDataEntry) => {
        return (
            <div className='pt-3'>
                <Card.Text className='input-label jcc-xs-jcfs-sm mb-0 font-weight-bold' >{dataSet.title}</Card.Text>
                {dataSet.entries.map((entry) => {
                    return entry.data ?
                        <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${entry.label}: ${entry.data}`}</Card.Text>
                        : <> </>
                })}
            </div>
        )
    }

    interface IDataEntry {
        title: string,
        entries: IEntry[]
    }

    interface IEntry {
        label: string,
        data: string
    }

    const certificateTest = new ShowCertificateData({ vacMedsData, diseaseAgentsData, vaccineManufacturers, vaccines, testManufacturersValueSet, testResultValueSet });
    const personalData: IDataEntry[] = certificateTest.getPersonalData(eudgc);
    const vaccinationData: IDataEntry[] = certificateTest.getVaccineData(vaccinationSet);
    const testData: IDataEntry[] = certificateTest.getTestData(testSet);
    const recoveryData: IDataEntry[] = certificateTest.getRecoveryData(recoverySet);



    return (
        !(isInit && eudgc && qrCodeValue) ? <Spinner /> :
            <>
                <Card id='data-card'>

                    {/*    content area with patient inputs and check box    */}
                    <Card.Body id='data-header'>
                        <Row>
                            <Col sm='6'>
                                <Card.Title className='m-sm-0 jcc-xs-jcfs-sm' as={'h2'}>{t('translation:your-certificate')}</Card.Title>
                                <hr />
                                {personalData && personalData.map(dataset => getDataOutputElement(dataset))}
                                {vaccinationSet && vaccinationData.map(dataset => getDataOutputElement(dataset))}
                                {testSet && testData.map(dataset => getDataOutputElement(dataset))}
                                {recoverySet && recoveryData.map(dataset => getDataOutputElement(dataset))}
                            </Col>
                            <Col sm='6' className='px-4'>
                                <Container id='qr-code-container'>
                                    {qrCodeValue ? <><QRCode id='qr-code' size={256} renderAs='svg' value={qrCodeValue} />
                                        {/* <Card.Text className='input-label' >{qrCodeValue}</Card.Text> */}
                                    </> : <></>}
                                </Container>
                                <Card.Text className='input-label jcc-xs-sm m-2 font-weight-bold text-center' >TAN: {tan}</Card.Text>
                            </Col>
                        </Row>
                    </Card.Body>

                    {/*    footer with correction and finish button    */}
                    <Card.Footer id='data-footer'>
                        <Row>
                            <Col sm='6' md='4'>
                                <Button
                                    className='my-1 my-md-0 p-0'
                                    block
                                    onClick={handleBack}
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