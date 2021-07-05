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
import useLocalStorage from '../misc/useLocalStorage';

import Spinner from './spinner/spinner.component';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { EUDCC1, VaccinationEntry } from '../generated-files/dgc-combined-schema';
import { Value_Sets } from '../misc/useValueSet';

import schema from '../generated-files/DGC.combined-schema.json';
import { Validator } from 'jsonschema';
import CardHeader from './modules/card-header.component';
import { PersonInputs, IPersonData, FormGroupInput, FormGroupValueSetSelect } from './modules/form-group.component';
import CardFooter from './modules/card-footer.component';
import moment from 'moment';
import AppContext from '../misc/appContext';

const validator = new Validator();

const RecordVaccinationCertData = (props: any) => {

    const context = React.useContext(AppContext);
    const { t } = useTranslation();

    const [isInit, setIsInit] = React.useState(false)

    const [person, setPerson] = React.useState<IPersonData>();

    const [disease, setDisease] = useLocalStorage('disease', '');
    const [vaccine, setVaccine] = useLocalStorage('vaccine', '');
    const [medicalProduct, setMedicalProduct] = useLocalStorage('medicalProduct', '');
    const [marketingHolder, setMarketingHolder] = useLocalStorage('marketingHolder', '');

    const [doseNumber, setDoseNumber] = React.useState<number>(0);
    const [totalDoseNumber, setTotalDoseNumber] = useLocalStorage('totalDoseNumber', 0);
    const [vacLastDate, setVacLastDate] = React.useState<Date>(new Date());
    const [certificateIssuer, setCertificateIssuer] = useLocalStorage('certificateIssuer', '');
    const [issuerCountryCode, setIssuerCountryCode] = useLocalStorage('issuerCountryCode', '');

    React.useEffect(() => {
        if (!props.eudgc || !props.eudgc.v || !props.eudgc.v[0]) {
            return;
        }

        const vac: VaccinationEntry = props.eudgc.v[0];

        setDisease(vac.tg);
        setVaccine(vac.vp);
        setMedicalProduct(vac.mp);
        setMarketingHolder(vac.ma);
        setDoseNumber(vac.dn);
        setTotalDoseNumber(vac.sd);
        setVacLastDate(new Date(vac.dt));
        setIssuerCountryCode(vac.co);
        setCertificateIssuer(vac.is);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.eudgc]);

    React.useEffect(() => {
        if (context.navigation && context.valueSets)
            setIsInit(true);
    }, [context.navigation, context.valueSets])


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
        context.navigation?.toLanding();
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {

        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;

        if (form.checkValidity() && person) {

            const vacc: VaccinationEntry = {
                tg: disease,
                vp: vaccine,
                mp: medicalProduct,
                ma: marketingHolder,
                dn: doseNumber,
                sd: totalDoseNumber,
                dt: vacLastDate!.toISOString().split('T')[0],
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
                v: [vacc]
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
                            <CardHeader title={t('translation:vaccination-cert')} />

                            {/*
                            content area with patient inputs and check box
                        */}
                            <Card.Body id='data-body'>

                                {/* name inputs */}
                                <PersonInputs eudgc={props.eudgc} onChange={setPerson} />

                                <hr />

                                {/* combobox disease */}
                                <FormGroupValueSetSelect controlId='formDiseaseInput' title={t('translation:disease-agent')} placeholder={t('translation:def-disease-agent')}
                                    value={disease}
                                    onChange={(evt: any) => setDisease(evt.target.value)}
                                    required
                                    valueSet={context.valueSets[Value_Sets.DiseaseAgent]}
                                />

                                {/* combobox vaccine */}
                                <FormGroupValueSetSelect controlId='formVaccineInput' title={t('translation:vaccine')}
                                    value={vaccine}
                                    onChange={(evt: any) => setVaccine(evt.target.value)}
                                    required
                                    valueSet={context.valueSets[Value_Sets.VaccineType]}
                                />

                                {/* combobox medicalProduct */}
                                <FormGroupValueSetSelect controlId='formMedicalProductInput' title={t('translation:vac-medical-product')}
                                    value={medicalProduct}
                                    onChange={(evt: any) => setMedicalProduct(evt.target.value)}
                                    required
                                    valueSet={context.valueSets[Value_Sets.Vaccines]}
                                />

                                {/* combobox marketingHolder */}
                                <FormGroupValueSetSelect controlId='formMarketingHolderInput' title={t('translation:vac-marketing-holder')}
                                    value={marketingHolder}
                                    onChange={(evt: any) => setMarketingHolder(evt.target.value)}
                                    required
                                    valueSet={context.valueSets[Value_Sets.VaccinesManufacturer]}
                                />

                                <hr />

                                {/* sequence */}
                                <FormGroupInput controlId='formDoseNumberInput' title={t('translation:sequence')} placeholder={t('translation:def-sequence')}
                                    value={doseNumber}
                                    onChange={(evt: any) => handleNumber(evt.target.value, setDoseNumber)}
                                    required min={1} max={9} maxLength={1}
                                    type='number'
                                />

                                {/* tot */}
                                <FormGroupInput controlId='formTotInput' title={t('translation:tot')} placeholder={t('translation:def-tot')}
                                    value={totalDoseNumber}
                                    onChange={(evt: any) => handleNumber(evt.target.value, setTotalDoseNumber)}
                                    required min={1} max={9} maxLength={1}
                                    type='number'
                                />

                                {/* vacLastDate */}
                                <Form.Group as={Row} controlId='formLastDateInput' className='pb-3 mb-0'>
                                    <Form.Label className='input-label ' column xs='5' sm='3'>{t('translation:vac-last-date') + '*'}</Form.Label>

                                    <Col xs='7' sm='9' className='d-flex'>
                                        <DatePicker
                                            selected={vacLastDate}
                                            onChange={handleVacLastDate}
                                            dateFormat='yyyy-MM-dd'
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
                                <FormGroupValueSetSelect controlId='formVacCountryInput' title={t('translation:vac-country')}
                                    value={issuerCountryCode}
                                    onChange={(evt: any) => setIssuerCountryCode(evt.target.value)}
                                    required
                                    valueSet={context.valueSets[Value_Sets.CountryCodes]}
                                />

                                {/* certificateIssuer */}
                                <FormGroupInput controlId='formcertificateIssuerInput' title={t('translation:certificateIssuer')}
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

export default RecordVaccinationCertData;
