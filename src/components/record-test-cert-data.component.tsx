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
import { Card, Col, Form, Row } from 'react-bootstrap';

import '../i18n';
import { useTranslation } from 'react-i18next';

import useNavigation from '../misc/navigation';
import Spinner from './spinner/spinner.component';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { EUDGC, TestEntry } from '../generated-files/dgc-combined-schema';
import { useGetDiseaseAgents, useGetTestManufacturers, useGetTestResult } from '../api';

import schema from '../generated-files/DGC.combined-schema.json';
import { Validator } from 'jsonschema';
import utils from '../misc/utils';
import CardHeader from './modules/card-header.component';
import { FormGroupInput, FormGroupISOCountrySelect, FormGroupValueSetSelect, IPersonData, PersonInputs } from './modules/form-group.component';
import CardFooter from './modules/card-footer.component';
import useLocalStorage from '../misc/local-storage';

const validator = new Validator();

const RecordTestCertData = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    const [isInit, setIsInit] = React.useState(false)

    const [person, setPerson] = React.useState<IPersonData>();

    const [disease, setDisease] = useLocalStorage('disease', '');

    const [testType, setTestType] = useLocalStorage('testType', '');
    const [testName, setTestName] = useLocalStorage('testName', '');
    const [testManufacturers, setTestManufacturers] = useLocalStorage('testManufacturers', '');

    const [sampleDateTime, setSampleDateTime] = React.useState<Date>();
    const [testDateTime, setTestDateTime] = React.useState<Date | undefined>();

    const [testResult, setTestResult] = React.useState<string>('');
    const [testCenter, setTestCenter] = useLocalStorage('testCenter', '');

    const [certificateIssuer, setCertificateIssuer] = useLocalStorage('certificateIssuer', '');
    const [issuerCountryCode, setIssuerCountryCode] = useLocalStorage('issuerCountryCode', '');

    React.useEffect(() => {
        if (!props.eudgc || !props.eudgc.t || !props.eudgc.t[0]) {
            return;
        }

        const test: TestEntry = props.eudgc.t[0];

        setDisease(test.tg);

        setTestType(test.tt);

        if (test.nm) {
            setTestName(test.nm);
        }

        if (test.ma) {
            setTestManufacturers(test.ma);
        }

        setSampleDateTime(new Date(test.sc));

        if (test.dr) {
            setTestDateTime(new Date(test.dr));
        }

        setTestResult(test.tr);
        setTestCenter(test.tc);

        setIssuerCountryCode(test.co);
        setCertificateIssuer(test.is);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.eudgc]);

    React.useEffect(() => {
        if (navigation) {
            setTimeout(setIsInit, 200, true);
        }
    }, [navigation]);

    const handleSampleDateTimeChange = (evt: Date | [Date, Date] | null) => {
        const date = handleDateTimeChange(evt);
        setSampleDateTime(date);
    }

    const handleTestDateTimeChange = (evt: Date | [Date, Date] | null) => {
        const date = handleDateTimeChange(evt);
        setTestDateTime(date);
    }


    const handleDateTimeChange = (evt: Date | [Date, Date] | null) => {
        let date: Date;

        if (Array.isArray(evt))
            date = evt[0];
        else
            date = evt as Date;

        return date;
    }

    const handleCancel = () => {
        props.setEudgc(undefined);
        navigation?.toLanding();
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {

        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;

        if (form.checkValidity()) {

            const test: TestEntry = {
                tg: disease,
                tt: testType,
                nm: testName,
                ma: testManufacturers,
                sc: sampleDateTime!.toISOString(),
                dr: testDateTime ? testDateTime.toISOString() : undefined,
                tr: testResult,
                tc: testCenter,
                co: issuerCountryCode,
                is: certificateIssuer,
                ci: ''
            };

            const eudgc: EUDGC = {
                ver: '1.0.0',
                nam: {
                    fn: person!.familyName,
                    fnt: person!.standardisedFamilyName!,
                    gn: person!.givenName,
                    gnt: person!.standardisedGivenName
                },
                dob: person!.dateOfBirth!.toISOString().split('T')[0],
                t: [test]
            }

            var result = validator.validate(eudgc, schema);

            if (result.valid) {
                // console.log(JSON.stringify(eudgc));

                props.setEudgc(eudgc);
                setTimeout(navigation!.toShowCert, 200);
            }
            else {
                console.error(result);
                props.setError({ error: result, message: result.errors[0].message, onCancel: navigation!.toLanding });
            }
        }
    }

    return (
        !isInit ? <Spinner /> :
            <>
                <Card id='data-card'>

                    <Form className='form-flex' onSubmit={handleSubmit} /*validated={validated}*/>

                        {/*
                            header with title and id card query
                        */}
                        <CardHeader title={t('translation:test-cert')} />

                        {/*
                            content area with patient inputs and check box
                        */}
                        <Card.Body id='data-body' className='p-3'>

                            <PersonInputs eudgc={props.eudgc} onChange={setPerson} />

                            <hr />

                            {/* combobox disease */}
                            <FormGroupValueSetSelect controlId='formDiseaseInput' title={t('translation:disease-agent')} placeholder={t('translation:def-disease-agent')}
                                value={disease}
                                onChange={(evt: any) => setDisease(evt.target.value)}
                                required
                                valueSet={useGetDiseaseAgents}
                            />

                            {/* testType input */}
                            <FormGroupInput controlId='formTestTypeInput' title={t('translation:testType')}
                                value={testType}
                                onChange={(evt: any) => setTestType(evt.target.value)}
                                required
                                maxLength={50}
                            />

                            {/* testName input */}
                            <FormGroupInput controlId='formTestNameInput' title={t('translation:testName')}
                                value={testName}
                                onChange={(evt: any) => setTestName(evt.target.value)}
                                maxLength={50}
                            />

                            {/* combobox testManufacturers */}
                            <FormGroupValueSetSelect controlId='formTestManufactorersInput' title={t('translation:testManufacturers')}
                                value={testManufacturers}
                                onChange={(evt: any) => setTestManufacturers(evt.target.value)}
                                valueSet={useGetTestManufacturers}
                            />

                            <hr />

                            {/* sampleDateTime */}
                            <Form.Group as={Row} controlId='formSampleDateTimeInput'className='pb-3 mb-0'>
                                <Form.Label className='input-label ' column xs='5' sm='3'>{t('translation:sampleDateTime') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <DatePicker
                                        selected={sampleDateTime}
                                        onChange={handleSampleDateTimeChange}
                                        dateFormat={utils.pickerDateTimeFormat}
                                        placeholderText={t('translation:sampleDateTime')}
                                        className='qt-input form-control'
                                        wrapperClassName='align-self-center'
                                        showMonthDropdown
                                        showYearDropdown
                                        showTimeSelect
                                        dropdownMode="select"
                                        minDate={new Date(2020, 10)}
                                        openToDate={new Date()}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            {/* testDateTime */}
                            <Form.Group as={Row} controlId='formTestDateTimeInput'className='pb-3 mb-0'>
                                <Form.Label className='input-label ' column xs='5' sm='3'>{t('translation:testDateTime')}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <DatePicker
                                        selected={testDateTime}
                                        onChange={handleTestDateTimeChange}
                                        dateFormat={utils.pickerDateTimeFormat}
                                        placeholderText={t('translation:testDateTime')}
                                        className='qt-input form-control'
                                        wrapperClassName='align-self-center'
                                        showMonthDropdown
                                        showYearDropdown
                                        showTimeSelect
                                        dropdownMode="select"
                                        minDate={new Date(2020, 10)}
                                        openToDate={new Date()}
                                    />
                                </Col>
                            </Form.Group>

                            {/* combobox testResult */}
                            <FormGroupValueSetSelect controlId='formTestResultInput' title={t('translation:testResult')}
                                value={testResult}
                                onChange={(evt: any) => setTestResult(evt.target.value)}
                                required
                                valueSet={useGetTestResult}
                            />

                            {/* testCenter input */}
                            <FormGroupInput controlId='formTestCenterInput' title={t('translation:testCenter')}
                                value={testCenter}
                                onChange={(evt: any) => setTestCenter(evt.target.value)}
                                required
                                maxLength={50}
                            />

                            <hr />

                            {/* Combobox for the vaccin countries in iso-3166-1-alpha-2 */}
                            <FormGroupISOCountrySelect controlId='formVacCountryInput' title={t('translation:vac-country')}
                                value={issuerCountryCode}
                                onChange={(evt: any) => setIssuerCountryCode(evt.target.value)}
                                required
                            />

                            {/* certificateIssuer */}
                            <FormGroupInput controlId='formcertificateIssuerInput' title={t('translation:certificateIssuer')} placeholder={t('translation:certificateIssuer')}
                                value={certificateIssuer}
                                onChange={(evt: any) => setCertificateIssuer(evt.target.value)}
                                required
                                maxLength={50}
                            />
                            <hr />
                        </Card.Body>

                        {/*
                            footer with clear and nex button
                        */}
                        <CardFooter handleCancel={handleCancel} />

                    </Form>
                </Card>
            </>
    )
}

export default RecordTestCertData;
