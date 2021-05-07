import { Component } from 'react'
import { EUDGC, RecoveryEntry, TestEntry, VaccinationEntry } from '../generated-files/dgc-combined-schema'
import i18n from 'i18next'
import { IValueSet } from '../api';
import moment from 'moment';
import utils from './utils';

export interface IDataEntry {
    title: string,
    entries: IEntry[]
}

export interface IEntry {
    label: string,
    data: string
}

interface IProps {
    vacMedsData?: IValueSet | undefined,
    diseaseAgentsData?: IValueSet | undefined,
    vaccineManufacturers?: IValueSet | undefined,
    vaccines?: IValueSet | undefined,
    testManufacturersValueSet?: IValueSet | undefined,
    testResultValueSet?: IValueSet | undefined,
}

const defaultString = '';

// returns display value for key 
const getValueSetDisplay = (key: string | undefined, valueSet: IValueSet | undefined): string | undefined => {
    let result = key;

    if (valueSet && key && valueSet[key]) {
        result = valueSet[key].display;
    }
    return result;
}

const convertDateToOutputFormat = (dateString: string): string => dateString ? moment(dateString, 'YYYY-MM-DDTHH:mm:ss.sssZ').format(utils.momentDateTimeFormat).toString() : '';

export class ShowCertificateData extends Component {
    data: IProps = {}
    constructor(props: IProps) {
        super(props);
        this.data = props;
    }

    getPersonalData = (eudgc: EUDGC | undefined): IDataEntry[] => {
        const personalData: IDataEntry[] = [
            {
                title: i18n.t('translation:personal-data'),
                entries: [
                    { label: i18n.t('translation:name'), data: eudgc?.nam.gn || defaultString },
                    { label: i18n.t('translation:first-name'), data: eudgc?.nam.fn || defaultString },
                    { label: i18n.t('translation:date-of-birth'), data: eudgc?.dob || defaultString },
                ]
            }
        ]
        return personalData;
    }

    getVaccineData = (vaccinationSet: VaccinationEntry | undefined) => {
        const vaccinationData: IDataEntry[] = [
            {
                title: i18n.t('translation:vaccine-data'),
                entries: [
                    { label: i18n.t('translation:disease-agent'), data: getValueSetDisplay(vaccinationSet?.tg, this.data.diseaseAgentsData) || defaultString },
                    { label: i18n.t('translation:vaccine'), data: getValueSetDisplay(vaccinationSet?.vp, this.data.vaccines) || defaultString },
                    { label: i18n.t('translation:vac-medical-product'), data: getValueSetDisplay(vaccinationSet?.mp, this.data.vacMedsData) || defaultString },
                    { label: i18n.t('translation:vac-marketing-holder'), data: getValueSetDisplay(vaccinationSet?.ma, this.data.vaccineManufacturers) || defaultString },
                ]
            },
            {
                title: i18n.t('translation:vaccination-data'),
                entries: [
                    { label: i18n.t('translation:sequence'), data: String(vaccinationSet?.dn) || defaultString },
                    { label: i18n.t('translation:tot'), data: String(vaccinationSet?.sd) || defaultString },
                    { label: i18n.t('translation:vac-last-date'), data: vaccinationSet?.dt || defaultString },
                ]
            },
            {
                title: i18n.t('translation:certificate-data'),
                entries: [
                    { label: i18n.t('translation:vac-country'), data: vaccinationSet?.co || defaultString },
                    { label: i18n.t('translation:adm'), data: vaccinationSet?.is || defaultString }
                ]
            }
        ]
        return vaccinationData;
    }

    getTestData = (testSet: TestEntry | undefined): IDataEntry[] => {
        const testData: IDataEntry[] = [
            {
                title: i18n.t('translation:test-data'),
                entries: [
                    { label: i18n.t('translation:diseaseAgent'), data: getValueSetDisplay(testSet?.tg, this.data.diseaseAgentsData) || defaultString },
                    { label: i18n.t('translation:testType'), data: testSet?.tt || defaultString },
                    { label: i18n.t('translation:testName'), data: testSet?.nm || defaultString },
                    { label: i18n.t('translation:testManufacturers'), data: getValueSetDisplay(testSet?.ma, this.data.testManufacturersValueSet) || defaultString }
                ]
            },
            {
                title: i18n.t('translation:test-data'),
                entries: [
                    { label: i18n.t('translation:sampleDateTime'), data: convertDateToOutputFormat(testSet?.sc || '') },
                    { label: i18n.t('translation:testDateTime'), data: convertDateToOutputFormat(testSet?.dr || defaultString) },
                    { label: i18n.t('translation:testResult'), data: getValueSetDisplay(testSet?.tr, this.data.testResultValueSet) || defaultString },
                    { label: i18n.t('translation:testCenter'), data: testSet?.tc || defaultString }
                ]
            },
            {
                title: i18n.t('translation:certificate-data'),
                entries: [
                    { label: i18n.t('translation:vac-country'), data: testSet?.co || defaultString },
                    { label: i18n.t('translation:adm'), data: testSet?.is || defaultString }
                ]
            }
        ]
        return testData;
    }

    getRecoveryData = (recoverySet: RecoveryEntry | undefined): IDataEntry[] => {
        const recoveryData: IDataEntry[] = [
            {
                title: i18n.t('translation:recovery-data'),
                entries: [
                    { label: i18n.t('translation:dieaseAgent'), data: getValueSetDisplay(recoverySet?.tg, this.data.diseaseAgentsData) || defaultString },
                    { label: i18n.t('translation:first-positive-test-date'), data: recoverySet?.fr || defaultString },
                    { label: i18n.t('translation:recovery-country'), data: recoverySet?.co || defaultString },
                ]
            },
            {
                title: i18n.t('translation:certificate-data'),
                entries: [
                    { label: i18n.t('translation:adm'), data: recoverySet?.is || defaultString },
                    { label: i18n.t('translation:valid-from'), data: recoverySet?.df || defaultString },
                    { label: i18n.t('translation:valid-to'), data: recoverySet?.du || defaultString },
                ]
            }
        ]
        return recoveryData;
    }
}

export default ShowCertificateData