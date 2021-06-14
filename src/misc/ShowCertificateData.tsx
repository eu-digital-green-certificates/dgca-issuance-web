import { EUDCC1, RecoveryEntry, TestEntry, VaccinationEntry } from '../generated-files/dgc-combined-schema'
import i18n from 'i18next'
import { IValueSet } from '../api';
import moment from 'moment';
import utils from './utils';
import { useGetDiseaseAgents, useGetVaccineManufacturers, useGetVaccines, useGetVaccinMedicalData, useGetTestManufacturers, useGetTestResult, useGetTestType } from '../api';
import React from 'react';
import { Card } from 'react-bootstrap';

interface IDataEntry {
    title: string,
    entries: IEntry[]
}

interface IEntry {
    label: string,
    data: string
}


export const ShowCertificateData = (props: any) => {

    const defaultString = '';

    const vacMedsData = useGetVaccinMedicalData();
    const diseaseAgentsData = useGetDiseaseAgents();
    const vaccineManufacturers = useGetVaccineManufacturers();
    const vaccines = useGetVaccines();
    const testManufacturersValueSet = useGetTestManufacturers();
    const testResultValueSet = useGetTestResult();
    const testTypeValueSet = useGetTestType();

    const [eudgc, setEudgc] = React.useState<EUDCC1>();
    const [vaccinationSet, setVaccinationSet] = React.useState<VaccinationEntry>();
    const [testSet, setTestSet] = React.useState<TestEntry>();
    const [recoverySet, setRecoverySet] = React.useState<RecoveryEntry>();
    const [personalData, setPersonalData] = React.useState<IDataEntry[]>();
    const [certificationData, setCertificationData] = React.useState<IDataEntry[]>();


    React.useEffect(() => {
        if (props && props.eudgc) {
            setEudgc(props.eudgc);
        }
    }, [props])

    React.useEffect(() => {
        if (eudgc) {
            const vacc : [VaccinationEntry] = eudgc.v as [VaccinationEntry];
            const test : [TestEntry] = eudgc.t as [TestEntry];
            const recovery: [RecoveryEntry] = eudgc.r as [RecoveryEntry];
            
            setVaccinationSet(vacc ? vacc[0] : undefined);
            setTestSet(test ? test[0] : undefined);
            setRecoverySet(recovery ? recovery[0] : undefined);

            setPersonalData(getPersonalData());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eudgc])

    React.useEffect(() => {
        if (vaccinationSet && diseaseAgentsData && vaccineManufacturers && vaccines && testManufacturersValueSet) {
            setCertificationData(getVaccinationData())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vaccinationSet, diseaseAgentsData, vaccineManufacturers, vaccines, testManufacturersValueSet])

    React.useEffect(() => {
        if (testSet && diseaseAgentsData && testResultValueSet && testManufacturersValueSet) {
            setCertificationData(getTestData())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testSet, diseaseAgentsData, testResultValueSet, testManufacturersValueSet])

    React.useEffect(() => {
        if (recoverySet && diseaseAgentsData) {
            setCertificationData(getRecoveryData())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recoverySet, diseaseAgentsData])

    const getPersonalData = (): IDataEntry[] => {
        const personalData: IDataEntry[] = [
            {
                title: i18n.t('translation:personal-data'),
                entries: [
                    { label: i18n.t('translation:name'), data: eudgc?.nam?.fn || defaultString },
                    { label: i18n.t('translation:first-name'), data: eudgc?.nam?.gn || defaultString },
                    { label: i18n.t('translation:date-of-birth'), data: eudgc?.dob || defaultString },
                ]
            }
        ]
        return personalData;
    }

    const getVaccinationData = (): IDataEntry[] => {
        return ([
            {
                title: i18n.t('translation:vaccine-data'),
                entries: [
                    { label: i18n.t('translation:disease-agent'), data: getValueSetDisplay(vaccinationSet?.tg, diseaseAgentsData) || defaultString },
                    { label: i18n.t('translation:vaccine'), data: getValueSetDisplay(vaccinationSet?.vp, vaccines) || defaultString },
                    { label: i18n.t('translation:vac-medical-product'), data: getValueSetDisplay(vaccinationSet?.mp, vacMedsData) || defaultString },
                    { label: i18n.t('translation:vac-marketing-holder'), data: getValueSetDisplay(vaccinationSet?.ma, vaccineManufacturers) || defaultString },
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
        ]);
    }

    const getTestData = (): IDataEntry[] => {
        const testData: IDataEntry[] = [
            {
                title: i18n.t('translation:test-data'),
                entries: [
                    { label: i18n.t('translation:disease-agent'), data: getValueSetDisplay(testSet?.tg, diseaseAgentsData) || defaultString },
                    { label: i18n.t('translation:testType'), data: getValueSetDisplay(testSet?.tt, testTypeValueSet) || defaultString },
                    { label: i18n.t('translation:testName'), data: testSet?.nm || defaultString },
                    { label: i18n.t('translation:testManufacturers'), data: getValueSetDisplay(testSet?.ma, testManufacturersValueSet) || defaultString }
                ]
            },
            {
                title: i18n.t('translation:test-data'),
                entries: [
                    { label: i18n.t('translation:sampleDateTime'), data: convertDateToOutputFormat(testSet?.sc || '') },
                    // { label: i18n.t('translation:testDateTime'), data: convertDateToOutputFormat(testSet?.dr || defaultString) },
                    { label: i18n.t('translation:testResult'), data: getValueSetDisplay(testSet?.tr, testResultValueSet) || defaultString },
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

    const getRecoveryData = (): IDataEntry[] => {
        const recoveryData: IDataEntry[] = [
            {
                title: i18n.t('translation:recovery-data'),
                entries: [
                    { label: i18n.t('translation:disease-agent'), data: getValueSetDisplay(recoverySet?.tg, diseaseAgentsData) || defaultString },
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

    const getDataOutputElement = (dataSet: IDataEntry) => {
        return (
            <React.Fragment key={JSON.stringify(dataSet)}>
                <div className='pb-3'>
                    <Card.Text className='data-header-title jcc-xs-jcfs-sm' >{dataSet.title}</Card.Text>
                    {dataSet.entries.map((entry) => {
                        return entry.data
                            ? <Card.Text key={JSON.stringify(entry)} className='data-label jcc-xs-jcfs-sm mb-2' >{`${entry.label}: ${entry.data}`}</Card.Text>
                            : <React.Fragment key={JSON.stringify(entry)} />
                    })}
                </div>
            </React.Fragment>
        )
    }

    return (
        <>
            {personalData && personalData.map(dataset => getDataOutputElement(dataset))}
            {certificationData && certificationData.map(dataset => getDataOutputElement(dataset))}
        </>
    )
}

export default ShowCertificateData

export const convertDateToOutputFormat = (dateString?: string): string => dateString ? moment(dateString, 'YYYY-MM-DDTHH:mm:ss.sssZ').format(utils.momentDateTimeFormat).toString() : '';

// returns display value for key 
export const getValueSetDisplay = (key: string | undefined, valueSet: IValueSet | undefined): string | undefined => {
    let result = key;

    if (valueSet && key && valueSet[key]) {
        result = valueSet[key].display;
    }
    return result;
}