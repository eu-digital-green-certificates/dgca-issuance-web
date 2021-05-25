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

import logo from '../assets/images/eu_flag.png';
import card_seperator from '../assets/images/card.png';
import flag_seperator from '../assets/images/flag.png';

import { EUDGC, RecoveryEntry, TestEntry, VaccinationEntry } from '../generated-files/dgc-combined-schema';
import {
    useGetDiseaseAgents, useGetVaccineManufacturers, useGetVaccines,
    useGetVaccinMedicalData, useGetTestManufacturers, useGetTestResult
} from '../api';
import { getValueSetDisplay, convertDateToOutputFormat } from '../misc/ShowCertificateData';
import { doc } from 'prettier';

require('../assets/SCSS/fonts/calibri-normal.js');
require('../assets/SCSS/fonts/calibri-bold.js');
require('../assets/SCSS/fonts/calibri-italic.js');
require('../assets/SCSS/fonts/calibri-bolditalic.js');

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
    fontSize9: number,
    fontSize10: number,
    fontSize12: number,
    lineHeight9: number,
    lineHeight10: number,
    lineHeight11: number,
    lineHeight12: number,
    headerLineHeight: number,
    headerFontSize: number,
    smallHeaderLineHeight: number,
    smallHeaderFontSize: number,
    space: number
}

const usePdfGenerator = (qrCodeCanvasElementProp: any, eudgcProp: EUDGC | undefined, onIsInit: (isInit: boolean) => void, onIsReady: (isReady: boolean) => void) => {
    const { t } = useTranslation();
    const french = i18n.getDataByLanguage('fr');

    const vacMedsData = useGetVaccinMedicalData();
    const diseaseAgentsData = useGetDiseaseAgents();
    const vaccineManufacturers = useGetVaccineManufacturers();
    const vaccines = useGetVaccines();
    const testManufacturersValueSet = useGetTestManufacturers();
    const testResultValueSet = useGetTestResult();

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
        fontSize9: 9,
        fontSize10: 10,
        fontSize12: 12,
        lineHeight9: 9,
        lineHeight10: 10,
        lineHeight11: 11,
        lineHeight12: 12,
        headerLineHeight: 28,
        headerFontSize: 28,
        smallHeaderLineHeight: 20,
        smallHeaderFontSize: 20,
        space: 2
    }

    const lblLength = params.a6width / 2 - params.paddingLeft - params.paddingRight;
    const pageMiddle = params.a6width / 2;

    const [isInit, setIsInit] = React.useState(false);
    const [isReady, setIsReady] = React.useState(false);

    const [firstPageIsReady, setFirstPageIsReady] = React.useState(false);
    const [secondPageIsReady, setSecondPageIsReady] = React.useState(false);
    const [thirdPageIsReady, setThirdPageIsReady] = React.useState(false);
    const [fourthPageIsReady, setFourthPageIsReady] = React.useState(false);

    const [pdf, setPdf] = React.useState<jsPDF>();

    const [eudgc, setEudgc] = React.useState<EUDGC>();
    const [vaccinationSet, setVaccinationSet] = React.useState<VaccinationEntry>();
    const [testSet, setTestSet] = React.useState<TestEntry>();
    const [recoverySet, setRecoverySet] = React.useState<RecoveryEntry>();
    const [ci, setCi] = React.useState<string>();
    const [qrCodeCanvasElement, setQrCodeCanvasElement] = React.useState<any>();

    // on mount generate pdf
    React.useEffect(() => {
        const _pdf = new jsPDF("p", "pt", "a4", true);

        _pdf.setFont('calibri', 'normal');

        setPdf(_pdf);
    }, [])

    // on pdf generated set all static data
    React.useEffect(() => {
        if (pdf) {
            printDottedLine();
            prepareFirstPage();
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

    // on receiving eudgc obj set specific ValueSet
    React.useEffect(() => {
        if (eudgcProp) {
            setEudgc(eudgcProp);
            setVaccinationSet(eudgcProp.v ? eudgcProp.v[0] : undefined);
            setTestSet(eudgcProp.t ? eudgcProp.t[0] : undefined);
            setRecoverySet(eudgcProp.r ? eudgcProp.r[0] : undefined);
        }
    }, [eudgcProp])

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
            prepareFourthPageVaccination();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vaccinationSet, isInit])

    // set fourth page for test
    React.useEffect(() => {
        if (testSet && isInit) {
            setCi(testSet.ci);
            prepareFourthPageTest();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testSet, isInit])

    // set fourth page for recovery
    React.useEffect(() => {
        if (recoverySet && isInit) {
            setCi(recoverySet.ci);
            prepareFourthPageRecovery();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recoverySet, isInit])

    React.useEffect(() => {
        if (qrCodeCanvasElement && ci && isInit && eudgc) {
            prepareSecondPage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrCodeCanvasElement, ci, isInit, eudgc]);

    const printDottedLine = () => {
        if (pdf) {
            let curX = 0;
            let curY = 0;
            let deltaX = mm2point(10);
            let deltaY = mm2point(10);

            pdf.line(curX, params.a6height, curX + deltaX, params.a6height);
            pdf.line(params.a6width * 2 - curX, params.a6height, params.a6width * 2 - curX - deltaX, params.a6height);

            pdf.line(params.a6width, curY, params.a6width, curY + deltaY);
            pdf.line(params.a6width, params.a6height * 2 - deltaY, params.a6width, params.a6height * 2);

            pdf.line(params.a6width, params.a6height - deltaY/2, params.a6width, params.a6height + deltaY/2);
            pdf.line(params.a6width - deltaX/2, params.a6height, params.a6width + deltaX/2, params.a6height);

            // let curX = 0 + params.marginLeft;
            // let curY = params.a6height;
            // let xTo = params.a6width * 2 - params.marginRight;
            // let deltaX = 3;
            // let deltaY = 3;
            // while (curX <= xTo) {
            //     pdf.line(curX, curY, curX + deltaX, curY);
            //     curX += 2 * deltaX;
            // }

            // curX = params.a6width;
            // curY = 0 + params.marginTop;
            // let yTo = params.a6height * 2 - params.marginBottom;
            // while (curY <= yTo) {
            //     pdf.line(curX, curY, curX, curY + deltaY);
            //     curY += 2 * deltaY;
            // }
        }
    }

    const prepareFirstPage = () => {
        if (pdf && french) {

            let x = params.a6width / 2;
            let y = mm2point(38);
            const lblLength = params.a6width - params.paddingRight - params.paddingRight;

            setTextColorBlue(pdf);
            pdf.setFont('calibri', 'bold');
            pdf.setFontSize(params.headerFontSize);

            let header = t('translation:pdfGreenCertificate');
            header = pdf.splitTextToSize(header, lblLength);
            pdf.text(header, x, y, { align: 'center', maxWidth: lblLength });

            pdf.setFillColor(255, 204, 0);
            const rectWidth = mm2point(85);
            const rectHeight = mm2point(2);
            x = (params.a6width - rectWidth) / 2;
            y += params.headerLineHeight * header.length - mm2point(4);
            pdf.rect(x, y, rectWidth, 5, 'F');
            pdf.setDrawColor(0, 51, 153);
            pdf.rect(x, y, rectWidth, 5);

            x = params.a6width / 2;
            y += params.headerLineHeight + mm2point(4);

            header = french.translation.pdfGreenCertificate;
            header = pdf.splitTextToSize(header, lblLength);
            pdf.text(header, x, y, { align: 'center', maxWidth: lblLength });

            let logoWidth = 82.495;
            let logoHeight = 59.5;
            x = (params.a6width - logoWidth) / 2;
            y += params.headerLineHeight + mm2point(7);
            pdf.addImage(logo, 'png', x, y, logoWidth, logoHeight);

            setTextColorBlack(pdf);
            pdf.setFont('calibri', 'normal');

            setFirstPageIsReady(true);
        }
    }

    const prepareSecondPage = () => {
        if (pdf && eudgc && ci && qrCodeCanvasElement && french) {

            const space_top = mm2point(16);
            const space = mm2point(5);

            const img = (qrCodeCanvasElement as HTMLCanvasElement).toDataURL("image/png,base64");
            const canvasWidth = mm2point(45);
            let x = params.a6width + (params.a6width - canvasWidth) / 2;
            let y = space_top;
            pdf.addImage(img, 'png', x, y, canvasWidth, canvasWidth);

            const imageWidth = 258;
            const imageHeight = 55.5;
            y += canvasWidth + mm2point(5);
            x = params.a6width * 2 - imageWidth - mm2point(9);
            pdf.addImage(card_seperator, x, y, imageWidth, imageHeight);

            //For the labels on the left side
            x = params.a6width + params.paddingInnerLeft;
            y += imageHeight + space;
            pdf.setFontSize(params.fontSize12);

            y = printVerticalBlock(x, y,
                t('translation:pdfSurname'),
                french.translation.pdfSurname,
                (eudgc.nam.fnt + ' ') + (eudgc.nam.gnt ? eudgc.nam.gnt : ''));

            y = printVerticalBlock(x, y,
                t('translation:pdfDateOfBirth'),
                french.translation.pdfDateOfBirth,
                eudgc.dob);

            y = printVerticalBlock(x, y,
                t('translation:pdfCi'),
                french.translation.pdfCi,
                ci);

            setSecondPageIsReady(true);
        }
    }

    const prepareThirdPage = () => {
        if (pdf) {
            prepareThirdPageRotated();
            // let lblLength = params.a6width - params.paddingRight - params.paddingRight - mm2point(14);
            // let space = mm2point(3);
            // let imageWidth = 258.75;
            // let imageHeight = 54.75;
            // let y = params.a6height + mm2point(4);
            // let x = (params.a6width - imageWidth) / 2;

            // pdf.addImage(flag_seperator, x, y, imageWidth, imageHeight);

            // x = params.a6width / 2;
            // y += imageHeight + params.fontSize12 + mm2point(2);

            // setTextColorBlue(pdf);
            // pdf.setFontSize(params.fontSize12);
            // pdf.setFont('calibri', 'bold');
            // let header = t('translation:pdfMemberPlaceholder');
            // header = pdf.splitTextToSize(header, lblLength);
            // pdf.text(header, x, y, { align: 'center', maxWidth: lblLength });
            // pdf.setFont('calibri', 'normal');

            // y += params.lineHeight12 + space;
            // setTextColorBlack(pdf);
            // pdf.setFontSize(params.fontSize10);
            // let infotext = t('translation:pdfMemberPlaceholderInfo');
            // infotext = pdf.splitTextToSize(infotext, lblLength);
            // pdf.text(infotext, x, y, { align: 'center', maxWidth: lblLength });

            // y += mm2point(65);
            // pdf.setFontSize(params.fontSize9);
            // infotext = t('translation:pdfInfoText');
            // infotext = pdf.splitTextToSize(infotext, lblLength);
            // pdf.text(infotext, x, y, { align: 'center', maxWidth: lblLength });

            // y += mm2point(10) + params.lineHeight9 * infotext.length;
            // infotext = t('translation:pdfRelevantInformation');
            // infotext = pdf.splitTextToSize(infotext, lblLength);
            // pdf.text(infotext, x, y, { align: 'center', maxWidth: lblLength });

            // y += space + params.lineHeight9 * infotext.length;
            // infotext = t('translation:pdfInfoURL');
            // infotext = pdf.splitTextToSize(infotext, lblLength);
            // pdf.text(infotext, x, y, { align: 'center', maxWidth: lblLength });

            // setThirdPageIsReady(true);
        }
    }

    /**
     * Rotated Third page is the new second page on the A4.
     */
    const prepareThirdPageRotated = () => {
        if (pdf) {
            let lblLength = params.a6width - params.paddingRight - params.paddingRight - mm2point(14);
            let space = mm2point(3);
            let imageWidth = 258.75;
            let imageHeight = 54.75;
            let y = params.a6height * 2 - imageHeight * 2 - mm2point(4);
            let x = imageWidth + (params.a6width - imageWidth) / 2;

            pdf.addImage(flag_seperator, x, y, imageWidth, imageHeight, undefined, undefined, 180);

            x = params.a6width / 2;
            y += imageHeight - params.lineHeight12 - mm2point(2);

            setTextColorBlue(pdf);
            pdf.setFontSize(params.fontSize12);
            pdf.setFont('calibri', 'bold');
            let header = t('translation:pdfMemberPlaceholder');
            header = pdf.splitTextToSize(header, lblLength);
            x = params.a6width;
            y = centerSplittedText(header, x, y);

            y -= params.lineHeight12 - space;

            pdf.setFont('calibri', 'normal');
            setTextColorBlack(pdf);
            pdf.setFontSize(params.fontSize10);
            let infotext = t('translation:pdfMemberPlaceholderInfo');
            infotext = pdf.splitTextToSize(infotext, lblLength);
            y = centerSplittedText(infotext, x, y);

            y -= mm2point(65);
            pdf.setFontSize(params.fontSize9);
            infotext = t('translation:pdfInfoText');
            infotext = pdf.splitTextToSize(infotext, lblLength);
            y = centerSplittedText(infotext, x, y);

            y -= mm2point(10);
            infotext = t('translation:pdfRelevantInformation');
            infotext = pdf.splitTextToSize(infotext, lblLength);
            y = centerSplittedText(infotext, x, y);

            y -= space;
            infotext = t('translation:pdfInfoURL');
            infotext = pdf.splitTextToSize(infotext, lblLength);
            y = centerSplittedText(infotext, x, y);

            setThirdPageIsReady(true);
        }
    }

    const prepareFourthPageVaccination = () => {
        if (pdf && vaccinationSet && french) {

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

            setFourthPageIsReady(true);
        }
    }

    const prepareFourthPageTest = () => {
        if (pdf && testSet && french) {

            const lineHeight = params.lineHeight10;

            let y = printCertificateHeader(t('translation:pdfHeaderTest'), french.translation.pdfHeaderTest);

            let x = params.a6width + params.paddingInnerLeft;

            pdf.setFontSize(params.fontSize10);

            y = printVerticalBlock(x, y,
                t('translation:pdfDisease'),
                french.translation.pdfDisease,
                getValueSetDisplay(testSet.tg, diseaseAgentsData),
                lineHeight, true);

            y = printVerticalBlock(x, y,
                t('translation:pdfTypeOfTest'),
                french.translation.pdfTypeOfTest,
                testSet.tt,
                lineHeight, true);

            y = printVerticalBlock(x, y,
                t('translation:pdfTestName'),
                french.translation.pdfTestName,
                testSet.nm ? testSet.nm : ' ',
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
                t('translation:pdfDateTestResult'),
                french.translation.pdfDateTestResult,
                convertDateToOutputFormat(testSet.dr),
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

    const prepareFourthPageRecovery = () => {
        if (pdf && recoverySet && french) {

            prepareFourthPageRecoveryRotated();

            // const lineHeight = params.lineHeight10;

            // let y = printCertificateHeader(t('translation:pdfHeaderRecovery'), french.translation.pdfHeaderRecovery, params.paddingTop);
            // y += params.smallHeaderLineHeight + params.space;

            // //For the labels on the left side
            // let xLeft = params.a6width + params.paddingInnerLeft;

            // pdf.setFontSize(params.fontSize10);

            // y = printVerticalBlock(xLeft, y,
            //     t('translation:pdfDisease'),
            //     french.translation.pdfDisease,
            //     getValueSetDisplay(recoverySet.tg, diseaseAgentsData),
            //     lineHeight, true);

            // y = printVerticalBlock(xLeft, y,
            //     t('translation:pdfDatePositiveTestResult'),
            //     french.translation.pdfDatePositiveTestResult,
            //     recoverySet.fr);

            // y = printVerticalBlock(xLeft, y,
            //     t('translation:pdfStateOfTest'),
            //     french.translation.pdfStateOfTest,
            //     recoverySet.co,
            //     lineHeight, true);

            // y = printVerticalBlock(xLeft, y,
            //     t('translation:pdfCertificateIssuer'),
            //     french.translation.pdfCertificateIssuer,
            //     recoverySet.is,
            //     lineHeight, true);

            // y = printVerticalBlock(xLeft, y,
            //     t('translation:pdfValidFrom'),
            //     french.translation.pdfValidFrom,
            //     recoverySet.df,
            //     lineHeight, true);

            // printVerticalBlock(xLeft, y,
            //     t('translation:pdfValidTo'),
            //     french.translation.pdfValidTo,
            //     recoverySet.du,
            //     lineHeight, true);

            // setFourthPageIsReady(true);
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
            let xLeft = params.a6width * 2 - params.paddingRight;

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

            setFourthPageIsReady(true);
        }
    }

    const printSplittedLine = (x: number, y: number, lblLeft: any, lblLeftFrench: any): number => {
        let result = 0;

        if (pdf) {
            pdf.setFont('calibri', 'bold');
            lblLeft = pdf.splitTextToSize(lblLeft, lblLength);
            pdf.text(lblLeft, x, y);

            pdf.setFont('calibri', 'normal');

            const lineheight = lblLeft.length > 2 ? params.lineHeight10 + 1 : params.lineHeight10;
            y += (lineheight * lblLeft.length) + params.space;
            lblLeftFrench = pdf.splitTextToSize(lblLeftFrench, lblLength);
            pdf.text(lblLeftFrench, x, y);

            result = y + params.lineHeight10 * lblLeftFrench.length;
        }

        return result;
    }

    const printVerticalBlock = (x: number, y: number, lbl: any, lblFrench: any, value?: string, lineHeight?: number, isItalic?: boolean): number => {
        let result = y;
        lineHeight = lineHeight ? lineHeight : params.lineHeight;

        if (value && pdf) {
            const lblLength = params.a6width - params.paddingInnerLeft - params.paddingRight;

            pdf.setFont('calibri', 'bold');
            lbl = pdf.splitTextToSize(lbl, lblLength);
            pdf.text(lbl, x, y);
            y += lineHeight * lbl.length;

            if (isItalic) {
                pdf.setFont('calibri', 'italic');
            } else {
                pdf.setFont('calibri', 'normal');
            }
            const frenchText = pdf.splitTextToSize(lblFrench, lblLength);
            pdf.text(frenchText, x, y);
            y += lineHeight * frenchText.length;

            pdf.setFont('calibri', 'normal');
            const valueText = pdf.splitTextToSize(value, lblLength);
            pdf.text(valueText, x, y);

            result = y + lineHeight * valueText.length + mm2point(2);
        }

        return result;
    }

    const printVerticalBlockRotated = (x: number, y: number, lbl: any, lblFrench: any, value?: string, lineHeight?: number, isItalic?: boolean): number => {
        let result = y;
        lineHeight = lineHeight ? lineHeight : params.lineHeight;

        if (value && pdf) {
            const lblLength = params.a6width - params.paddingInnerLeft - params.paddingRight;

            pdf.setFont('calibri', 'bold');
            lbl = pdf.splitTextToSize(lbl, lblLength);
            y = leftSplittedText(lbl, x, y);

            if (isItalic) {
                pdf.setFont('calibri', 'italic');
            } else {
                pdf.setFont('calibri', 'normal');
            }
            const frenchText = pdf.splitTextToSize(lblFrench, lblLength);
            y = leftSplittedText(frenchText, x, y);

            pdf.setFont('calibri', 'normal');
            const valueText = pdf.splitTextToSize(value, lblLength);
            y = leftSplittedText(valueText, x, y);

            result = y - mm2point(2);
        }

        return result;
    }

    /**
     *  @deprecated
     * @param xLeft
     * @param xRight 
     * @param y 
     * @param lblLeft 
     * @param lblLeftFrench 
     * @param value 
     * @param space 
     * @returns 
     */
    const printBlock = (xLeft: number, xRight: number, y: number, lblLeft: any, lblLeftFrench: any, value?: string, space?: number): number => {
        let result = y;

        if (pdf && value) {
            const valueText = pdf.splitTextToSize(value, lblLength);
            pdf.text(valueText, xRight, y);
            result = printSplittedLine(xLeft, y, lblLeft, lblLeftFrench);
            result += space ? space : params.lineHeight10 + params.space;
        }

        return result;
    }

    const printCertificateHeader = (header: any, frenchHeader: string, paddingTop?: number): number => {
        let result = 0;

        if (pdf) {
            let x = params.a6width + params.a6width / 2;
            let y = params.a6height;

            pdf.setFont('calibri', 'bold');
            pdf.setFontSize(params.smallHeaderFontSize);
            setTextColorBlue(pdf);

            paddingTop = paddingTop ? paddingTop : 0;
            y += params.smallHeaderLineHeight + paddingTop;

            pdf.text(header, x, y, { align: 'center', maxWidth: params.a6width - params.paddingRight });

            y += params.smallHeaderLineHeight;
            frenchHeader = pdf.splitTextToSize(frenchHeader, params.a6width);
            pdf.text(frenchHeader, x, y, { align: 'center', maxWidth: params.a6width - params.paddingRight });
            setTextColorBlack(pdf);

            return y + params.smallHeaderLineHeight * frenchHeader.length;
        }

        return result;
    }

    const printCertificateHeaderRotated = (header: any, frenchHeader: string, paddingTop?: number): number => {
        let result = 0;

        if (pdf) {
            let x = params.a6width * 2
            let y = params.a6height * 2;

            pdf.setFont('calibri', 'bold');
            pdf.setFontSize(params.smallHeaderFontSize);
            setTextColorBlue(pdf);

            paddingTop = paddingTop ? paddingTop : 0;
            y -= params.smallHeaderLineHeight + paddingTop;

            header = pdf.splitTextToSize(header, params.a6width);
            centerSplittedText(header, x, y);

            // pdf.text(header, x, y, { align: 'center', maxWidth: params.a6width - params.paddingRight });

            y -= params.smallHeaderLineHeight;
            frenchHeader = pdf.splitTextToSize(frenchHeader, params.a6width);
            centerSplittedText(header, x, y);
            setTextColorBlack(pdf);

            return y - params.smallHeaderLineHeight * frenchHeader.length;
        }

        return result;
    }

    const centerSplittedText = (txt: string, x: number, y: number): number => {
        if (pdf) {
            let offset = x;
            for (let i = 0; i < txt.length; i++) {
                let dim = pdf.getTextDimensions(txt[i]);
                x = offset - (params.a6width - dim.w) / 2;
                pdf.text(txt[i], x, y, { align: 'left', angle: 180 });
                y -= dim.h;
            }
            return y;
        }
        return 0;
    }

    const leftSplittedText = (header: string, x: number, y: number): number => {
        if (pdf) {
            for (let i = 0; i < header.length; i++) {
                let dim = pdf.getTextDimensions(header[i]);
                pdf.text(header[i], x, y, { align: 'left', angle: 180 });
                y -= dim.h;
            }
            return y;
        }
        return 0;
    }

    const setTextColorBlue = (pdf: jsPDF) => {
        pdf.setTextColor(0, 51, 153);
    }

    const setTextColorBlack = (pdf: jsPDF) => {
        pdf.setTextColor(0, 0, 0);
    }

    return pdf;
}



export default usePdfGenerator;



