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
import useLocalStorage from '../misc/local-storage';

import useNavigation from '../misc/navigation';
import Spinner from './spinner/spinner.component';
import { IdentifierType } from '../misc/enum';

import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
//import de from 'date-fns/locale/de';

import { EUDGC, RecoveryEntry, DiseaseAgentTargeted } from '../generated-files/dgc-combined-schema';
import { useGetDiseaseAgents, IValueSet } from '../api';

import schema from '../generated-files/DGC.combined-schema.json';
import { Validator } from 'jsonschema';
import utils from '../misc/utils';
const validator = new Validator();
const iso3311a2 = require('iso-3166-1-alpha-2');

//registerLocale('de', de)


const RecordRecoveryCertData = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    // data read from the API
    const diseaseAgentsData = useGetDiseaseAgents();

    const [isInit, setIsInit] = React.useState(false)

    const [givenName, setGivenName] = React.useState<string>('');
    const [familyName, setFamilyName] = React.useState<string>('');

    const [standardisedGivenName, setStandardisedGivenName] = React.useState<string>('');
    const [standardisedFamilyName, setStandardisedFamilyName] = React.useState<string>('');

    const [dateOfBirth, setDateOfBirth] = React.useState<Date>();

    const [disease, setDisease] = React.useState<string>('');

    const [diseasOptions, setDiseasOptions] = React.useState<JSX.Element[]>();

    const [firstPositiveResultDate, setFirstPositiveResultDate] = React.useState<Date>();
    const [certificateIssuer, setCertificateIssuer] = React.useState('');
    const [testCountryCode, setTestCountryCode] = React.useState<string>('');
    const [ dateValidFrom, setDateValidFrom] = React.useState<Date>();
    const [ dateValidTo, setDateValidTo] = React.useState<Date>();

    const [isoCountryOptions, setIsoCountryOptions] = React.useState<JSX.Element[]>();
    const [defaultTestCountryCode, setDefaultTestCountryCode] = useLocalStorage('defaultTestCountryCode', '');


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
        setDisease(eudgc.r![0].tg!);
        setFirstPositiveResultDate(new Date(eudgc.r![0].fr!));
        setTestCountryCode(eudgc.r![0].co!);
        setCertificateIssuer(eudgc.r![0].is!);
        setDateValidFrom(new Date(eudgc.r![0].df!))
        setDateValidTo(new Date(eudgc.r![0].du!))
    }, [props.eudgc]);

    React.useEffect(() => {
        setIso3311a2();
    }, []);

    React.useEffect(() => {
        if(!testCountryCode) {
            setTestCountryCode(defaultTestCountryCode);
        }

    }, [defaultTestCountryCode]);

    React.useEffect(() => {
        if (testCountryCode !== defaultTestCountryCode) {
            setDefaultTestCountryCode(testCountryCode);
        }

    }, [testCountryCode]);


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

        // options.push(<option key={0} value={''} >{ }</option>);

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

    const handleFirstPositiveResultDate = (evt: Date | [Date, Date] | null) => {
        const date = handleDateChange(evt);
        setFirstPositiveResultDate(date);
    }

    const handleDateValidFrom = (evt: Date | [Date, Date] | null) => {
        const date = handleDateChange(evt);
        setDateValidFrom(date);
    }

    const handleDateValidTo = (evt: Date | [Date, Date] | null) => {
        const date = handleDateChange(evt);
        setDateValidTo(date);
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

    const handleCancel = () => {
        props.setEudgc(undefined);
        navigation?.toLanding();
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {

        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;

        if (form.checkValidity()) {

            const r: RecoveryEntry = {
                tg: disease,
                fr: firstPositiveResultDate!.toISOString().split('T')[0],
                co: testCountryCode,
                is: certificateIssuer,
                df: dateValidFrom!.toISOString().split('T')[0],
                du: dateValidTo!.toISOString().split('T')[0],
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
                r: [r]
            }

            var result = validator.validate(eudgc, schema);

            if (result.valid) {
                //console.log(JSON.stringify(eudgc));

                props.setEudgc(eudgc);
                setTimeout(navigation!.toShowCert, 200);
            }
            else {
                console.error(result);
                props.setError({ error: result, message: result.errors[0].message, onCancel: navigation!.toLanding });
            }
        }
    }

    const formatDate = (date: Date): string => `${date.toISOString().substr(0, 10)}`;


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
                                    <Card.Title className='m-md-0 tac-xs-tal-md jcc-xs-jcfs-md' as={'h2'} >{t('translation:record-recovery-cert-dat')}</Card.Title>
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

                            <hr />

                            {/* Date of First Positive Test Result  */}
                            <Form.Group as={Row} controlId='formLastDateInput' className='mb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:recovery-first-date') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <DatePicker
                                        selected={firstPositiveResultDate}
                                        onChange={handleFirstPositiveResultDate}
                                        dateFormat='yyyy-MM-dd'
                                        isClearable
                                        placeholderText={t('translation:recovery-first-date')}
                                        className='qt-input form-control'
                                        wrapperClassName='align-self-center'
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        maxDate={new Date()}
                                        minDate={new Date(2020, 10)}
                                        openToDate={new Date()}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            {/* Combobox for the vaccin countries in iso-3166-1-alpha-2 */}
                            <Form.Group as={Row} controlId='formVacCountryInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:recovery-test-country') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={testCountryCode}
                                        onChange={event => setTestCountryCode(event.target.value)}
                                        placeholder={t('translation:country')}
                                        required
                                    >
                                        <option disabled key={0} value={''} >{t('translation:recovery-test-country')}</option>
                                        {isoCountryOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            <hr />



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

                            {/* Date: Certificate Valid From - To */}
                            <Form.Group as={Row} controlId='formDateOfBirthInput' className='mb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:cert-valid-from-go') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <DatePicker
                                        selected={dateValidFrom}
                                        onChange={handleDateValidFrom}
                                        dateFormat='yyyy-MM-dd'
                                        isClearable
                                        placeholderText={t('translation:valid-from')}
                                        className='qt-input form-control'
                                        wrapperClassName='align-self-center'
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        //TODO: possibly calculate dat min and max
                                        maxDate={new Date()}
                                        minDate={new Date(2020, 10)}
                                        openToDate={new Date()}
                                        required
                                    />
                                    <span className='space-five'>{ '-'}</span>
                                    <DatePicker
                                        selected={dateValidTo}
                                        onChange={handleDateValidTo}
                                        dateFormat='yyyy-MM-dd'
                                        isClearable
                                        placeholderText={t('translation:valid-to')}
                                        className='qt-input form-control'
                                        wrapperClassName='align-self-center'
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        //TODO: calculate date min and max
                                        maxDate={new Date(2099, 12)}
                                        minDate={new Date()}
                                        openToDate={new Date()}
                                        required
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

export default RecordRecoveryCertData;