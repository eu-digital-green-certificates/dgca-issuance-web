import React from "react";
import { Form, Row, Col } from "react-bootstrap";

import '../../i18n';
import { useTranslation } from 'react-i18next';
import utils from "../../misc/utils";

import DatePicker from "react-datepicker";
// import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IValueSet } from "../../api";

const iso3311a2 = require('iso-3166-1-alpha-2');


export interface IPersonData {
    givenName: string;
    familyName: string;
    standardisedGivenName: string;
    standardisedFamilyName: string;
    dateOfBirth: Date | undefined;
}

export const FormGroupInput = (props: any) => {

    return (!props ? <></> :
        <Form.Group as={Row} controlId={props.controlId} className='mb-1'>
            <Form.Label className='input-label' column xs='5' sm='3'>{props.title + (props.required ? '*' : '')}</Form.Label>

            <Col xs='7' sm='9' className='d-flex'>
                <Form.Control
                    className='qt-input'
                    value={props.value}
                    onChange={props.onChange}
                    placeholder={props.placeholder ? props.placeholder : props.title}
                    type={props.type ? props.type : 'text'}
                    required={props.required}
                    maxLength={props.maxLength}
                    min={props.min}
                    max={props.max}
                    pattern={props.pattern}
                />
            </Col>
        </Form.Group>
    )

}

export const FormGroupValueSetSelect = (props: any) => {

    const valueSet = props.valueSet();
    const [options, setOptions] = React.useState<JSX.Element[]>();

    React.useEffect(() => {
        if (valueSet) {
            const options = getOptionsForValueSet(valueSet)
            setOptions(options);
        }
    }, [valueSet])


    const getOptionsForValueSet = (valueSet: IValueSet): JSX.Element[] => {
        const result: JSX.Element[] = [];
        for (const key of Object.keys(valueSet)) {
            result.push(<option key={key} value={key}>{valueSet[key].display}</option>)
        }

        return result;
    }

    return (!(props && options) ? <></> :
        <Form.Group as={Row} controlId={props.controlId} className='mb-1'>
            <Form.Label className='input-label' column xs='5' sm='3'>{props.title + (props.required ? '*' : '')}</Form.Label>

            <Col xs='7' sm='9' className='d-flex'>
                <Form.Control as="select"
                    className={!props.value ? 'selection-placeholder qt-input' : 'qt-input'}
                    value={props.value}
                    onChange={props.onChange}
                    placeholder={props.placeholder ? props.placeholder : props.title}
                    required={props.required}
                    >
                    <option disabled key={0} value={''} >{props.placeholder ? props.placeholder : props.title}</option>
                    {options}
                </Form.Control>
            </Col>
        </Form.Group>
    )
}

export const FormGroupISOCountrySelect = (props: any) => {

    const [options, setOptions] = React.useState<JSX.Element[]>();

    React.useEffect(() => {
        const options: JSX.Element[] = [];
        const codes: string[] = iso3311a2.getCodes().sort();

        for (const code of codes) {
            options.push(<option key={code} value={code}>{code + " : " + iso3311a2.getCountry(code)}</option>)
        }

        setOptions(options);
    }, [])


    return (!(props && options) ? <></> :
        <Form.Group as={Row} controlId={props.controlId} className='mb-1'>
            <Form.Label className='input-label' column xs='5' sm='3'>{props.title + (props.required ? '*' : '')}</Form.Label>

            <Col xs='7' sm='9' className='d-flex'>
                <Form.Control as="select"
                    className={!props.value ? 'selection-placeholder qt-input' : 'qt-input'}
                    value={props.value}
                    onChange={props.onChange}
                    placeholder={props.placeholder ? props.placeholder : props.title}
                    required={props.required}
                    >
                    <option disabled key={0} value={''} >{props.placeholder ? props.placeholder : props.title}</option>
                    {options}
                </Form.Control>
            </Col>
        </Form.Group>
    )
}


export const PersonInputs = (props: any) => {

    const { t } = useTranslation();

    const [givenName, setGivenName] = React.useState<string>('');
    const [familyName, setFamilyName] = React.useState<string>('');

    const [standardisedGivenName, setStandardisedGivenName] = React.useState<string>('');
    const [standardisedFamilyName, setStandardisedFamilyName] = React.useState<string>('');

    const [dateOfBirth, setDateOfBirth] = React.useState<Date>();


    React.useEffect(() => {
        if (props && props.eudgc && props.eudgc.nam) {
            const names = props.eudgc.nam

            setFamilyName(names.fn!);
            setStandardisedFamilyName(names.fnt!);
            setGivenName(names.gn!);
            setStandardisedGivenName(names.gnt!);

            setDateOfBirth(new Date(props.eudgc.dob!));
        }
    }, [])

    React.useEffect(() => {
        const result: IPersonData = {
            givenName: givenName,
            familyName: familyName,
            standardisedGivenName: standardisedGivenName,
            standardisedFamilyName: standardisedFamilyName,
            dateOfBirth: dateOfBirth
        }

        props.onChange(result);

    }, [givenName, familyName, standardisedGivenName, standardisedFamilyName, dateOfBirth])


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

    return (
        <>
            {/* first name input */}
            <FormGroupInput controlId='formGivenNameInput' title={t('translation:first-name')}
                value={givenName}
                onChange={(evt: any) => setGivenName(evt.target.value)}
                required
                maxLength={50}
            />

            {/* name input */}
            <FormGroupInput controlId='formNameInput' title={t('translation:name')}
                value={familyName}
                onChange={(evt: any) => setFamilyName(evt.target.value)}
                required
                maxLength={50}
            />

            <hr />

            {/* standardised first name input */}
            <FormGroupInput controlId='formStandadisedGivenNameInput' title={t('translation:standardised-first-name')}
                value={standardisedGivenName}
                onChange={(evt: any) => handleStandardisedNameChanged(evt.target.value, setStandardisedGivenName)}
                required
                pattern={utils.pattern.standardisedName}
                maxLength={50}
            />

            {/*standardised name input */}
            <FormGroupInput controlId='formStandadisedNameInput' title={t('translation:standardised-name')}
                value={standardisedFamilyName}
                onChange={(evt: any) => handleStandardisedNameChanged(evt.target.value, setStandardisedFamilyName)}
                required
                pattern={utils.pattern.standardisedName}
                maxLength={50}
            />

            <hr />

            {/* date of birth input */}
            <Form.Group as={Row} controlId='formDateOfBirthInput' className='mb-1'>
                <Form.Label className='input-label txt-no-wrap' column xs='5' sm='3'>{t('translation:date-of-birth') + '*'}</Form.Label>

                <Col xs='7' sm='9' className='d-flex'>
                    <DatePicker
                        selected={dateOfBirth}
                        onChange={handleDateOfBirthChange}
                        dateFormat={utils.pickerDateFormat}
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
        </>
    )
}