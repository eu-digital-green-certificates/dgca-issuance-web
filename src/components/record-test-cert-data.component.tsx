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
import { Card, Col, Fade, Form, Row } from 'react-bootstrap';

import '../i18n';
import { useTranslation } from 'react-i18next';

import Spinner from './spinner/spinner.component';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { EUDCC1, TestEntry } from '../generated-files/dgc-combined-schema';
import { Value_Sets } from '../misc/useValueSet';

import schema from '../generated-files/DGC.combined-schema.json';
import { Validator } from 'jsonschema';
import utils from '../misc/utils';
import CardHeader from './modules/card-header.component';
import { FormGroupInput, FormGroupValueSetSelect, IPersonData, PersonInputs } from './modules/form-group.component';
import CardFooter from './modules/card-footer.component';
import useLocalStorage from '../misc/useLocalStorage';
import moment from 'moment';
import AppContext from '../misc/appContext';

const validator = new Validator();

const RecordTestCertData = (props: any) => {

    const context = React.useContext(AppContext);
    const { t } = useTranslation();

    const [isInit, setIsInit] = React.useState(false)

    const [person, setPerson] = React.useState<IPersonData>();

    const [disease, setDisease] = useLocalStorage('disease', '');

    const [testType, setTestType] = useLocalStorage('testType', '');
    const [testName, setTestName] = useLocalStorage('testName', '');
    const [testManufacturers, setTestManufacturers] = useLocalStorage('testManufacturers', '');

    const [sampleDateTime, setSampleDateTime] = React.useState<Date>();

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

        setTestResult(test.tr);
        setTestCenter(test.tc);

        setIssuerCountryCode(test.co);
        setCertificateIssuer(test.is);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.eudgc]);

    React.useEffect(() => {
        if (context.navigation && context.valueSets)
            setIsInit(true);
    }, [context.navigation, context.valueSets])

    const handleSampleDateTimeChange = (evt: Date | [Date, Date] | null) => {
        const date = handleDateTimeChange(evt);
        setSampleDateTime(date);
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
        context.navigation?.toLanding();
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {

        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;

        if (form.checkValidity() && person) {

            const test: TestEntry = {
                tg: disease,
                tt: testType,
                nm: testName && testType === 'LP6464-4' ? testName : undefined,
                ma: testManufacturers && testType === 'LP217198-3' ? testManufacturers : undefined,
                sc: moment.utc(sampleDateTime).format(),
                tr: testResult,
                tc: testCenter,
                co: issuerCountryCode,
                is: certificateIssuer,
                ci: ''
            };

            const eudgc: EUDCC1 = {
                ver: '1.3.0',
                nam: {
                    fn: person.familyName,
                    fnt: person.standardisedFamilyName!,
                    gn: person.givenName,
                    gnt: person.standardisedGivenName
                },
                dob: person.dateOfBirth
                    ? moment(person.dateOfBirth).format(person.dobFormat === 'yyyy-MM-dd' ? 'yyyy-MM-DD' : person.dobFormat)
                    : '',
                t: [test]
            }

            var result = validator.validate(eudgc, schema);

            if (result.valid) {
                props.setEudgc(eudgc);
                setTimeout(context.navigation!.toShowCert, 200);
            }
            else {
                console.error(result);
                props.setError({ error: result, message: result.errors[0].message, onCancel: context.navigation!.toLanding });
            }
        }
    }

    return (
        !(isInit && context && context.valueSets) ? <Spinner /> :
            <>
                <Fade appear={true} in={true} >
                    <Card id='data-card'>

                        <Form className='form-flex' onSubmit={handleSubmit} /*validated={validated}*/>

                            {/*
                            header with title and id card query
                        */}
                            <CardHeader title={t('translation:test-cert')} />

                            {/*
                            content area with patient inputs and check box
                        */}
                            <Card.Body id='data-body'>

                                <PersonInputs eudgc={props.eudgc} onChange={setPerson} />

                                <hr />

                                {/* combobox disease */}
                                <FormGroupValueSetSelect controlId='formDiseaseInput' title={t('translation:disease-agent')} placeholder={t('translation:def-disease-agent')}
                                    value={disease}
                                    onChange={(evt: any) => setDisease(evt.target.value)}
                                    required
                                    valueSet={context.valueSets[Value_Sets.DiseaseAgent]}
                                />

                                {/* testType input */}
                                <FormGroupValueSetSelect controlId='formTestTypeInput' title={t('translation:testType')}
                                    value={testType}
                                    onChange={(evt: any) => setTestType(evt.target.value)}
                                    required
                                    valueSet={context.valueSets[Value_Sets.TestType]}
                                />

                                {/* testName input */}
                                <FormGroupInput controlId='formTestNameInput' title={t('translation:testName')}
                                    value={testName}
                                    onChange={(evt: any) => setTestName(evt.target.value)}
                                    hidden={testType !== 'LP6464-4'}
                                    maxLength={80}
                                />

                                {/* combobox testManufacturers */}
                                <FormGroupValueSetSelect controlId='formTestManufactorersInput' title={t('translation:testManufacturers')}
                                    value={testManufacturers}
                                    onChange={(evt: any) => setTestManufacturers(evt.target.value)}
                                    hidden={testType !== 'LP217198-3'}
                                    valueSet={context.valueSets[Value_Sets.TestManufacturer]}
                                />

                                <hr />

                                {/* sampleDateTime */}
                                <Form.Group as={Row} controlId='formSampleDateTimeInput' className='pb-3 mb-0'>
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

                                {/* combobox testResult */}
                                <FormGroupValueSetSelect controlId='formTestResultInput' title={t('translation:testResult')}
                                    value={testResult}
                                    onChange={(evt: any) => setTestResult(evt.target.value)}
                                    required
                                    valueSet={context.valueSets[Value_Sets.TestResult]}
                                />

                                {/* testCenter input */}
                                <FormGroupInput controlId='formTestCenterInput' title={t('translation:testCenter')}
                                    value={testCenter}
                                    onChange={(evt: any) => setTestCenter(evt.target.value)}
                                    required
                                    maxLength={80}
                                />

                                <hr />

                                {/* Combobox for the vaccin countries in iso-3166-1-alpha-2 */}
                                <FormGroupValueSetSelect controlId='formVacCountryInput' title={t('translation:vac-country')}
                                    value={issuerCountryCode}
                                    onChange={(evt: any) => setIssuerCountryCode(evt.target.value)}
                                    required
                                    valueSet={context.valueSets[Value_Sets.CountryCodes]}
                                />

                                {/* certificateIssuer */}
                                <FormGroupInput controlId='formcertificateIssuerInput' title={t('translation:certificateIssuer')} placeholder={t('translation:certificateIssuer')}
                                    value={certificateIssuer}
                                    onChange={(evt: any) => setCertificateIssuer(evt.target.value)}
                                    required
                                    maxLength={80}
                                />
                            </Card.Body>

                            {/*
                            footer with clear and nex button
                        */}
                            <CardFooter handleCancel={handleCancel} />

                        </Form>
                    </Card>
                </Fade>
            </>
    )
}

export default RecordTestCertData;
