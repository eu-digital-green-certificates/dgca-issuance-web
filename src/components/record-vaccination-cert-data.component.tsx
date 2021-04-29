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
import { IdentifierType } from '../misc/enum';

import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import de from 'date-fns/locale/de';

import { EUDGC, VaccinationEntry, DiseaseAgentTargeted } from '../generated-files/dgc-combined-schema';
import { useGetDiseaseAgents, useGetVaccineManufacturers, useGetVaccines, useGetVaccinMedicalData } from '../api';

import schema from '../generated-files/DGC.combined-schema.json';
import { Validator } from 'jsonschema';
const validator = new Validator();
const iso3311a2 = require('iso-3166-1-alpha-2');

registerLocale('de', de)


const RecordVaccinationCertData = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();
    
    // data read from the API
    const vacMedsData = useGetVaccinMedicalData();
    const diseaseAgentsData = useGetDiseaseAgents();
    const vaccineManufacturers = useGetVaccineManufacturers();
    const vaccines = useGetVaccines();

    const [isInit, setIsInit] = React.useState(false)

    const [firstName, setFirstName] = React.useState('');
    const [name, setName] = React.useState('');
    const [identifierType, setIdentifierType] = React.useState('');
    const [identifierNumber, setIdentifierNumber] = React.useState('');
    const [dateOfBirth, setDateOfBirth] = React.useState<Date>();
    const [disease, setDisease] = React.useState('');
    const [vaccine, setVaccine] = React.useState<any>('');
    const [medicalProduct, setMedicalProduct] = React.useState<any>('');
    const [marketingHolder, setMarketingHolder] = React.useState<any>('');
    const [sequence, setSequence] = React.useState<number>();
    const [tot, setTot] = React.useState<number>();
    const [vacLastDate, setVacLastDate] = React.useState<Date>();
    const [adm, setAdm] = React.useState('');
    const [selectedIdentifierTypeOptionValue, setSelectedIdentifierTypeOptionValue] = React.useState<string>();
    const [personCountry, setPersonCountry] = React.useState<string>();
    const [issuerCountry, setIssuerCountry] = React.useState<string>();

    const [identifierTypeOptions, setIdentifierTypeOptions] = React.useState<HTMLSelectElement[]>();
    const [isoCountryOptions, setIsoCountryOptions] = React.useState<HTMLSelectElement[]>();

    //TODO: Options to be read from the gateway
    const [diseasOptions, setDiseasOptions] = React.useState<HTMLSelectElement[]>();
    const [vaccineOptions, setVaccineOptions] = React.useState<HTMLSelectElement[]>();
    const [medicalProductOptions, setMedicalProductOptions] = React.useState<HTMLSelectElement[]>();
    const [marketingHolderOptions, setMarketingHolderOptions] = React.useState<HTMLSelectElement[]>();


    React.useEffect(() => {
        if (navigation) {
            setTimeout(setIsInit, 200, true);
        }
    }, [navigation]);


    React.useEffect(() => {
        setOptions();
        setIso3311a2();

        setIdentifierType(IdentifierType.PPN);
        setSelectedIdentifierTypeOptionValue(IdentifierType.PPN);
    }, []);


    React.useEffect(() => {
        if (vacMedsData) {
            let possibleOptions: string[] = []
            Object.keys(vacMedsData).forEach((key) => {
                // transcribes the IDs to the display names
                possibleOptions = [...possibleOptions, vacMedsData[key]["display"]]
            })
            setMedicalProductOptions(setDynamicOptions(possibleOptions));
        }
    }, [vacMedsData])


    React.useEffect(() => {
        if (diseaseAgentsData) {
            let possibleOptions: string[] = []
            Object.keys(diseaseAgentsData).forEach((key) => {
                // transcribes the IDs to the display names
                possibleOptions = [...possibleOptions, diseaseAgentsData[key]["display"]]
            })
            setDiseasOptions(setDynamicOptions(possibleOptions));
        }
    }, [diseaseAgentsData])


    React.useEffect(() => {
        if (vaccineManufacturers) {
            let possibleOptions: string[] = []
            Object.keys(vaccineManufacturers).forEach((key) => {
                // transcribes the IDs to the display names
                possibleOptions = [...possibleOptions, vaccineManufacturers[key]["display"]]
            })
            setMarketingHolderOptions(setDynamicOptions(possibleOptions));
        }
    }, [vaccineManufacturers])


    React.useEffect(() => {
        if (vaccines) {
            let possibleOptions: string[] = []
            Object.keys(vaccines).forEach((key) => {
                // transcribes the IDs to the display names
                possibleOptions = [...possibleOptions, vaccines[key]["display"]]
            })
            setVaccineOptions(setDynamicOptions(possibleOptions));
        }
    }, [vaccines])


    const handleError = (error: any) => {
        let msg = '';

        if (error) {
            msg = error.message
        }
        props.setError({ error: error, message: msg, onCancel: navigation!.toLanding });
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

    const handleCancel = () => {
        props.setEudgc(undefined);
        navigation?.toLanding();
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;

        const vacc: VaccinationEntry = {
            tg: disease as DiseaseAgentTargeted,
            vp: vaccine,
            mp: medicalProduct,
            ma: marketingHolder,
            dn: sequence!,
            sd: tot!,
            dt: formatDate(vacLastDate!),
            co: issuerCountry!.substr(0, 2),
            // TODO: was bedeutet das?
            is: adm,
            /**
             * Unique Certificate Identifier: UVCI
             * TODO: Wo kommt das her?
             */
            ci: "Wo kommt das her?"
        };

        const eudgc: EUDGC = {
            ver: '1.0.0',
            nam: {
                fnt: name,
                gnt: firstName
            },
            dob: formatDate(dateOfBirth!),
            v: [vacc]
        }

        var result = validator.validate(eudgc, schema);
        if (!result.valid) {
            console.error(result);
            alert("Eingabe passt nicht zum Schema. Siehe Konsoleausgabe!");
        }

        console.log(vacc);

        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity()) {
            props.setEudgc(eudgc);
            setTimeout(navigation!.toShowCert, 200);
        }
    }

    const formatDate = (date: Date): string => `${date.toISOString().substr(0, 10)}`;

    const setOptions = () => {
        const options: any[] = [];
        for (let option in IdentifierType) {
            options.push(<option key={option} value={option}>{t('translation:' + option)}</option>)
        }

        setIdentifierTypeOptions(options);
    }

    const setDynamicOptions = (dynamicOptions: string[]) => {
        const options: any[] = [];
        for (let i = 0; i < dynamicOptions.length; i++) {
            options.push(<option key={i} value={dynamicOptions[i]}>{dynamicOptions[i]}</option>)
        }

        return options;
    }

    const setIso3311a2 = () => {
        const options: any[] = [];
        const codes: any[] = iso3311a2.getCodes().sort();
        for (let i = 0; i < codes.length; i++) {
            options.push(<option key={codes[i]}>{codes[i] + " : " + iso3311a2.getCountry(codes[i])}</option>)
        }

        setIsoCountryOptions(options);
        setPersonCountry(codes[0]);
        setIssuerCountry(codes[0]);
    }

    const handleIdentifierTypeChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setIdentifierType(event.target.value);
        setSelectedIdentifierTypeOptionValue(event.target.value);
    }

    return (
        !isInit ? <Spinner /> :
            <>
                <Card id='data-card'>

                    <Form onSubmit={handleSubmit} /*validated={validated}*/>

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
                            <Form.Group as={Row} controlId='formFirstNameInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:first-name') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={firstName}
                                        onChange={event => setFirstName(event.target.value.toUpperCase())}
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
                                        value={name}
                                        onChange={event => setName(event.target.value.toUpperCase())}
                                        placeholder={t('translation:name')}
                                        type='text'
                                        required
                                        maxLength={50}
                                    />
                                </Col>
                            </Form.Group>

                            {/* !TODO: implement input for the standardized name */}

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
                            {/* Combobox for Identifier Type */}
                            <Form.Group as={Row} controlId='formIdentifyerTypeInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:identifierType') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={identifierType}
                                        onChange={handleIdentifierTypeChanged}
                                        placeholder={t('translation:name')}
                                        required
                                    >
                                        {identifierTypeOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            {/* Combobox for the countries in iso-3166-1-alpha-2 */}
                            <Form.Group as={Row} controlId='formIsoCountryInput' className='mb-1 mt-1 sb-1 st-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:country') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={personCountry}
                                        onChange={event => setPersonCountry(event.target.value)}
                                        placeholder={t('translation:country')}
                                        required
                                    >
                                        {isoCountryOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            {/* input identifierNumber */}
                            <Form.Group as={Row} controlId='formIdentifyerNumberInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:identifierNumber') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={identifierNumber}
                                        onChange={event => setIdentifierNumber(event.target.value)}
                                        placeholder={t('translation:identifierNumber')}
                                        type='text'
                                        required
                                        maxLength={79}
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
                                        {medicalProductOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            <hr />

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
                                        {marketingHolderOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            {/* sequence */}
                            <Form.Group as={Row} controlId='formTotInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:sequence') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={sequence}
                                        onChange={event => setSequence(parseInt(event.target.value))}
                                        placeholder={t('translation:def-sequence')}
                                        type='number'
                                        required
                                        min={0}
                                        max={999999999}
                                        maxLength={6}
                                    />
                                </Col>
                            </Form.Group>

                            {/* tot */}
                            <Form.Group as={Row} controlId='formTotInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:tot') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={tot}
                                        onChange={event => setTot(parseInt(event.target.value))}
                                        placeholder={t('translation:def-tot')}
                                        type='number'
                                        required
                                        min={1}
                                        max={9}
                                    />
                                </Col>
                            </Form.Group>

                            {/* !TODO: change label to a clearer name then "Last Date" */}
                            {/* vacLastDate */}
                            <Form.Group as={Row} controlId='formLastDateInput' className='mb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:vac-last-date') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <DatePicker
                                        selected={vacLastDate}
                                        onChange={handleVacLastDate}
                                        locale='de'
                                        dateFormat='dd. MM. yyyy'
                                        isClearable
                                        placeholderText={t('translation:vac-last-date')}
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
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:vac-country') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control as="select"
                                        className='qt-input'
                                        value={issuerCountry}
                                        onChange={event => setIssuerCountry(event.target.value)}
                                        placeholder={t('translation:country')}
                                        required
                                    >
                                        {isoCountryOptions}
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                            <hr />
                            {/* adm */}
                            <Form.Group as={Row} controlId='formAdmInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:adm')}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={adm}
                                        onChange={event => setAdm(event.target.value)}
                                        placeholder={t('translation:def-adm')}
                                        type='text'
                                        maxLength={79}
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

export default RecordVaccinationCertData;