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

import i18n from '../i18n';
import { useTranslation } from 'react-i18next';

import { jsPDF } from "jspdf";

import logo from '../assets/images/eu_flag_neu.png';
import card_seperator from '../assets/images/certificate.png';
import flag_seperator from '../assets/images/flag_seperator.png';
import yellow_seperator from '../assets/images/yellow_seperator.png';
import folding_instruction from '../assets/images/folding-instruction.png';

import { EUDCC1, RecoveryEntry, TestEntry, VaccinationEntry } from '../generated-files/dgc-combined-schema';
import {
    useGetDiseaseAgents, useGetVaccineManufacturers, useGetVaccines,
    useGetVaccinMedicalData, useGetTestManufacturers, useGetTestResult, useGetTestType
} from '../api';
import { getValueSetDisplay, convertDateToOutputFormat } from '../misc/ShowCertificateData';
// import pdfParams from '../pdf-settings.json';

require('../assets/SCSS/fonts/arial-normal.js');
require('../assets/SCSS/fonts/arial-bold.js');
require('../assets/SCSS/fonts/arial-italic.js');
require('../assets/SCSS/fonts/arial-bolditalic.js');

const mm2point = (mm: number): number => {
    return mm * 2.83465;
}

interface IPageParameter {
    a6width: number,
    a6height: number,

    marginTop: number,
    marginBottom: number,
    marginLeft: number,
    marginRight: number,

    paddingLeft: number,
    paddingInnerLeft: number,
    paddingRight: number,
    paddingTop: number,
    paddingInnerTop: number,
    paddingBottom: number,

    lineHeight: number,
    fontSize: number,
    fontSize8: number,
    fontSize9: number,
    fontSize10: number,
    fontSize11: number,
    fontSize12: number,
    fontSize14: number,
    fontSize16: number,
    lineHeight9: number,
    lineHeight10: number,
    lineHeight11: number,
    lineHeight12: number,
    lineHeight14: number,
    lineHeight16: number,
    headerLineHeight: number,
    headerFontSize: number,
    smallHeaderLineHeight: number,
    smallHeaderFontSize: number,
    space: number
}

const usePdfGenerator = (qrCodeCanvasElementProp: any, eudccProp: EUDCC1 | undefined, onIsInit: (isInit: boolean) => void, onIsReady: (isReady: boolean) => void) => {
    const { t } = useTranslation();
    const french = i18n.getDataByLanguage('fr');

    const vacMedsData = useGetVaccinMedicalData();
    const diseaseAgentsData = useGetDiseaseAgents();
    const vaccineManufacturers = useGetVaccineManufacturers();
    const vaccines = useGetVaccines();
    const testManufacturersValueSet = useGetTestManufacturers();
    const testResultValueSet = useGetTestResult();
    const testTypeValueSet = useGetTestType();

    //A4 210 x 297 mm or 2480 x 3508 pixels or 595 × 842 points
    //A6 105 x 74 mm or 1240 x 1748 pixels or 298 × 420 points

    const params: IPageParameter = {
        a6width: 298,
        a6height: 420,

        marginTop: mm2point(15),
        marginBottom: mm2point(15),
        marginLeft: mm2point(15),
        marginRight: mm2point(15),

        paddingLeft: mm2point(10),
        paddingInnerLeft: mm2point(3),
        paddingRight: mm2point(10),
        paddingTop: mm2point(10),
        paddingInnerTop: mm2point(4),
        paddingBottom: mm2point(10),

        lineHeight: 14,
        fontSize: 11,
        fontSize8: 8,
        fontSize9: 9,
        fontSize10: 10,
        fontSize11: 11,
        fontSize12: 12,
        fontSize14: 14,
        fontSize16: 16,
        lineHeight9: 9,
        lineHeight10: 10,
        lineHeight11: 11,
        lineHeight12: 12,
        lineHeight14: 14,
        lineHeight16: 16,
        headerLineHeight: 21,
        headerFontSize: 21,
        smallHeaderLineHeight: 17,
        smallHeaderFontSize: 17,
        space: 2
    }

    const lblLength = params.a6width - params.paddingInnerLeft - params.paddingRight;
    // const pageMiddle = params.a6width / 2;

    const [isInit, setIsInit] = React.useState(false);
    const [isReady, setIsReady] = React.useState(false);

    const [firstPageIsReady, setFirstPageIsReady] = React.useState(false);
    const [secondPageIsReady, setSecondPageIsReady] = React.useState(false);
    const [thirdPageIsReady, setThirdPageIsReady] = React.useState(false);
    const [fourthPageIsReady, setFourthPageIsReady] = React.useState(false);

    const [pdf, setPdf] = React.useState<jsPDF>();

    const [eudcc, setEudcc] = React.useState<EUDCC1>();
    const [vaccinationSet, setVaccinationSet] = React.useState<VaccinationEntry>();
    const [testSet, setTestSet] = React.useState<TestEntry>();
    const [recoverySet, setRecoverySet] = React.useState<RecoveryEntry>();
    const [ci, setCi] = React.useState<string>();
    const [co, setCo] = React.useState<string>();
    const [qrCodeCanvasElement, setQrCodeCanvasElement] = React.useState<any>();

    // on mount generate pdf
    React.useEffect(() => {
        const _pdf = new jsPDF("p", "pt", "a4", true);

        _pdf.setFont('arial', 'normal');
        _pdf.setLineHeightFactor(1);
        _pdf.addPage();

        setPdf(_pdf);
    }, [])

    // on pdf generated set all static data
    React.useEffect(() => {
        if (pdf) {
            printDottedLine();
            prepareThirdPage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdf])

    // set isInit true if all ValueSets are loaded and pdf is initialized
    React.useEffect(() => {
        if (pdf && diseaseAgentsData && vaccines && vaccineManufacturers && vacMedsData && testResultValueSet && testManufacturersValueSet) {
            setIsInit(true);
        }
    }, [pdf, diseaseAgentsData, vaccines, vaccineManufacturers, vacMedsData, testResultValueSet, testManufacturersValueSet])

    React.useEffect(() => {
        if (onIsInit) {
            onIsInit(isInit);
        }
    }, [isInit, onIsInit])

    React.useEffect(() => {
        if (onIsReady) {
            onIsReady(isReady);
        }
    }, [isReady, onIsReady])

    React.useEffect(() => {
        if (firstPageIsReady && secondPageIsReady && thirdPageIsReady && fourthPageIsReady) {
            setIsReady(true);
        }
    }, [firstPageIsReady, secondPageIsReady, thirdPageIsReady, fourthPageIsReady])

    // on receiving eudcc obj set specific ValueSet
    React.useEffect(() => {
        if (eudccProp) {
            setEudcc(eudccProp);

            const vacc : [VaccinationEntry] = eudccProp.v as [VaccinationEntry];
            const test : [TestEntry] = eudccProp.t as [TestEntry];
            const recovery: [RecoveryEntry] = eudccProp.r as [RecoveryEntry];

            setVaccinationSet(vacc ? vacc[0] : undefined);
            setTestSet(test ? test[0] : undefined);
            setRecoverySet(recovery ? recovery[0] : undefined);
        }
    }, [eudccProp])

    // set qrcode element from props
    React.useEffect(() => {
        if (qrCodeCanvasElementProp) {
            setQrCodeCanvasElement(qrCodeCanvasElementProp);
        }
    }, [qrCodeCanvasElementProp])

    // set fourth page for vaccination
    React.useEffect(() => {
        if (vaccinationSet && isInit) {
            setCi(vaccinationSet.ci);
            setCo(vaccinationSet.co);
            prepareFourthPageVaccination();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vaccinationSet, isInit])

    // set fourth page for test
    React.useEffect(() => {
        if (testSet && isInit) {
            setCi(testSet.ci);
            setCo(testSet.co);
            prepareFourthPageTest();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testSet, isInit])

    // set fourth page for recovery
    React.useEffect(() => {
        if (recoverySet && isInit) {
            setCi(recoverySet.ci);
            setCo(recoverySet.co);
            prepareFourthPageRecovery();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recoverySet, isInit])

    React.useEffect(() => {
        if (qrCodeCanvasElement && ci && isInit && eudcc) {
            prepareSecondPage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrCodeCanvasElement, ci, isInit, eudcc]);

    React.useEffect(() => {
        if (co && isInit && eudcc) {
            prepareFirstPage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [co, isInit, eudcc]);

    const printDottedLine = () => {
        if (pdf) {
            pdf.setPage(1);
            let curX = 0;
            let curY = 0;
            let deltaX = mm2point(10);
            let deltaY = mm2point(10);

            pdf.line(curX, params.a6height, curX + deltaX, params.a6height);
            pdf.line(params.a6width * 2 - curX, params.a6height, params.a6width * 2 - curX - deltaX, params.a6height);

            pdf.line(params.a6width, curY, params.a6width, curY + deltaY);
            pdf.line(params.a6width, params.a6height * 2 - deltaY, params.a6width, params.a6height * 2);

            pdf.line(params.a6width, params.a6height - deltaY / 2, params.a6width, params.a6height + deltaY / 2);
            pdf.line(params.a6width - deltaX / 2, params.a6height, params.a6width + deltaX / 2, params.a6height);

            // for (let page = 1; page < 3; page++) {
            //     pdf.setPage(page)
            //     let curX = 0 + params.marginLeft;
            //     let curY = params.a6height;
            //     let xTo = params.a6width * 2 - params.marginRight;
            //     let deltaX = 3;
            //     let deltaY = 3;
            //     while (curX <= xTo) {
            //         pdf.line(curX, curY, curX + deltaX, curY);
            //         curX += 2 * deltaX;
            //     }

            //     curX = params.a6width;
            //     curY = 0 + params.marginTop;
            //     let yTo = params.a6height * 2 - params.marginBottom;
            //     while (curY <= yTo) {
            //         pdf.line(curX, curY, curX, curY + deltaY);
            //         curY += 2 * deltaY;
            //     }
            // }
        }
    }

    const prepareFirstPage = () => {
        if (pdf && french && eudcc && co) {
            for (let page = 1; page < 3; page++) {
                let x = 0;
                let y = 0;

                pdf.setPage(page);
                if (page === 1) {
                    x = params.a6width;
                    y = params.a6height;
                }

                x += params.a6width / 2;
                y += mm2point(40);

                setTextColorBlue();
                pdf.setFont('arial', 'bold');
                pdf.setFontSize(params.headerFontSize);

                let header = t('translation:pdfGreenCertificate');
                header = pdf.splitTextToSize(header, lblLength);
                pdf.text(header, x, y, { align: 'center', maxWidth: lblLength });

                let imgWidth = 219.75;
                let imgHeight = 6.75;
                if (page === 1) {
                    x = params.a6width + (params.a6width - imgWidth) / 2;
                } else {
                    x = (params.a6width - imgWidth) / 2;
                }
                y += params.headerLineHeight * header.length - mm2point(4);
                pdf.addImage(yellow_seperator, x, y, imgWidth, imgHeight);

                if (page === 1) {
                    x = params.a6width + params.a6width / 2;
                } else {
                    x = params.a6width / 2;
                }

                y += params.headerLineHeight + mm2point(4);

                header = french.translation.pdfGreenCertificate;
                header = pdf.splitTextToSize(header, lblLength);
                pdf.text(header, x, y, { align: 'center', maxWidth: lblLength });

                let logoWidth = 82.495;
                let logoHeight = 59.5;
                if (page === 1) {
                    x = params.a6width + (params.a6width - logoWidth) / 2;
                } else {
                    x = (params.a6width - logoWidth) / 2;
                }
                y += params.headerLineHeight + mm2point(10);
                pdf.addImage(logo, 'png', x, y, logoWidth, logoHeight);
                x += logoWidth / 2;
                y += logoHeight / 2 + params.lineHeight16 / 2 - 3;
                setTextColorWhite();
                pdf.setFontSize(params.fontSize16);
                //TODO: country
                // if(pdfParams.issuer_country_code) {
                //     pdf.text(pdfParams.issuer_country_code, x, y, { align: 'center' });
                // }

                pdf.text(co, x, y, { align: 'center' });
                setTextColorBlack();
                pdf.setFont('arial', 'normal');
            }

            setFirstPageIsReady(true);
        }
    }

    const prepareSecondPage = () => {
        if (pdf && eudcc && ci && qrCodeCanvasElement && french) {

            const space = mm2point(5);

            const img = (qrCodeCanvasElement as HTMLCanvasElement).toDataURL("image/png,base64");
            const canvasWidth = mm2point(60);

            for (let page = 1; page < 3; page++) {
                let x = 0;
                let y = 0;

                pdf.setPage(page);
                if (page === 1) {
                    y = params.a6height - space;
                } else {
                    x = params.a6width;
                }
                x += (params.a6width - canvasWidth) / 2;
                y += params.paddingTop;
                pdf.addImage(img, 'png', x, y, canvasWidth, canvasWidth);

                const imageWidth = 221.25;
                const imageHeight = 52.5;
                y += canvasWidth + mm2point(1);
                if (page === 1) {
                    x = (params.a6width - imageWidth) / 2;
                } else {
                    x = params.a6width + (params.a6width - imageWidth) / 2;
                }
                pdf.addImage(card_seperator, x, y, imageWidth, imageHeight);

                //For the labels on the left side
                if (page === 1) {
                    x = params.paddingLeft;
                } else {
                    x = params.a6width + params.paddingInnerLeft;
                }

                y += imageHeight + space;
                pdf.setFontSize(params.fontSize11);

                y = printHorizontalBlockPerson(x, y,
                    t('translation:pdfSurname'),
                    french.translation.pdfSurname,
                    (eudcc!.nam!.fnt + ' ') + (eudcc!.nam!.gnt ? eudcc!.nam!.gnt : ''));

                y = printHorizontalBlockPerson(x, y,
                    t('translation:pdfDateOfBirth'),
                    french.translation.pdfDateOfBirth,
                    eudcc.dob);

                y = printHorizontalBlockPerson(x, y,
                    t('translation:pdfCi'),
                    french.translation.pdfCi,
                    ci);
            }

            setSecondPageIsReady(true);
        }
    }

    const prepareThirdPage = () => {
        if (pdf) {


            for (let page = 1; page < 3; page++) {
                pdf.setPage(page);
                if (page === 1) {
                    prepareThirdPageRotated();
                } else {

                    let lblLength = params.a6width - params.paddingRight - params.paddingRight - mm2point(14);
                    let space = mm2point(3);
                    let imageWidth = 225.75;
                    let imageHeight = 54.75;
                    let y = params.a6height + mm2point(4);
                    let x = (params.a6width - imageWidth) / 2;

                    pdf.addImage(flag_seperator, x, y, imageWidth, imageHeight);

                    x = params.a6width / 2;
                    y += imageHeight + params.fontSize12 + mm2point(2);

                    setTextColorBlue();
                    pdf.setFontSize(params.fontSize14);
                    pdf.setFont('arial', 'bold');
                    let header = t('translation:pdfMemberPlaceholder');
                    header = pdf.splitTextToSize(header, lblLength);
                    pdf.text(header, x, y, { align: 'center', maxWidth: lblLength });
                    pdf.setFont('arial', 'normal');

                    y += mm2point(40) + params.lineHeight9;
                    setTextColorBlack();
                    pdf.setFont('arial', 'normal');
                    pdf.setFontSize(params.fontSize8);
                    let infotext = t('translation:pdfInfoText');
                    infotext = pdf.splitTextToSize(infotext, lblLength);
                    pdf.text(infotext, x, y, { align: 'center', maxWidth: lblLength });

                    y += mm2point(2) + params.lineHeight9 * infotext.length;
                    infotext = t('translation:pdfRelevantInformation');
                    infotext = pdf.splitTextToSize(infotext, lblLength);
                    pdf.text(infotext, x, y, { align: 'center', maxWidth: lblLength });

                    y += space + params.lineHeight9 * infotext.length;
                    setTextColorBlue();
                    pdf.setFontSize(params.fontSize10);
                    infotext = t('translation:pdfInfoURL');
                    infotext = pdf.splitTextToSize(infotext, lblLength);
                    pdf.text(infotext, x, y, { align: 'center', maxWidth: lblLength });

                    setTextColorBlack();
                    pdf.setFont('arial', 'normal');
                }
            }

            setThirdPageIsReady(true);
        }
    }

    /**
     * Rotated Third page is the new second page on the A4.
     */
    const prepareThirdPageRotated = () => {
        if (pdf) {
            let lblLength = params.a6width - params.paddingRight - params.paddingRight - mm2point(14);
            let imageWidth = 225.75;
            let imageHeight = 54.75;
            let y = params.a6height - imageHeight * 2 - mm2point(4);
            let x = imageWidth + (params.a6width - imageWidth) / 2 + params.a6width;

            pdf.addImage(flag_seperator, x, y, imageWidth, imageHeight, undefined, undefined, 180);

            x = params.a6width + params.a6width / 2;
            y += imageHeight - params.lineHeight12 - mm2point(2);

            setTextColorBlue();
            pdf.setFontSize(params.fontSize14);
            pdf.setFont('arial', 'bold');
            let header = t('translation:pdfMemberPlaceholder');
            header = pdf.splitTextToSize(header, lblLength);
            x = params.a6width * 2;
            y = centerSplittedText(header, x, y);

            y -= mm2point(40);
            setTextColorBlack();
            pdf.setFont('arial', 'normal');
            pdf.setFontSize(params.fontSize8);
            let infotext = t('translation:pdfInfoText');
            infotext = pdf.splitTextToSize(infotext, lblLength);
            y = centerSplittedText(infotext, x, y);

            y -= mm2point(2);
            infotext = t('translation:pdfRelevantInformation');
            infotext = pdf.splitTextToSize(infotext, lblLength);
            y = centerSplittedText(infotext, x, y);

            setTextColorBlue();
            pdf.setFontSize(params.fontSize10);
            infotext = t('translation:pdfInfoURL');
            infotext = pdf.splitTextToSize(infotext, lblLength);
            y = centerSplittedText(infotext, x, y);

            pdf.line(params.a6width + params.paddingLeft, y + 4, params.a6width * 2 - params.paddingRight, y + 4);

            y -= params.lineHeight9;
            setTextColorBlack();
            pdf.setFontSize(params.fontSize9);
            pdf.setFont('arial', 'italic');
            infotext = t('translation:pdfFoldingInstruction');
            infotext = pdf.splitTextToSize(infotext, lblLength);
            y = centerSplittedText(infotext, x, y);

            imageWidth = 173.25;
            imageHeight = 51;
            y -= imageHeight - mm2point(2);
            x = (params.a6width - imageWidth) / 2 + params.a6width;
            pdf.addImage(folding_instruction, x, y, imageWidth, imageHeight);

            setTextColorBlack();
            pdf.setFont('arial', 'normal');
        }
    }

    const prepareFourthPageVaccination = () => {
        if (pdf && vaccinationSet && french) {

            for (let page = 1; page < 3; page++) {

                pdf.setPage(page);

                if (page === 1) {
                    prepareFourthPageVaccinationRotated();
                } else {

                    const lineHeight = params.lineHeight10;

                    let y = printCertificateHeader(t('translation:pdfHeaderVaccination'), french.translation.pdfHeaderVaccination, params.paddingTop);
                    y += params.space;

                    //For the labels on the left side
                    let xLeft = params.a6width + params.paddingInnerLeft;

                    pdf.setFontSize(params.fontSize10);

                    y = printVerticalBlock(xLeft, y,
                        t('translation:pdfDisease'),
                        french.translation.pdfDisease,
                        getValueSetDisplay(vaccinationSet.tg, diseaseAgentsData),
                        lineHeight, true);

                    y = printVerticalBlock(xLeft, y,
                        t('translation:pdfVaccineProphylaxis'),
                        french.translation.pdfVaccineProphylaxis,
                        getValueSetDisplay(vaccinationSet.vp, vaccines),
                        lineHeight, true);

                    y = printVerticalBlock(xLeft, y,
                        t('translation:pdfVaccineMedicalProduct'),
                        french.translation.pdfVaccineMedicalProduct,
                        getValueSetDisplay(vaccinationSet.mp, vacMedsData),
                        lineHeight, true);

                    y = printVerticalBlock(xLeft, y,
                        t('translation:pdfVaccineManufacturer'),
                        french.translation.pdfVaccineManufacturer,
                        getValueSetDisplay(vaccinationSet.ma, vaccineManufacturers),
                        lineHeight, true);

                    y = printVerticalBlock(xLeft, y,
                        t('translation:pdfNumberOfDoses'),
                        french.translation.pdfNumberOfDoses,
                        vaccinationSet.dn.toString() + ' / ' + vaccinationSet.sd.toString(),
                        lineHeight, true);

                    y = printVerticalBlock(xLeft, y,
                        t('translation:pdfDateOfVaccination'),
                        french.translation.pdfDateOfVaccination,
                        vaccinationSet.dt,
                        lineHeight, true);

                    y = printVerticalBlock(xLeft, y,
                        t('translation:pdfMemberStateOfVaccination'),
                        french.translation.pdfMemberStateOfVaccination,
                        vaccinationSet.co,
                        lineHeight, true);

                    printVerticalBlock(xLeft, y,
                        t('translation:pdfCertificateIssuer'),
                        french.translation.pdfCertificateIssuer,
                        vaccinationSet.is,
                        lineHeight, true);
                }

                setFourthPageIsReady(true);
            }
        }
    }

    const prepareFourthPageVaccinationRotated = () => {
        if (pdf && vaccinationSet && french) {
            const lineHeight = params.lineHeight10;

            let y = printCertificateHeaderRotated(t('translation:pdfHeaderVaccination'), french.translation.pdfHeaderVaccination, params.paddingTop);
            y += params.space;

            //For the labels on the left side
            let xLeft = params.a6width - params.paddingInnerLeft;

            pdf.setFontSize(params.fontSize10);

            y = printVerticalBlockRotated(xLeft, y,
                t('translation:pdfDisease'),
                french.translation.pdfDisease,
                getValueSetDisplay(vaccinationSet.tg, diseaseAgentsData),
                lineHeight, true);

            y = printVerticalBlockRotated(xLeft, y,
                t('translation:pdfVaccineProphylaxis'),
                french.translation.pdfVaccineProphylaxis,
                getValueSetDisplay(vaccinationSet.vp, vaccines),
                lineHeight, true);

            y = printVerticalBlockRotated(xLeft, y,
                t('translation:pdfVaccineMedicalProduct'),
                french.translation.pdfVaccineMedicalProduct,
                getValueSetDisplay(vaccinationSet.mp, vacMedsData),
                lineHeight, true);

            y = printVerticalBlockRotated(xLeft, y,
                t('translation:pdfVaccineManufacturer'),
                french.translation.pdfVaccineManufacturer,
                getValueSetDisplay(vaccinationSet.ma, vaccineManufacturers),
                lineHeight, true);

            y = printVerticalBlockRotated(xLeft, y,
                t('translation:pdfNumberOfDoses'),
                french.translation.pdfNumberOfDoses,
                vaccinationSet.dn.toString() + ' / ' + vaccinationSet.sd.toString(),
                lineHeight, true);

            y = printVerticalBlockRotated(xLeft, y,
                t('translation:pdfDateOfVaccination'),
                french.translation.pdfDateOfVaccination,
                vaccinationSet.dt,
                lineHeight, true);

            y = printVerticalBlockRotated(xLeft, y,
                t('translation:pdfMemberStateOfVaccination'),
                french.translation.pdfMemberStateOfVaccination,
                vaccinationSet.co,
                lineHeight, true);

            printVerticalBlockRotated(xLeft, y,
                t('translation:pdfCertificateIssuer'),
                french.translation.pdfCertificateIssuer,
                vaccinationSet.is,
                lineHeight, true);
        }
    }

    const prepareFourthPageTest = () => {
        if (pdf && testSet && french) {
            for (let page = 1; page < 3; page++) {

                pdf.setPage(page);

                if (page === 1) {
                    prepareFourthPageTestRotated();
                } else {

                    const lineHeight = params.lineHeight10;

                    let y = printCertificateHeader(t('translation:pdfHeaderTest'), french.translation.pdfHeaderTest);

                    let x = params.a6width + params.paddingInnerLeft;

                    pdf.setFontSize(params.fontSize9);

                    y = printVerticalBlock(x, y,
                        t('translation:pdfDisease'),
                        french.translation.pdfDisease,
                        getValueSetDisplay(testSet.tg, diseaseAgentsData),
                        lineHeight, true);

                    y = printVerticalBlock(x, y,
                        t('translation:pdfTypeOfTest'),
                        french.translation.pdfTypeOfTest,
                        getValueSetDisplay(testSet.tt, testTypeValueSet),
                        lineHeight, true);

                    y = printVerticalBlock(x, y,
                        t('translation:pdfTestName'),
                        french.translation.pdfTestName,
                        testSet.nm,
                        lineHeight, true);

                    y = printVerticalBlock(x, y,
                        t('translation:pdfTestManufacturer'),
                        french.translation.pdfTestManufacturer,
                        getValueSetDisplay(testSet.ma, testManufacturersValueSet),
                        lineHeight, true);

                    y = printVerticalBlock(x, y,
                        t('translation:pdfDateSampleCollection'),
                        french.translation.pdfDateSampleCollection,
                        convertDateToOutputFormat(testSet.sc),
                        lineHeight, true);

                    y = printVerticalBlock(x, y,
                        t('translation:pdfTestResult'),
                        french.translation.pdfTestResult,
                        getValueSetDisplay(testSet.tr, testResultValueSet),
                        lineHeight, true);

                    y = printVerticalBlock(x, y,
                        t('translation:pdfTestingCentre'),
                        french.translation.pdfTestingCentre,
                        testSet.tc,
                        lineHeight, true);

                    y = printVerticalBlock(x, y,
                        t('translation:pdfStateOfVaccination'),
                        french.translation.pdfStateOfVaccination,
                        testSet.co,
                        lineHeight, true);

                    printVerticalBlock(x, y,
                        t('translation:pdfCertificateIssuer'),
                        french.translation.pdfCertificateIssuer,
                        testSet.is,
                        lineHeight, true);

                    setFourthPageIsReady(true);
                }
            }
        }

    }

    const prepareFourthPageTestRotated = () => {
        if (pdf && testSet && french) {
            const lineHeight = params.lineHeight10;

            let y = printCertificateHeaderRotated(t('translation:pdfHeaderTest'), french.translation.pdfHeaderTest);

            let x = params.a6width - params.paddingInnerLeft;

            pdf.setFontSize(params.fontSize9);

            y = printVerticalBlockRotated(x, y,
                t('translation:pdfDisease'),
                french.translation.pdfDisease,
                getValueSetDisplay(testSet.tg, diseaseAgentsData),
                lineHeight, true);

            y = printVerticalBlockRotated(x, y,
                t('translation:pdfTypeOfTest'),
                french.translation.pdfTypeOfTest,
                getValueSetDisplay(testSet.tt, testTypeValueSet),
                lineHeight, true);

            y = printVerticalBlockRotated(x, y,
                t('translation:pdfTestName'),
                french.translation.pdfTestName,
                testSet.nm ? testSet.nm : ' ',
                lineHeight, true);

            y = printVerticalBlockRotated(x, y,
                t('translation:pdfTestManufacturer'),
                french.translation.pdfTestManufacturer,
                getValueSetDisplay(testSet.ma, testManufacturersValueSet),
                lineHeight, true);

            y = printVerticalBlockRotated(x, y,
                t('translation:pdfDateSampleCollection'),
                french.translation.pdfDateSampleCollection,
                convertDateToOutputFormat(testSet.sc),
                lineHeight, true);

            y = printVerticalBlockRotated(x, y,
                t('translation:pdfTestResult'),
                french.translation.pdfTestResult,
                getValueSetDisplay(testSet.tr, testResultValueSet),
                lineHeight, true);

            y = printVerticalBlockRotated(x, y,
                t('translation:pdfTestingCentre'),
                french.translation.pdfTestingCentre,
                testSet.tc,
                lineHeight, true);

            y = printVerticalBlockRotated(x, y,
                t('translation:pdfStateOfVaccination'),
                french.translation.pdfStateOfVaccination,
                testSet.co,
                lineHeight, true);

            printVerticalBlockRotated(x, y,
                t('translation:pdfCertificateIssuer'),
                french.translation.pdfCertificateIssuer,
                testSet.is,
                lineHeight, true);
        }
    }

    const prepareFourthPageRecovery = () => {
        if (pdf && recoverySet && french) {

            for (let page = 1; page < 3; page++) {

                pdf.setPage(page);

                if (page === 1) {
                    prepareFourthPageRecoveryRotated();
                }
                else {
                    const lineHeight = params.lineHeight10;

                    let y = printCertificateHeader(t('translation:pdfHeaderRecovery'), french.translation.pdfHeaderRecovery, params.paddingTop);
                    y += params.smallHeaderLineHeight + params.space;

                    //For the labels on the left side
                    let xLeft = params.a6width + params.paddingInnerLeft;

                    pdf.setFontSize(params.fontSize10);

                    y = printVerticalBlock(xLeft, y,
                        t('translation:pdfDisease'),
                        french.translation.pdfDisease,
                        getValueSetDisplay(recoverySet.tg, diseaseAgentsData),
                        lineHeight, true);

                    y = printVerticalBlock(xLeft, y,
                        t('translation:pdfDatePositiveTestResult'),
                        french.translation.pdfDatePositiveTestResult,
                        recoverySet.fr);

                    y = printVerticalBlock(xLeft, y,
                        t('translation:pdfStateOfTest'),
                        french.translation.pdfStateOfTest,
                        recoverySet.co,
                        lineHeight, true);

                    y = printVerticalBlock(xLeft, y,
                        t('translation:pdfCertificateIssuer'),
                        french.translation.pdfCertificateIssuer,
                        recoverySet.is,
                        lineHeight, true);

                    y = printVerticalBlock(xLeft, y,
                        t('translation:pdfValidFrom'),
                        french.translation.pdfValidFrom,
                        recoverySet.df,
                        lineHeight, true);

                    printVerticalBlock(xLeft, y,
                        t('translation:pdfValidTo'),
                        french.translation.pdfValidTo,
                        recoverySet.du,
                        lineHeight, true);

                    setFourthPageIsReady(true);
                }
            }
        }
    }

    /**
     * Rotated Fourth page is the new first page on the A4.
     */
    const prepareFourthPageRecoveryRotated = () => {
        if (pdf && recoverySet && french) {

            const lineHeight = params.lineHeight10;

            let y = printCertificateHeaderRotated(t('translation:pdfHeaderRecovery'), french.translation.pdfHeaderRecovery, params.paddingTop);
            y -= params.smallHeaderLineHeight - params.space;

            //For the labels on the left side
            let xLeft = params.a6width - params.paddingInnerLeft;

            pdf.setFontSize(params.fontSize10);

            y = printVerticalBlockRotated(xLeft, y,
                t('translation:pdfDisease'),
                french.translation.pdfDisease,
                getValueSetDisplay(recoverySet.tg, diseaseAgentsData),
                lineHeight, true);

            y = printVerticalBlockRotated(xLeft, y,
                t('translation:pdfDatePositiveTestResult'),
                french.translation.pdfDatePositiveTestResult,
                recoverySet.fr);

            y = printVerticalBlockRotated(xLeft, y,
                t('translation:pdfStateOfTest'),
                french.translation.pdfStateOfTest,
                recoverySet.co,
                lineHeight, true);

            y = printVerticalBlockRotated(xLeft, y,
                t('translation:pdfCertificateIssuer'),
                french.translation.pdfCertificateIssuer,
                recoverySet.is,
                lineHeight, true);

            y = printVerticalBlockRotated(xLeft, y,
                t('translation:pdfValidFrom'),
                french.translation.pdfValidFrom,
                recoverySet.df,
                lineHeight, true);

            printVerticalBlockRotated(xLeft, y,
                t('translation:pdfValidTo'),
                french.translation.pdfValidTo,
                recoverySet.du,
                lineHeight, true);
        }
    }

    // const printSplittedLine = (x: number, y: number, lblLeft: any, lblLeftFrench: any): number => {
    //     let result = 0;

    //     if (pdf) {
    //         pdf.setFont('arial', 'bold');
    //         lblLeft = pdf.splitTextToSize(lblLeft, lblLength);
    //         pdf.text(lblLeft, x, y);

    //         pdf.setFont('arial', 'normal');

    //         const lineheight = lblLeft.length > 2 ? params.lineHeight10 + 1 : params.lineHeight10;
    //         y += (lineheight * lblLeft.length) + params.space;
    //         lblLeftFrench = pdf.splitTextToSize(lblLeftFrench, lblLength);
    //         pdf.text(lblLeftFrench, x, y);

    //         result = y + params.lineHeight10 * lblLeftFrench.length;
    //     }

    //     return result;
    // }

    const printVerticalBlock = (x: number, y: number, lbl: any, lblFrench: any, value?: string, lineHeight?: number, isItalic?: boolean): number => {
        let result = y;
        lineHeight = lineHeight ? lineHeight : params.lineHeight;

        if (pdf) {
            pdf.setFont('arial', 'bold');
            lbl = pdf.splitTextToSize(lbl, lblLength);
            pdf.text(lbl, x, y);

            y += lineHeight * lbl.length;

            pdf.setFont('arial', 'italic');

            const frenchText = pdf.splitTextToSize(lblFrench, lblLength);
            pdf.text(frenchText, x, y);
            y += lineHeight * frenchText.length;

            if (value) {
                pdf.setFont('arial', 'normal');
                const valueText = pdf.splitTextToSize(value, lblLength);
                pdf.text(valueText, x, y);

                y += lineHeight * valueText.length;
            }

            result = y + mm2point(2);
        }

        return result;
    }

    const printHorizontalBlockPerson = (x: number, y: number, lbl: any, lblFrench: any, value?: string): number => {
        let result = y;

        if (value && pdf) {
            pdf.setFontSize(params.fontSize11)
            pdf.setFont('arial', 'bold');
            lbl = pdf.splitTextToSize(lbl, lblLength);
            pdf.text(lbl, x, y);
            y += params.lineHeight12 * lbl.length;

            pdf.setFontSize(params.fontSize10)
            pdf.setFont('arial', 'italic');

            const frenchText = pdf.splitTextToSize(lblFrench, lblLength);
            pdf.text(frenchText, x, y);
            y += params.lineHeight12 * frenchText.length;

            pdf.setFontSize(params.fontSize11);
            pdf.setFont('arial', 'normal');
            setTextColorBlue()
            const valueText = pdf.splitTextToSize(value, lblLength);
            pdf.text(valueText, x, y);
            setTextColorBlack()

            result = y + params.lineHeight11 * valueText.length + mm2point(2);
        }

        return result;
    }

    const printVerticalBlockRotated = (x: number, y: number, lbl: any, lblFrench: any, value?: string, lineHeight?: number, isItalic?: boolean): number => {
        let result = y;
        lineHeight = lineHeight ? lineHeight : params.lineHeight;

        if (value && pdf) {
            pdf.setFont('arial', 'bold');
            lbl = pdf.splitTextToSize(lbl, lblLength);
            y = leftSplittedTextRotated(lbl, x, y);

            if (isItalic) {
                pdf.setFont('arial', 'italic');
            } else {
                pdf.setFont('arial', 'normal');
            }
            const frenchText = pdf.splitTextToSize(lblFrench, lblLength);
            y = leftSplittedTextRotated(frenchText, x, y);

            pdf.setFont('arial', 'normal');
            const valueText = pdf.splitTextToSize(value, lblLength);
            y = leftSplittedTextRotated(valueText, x, y);

            result = y - 6;
        }

        return result;
    }

    // const printBlock = (xLeft: number, xRight: number, y: number, lblLeft: any, lblLeftFrench: any, value?: string, space?: number): number => {
    //     let result = y;

    //     if (pdf && value) {
    //         const valueText = pdf.splitTextToSize(value, lblLength);
    //         pdf.text(valueText, xRight, y);
    //         result = printSplittedLine(xLeft, y, lblLeft, lblLeftFrench);
    //         result += space ? space : params.lineHeight10 + params.space;
    //     }

    //     return result;
    // }

    const printCertificateHeader = (header: any, frenchHeader: string, paddingTop?: number): number => {
        let result = 0;

        if (pdf) {
            let x = params.a6width + params.a6width / 2;
            let y = params.a6height;
            const lblLength = params.a6width - params.paddingLeft - params.paddingRight;

            pdf.setFont('arial', 'bold');
            pdf.setFontSize(params.smallHeaderFontSize);
            setTextColorBlue();

            paddingTop = paddingTop ? paddingTop : 0;
            y += params.smallHeaderLineHeight + paddingTop;

            header = pdf.splitTextToSize(header, params.a6width);
            pdf.text(header, x, y, { align: 'center', maxWidth: lblLength });

            y += params.smallHeaderLineHeight + header.length;
            pdf.setFontSize(params.fontSize14);
            frenchHeader = pdf.splitTextToSize(frenchHeader, params.a6width);
            pdf.text(frenchHeader, x, y, { align: 'center', maxWidth: lblLength });
            setTextColorBlack();

            result = y + params.smallHeaderLineHeight * frenchHeader.length;
        }

        return result;
    }

    const printCertificateHeaderRotated = (header: any, frenchHeader: string, paddingTop?: number): number => {
        let result = 0;

        if (pdf) {
            let x = params.a6width
            let y = params.a6height;

            pdf.setFont('arial', 'bold');
            pdf.setFontSize(params.smallHeaderFontSize);
            setTextColorBlue();

            paddingTop = paddingTop ? paddingTop : 0;
            y -= params.smallHeaderLineHeight + paddingTop;

            header = pdf.splitTextToSize(header, lblLength);
            centerSplittedText(header, x, y);

            y -= params.smallHeaderLineHeight;
            pdf.setFontSize(params.fontSize14);
            frenchHeader = pdf.splitTextToSize(frenchHeader, lblLength);
            centerSplittedText(frenchHeader, x, y);
            setTextColorBlack();

            result = y - params.smallHeaderLineHeight * frenchHeader.length;
        }

        return result;
    }

    const centerSplittedText = (txt: string, x: number, y: number): number => {
        let result = y;

        if (pdf) {
            const offset = x;
            for (let i = 0; i < txt.length; i++) {
                const dim = pdf.getTextDimensions(txt[i]);
                x = offset - (params.a6width - dim.w) / 2;
                pdf.text(txt[i], x, y, { align: 'left', angle: 180 });
                y -= dim.h + 2;
            }

            result = y;
        }
        return result;
    }

    const leftSplittedTextRotated = (text: string, x: number, y: number): number => {
        let result = y;

        if (pdf) {
            for (let i = 0; i < text.length; i++) {
                const dim = pdf.getTextDimensions(text[i]);
                pdf.text(text[i], x, y, { align: 'left', angle: 180 });
                y -= dim.h;
            }
            result = y;
        }
        return result;
    }

    const setTextColorBlue = () => {
        pdf!.setTextColor(0, 51, 153);
    }

    const setTextColorBlack = () => {
        pdf!.setTextColor(0, 0, 0);
    }

    const setTextColorWhite = () => {
        pdf!.setTextColor(256, 256, 256);
    }

    return pdf;
}



export default usePdfGenerator;



