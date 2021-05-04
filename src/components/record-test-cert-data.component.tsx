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
import { Button, Card, Col, Form, FormControlProps, Row } from 'react-bootstrap';

import '../i18n';
import { useTranslation } from 'react-i18next';

import useNavigation from '../misc/navigation';
import Spinner from './spinner/spinner.component';
import { IdentifierType } from '../misc/enum';

import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// e.G. german month names pt1
//import de from 'date-fns/locale/de';

import { EUDGC, VaccinationEntry, DiseaseAgentTargeted, TestEntry } from '../generated-files/dgc-combined-schema';
import { useGetDiseaseAgents, useGetTestManufacturers, useGetTestResult, IValueSet } from '../api';

import schema from '../generated-files/DGC.combined-schema.json';
import { Validator } from 'jsonschema';
import utils from '../misc/utils';
const validator = new Validator();
const iso3311a2 = require('iso-3166-1-alpha-2');

// e.G. german month names pt2
// registerLocale('de', de)


const RecordTestCertData = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    // data read from the API
    const diseaseAgentsData = useGetDiseaseAgents();
    const testManufacturersValueSet = useGetTestManufacturers();
    const testResultValueSet = useGetTestResult();

    const [isInit, setIsInit] = React.useState(false)

    const [givenName, setGivenName] = React.useState<string>('');
    const [familyName, setFamilyName] = React.useState<string>('');

    const [standardisedGivenName, setStandardisedGivenName] = React.useState<string>('');
    const [standardisedFamilyName, setStandardisedFamilyName] = React.useState<string>('');

    const [dateOfBirth, setDateOfBirth] = React.useState<Date>();

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

        setFamilyName(eudgc.nam!.fn!);
        setStandardisedFamilyName(eudgc.nam!.fnt!);
        setGivenName(eudgc.nam!.gn!);
        setStandardisedGivenName(eudgc.nam!.gnt!);
        setDateOfBirth(new Date(eudgc.dob!));

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

    const handleStandardisedNameChanged = (changedValue: string, setStandardisedName: (value: string) => void) => {
        const upperCaseChangedValue = changedValue.toUpperCase();

        if (utils.isStandardisedNameValid(upperCaseChangedValue)) {
            setStandardisedName(upperCaseChangedValue);
        }
    }

    const handleDateOfBirthChange = (evt: Date | [Date, Date] | null) => {
        const date = handleDateChange(evt);
        setDateOfBirth(date);
    }

    const handleSampleDateTimeChange = (evt: Date | [Date, Date] | null) => {
        const date = handleDateTimeChange(evt);
        setSampleDateTime(date);
    }

    const handleTestDateTimeChange = (evt: Date | [Date, Date] | null) => {
        const date = handleDateTimeChange(evt);
        setTestDateTime(date);
    }

    const handleDateChange = (evt: Date | [Date, Date] | null) => {
        let date: Date;

        if (Array.isArray(evt))
            date = evt[0];
        else
            date = evt as Date;

        if (date) {
            date.setHours(12);
        }

        return date;
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
                    fn: familyName,
                    fnt: standardisedFamilyName!,
                    gn: givenName,
                    gnt: standardisedGivenName
                },
                dob: dateOfBirth!.toISOString().split('T')[0],
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
                        <Card.Header id='data-header' className='pb-0'>
                            <Row>
                                <Col md='6'>
                                    <Card.Title className='m-md-0 tac-xs-tal-md jcc-xs-jcfs-md' as={'h2'} >{t('translation:test-cert')}</Card.Title>
                                </Col>
                                <Col md='6' className='d-flex justify-content-center'>
                                    <Card.Text id='id-query-text'>{t('translation:query-id-card')}</Card.Text>
                                </Col>
                            </Row>
                            <hr />
                        </Card.Header>

                        {/*
                            content area with patient inputs and check box
                        */}
                        <Card.Body id='data-body' className='pt-0'>

                            {/* first name input */}
                            <Form.Group as={Row} controlId='formGivenNameInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:first-name') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={givenName}
                                        onChange={event => setGivenName(event.target.value)}
                                        placeholder={t('translation:first-name')}
                                        type='text'
                                        required
                                        maxLength={50}
                                    />
                                </Col>
                            </Form.Group>

                            {/* name input */}
                            <Form.Group as={Row} controlId='formNameInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:name') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={familyName}
                                        onChange={event => setFamilyName(event.target.value)}
                                        placeholder={t('translation:name')}
                                        type='text'
                                        required
                                        maxLength={50}
                                    />
                                </Col>
                            </Form.Group>

                            <hr />

                            {/* standardised first name input */}
                            <Form.Group as={Row} controlId='formStandadisedGivenNameInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:standardised-first-name') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={standardisedGivenName}
                                        onChange={(evt) => handleStandardisedNameChanged(evt.target.value, setStandardisedGivenName)}
                                        placeholder={t('translation:standardised-first-name')}
                                        type='text'
                                        required
                                        pattern={utils.pattern.standardisedName}
                                        maxLength={50}
                                    />
                                </Col>
                            </Form.Group>

                            {/*standardised name input */}
                            <Form.Group as={Row} controlId='formStandadisedNameInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:standardised-name') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={standardisedFamilyName}
                                        onChange={(evt) => handleStandardisedNameChanged(evt.target.value, setStandardisedFamilyName)}
                                        placeholder={t('translation:standardised-name')}
                                        type='text'
                                        required
                                        pattern={utils.pattern.standardisedName}
                                        maxLength={50}
                                    />
                                </Col>
                            </Form.Group>

                            <hr />

                            {/* date of birth input */}
                            <Form.Group as={Row} controlId='formDateOfBirthInput' className='mb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:date-of-birth') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <DatePicker
                                        selected={dateOfBirth}
                                        onChange={handleDateOfBirthChange}
                                        dateFormat='yyyy-MM-dd'
                                        isClearable
                                        placeholderText={t('translation:date-of-birth')}
                                        className='qt-input form-control'
                                        wrapperClassName='align-self-center'
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        maxDate={new Date()}
                                        minDate={new Date(1900, 0, 1, 12)}
                                        openToDate={new Date(1990, 0, 1)}
                                        required
                                    />
                                </Col>
                            </Form.Group>

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
                            <Form.Group as={Row} controlId='formTestTypeInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:testType') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={testType}
                                        onChange={event => setTestType(event.target.value)}
                                        placeholder={t('translation:testType')}
                                        type='text'
                                        required
                                        maxLength={50}
                                    />
                                </Col>
                            </Form.Group>

                            {/* testName input */}
                            <Form.Group as={Row} controlId='formTestNameInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:testName') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={testName}
                                        onChange={event => setTestName(event.target.value)}
                                        placeholder={t('translation:testName')}
                                        type='text'
                                        required
                                        maxLength={50}
                                    />
                                </Col>
                            </Form.Group>

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
                                        dateFormat='yyyy-MM-dd / hh:mm a'
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
                                        dateFormat='yyyy-MM-dd / hh:mm a'
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
                            <Form.Group as={Row} controlId='formTestCenterInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:testCenter') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={testCenter}
                                        onChange={event => setTestCenter(event.target.value)}
                                        placeholder={t('translation:testCenter')}
                                        type='text'
                                        required
                                        maxLength={50}
                                    />
                                </Col>
                            </Form.Group>

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
                            <Form.Group as={Row} controlId='formcertificateIssuerInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:certificateIssuer') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={certificateIssuer}
                                        onChange={event => setCertificateIssuer(event.target.value)}
                                        placeholder={t('translation:certificateIssuer')}
                                        type='text'
                                        required
                                        maxLength={50}
                                    />
                                </Col>
                            </Form.Group>
                            <hr />
                        </Card.Body>

                        {/*
                            footer with clear and nex button
                        */}
                        <Card.Footer id='data-footer'>
                            <Row>
                                <Col xs='6' md='3'>
                                    <Button
                                        className='my-1 my-md-0 p-0'
                                        block
                                        onClick={handleCancel}
                                    >
                                        {t('translation:cancel')}
                                    </Button>
                                </Col>
                                <Col xs='6' md='3' className='pr-md-0'>
                                    <Button
                                        className='my-1 my-md-0 p-0'
                                        block
                                        type='submit'
                                    >
                                        {t('translation:next')}
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Footer>

                    </Form>
                </Card>
            </>
    )
}

export default RecordTestCertData;