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
import de from 'date-fns/locale/de';

import { EUDGC, VaccinationEntry, DiseaseAgentTargeted } from '../generated-files/dgc-combined-schema';
import { useGetDiseaseAgents, useGetVaccineManufacturers, useGetVaccines, useGetVaccinMedicalData, IValueSet } from '../api';

import schema from '../generated-files/DGC.combined-schema.json';
import { Validator } from 'jsonschema';
import utils from '../misc/utils';
const validator = new Validator();
const iso3311a2 = require('iso-3166-1-alpha-2');

registerLocale('de', de)


const RecordTestCertData = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    // data read from the API
    const vacMedsData = useGetVaccinMedicalData();
    const diseaseAgentsData = useGetDiseaseAgents();
    const vaccineManufacturers = useGetVaccineManufacturers();
    const vaccines = useGetVaccines();

    const [isInit, setIsInit] = React.useState(false)

    const [givenName, setGivenName] = React.useState<string>('');
    const [familyName, setFamilyName] = React.useState<string>('');

    const [standardisedGivenName, setStandardisedGivenName] = React.useState<string>('');
    const [standardisedFamilyName, setStandardisedFamilyName] = React.useState<string>('');

    const [dateOfBirth, setDateOfBirth] = React.useState<Date>();

    const [disease, setDisease] = React.useState<string>('');
    const [vaccine, setVaccine] = React.useState<string>('');
    const [medicalProduct, setMedicalProduct] = React.useState<string>('');
    const [marketingHolder, setMarketingHolder] = React.useState<string>('');

    const [diseasOptions, setDiseasOptions] = React.useState<JSX.Element[]>();
    const [vaccineOptions, setVaccineOptions] = React.useState<JSX.Element[]>();
    const [medicalProductOptions, setMedicalProductOptions] = React.useState<JSX.Element[]>();
    const [marketingHolderOptions, setMarketingHolderOptions] = React.useState<JSX.Element[]>();

    const [doseNumber, setDoseNumber] = React.useState<number>(0);
    const [totalDoseNumber, setTotalDoseNumber] = React.useState<number>(0);
    const [vacLastDate, setVacLastDate] = React.useState<Date>();
    const [certificateIssuer, setCertificateIssuer] = React.useState('');
    const [issuerCountryCode, setIssuerCountryCode] = React.useState<string>('');

    const [isoCountryOptions, setIsoCountryOptions] = React.useState<JSX.Element[]>();


    React.useEffect(() => {
        if(!props.eudgc) {
            return;
        }

        const eudgc: EUDGC = props.eudgc;

        setFamilyName(eudgc.nam!.fn!);
        setStandardisedFamilyName(eudgc.nam!.fnt!);
        setGivenName(eudgc.nam!.gn!);
        setStandardisedGivenName(eudgc.nam!.gnt!);
        setDateOfBirth(new Date(eudgc.dob!));
        setDisease(eudgc.v![0].tg!);
        setVaccine(eudgc.v![0]!.vp!);
        setMedicalProduct(eudgc.v![0].mp!);
        setMarketingHolder(eudgc.v![0].ma!);
        setDoseNumber(eudgc.v![0].dn!);
        setTotalDoseNumber(eudgc.v![0].sd!);
        setVacLastDate(new Date(eudgc.v![0].dt!));
        setIssuerCountryCode(eudgc.v![0].co!);
        setCertificateIssuer(eudgc.v![0].is!);
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
        if (vaccines) {
            const options = getOptionsForValueSet(vaccines)
            setVaccineOptions(options);
        }
    }, [vaccines])


    React.useEffect(() => {
        if (vacMedsData) {
            const options = getOptionsForValueSet(vacMedsData)
            setMedicalProductOptions(options);
        }
    }, [vacMedsData])


    React.useEffect(() => {
        if (vaccineManufacturers) {
            const options = getOptionsForValueSet(vaccineManufacturers)
            setMarketingHolderOptions(options);
        }
    }, [vaccineManufacturers])


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

    const handleVacLastDate = (evt: Date | [Date, Date] | null) => {
        const date = handleDateChange(evt);
        setVacLastDate(date);
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

    const handleNumber = (value: string, setNumber: (num: number) => void) => {
        const num = parseInt(value);

        if (!isNaN(num)) {
            setNumber(num);
        }
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

            const vacc: VaccinationEntry = {
                tg: disease,
                vp: vaccine,
                mp: medicalProduct,
                ma: marketingHolder,
                dn: doseNumber!,
                sd: totalDoseNumber!,
                dt: vacLastDate!.toISOString().split('T')[0],
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
                v: [vacc]
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

                                <Col md='4' className='d-flex justify-content-left'>
                                    <Card.Text id='id-query-text'>{t('translation:query-id-card')}</Card.Text>
                                </Col>
                                <Col md='8'>
                                    <Card.Title className='m-md-0 jcc-xs-jcfs-md' as={'h2'} >{t('translation:vaccination-cert')}</Card.Title>
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
                                        locale='de'
                                        dateFormat='dd.MM.yyyy'
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

                            {/* combobox vaccine */}
                            <Form.Group as={Row} controlId='formVaccineInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:vaccine') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={vaccine}
                                        onChange={event => setVaccine(event.target.value)}
                                        placeholder={t('translation:vaccine')}
                                        required
                                    >
                                        <option disabled key={0} value={''} >{t('translation:vaccine')}</option>
                                        {vaccineOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            {/* combobox medicalProduct */}
                            <Form.Group as={Row} controlId='formMedicalProductInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:vac-medical-product') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={medicalProduct}
                                        onChange={event => setMedicalProduct(event.target.value)}
                                        placeholder="{t('translation:vaccine')}"
                                        required
                                    >
                                        <option disabled key={0} value={''} >{t('translation:vac-medical-product')}</option>
                                        {medicalProductOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            {/* combobox marketingHolder */}
                            <Form.Group as={Row} controlId='formMarketingHolderInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:vac-marketing-holder') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={marketingHolder}
                                        onChange={event => setMarketingHolder(event.target.value)}
                                        placeholder={t('translation:def-vac-marketing-holder')}
                                        required
                                    >
                                        <option disabled key={0} value={''} >{t('translation:vac-marketing-holder')}</option>
                                        {marketingHolderOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            <hr />

                            {/* sequence */}
                            <Form.Group as={Row} controlId='formDoseNumberInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:sequence') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={doseNumber}
                                        onChange={event => handleNumber(event.target.value, setDoseNumber)}
                                        placeholder={t('translation:def-sequence')}
                                        type='number'
                                        required
                                        min={1}
                                        max={9}
                                        maxLength={1}
                                    />
                                </Col>
                            </Form.Group>

                            {/* tot */}
                            <Form.Group as={Row} controlId='formTotInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:tot') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={totalDoseNumber}
                                        onChange={event => handleNumber(event.target.value, setTotalDoseNumber)}
                                        placeholder={t('translation:def-tot')}
                                        type='number'
                                        required
                                        min={1}
                                        max={9}
                                        maxLength={1}
                                    />
                                </Col>
                            </Form.Group>

                            {/* vacLastDate */}
                            <Form.Group as={Row} controlId='formLastDateInput' className='mb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:vac-last-date') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <DatePicker
                                        selected={vacLastDate}
                                        onChange={handleVacLastDate}
                                        locale='de'
                                        dateFormat='dd.MM.yyyy'
                                        isClearable
                                        placeholderText={t('translation:vac-last-date')}
                                        className='qt-input form-control'
                                        wrapperClassName='align-self-center'
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        minDate={new Date(2020, 10)}
                                        openToDate={new Date()}
                                        required
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