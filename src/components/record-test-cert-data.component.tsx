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
import { Button, Card, Col, Form, Row } from 'react-bootstrap';

import '../i18n';
import { useTranslation } from 'react-i18next';

import useNavigation from '../misc/navigation';
import Spinner from './spinner/spinner.component';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { EUDGC, TestEntry } from '../generated-files/dgc-combined-schema';
import { useGetDiseaseAgents, useGetTestManufacturers, useGetTestResult, IValueSet } from '../api';

import schema from '../generated-files/DGC.combined-schema.json';
import { Validator } from 'jsonschema';
import utils from '../misc/utils';
import CardHeader from './modules/card-header.component';
import { FormGroupInput, IPersonData, PersonInputs } from './modules/form-group.component';
import CardFooter from './modules/card-footer.component';

const validator = new Validator();
const iso3311a2 = require('iso-3166-1-alpha-2');


const RecordTestCertData = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    // data read from the API
    const diseaseAgentsData = useGetDiseaseAgents();
    const testManufacturersValueSet = useGetTestManufacturers();
    const testResultValueSet = useGetTestResult();

    const [isInit, setIsInit] = React.useState(false)

    const [person, setPerson] = React.useState<IPersonData>();

    const [disease, setDisease] = React.useState<string>('');

    const [testType, setTestType] = React.useState<string>('');
    const [testName, setTestName] = React.useState<string>('');
    const [testManufacturers, setTestManufacturers] = React.useState<string>('');

    const [sampleDateTime, setSampleDateTime] = React.useState<Date>();
    const [testDateTime, setTestDateTime] = React.useState<Date>();

    const [testResult, setTestResult] = React.useState<string>('');
    const [testCenter, setTestCenter] = React.useState<string>('');

    const [diseasOptions, setDiseasOptions] = React.useState<JSX.Element[]>();
    const [testResultOptions, setTestResultOptions] = React.useState<JSX.Element[]>();
    const [testManufacturersOptions, setTestManufacturersOptions] = React.useState<JSX.Element[]>();

    const [vacLastDate, setVacLastDate] = React.useState<Date>();
    const [certificateIssuer, setCertificateIssuer] = React.useState('');
    const [issuerCountryCode, setIssuerCountryCode] = React.useState<string>('');

    const [isoCountryOptions, setIsoCountryOptions] = React.useState<JSX.Element[]>();


    React.useEffect(() => {
        if (!props.eudgc) {
            return;
        }

        const eudgc: EUDGC = props.eudgc;

        setDisease(eudgc.t![0].tg!);

        setTestType(eudgc.t![0].tt!);
        setTestName(eudgc.t![0].nm!);
        setTestManufacturers(eudgc.t![0].ma!);

        setSampleDateTime(new Date(eudgc.t![0].sc));
        setTestDateTime(new Date(eudgc.t![0].dr!));

        setTestResult(eudgc.t![0]!.tr!);
        setTestCenter(eudgc.t![0]!.tc!);

        setIssuerCountryCode(eudgc.t![0].co!);
        setCertificateIssuer(eudgc.t![0].is!);
    }, [props.eudgc]);

    React.useEffect(() => {
        setIso3311a2();
    }, []);


    React.useEffect(() => {
        if (navigation) {
            setTimeout(setIsInit, 200, true);
        }
    }, [navigation]);


    React.useEffect(() => {
        if (diseaseAgentsData) {
            const options = getOptionsForValueSet(diseaseAgentsData)
            setDiseasOptions(options);
        }
    }, [diseaseAgentsData])


    React.useEffect(() => {
        if (testResultValueSet) {
            const options = getOptionsForValueSet(testResultValueSet)
            setTestResultOptions(options);
        }
    }, [testResultValueSet])


    React.useEffect(() => {
        if (testManufacturersValueSet) {
            const options = getOptionsForValueSet(testManufacturersValueSet)
            setTestManufacturersOptions(options);
        }
    }, [testManufacturersValueSet])


    const getOptionsForValueSet = (valueSet: IValueSet): JSX.Element[] => {
        const result: JSX.Element[] = [];
        for (const key of Object.keys(valueSet)) {
            result.push(<option key={key} value={key}>{valueSet[key].display}</option>)
        }

        return result;
    }

    const setIso3311a2 = () => {
        const options: JSX.Element[] = [];
        const codes: string[] = iso3311a2.getCodes().sort();

        options.push(<option key={0} value={''} >{ }</option>);

        for (const code of codes) {
            options.push(<option key={code} value={code}>{code + " : " + iso3311a2.getCountry(code)}</option>)
        }

        setIsoCountryOptions(options);
    }

    const handleError = (error: any) => {
        let msg = '';

        if (error) {
            msg = error.message
        }
        props.setError({ error: error, message: msg, onCancel: navigation!.toLanding });
    }

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
                dr: testDateTime!.toISOString(),
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
                        <Card.Body id='data-body' className='pt-0'>

                            <PersonInputs eudgc={props.eudgc} onChange={setPerson} />

                            <hr />

                            {/* combobox disease */}
                            <Form.Group as={Row} controlId='formDiseaseInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:disease-agent') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={disease}
                                        onChange={event => setDisease(event.target.value)}
                                        placeholder={t('translation:def-disease-agent')}
                                        required
                                    >
                                        <option disabled key={0} value={''} >{t('translation:def-disease-agent')}</option>
                                        {diseasOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

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
                                required
                                maxLength={50}
                            />

                            {/* combobox testManufacturers */}
                            <Form.Group as={Row} controlId='formTestManufactorersInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:testManufacturers') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={testManufacturers}
                                        onChange={event => setTestManufacturers(event.target.value)}
                                        placeholder={t('translation:testManufacturers')}
                                        required
                                    >
                                        <option disabled key={0} value={''} >{t('translation:testManufacturers')}</option>
                                        {testManufacturersOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            <hr />

                            {/* sampleDateTime */}
                            <Form.Group as={Row} controlId='formSampleDateTimeInput' className='mb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:sampleDateTime') + '*'}</Form.Label>

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
                            <Form.Group as={Row} controlId='formTestDateTimeInput' className='mb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:testDateTime') + '*'}</Form.Label>

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
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            {/* combobox testResult */}
                            <Form.Group as={Row} controlId='formTestResultInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:testResult') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={testResult}
                                        onChange={event => setTestResult(event.target.value)}
                                        placeholder="{t('translation:testResult')}"
                                        required
                                    >
                                        <option disabled key={0} value={''} >{t('translation:testResult')}</option>
                                        {testResultOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            {/* testCenter input */}
                            <FormGroupInput controlId='formTestCenterInput' title={t('translation:testCenter')}
                                value={testCenter}
                                onChange={(evt: any) => setTestCenter(evt.target.value)}
                                required
                                maxLength={50}
                            />

                            <hr />

                            {/* Combobox for the vaccin countries in iso-3166-1-alpha-2 */}
                            <Form.Group as={Row} controlId='formVacCountryInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:vac-country') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={issuerCountryCode}
                                        onChange={event => setIssuerCountryCode(event.target.value)}
                                        placeholder={t('translation:country')}
                                        required
                                    >
                                        <option disabled key={0} value={''} >{t('translation:vac-country')}</option>
                                        {isoCountryOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

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
