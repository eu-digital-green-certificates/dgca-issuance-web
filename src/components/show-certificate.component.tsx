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
import Moment from 'react-moment';
import utils from '../misc/utils';

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
            setVaccinationSet(eudgc.v ? eudgc.v[0] : undefined);
            setTestSet(eudgc.t ? eudgc.t[0] : undefined);
            setRecoverySet(eudgc.r ? eudgc.r[0] : undefined);

            // TODO catch errors and handle them du to possible server connection problems
            genEDGCQR(eudgc)
                .then((certResult: CertResult) => {
                    //console.log("qrcode: " + certResult.qrCode);
                    setQrCodeValue(certResult.qrCode);
                    setTAN(certResult.tan);
                    setDGCI(certResult.dgci);
                })
                .catch(error => {
                    handleError(error);
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
        navigation!.toLanding();
    }

    const handleError = (error: any) => {
        let msg = '';

        if (error) {


            msg = error.message
        }
        props.setError({ error: error, message: msg, onCancel: navigation!.toLanding });
    }

    // returns display value for key 
    const getValueSetDisplay = (key: string | undefined, valueSet: IValueSet | undefined): string | undefined => {
        let result = key;

        if (valueSet && key && valueSet[key]) {
            result = valueSet[key].display;
        }

        return result;
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

    interface IDataEntry {
        title: string,
        entries: IEntry[]
    }

    interface IEntry {
        label: string,
        data: string
    }

    const defaultString = ''

    const personalData: IDataEntry[] = [
        {
            title: t('translation:personal-data'),
            entries: [
                {
                    label: t('translation:name'),
                    data: eudgc?.nam.gn || defaultString
                },
                {
                    label: t('translation:first-name'),
                    data: eudgc?.nam.fn || defaultString
                },
                {
                    label: t('translation:date-of-birth'),
                    data: eudgc?.dob || defaultString
                },
            ]
        }
    ]

    const vaccinationData: IDataEntry[] = [
        {
            title: t('translation:vaccine-data'),
            entries: [
                {
                    label: t('translation:disease-agent'),
                    data: getValueSetDisplay(vaccinationSet?.tg, diseaseAgentsData) || defaultString
                },
                {
                    label: t('translation:vaccine'),
                    data: getValueSetDisplay(vaccinationSet?.vp, vaccines) || defaultString
                },
                {
                    label: t('translation:vac-medical-product'),
                    data: getValueSetDisplay(vaccinationSet?.mp, vacMedsData) || defaultString
                },
                {
                    label: t('translation:vac-marketing-holder'),
                    data: getValueSetDisplay(vaccinationSet?.ma, vaccineManufacturers) || defaultString
                },
            ]
        },
        {
            title: t('translation:vaccination-data'),
            entries: [
                {
                    label: t('translation:sequence'),
                    data: String(vaccinationSet?.dn) || defaultString
                },
                {
                    label: t('translation:tot'),
                    data: String(vaccinationSet?.sd) || defaultString
                },
                {
                    label: t('translation:vac-last-date'),
                    data: vaccinationSet?.dt || defaultString
                },
            ]
        },
        {
            title: t('translation:certificate-data'),
            entries: [
                {
                    label: t('translation:vac-country'),
                    data: vaccinationSet?.co || defaultString
                },
                {
                    label: t('translation:adm'),
                    data: vaccinationSet?.is || defaultString
                },
            ]
        }
    ]

    const getDataOutputElement = (dataSet: IDataEntry) => {
        return (
            <div className='pt-3'>
                <Card.Text className='input-label jcc-xs-jcfs-sm mb-0 font-weight-bold' >{dataSet.title}</Card.Text>
                {dataSet.entries.map((entry) => (
                    <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${entry.label}: ${entry.data}`}</Card.Text>
                ))}
            </div>
        )
    }

    return (
        !(isInit && eudgc && qrCodeValue) ? <Spinner /> :
            <>
                <Card id='data-card'>

                    {/*
    content area with patient inputs and check box
    */}
                    <Card.Body id='data-header'>
                        <Row>
                            <Col sm='6'>
                                <Card.Title className='m-sm-0 jcc-xs-jcfs-sm' as={'h2'}>{t('translation:your-certificate')}</Card.Title>
                                <hr />
                                {personalData.map(dataset => getDataOutputElement(dataset))}
                                {vaccinationSet && vaccinationData.map(dataset => getDataOutputElement(dataset))}
                                {!testSet ? <></>
                                    : <>
                                        <div className="pt-3">
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0 font-weight-bold' >{t('translation:test-data')}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:disease-agent')}: ${getValueSetDisplay(testSet.tg, diseaseAgentsData)}`}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:testType')}: ${testSet.tt}`}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:testName')}: ${testSet.nm}`}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:testManufacturers')}: ${getValueSetDisplay(testSet.ma, testManufacturersValueSet)}`}</Card.Text>
                                        </div>

                                        <div className="pt-3">
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0 font-weight-bold' >{t('translation:test-data')}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{t('translation:sampleDateTime') + ': '} </Card.Text>
                                            <Moment className='input-label mb-3 jcc-xs-jcfs-sm' format={utils.momentDateTimeFormat}>{testSet.sc}</Moment>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{t('translation:testDateTime') + ': '} </Card.Text>
                                            <Moment className='input-label mb-3 jcc-xs-jcfs-sm' format={utils.momentDateTimeFormat}>{testSet.dr}</Moment>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:testResult')}: ${getValueSetDisplay(testSet.tr, testResultValueSet)}`}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:testCenter')}: ${testSet.tc}`}</Card.Text>
                                        </div>

                                        <div className="vaccination-data pt-3">
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0 font-weight-bold' >{t('translation:certificate-data')}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:vac-country')}: ${testSet.co}`}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:adm')}: ${testSet.is}`}</Card.Text>
                                        </div>
                                    </>}
                                {!recoverySet ? <></>
                                    : <>
                                        <div className="pt-3">
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0 font-weight-bold' >{t('translation:recovery-data')}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:disease-agent')}: ${getValueSetDisplay(recoverySet.tg, diseaseAgentsData)}`}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:first-positive-test-date')}: ${recoverySet.fr}`}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:recovery-country')}: ${recoverySet.co}`}</Card.Text>

                                        </div>

                                        <div className="pt-3">
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0 font-weight-bold' >{t('translation:certificate-data')}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:adm')}: ${recoverySet.is}`}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:valid-from')}: ${recoverySet.df}`}</Card.Text>
                                            <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{`${t('translation:valid-to')}: ${recoverySet.du}`}</Card.Text>
                                        </div>
                                    </>}
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

                    {/*
    footer with correction and finish button
    */}
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