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
import useLocalStorage from '../misc/local-storage';

import useNavigation from '../misc/navigation';
import Spinner from './spinner/spinner.component';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { EUDGC, RecoveryEntry } from '../generated-files/dgc-combined-schema';
import { useGetDiseaseAgents } from '../api';

import schema from '../generated-files/DGC.combined-schema.json';
import { Validator } from 'jsonschema';
import CardHeader from './modules/card-header.component';
import { PersonInputs, IPersonData, FormGroupInput, FormGroupValueSetSelect, FormGroupISOCountrySelect } from './modules/form-group.component';
import CardFooter from './modules/card-footer.component';

const validator = new Validator();
const expirationMilSeconds = 60 * 60 * 24 * 180 * 1000;

const RecordRecoveryCertData = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    const [isInit, setIsInit] = React.useState(false)

    const [person, setPerson] = React.useState<IPersonData>();

    const [disease, setDisease] = useLocalStorage('disease', '');

    const [firstPositiveResultDate, setFirstPositiveResultDate] = React.useState<Date>();
    const [certificateIssuer, setCertificateIssuer] = useLocalStorage('certificateIssuer', '');
    const [testCountryCode, setTestCountryCode] = useLocalStorage('testCountryCode', '');
    const [dateValidFrom, setDateValidFrom] = React.useState<Date>();
    const [dateValidTo, setDateValidTo] = React.useState<Date>();

    React.useEffect(() => {
        if (!props.eudgc || !props.eudgc.r || !props.eudgc.r[0]) {
            return;
        }

        const rec: RecoveryEntry = props.eudgc.r[0];

        setDisease(rec.tg);
        setFirstPositiveResultDate(new Date(rec.fr));
        setTestCountryCode(rec.co);
        setCertificateIssuer(rec.is);
        setDateValidFrom(new Date(rec.df))
        setDateValidTo(new Date(rec.du))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.eudgc]);

    React.useEffect(() => {
        if (navigation) {
            setTimeout(setIsInit, 200, true);
        }
    }, [navigation]);

    // const handleError = (error: any) => {
    //     let msg = '';

    //     if (error) {
    //         msg = error.message
    //     }
    //     props.setError({ error: error, message: msg, onCancel: navigation!.toLanding });
    // }

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
                    fn: person!.familyName,
                    fnt: person!.standardisedFamilyName!,
                    gn: person!.givenName,
                    gnt: person!.standardisedGivenName
                },
                dob: person!.dateOfBirth!.toISOString().split('T')[0],
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

    return (
        !isInit ? <Spinner /> :
            <>
                <Card id='data-card'>

                    <Form className='form-flex' onSubmit={handleSubmit} /*validated={validated}*/>

                        {/*
                            header with title and id card query
                        */}
                        <CardHeader title={t('translation:record-recovery-cert-dat')} />

                        {/*
                            content area with patient inputs and check box
                        */}
                        <Card.Body id='data-body' className='p-3'>

                            {/* name inputs */}
                            <PersonInputs eudgc={props.eudgc} onChange={setPerson} />

                            <hr />

                            {/* combobox disease */}
                            <FormGroupValueSetSelect controlId='formDiseaseInput' title={t('translation:disease-agent')} placeholder={t('translation:def-disease-agent')}
                                value={disease}
                                onChange={(evt: any) => setDisease(evt.target.value)}
                                required
                                valueSet={useGetDiseaseAgents}
                            />

                            <hr />

                            {/* Date of First Positive Test Result  */}
                            <Form.Group as={Row} controlId='formLastDateInput' className='pb-3 mb-0'>
                                <Form.Label className='input-label ' column xs='5' sm='3'>{t('translation:first-positive-test-date') + '*'}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <DatePicker
                                        selected={firstPositiveResultDate}
                                        onChange={handleFirstPositiveResultDate}
                                        dateFormat='yyyy-MM-dd'
                                        isClearable
                                        placeholderText={t('translation:first-positive-test-date')}
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
                            <FormGroupISOCountrySelect controlId='formVacCountryInput' title={t('translation:recovery-country')}
                                value={testCountryCode}
                                onChange={(evt: any) => setTestCountryCode(evt.target.value)}
                                required
                            />

                            <hr />

                            {/* certificateIssuer */}
                            <FormGroupInput controlId='formcertificateIssuerInput' title={t('translation:certificateIssuer')} placeholder={t('translation:certificateIssuer')}
                                value={certificateIssuer}
                                onChange={(evt: any) => setCertificateIssuer(evt.target.value)}
                                required
                                maxLength={50}
                            />

                            {/* Date: Certificate Valid From - To */}
                            <Form.Group as={Row} controlId='formDateOfBirthInput' className='pb-3 mb-0'>
                                <Form.Label className='input-label ' column xs='5' sm='3'>{t('translation:cert-valid-from-to') + '*'}</Form.Label>

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
                                        maxDate={new Date()}
                                        minDate={dateValidTo ? new Date(dateValidTo.getTime() - expirationMilSeconds) : new Date(Date.now() - expirationMilSeconds)}
                                        openToDate={dateValidFrom ? dateValidFrom : new Date()}
                                        required
                                    />
                                    <span className='space-five'>{'-'}</span>
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
                                        maxDate={dateValidFrom ? new Date(dateValidFrom.getTime() + expirationMilSeconds) : new Date(Date.now() + expirationMilSeconds)}
                                        minDate={new Date()}
                                        openToDate={dateValidTo ? dateValidTo : new Date()}
                                        required
                                    />
                                </Col>
                            </Form.Group>

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

export default RecordRecoveryCertData;
