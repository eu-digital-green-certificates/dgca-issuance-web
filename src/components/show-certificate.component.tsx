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
import { Button, Card, Col, Container, Fade, Row } from 'react-bootstrap'

import '../i18n';
import { useTranslation } from 'react-i18next';

import QRCode from 'qrcode.react';

import Spinner from './spinner/spinner.component';
import { EUDCC1 } from '../generated-files/dgc-combined-schema';
import genEDGCQR, { CertResult } from '../misc/edgcQRGenerator';

import ShowCertificateData from './modules/show-certificate-data.component';
import usePdfGenerator from '../misc/usePdfGenerator';
import AppContext from '../misc/appContext';
import { IValueSetList } from '../misc/useValueSet';

// import { usePostPatient } from '../api';

const ShowCertificate = (props: any) => {

    const context = React.useContext(AppContext);
    const { t } = useTranslation();

    const [isInit, setIsInit] = React.useState(false)
    const [pdfIsInit, setPdfIsInit] = React.useState(false)
    const [pdfIsReady, setPdfIsReady] = React.useState(false)
    const [eudgc, setEudgc] = React.useState<EUDCC1>();
    const [qrCodeValue, setQrCodeValue] = React.useState('');

    const [tan, setTAN] = React.useState('');

    const [qrCodeForPDF, setQrCodeForPDF] = React.useState<any>();
    const [eudgcForPDF, setEudgcForPDF] = React.useState<EUDCC1>();
    const [valueSetsForPDF, setValueSetsForPDF] = React.useState<IValueSetList>();
    const [issuerCountryCodeForPDF, setIssuerCountryCodeForPDF] = React.useState('');

    const pdf = usePdfGenerator(qrCodeForPDF, eudgcForPDF, valueSetsForPDF, issuerCountryCodeForPDF, (isInit) => setPdfIsInit(isInit), (isReady) => setPdfIsReady(isReady));

    // set patient data on mount and set hash from uuid
    React.useEffect(() => {
        if (isInit) {
            if (props.eudgc) {
                setEudgc(props.eudgc)
            }
            else
                props.setError({ error: '', message: t('translation:error-patient-data-load'), onCancel: context.navigation!.toLanding });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInit])

    React.useEffect(() => {
        if (eudgc) {

            // TODO catch errors and handle them du to possible server connection problems
            genEDGCQR(eudgc)
                .then((certResult: CertResult) => {
                    //console.log("qrcode: " + certResult.qrCode);
                    setQrCodeValue(certResult.qrCode);
                    setTAN(certResult.tan);
                    setIssuerCountryCodeForPDF(certResult.issuerCountryCode);
                })
                .catch(error => {
                    handleError(error);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eudgc])

    React.useEffect(() => {
        if (pdf) {
            handleShowPdf();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdfIsReady]);

    React.useEffect(() => {
        if (context.navigation && context.valueSets)
            setIsInit(true);
        setValueSetsForPDF(context.valueSets);
    }, [context.navigation, context.valueSets])

    const finishProcess = () => {
        props.setEudgc(undefined);
        context.navigation!.toLanding();
    }

    const handleError = (error: any) => {
        let msg = '';

        if (error) {
            msg = error.message
        }
        props.setError({ error: error, message: msg, onCancel: context.navigation!.toLanding });
    }

    const handleBack = () => {
        if (eudgc) {
            if (eudgc.v) {
                context.navigation!.toRecordVac();
            }
            if (eudgc.t) {
                context.navigation!.toRecordTest();
            }
            if (eudgc.r) {
                context.navigation!.toRecordRecovery();
            }
        }
        else {
            context.navigation!.toLanding();
        }
    }

    const handleGeneratePdf = () => {
        setQrCodeForPDF(document.getElementById('qr-code-pdf'));
        setEudgcForPDF(eudgc);
    }

    const handleShowPdf = () => {
        if (pdf) {
            const blobPDF = new Blob([pdf.output('blob')], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blobPDF);
            window.open(blobUrl);
        }
    }

    return (
        !(isInit && context.valueSets && eudgc && qrCodeValue) ? <Spinner /> :
            <>
                <Fade appear={true} in={true} >
                    <Card id='data-card'>
                        {/*    content area with patient inputs and check box    */}
                        <Card.Header id='data-header' className='p-3'>
                            <Row>
                                <Col md='6' className='pl-0'>
                                    <Card.Title className='m-md-0 tac-xs-tal-md jcc-xs-jcfs-md' as={'h3'} >{t('translation:your-certificate')}</Card.Title>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body id='data-body'>
                            <Row>
                                <Col sm='6' className='p-3'>

                                    <ShowCertificateData eudgc={eudgc} valueSetList={context.valueSets} />

                                </Col>
                                <Col sm='6' className='p-3'>
                                    <Container id='qr-code-container'>
                                        {qrCodeValue ? <><QRCode id='qr-code' size={256} renderAs='svg' value={qrCodeValue} />
                                            {/* <Card.Text className='input-label' >{qrCodeValue}</Card.Text> */}
                                        </> : <></>}
                                    </Container>
                                    <Container id='qr-code-container' className='hidden'>
                                        {qrCodeValue ? <> <QRCode id='qr-code-pdf' size={256} renderAs='canvas' value={qrCodeValue} />
                                        </> : <></>}
                                    </Container>
                                    <Card.Text className='input-label jcc-xs-sm m-3 text-center' >TAN: {tan}</Card.Text>
                                </Col>
                            </Row>
                        </Card.Body>

                        {/*    footer with correction and finish button    */}
                        <Card.Footer id='data-footer'>
                            <Row>
                                <Col xs='12' md='4' className='pl-md-0 pr-md-2 pb-3 pb-md-0'>
                                    <Button
                                        className=''
                                        variant='outline-primary'
                                        block
                                        onClick={handleBack}
                                    >
                                        {t('translation:patient-data-correction')}
                                    </Button>
                                </Col>
                                <Col xs='6' md='4' className='px-md-2 pr-2'>
                                    <Button
                                        className=''
                                        block
                                        onClick={handleGeneratePdf}
                                        disabled={!pdfIsInit}
                                        hidden={pdfIsReady}
                                    >
                                        {t('translation:generate-pdf')}
                                    </Button>
                                    <Button
                                        className='m-0'
                                        block
                                        onClick={handleShowPdf}
                                        hidden={!pdfIsReady}
                                    >
                                        {t('translation:show-pdf')}
                                    </Button>
                                </Col>
                                <Col xs='6' md='4' className='pr-md-0 pl-2'>
                                    <Button
                                        className=''
                                        block
                                        onClick={finishProcess}
                                    >
                                        {t('translation:process-finish')}
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Fade>
            </>

    )
}

export default ShowCertificate;