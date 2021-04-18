/*
 * Corona-Warn-App / cwa-quick-test-frontend
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

import sha256 from 'crypto-js/sha256';

import useNavigation from '../misc/navigation';
import Patient from '../misc/patient';
import CwaSpinner from './spinner/spinner.component';
import utils from '../misc/utils';
import { Sex } from '../misc/enum'
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import de from 'date-fns/locale/de';
import { useGetUuid } from '../api';

registerLocale('de', de)


const RecordPatientData = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    const [isInit, setIsInit] = React.useState(false)
    const [uuIdHash, setUuIdHash] = React.useState('');
    const [processId, setProcessId] = React.useState('');

    const [firstName, setFirstName] = React.useState('');
    const [name, setName] = React.useState('');
    const [zip, setZip] = React.useState('');
    const [city, setCity] = React.useState('');
    const [street, setStreet] = React.useState('');
    const [houseNumber, setHouseNumber] = React.useState('');
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [emailAddress, setEmailAddress] = React.useState('');
    const [dateOfBirth, setDateOfBirth] = React.useState<Date>();
    const [sex, setSex] = React.useState<Sex>();
    const [consent, setConsent] = React.useState(false);
    const [persDataInQR, setIncludePersData] = React.useState(false)
    const [privacyAgreement, setPrivacyAgreement] = React.useState(false)
    const [canGoNext, setCanGoNext] = React.useState(false)
    const [patient, setPatient] = React.useState<Patient>();
    const [validated, setValidated] = React.useState(false);


    const handleError = (error: any) => {
        let msg = '';

        if (error) {
            msg = error.message
        }
        props.setError({ error: error, message: msg, onCancel: navigation!.toLanding });
    }

    const uuid = useGetUuid(props?.patient?.uuId, undefined, handleError);

    // set values from props or new uuid on mount
    React.useEffect(() => {
        if (props.patient) {
            const p = props.patient;
            setFirstName(p.firstName);
            setName(p.name);
            setDateOfBirth(p.dateOfBirth);
            setConsent(p.processingConsens);
            setIncludePersData(p.includePersData);
            setPrivacyAgreement(p.privacyAgreement);
            setZip(p.zip);
            setCity(p.city);
            setStreet(p.street);
            setHouseNumber(p.houseNumber);
            setPhoneNumber(p.phoneNumber);
            setEmailAddress(p.emailAddress);
            setSex(p.sex);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // set hash from uuid
    React.useEffect(() => {
        if (uuid) {
            setUuIdHash(sha256(uuid).toString());
        }
    }, [uuid]);

    // set process id from hash
    React.useEffect(() => {
        setProcessId(utils.shortHash(uuIdHash));
    }, [uuIdHash]);

    // set ready state for spinner
    React.useEffect(() => {
        if (processId && navigation) {
            setTimeout(setIsInit, 200, true);
        }
    }, [processId, navigation]);

    // check completness on value change
    React.useEffect(() => {
        if (firstName.trim() !== ''
            && name.trim() !== ''
            && dateOfBirth !== undefined
            && sex !== undefined
            && zip !== ''
            && city !== ''
            && street !== ''
            && houseNumber !== ''
            && phoneNumber !== ''
            && emailAddress !== ''
            && consent
            && privacyAgreement
            && uuid) {
            setCanGoNext(true);
            setPatient({
                firstName: firstName,
                name: name,
                dateOfBirth: dateOfBirth,
                processingConsens: consent,
                uuId: uuid,
                includePersData: persDataInQR,
                privacyAgreement: privacyAgreement,
                sex: sex,
                zip: zip,
                city: city,
                street: street,
                houseNumber: houseNumber,
                phoneNumber: phoneNumber,
                emailAddress: emailAddress,
            });
        }
        else {
            setCanGoNext(false);
            setPatient(undefined);
        }
    }, [firstName, name, dateOfBirth, sex, zip, city, street, houseNumber, phoneNumber, emailAddress, consent, uuid, persDataInQR, privacyAgreement])


    // emit patient object to parent
    React.useEffect(() => {
        props.setPatient(patient);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patient])

    // on input chnage
    const handleFirstNameChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setFirstName(evt.currentTarget.value);
    }
    const handleNameChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setName(evt.currentTarget.value);
    }
    const handleZipChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setZip(evt.currentTarget.value);
    }
    const handleCityChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setCity(evt.currentTarget.value);
    }
    const handleStreetChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setStreet(evt.currentTarget.value);
    }
    const handleHouseNumberChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setHouseNumber(evt.currentTarget.value);
    }
    const handlePhoneNumberChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(evt.currentTarget.value);
    }
    const handleEmailAddressChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEmailAddress(evt.currentTarget.value);
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

        setDateOfBirth(date);
    }
    const handleConsentChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setConsent(evt.currentTarget.checked);
    }
    const handlePersDataInQRChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setIncludePersData(evt.currentTarget.checked);
    }
    const handlePrivacyAgreement = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setPrivacyAgreement(evt.currentTarget.checked);
    }

    const handleCancel = () => {
        props.setPatient(undefined);
        navigation!.toLanding();
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;

        event.preventDefault();
        event.stopPropagation();

        setValidated(true);

        if (form.checkValidity() && canGoNext) {
            setTimeout(navigation!.toShowRecordPatient, 200);
        }

    }

    return (
        !isInit ? <CwaSpinner /> :
            <>
                <Row id='process-row'>
                    <span className='font-weight-bold mr-2'>{t('translation:process')}</span>
                    <span>{processId}</span>
                </Row>
                <Card id='data-card'>

                    <Form onSubmit={handleSubmit} validated={validated}>

                        {/*
    header with title and id card query
    */}
                        <Card.Header id='data-header' className='pb-0'>
                            <Row>
                                <Col md='4'>
                                    <Card.Title className='m-md-0 jcc-xs-jcfs-md' as={'h2'} >{t('translation:record-data')}</Card.Title>
                                </Col>
                                <Col md='8' className='d-flex justify-content-center'>
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
                            <Form.Group as={Row} controlId='formNameInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:first-name')}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={firstName}
                                        onChange={handleFirstNameChange}
                                        placeholder={t('translation:first-name')}
                                        type='text'
                                        required
                                        maxLength={79}
                                    />
                                </Col>
                            </Form.Group>

                            {/* name input */}
                            <Form.Group as={Row} controlId='formNameInput' className='mb-1'>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:name')}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={name}
                                        onChange={handleNameChange}
                                        placeholder={t('translation:name')}
                                        type='text'
                                        required
                                        maxLength={79}
                                    />
                                </Col>
                            </Form.Group>

                            {/* date of birth input */}
                            <Form.Group as={Row} className='mb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:date-of-birth')}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <DatePicker
                                        selected={dateOfBirth}
                                        onChange={handleDateChange}
                                        locale='de'
                                        dateFormat='dd. MM. yyyy'
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

                            {/* sex input */}
                            <Row>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:sex')}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Row>
                                        <Form.Group as={Col} xs='12' sm='4' className='d-flex mb-0' controlId='sex-radio1'>
                                            <Form.Check className='d-flex align-self-center'>
                                                <Form.Check.Input
                                                    className='rdb-input'
                                                    type='radio'
                                                    name="sex-radios"
                                                    id="sex-radio1"
                                                    checked={sex === Sex.MALE}
                                                    onChange={() => setSex(Sex.MALE)}
                                                />
                                                <Form.Label className='rdb-label mb-0'>{t('translation:male')}</Form.Label>
                                            </Form.Check>
                                        </Form.Group>
                                        <Form.Group as={Col} xs='12' sm='4' className='d-flex mb-0' controlId='sex-radio2'>
                                            <Form.Check className='d-flex align-self-center'>
                                                <Form.Check.Input required
                                                    className='rdb-input'
                                                    type='radio'
                                                    name="sex-radios"
                                                    id="sex-radio2"
                                                    checked={sex === Sex.FEMALE}
                                                    onChange={() => setSex(Sex.FEMALE)}
                                                />
                                                <Form.Label className='rdb-label mb-0'>{t('translation:female')}</Form.Label>
                                            </Form.Check>
                                        </Form.Group>
                                        <Form.Group as={Col} xs='12' sm='4' className='d-flex mb-0' controlId='sex-radio3'>
                                            <Form.Check className='d-flex align-self-center'>
                                                <Form.Check.Input
                                                    className='rdb-input'
                                                    type='radio'
                                                    name="sex-radios"
                                                    id="sex-radio3"
                                                    checked={sex === Sex.DIVERSE}
                                                    onChange={() => setSex(Sex.DIVERSE)}
                                                />
                                                <Form.Label className='rdb-label mb-0'>{t('translation:diverse')}</Form.Label>
                                            </Form.Check>
                                        </Form.Group>
                                    </Row>
                                </Col>
                            </Row>

                            <hr />

                            {/* address input */}
                            <Row>
                                <Form.Label className='input-label' column xs='5' sm='3'>{t('translation:address')}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Row>

                                        <Form.Group as={Col} sm='4' className='mb-1' controlId='zipInput'>
                                            <Form.Control
                                                className='qt-input'
                                                value={zip}
                                                onChange={handleZipChange}
                                                placeholder={t('translation:zip')}
                                                type='text'
                                                required
                                                pattern={utils.pattern.zip}
                                            />

                                        </Form.Group>
                                        <Form.Group as={Col} sm='8' className='my-1 mt-sm-0' controlId='cityInput'>
                                            <Form.Control
                                                className='qt-input'
                                                value={city}
                                                onChange={handleCityChange}
                                                placeholder={t('translation:city')}
                                                type='text'
                                                required
                                                maxLength={255}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} sm='8' className='my-1 mb-sm-0' controlId='streetInput'>
                                            <Form.Control
                                                className='qt-input'
                                                value={street}
                                                onChange={handleStreetChange}
                                                placeholder={t('translation:street')}
                                                type='text'
                                                required
                                                maxLength={255}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} sm='4' className='mt-1 mb-sm-0' controlId='houseNumberInput'>
                                            <Form.Control
                                                className='qt-input'
                                                value={houseNumber}
                                                onChange={handleHouseNumberChange}
                                                placeholder={t('translation:house-number')}
                                                type='text'
                                                required
                                                maxLength={15}
                                            />
                                        </Form.Group>
                                    </Row>
                                </Col>
                            </Row>

                            <hr />

                            {/* phone number input */}
                            <Form.Group as={Row} controlId='formPhoneInput' className='mb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:phone-number')}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={phoneNumber}
                                        onChange={handlePhoneNumberChange}
                                        placeholder={t('translation:phone-number')}
                                        type='tel'
                                        required
                                        pattern={utils.pattern.tel}
                                        maxLength={79}
                                    />
                                </Col>
                            </Form.Group>

                            {/* email input */}
                            <Form.Group as={Row} controlId='formEmailInput' className='mb-1'>
                                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:email-address')}</Form.Label>

                                <Col xs='7' sm='9' className='d-flex'>
                                    <Form.Control
                                        className='qt-input'
                                        value={emailAddress}
                                        onChange={handleEmailAddressChange}
                                        placeholder={t('translation:email-address')}
                                        type='email'
                                        required
                                        pattern={utils.pattern.eMail}
                                        minLength={5}
                                        maxLength={255}
                                    />
                                </Col>
                            </Form.Group>

                            <hr />

                            {/* processing consent check box */}
                            <Form.Group as={Row} controlId='formConsentCheckbox'>
                                <Form.Label className='input-label' column sm='10' >{t('translation:processing-consent')}</Form.Label>

                                <Col sm='2' className='jcc-xs-jcfs-md'>
                                    <Form.Check className='align-self-center'>
                                        <Form.Check.Input
                                            className='ckb-input'
                                            onChange={handleConsentChange}
                                            type='checkbox'
                                            checked={consent}
                                            required
                                        />
                                    </Form.Check>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId='formKeepPrivateCheckbox'>
                                <Form.Label className='input-label' column sm='10' >{t('translation:patientdata-exclude')}</Form.Label>

                                <Col sm='2' className='jcc-xs-jcfs-md'>
                                    <Form.Check className='align-self-center'>
                                        <Form.Check.Input
                                            className='ckb-input'
                                            onChange={handlePersDataInQRChange}
                                            type='checkbox'
                                            checked={persDataInQR}
                                        />
                                    </Form.Check>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId='formDataPrivacyCheckbox'>
                                <Form.Label className='input-label' column sm='10' >{t('translation:data-privacy-approve') + '*'}</Form.Label>

                                <Col sm='2' className='jcc-xs-jcfs-md'>
                                    <Form.Check className='align-self-center'>
                                        <Form.Check.Input
                                            className='ckb-input'
                                            onChange={handlePrivacyAgreement}
                                            type='checkbox'
                                            checked={privacyAgreement}
                                            required
                                        />
                                    </Form.Check>
                                </Col>
                            </Form.Group>
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
                                    // onClick={navigation.toShowRecordPatient}
                                    // disabled={!canGoNext}
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

export default RecordPatientData;