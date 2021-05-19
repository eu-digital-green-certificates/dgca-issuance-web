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
    paddingRight: number,
    paddingTop: number,

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

const usePdfGenerator = (qrCodeCanvasElement: any, eudgc: EUDGC | undefined) => {
    const { t } = useTranslation();

    const vacMedsData = useGetVaccinMedicalData();
    const diseaseAgentsData = useGetDiseaseAgents();
    const vaccineManufacturers = useGetVaccineManufacturers();
    const vaccines = useGetVaccines();
    const testManufacturersValueSet = useGetTestManufacturers();
    const testResultValueSet = useGetTestResult();

    //A4 210 x 297 mm or 2480 x 3508 pixels or 595 × 842 points
    //A6 105 x 74 mm or 1240 x 1748 pixels or 298 × 420 points

    let params: IPageParameter = {
        a6width: 298,
        a6height: 420,

        marginTop: mm2point(15),
        marginBottom: mm2point(15),
        marginLeft: mm2point(15),
        marginRight: mm2point(15),

        paddingLeft: mm2point(2),
        paddingRight: mm2point(2),
        paddingTop: mm2point(1),

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

    const [pdf, setPdf] = React.useState<jsPDF>();

    React.useEffect(() => {
        const _pdf = new jsPDF("p", "pt", "a4", true);

        _pdf.setFont('calibri', 'normal');

        setPdf(_pdf);
    }, [])

    React.useEffect(() => {
        if (!qrCodeCanvasElement && !eudgc && !pdf) {
            return;
        }
        const _pdf = pdf!;

        let _ci: string = '';
        if (eudgc!.r) {
            _ci = eudgc!.r![0].ci;
            prepareFourthPageRecovery(_pdf, eudgc, diseaseAgentsData, params, pageMiddle, lblLength);
        } else if (eudgc!.t) {
            _ci = eudgc!.t![0].ci;
            prepareFourthPageTest(_pdf, eudgc, params, t, testResultValueSet, testManufacturersValueSet,
                diseaseAgentsData, pageMiddle, lblLength);
        } else if (eudgc!.v) {
            _ci = eudgc!.v![0].ci;
            prepareFourthPageVaccination(_pdf, eudgc, params, t, diseaseAgentsData, vaccines, vaccineManufacturers,
                vacMedsData, pageMiddle, lblLength);
        }

        prepareFirstPage(_pdf, params, t);

        prepareSecondPage(_pdf, params, eudgc, t, qrCodeCanvasElement, _ci);

        prepareThirdPage(_pdf, params, t);

        printDottedLine(_pdf, params);

        // _pdf.save('edgcPdfTest');
        const blobPDF = new Blob([_pdf.output('blob')], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blobPDF);
        window.open(blobUrl);

    }, [qrCodeCanvasElement]);

}

export default usePdfGenerator;

const prepareSecondPage = (pdf: jsPDF, params: IPageParameter, eudgc: EUDGC | undefined,
    translation: any, qrCodeCanvasElement: HTMLCanvasElement, _ci: string) => {

    let lblLength = params.a6width - params.paddingRight - params.paddingRight * 3;
    let space = mm2point(10);
    let canvas: HTMLCanvasElement = qrCodeCanvasElement;
    let img = canvas!.toDataURL("image/png,base64");
    let canvasWidth = mm2point(40);
    let x = params.a6width * 2 - canvasWidth - mm2point(10);
    let y = space;
    pdf.addImage(img, 'png', x, y, canvasWidth, canvasWidth);

    let imageWidth = 258;
    let imageHeight = 55.5;
    y += imageHeight + mm2point(8);
    x = params.a6width * 2 - imageWidth - mm2point(9);

    pdf.addImage(card_seperator, x, y, imageWidth, imageHeight);

    //For the labels on the left side
    x = params.a6width + params.paddingLeft;
    y += imageHeight + space;

    pdf.setFontSize(params.fontSize12);

    pdf.setFont('calibri', 'bold');
    let lblSurname: string = translation('translation:pdfSurname');
    pdf.text(lblSurname, x, y);
    pdf.setFont('calibri', 'normal');

    y += params.lineHeight;
    lblSurname = i18n!.getDataByLanguage('fr')!.translation.pdfSurname
    pdf.text(lblSurname, x, y);

    y += params.lineHeight;
    setTextColorTurkis(pdf);
    let name = eudgc!.nam!.fnt + ' ';
    name += eudgc!.nam.gnt ? eudgc!.nam.gnt : '';
    name = pdf.splitTextToSize(name, lblLength);
    pdf.text(name, x, y);

    y += params.lineHeight * name.length + space;
    setTextColorBlack(pdf);
    pdf.setFont('calibri', 'bold');
    let lblDateOfBirth: string = translation('translation:pdfDateOfBirth');
    pdf.text(lblDateOfBirth, x, y);
    pdf.setFont('calibri', 'normal');
    y += params.lineHeight;
    lblDateOfBirth = i18n!.getDataByLanguage('fr')!.translation.pdfDateOfBirth;
    pdf.text(lblDateOfBirth, x, y);


    y += params.lineHeight;
    setTextColorTurkis(pdf);
    pdf.text(eudgc!.dob, x, y);

    y += params.lineHeight + space;
    setTextColorBlack(pdf);
    pdf.setFont('calibri', 'bold');
    let lblci: string = translation('translation:pdfCi');
    lblci = pdf.splitTextToSize(lblci, lblLength);
    pdf.text(lblci, x, y);
    pdf.setFont('calibri', 'normal');
    y += params.lineHeight;
    lblci = i18n!.getDataByLanguage('fr')!.translation.pdfCi;
    lblci = pdf.splitTextToSize(lblci, lblLength);
    pdf.text(lblci, x, y);

    y += params.lineHeight;
    setTextColorTurkis(pdf);
    lblci = pdf.splitTextToSize(_ci, lblLength);
    pdf.text(lblci, x, y);

    setTextColorBlack(pdf);
}

const prepareFirstPage = (pdf: jsPDF, params: IPageParameter, translation: any) => {
    let x = params.a6width / 2;
    let y = mm2point(38);
    let lblLength = params.a6width - params.paddingRight - params.paddingRight;
    setTextColorTurkis(pdf);
    pdf.setFont('calibri', 'bold');

    pdf.setFontSize(params.headerFontSize);
    let header = translation('translation:pdfGreenCertificate');
    header = pdf.splitTextToSize(header, lblLength);
    pdf.text(header, x, y, { align: 'center', maxWidth: lblLength });

    pdf.setFillColor(255, 242, 0);
    x = params.a6width - lblLength;
    y += params.headerLineHeight * header.length - mm2point(4);
    pdf.rect(x, y, lblLength - x, 3, 'F');

    x = params.a6width / 2;
    y += params.headerLineHeight + mm2point(4);

    header = i18n!.getDataByLanguage('fr')!.translation.pdfGreenCertificate;
    header = pdf.splitTextToSize(header, lblLength);
    pdf.text(header, x, y, { align: 'center', maxWidth: lblLength });

    let logoWidth = 82.495;
    let logoHeight = 59.5;
    x = (params.a6width - logoWidth) / 2;
    y += params.headerLineHeight + mm2point(7);
    pdf.addImage(logo, 'png', x, y, logoWidth, logoHeight);

    setTextColorBlack(pdf);
    pdf.setFont('calibri', 'normal');
}

const printDottedLine = (pdf: jsPDF, params: IPageParameter) => {
    let curX = 0 + params.marginLeft;
    let curY = params.a6height;
    let xTo = params.a6width * 2 - params.marginRight;
    let deltaX = 3;
    let deltaY = 3;

    pdf.setDrawColor(0, 122, 102);

    while (curX <= xTo) {
        pdf.line(curX, curY, curX + deltaX, curY);
        curX += 2 * deltaX;
    }

    curX = params.a6width;
    curY = 0 + params.marginTop;
    let yTo = params.a6height * 2 - params.marginBottom;
    while (curY <= yTo) {
        pdf.line(curX, curY, curX, curY + deltaY);
        curY += 2 * deltaY;
    }

    //Prints dotted line over page length and height
    // pdf.setLineDashPattern([3, 3], 0);
    // pdf.line(0, a6height, a6width*2, a6height);
    // pdf.line(a6width, 0, a6width, a6height*2);
}

const prepareFourthPageTest = (pdf: jsPDF, eudgc: EUDGC | undefined, params: IPageParameter,
    translation: any, testResultValueSet: any, testManufacturersValueSet: any,
    diseaseAgentsData: any, pageMiddle: number, lblLength: number) => {

    let test: TestEntry;

    if (eudgc!.t![0]) {
        test = eudgc!.t![0];
    }

    let headerEn = translation('translation:pdfHeaderTest');
    let headerFr = i18n!.getDataByLanguage('fr')!.translation.pdfHeaderTest;

    let y = printCertificateHeader(params, pdf, headerEn, headerFr);

    //For the labels on the left side
    let xLeft = params.a6width + params.paddingLeft;
    let yLeft = y + params.lineHeight10 * 2 + params.space;
    //For the text on the right side
    let xRight = params.a6width + pageMiddle;
    let yRight = yLeft;
    let space = 7;

    pdf.setFontSize(params.fontSize10);

    let lblLeftEn = translation('translation:pdfDisease');
    let lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfDisease;
    yLeft = printLine(pdf, lblLeftEn, xLeft, yLeft, params, lblLeftFr);

    let txtDisplay: string = getValueSetDisplay(test!.tg!, diseaseAgentsData) || '';
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfTypeOfTest');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfTypeOfTest;
    yLeft = printLine(pdf, lblLeftEn, xLeft, yLeft, params, lblLeftFr);

    pdf.text(test!.tt!, xRight, yRight);

    yLeft += space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfTestName');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfTypeOfTest;
    yLeft = printSplittedLine(pdf, lblLeftEn, lblLeftFr, lblLength, xLeft, yLeft, params);

    txtDisplay = pdf.splitTextToSize(test!.nm!, lblLength);
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfTestManufacturer');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfTestManufacturer;
    yLeft = printSplittedLine(pdf, lblLeftEn, lblLeftFr, lblLength, xLeft, yLeft, params);

    txtDisplay = getValueSetDisplay(test!.ma!, testManufacturersValueSet) || '';
    txtDisplay = pdf.splitTextToSize(txtDisplay, lblLength);
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfDateSampleCollection');
    lblLeftEn = i18n!.getDataByLanguage('fr')!.translation.pdfDateSampleCollection;
    yLeft = printSplittedLine(pdf, lblLeftEn, lblLeftFr, lblLength, xLeft, yLeft, params);
    pdf.text(convertDateToOutputFormat(test!.sc!), xRight, yRight);

    yLeft += space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfDateTestResult');
    lblLeftEn = i18n!.getDataByLanguage('fr')!.translation.pdfDateTestResult;
    yLeft = printSplittedLine(pdf, lblLeftEn, lblLeftFr, lblLength, xLeft, yLeft, params);
    pdf.text(convertDateToOutputFormat(test!.dr!), xRight, yRight);

    yLeft += space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfTestResult');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfTestResult;
    yLeft = printLine(pdf, lblLeftEn, xLeft, yLeft, params, lblLeftFr);

    txtDisplay = getValueSetDisplay(test!.tr!, testResultValueSet) || '';
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfTestingCentre');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfTestingCentre;
    yLeft = printLine(pdf, lblLeftEn, xLeft, yLeft, params, lblLeftFr);
    pdf.text(test!.tc!, xRight, yRight);

    yLeft += space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfStateOfVaccination');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfStateOfVaccination;
    yLeft = printLine(pdf, lblLeftEn, xLeft, yLeft, params, lblLeftFr);
    pdf.text(test!.co!, xRight, yRight);

    yLeft += space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfCertificateIssuer');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfCertificateIssuer;
    yLeft = printLine(pdf, lblLeftEn, xLeft, yLeft, params, lblLeftFr);
    pdf.text(test!.is!, xRight, yRight);
}

const prepareFourthPageVaccination = (pdf: jsPDF, eudgc: EUDGC | undefined, params: IPageParameter, translation: any,
    diseaseAgentsData: any, vaccines: any, vaccineManufacturers: any,
    vacMedsData: any, pageMiddle: number, lblLength: number) => {

    let vaccination: VaccinationEntry;
    if (eudgc!.v![0]) {
        vaccination = eudgc!.v![0];
    }

    let headerEn = translation('translation:pdfHeaderVaccination');
    let headerFr = i18n!.getDataByLanguage('fr')!.translation.pdfHeaderVaccination;

    let y = printCertificateHeader(params, pdf, headerEn, headerFr);

    //For the labels on the left side
    let xLeft = params.a6width + params.paddingLeft;
    let yLeft = y + params.lineHeight10 * 2 + params.space;
    //For the text on the right side
    let xRight = params.a6width + pageMiddle;
    let yRight = yLeft;

    pdf.setFontSize(params.fontSize10);

    let lblLeftEn = translation('translation:pdfDisease');
    let lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfDisease;
    yLeft = printLine(pdf, lblLeftEn, xLeft, yLeft, params, lblLeftFr);

    let txtDisplay: string = getValueSetDisplay(vaccination!.tg!, diseaseAgentsData) || '';
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight10 + params.space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfVaccineProphylaxis');
    lblLeftEn = i18n!.getDataByLanguage('fr')!.translation.pdfVaccineProphylaxis;
    yLeft = printLine(pdf, lblLeftEn, xLeft, yLeft, params, lblLeftFr);

    txtDisplay = getValueSetDisplay(vaccination!.vp!, vaccines) || '';
    txtDisplay = pdf.splitTextToSize(txtDisplay, lblLength);
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight10 + params.space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfVaccineMedicalProduct');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfVaccineProphylaxis;
    yLeft = printLine(pdf, lblLeftEn, xLeft, yLeft, params, lblLeftFr);

    txtDisplay = getValueSetDisplay(vaccination!.mp!, vacMedsData) || '';
    txtDisplay = pdf.splitTextToSize(txtDisplay, lblLength);
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight10 + params.space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfVaccineManufacturer');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfVaccineManufacturer;
    yLeft = printSplittedLine(pdf, lblLeftEn, lblLeftFr, lblLength, xLeft, yLeft, params);

    txtDisplay = getValueSetDisplay(vaccination!.ma!, vaccineManufacturers) || '';
    txtDisplay = pdf.splitTextToSize(txtDisplay, lblLength);
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight10 + params.space;
    yRight = yLeft;

    lblLeftEn = translation('translation:pdfNumberOfDoses');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfNumberOfDoses;
    yLeft = printSplittedLine(pdf, lblLeftEn, lblLeftFr, lblLength, xLeft, yLeft, params);
    pdf.text('' + vaccination!.dn!, xRight, yRight);

    yLeft += params.lineHeight10 + params.space;
    yRight = yLeft

    lblLeftEn = translation('translation:pdfDateOfVaccination');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfDateOfVaccination;
    yLeft = printLine(pdf, lblLeftEn, xLeft, yLeft, params, lblLeftFr);
    pdf.text(vaccination!.dt!, xRight, yRight);
    
    yLeft += params.lineHeight10 + params.space;
    yRight = yLeft

    lblLeftEn = translation('translation:pdfMemberStateOfVaccination');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfMemberStateOfVaccination;
    yLeft = printLine(pdf, lblLeftEn, xLeft, yLeft, params, lblLeftFr);
    pdf.text(vaccination!.co!, xRight, yRight);

    yLeft += params.lineHeight10 + params.space;
    yRight = yLeft

    lblLeftEn = translation('translation:pdfCertificateIssuer');
    lblLeftFr = i18n!.getDataByLanguage('fr')!.translation.pdfCertificateIssuer;
    yLeft = printLine(pdf, lblLeftEn, xLeft, yLeft, params, lblLeftFr);
    pdf.text(vaccination!.is!, xRight, yRight);
}

const prepareThirdPage = (pdf: jsPDF, params: IPageParameter, translation: any) => {

    let lblLength = params.a6width - params.paddingRight - params.paddingRight - mm2point(14);
    let space = mm2point(3);
    let imageWidth = 258.75;
    let imageHeight = 54.75;
    let y = params.a6height + mm2point(4);
    let x = (params.a6width - imageWidth) / 2;

    pdf.addImage(flag_seperator, x, y, imageWidth, imageHeight);

    x = params.a6width / 2;
    y += imageHeight + params.fontSize12 + mm2point(2);

    setTextColorTurkis(pdf);
    pdf.setFontSize(params.fontSize12);
    pdf.setFont('calibri', 'bold');
    let header = translation('translation:pdfMemberPlaceholder');
    header = pdf.splitTextToSize(header, lblLength);
    pdf.text(header, x, y, { align: 'center', maxWidth: lblLength });
    pdf.setFont('calibri', 'normal');

    y += params.lineHeight12 + space;
    setTextColorBlack(pdf);
    pdf.setFontSize(params.fontSize10);
    let infotext = translation('translation:pdfMemberPlaceholderInfo');
    infotext = pdf.splitTextToSize(infotext, lblLength);
    pdf.text(infotext, x, y, { align: 'center', maxWidth: lblLength });

    y += mm2point(65);
    pdf.setFontSize(params.fontSize9);
    infotext = translation('translation:pdfInfoText');
    infotext = pdf.splitTextToSize(infotext, lblLength);
    pdf.text(infotext, x, y, { align: 'center', maxWidth: lblLength });

    y += mm2point(10) + params.lineHeight9 * infotext.length;
    infotext = translation('translation:pdfRelevantInformation');
    infotext = pdf.splitTextToSize(infotext, lblLength);
    pdf.text(infotext, x, y, { align: 'center', maxWidth: lblLength });

    y += space + params.lineHeight9 * infotext.length;
    infotext = translation('translation:pdfInfoURL');
    infotext = pdf.splitTextToSize(infotext, lblLength);
    pdf.text(infotext, x, y, { align: 'center', maxWidth: lblLength });
}

function printSplittedLine(pdf: jsPDF, lblLeft: any, lblLeftFrench: any, lblLength: number, xLeft: number, yLeft: number, params: IPageParameter) : number{
    pdf.setFont('calibri', 'bold');
    lblLeft = pdf.splitTextToSize(lblLeft, lblLength);
    pdf.text(lblLeft, xLeft, yLeft);
    pdf.setFont('calibri', 'normal');
    yLeft += params.lineHeight10 * lblLeft.length + params.space;
    lblLeftFrench = pdf.splitTextToSize(lblLeftFrench, lblLength);
    pdf.text(lblLeftFrench, xLeft, yLeft);
    return yLeft + params.lineHeight10 * lblLeftFrench.length;
}

function printLine(pdf: jsPDF, lblLeft: any, xLeft: number, yLeft: number, params: IPageParameter, lblLeftFrench: string) : number{
    pdf.setFont('calibri', 'bold');
    pdf.text(lblLeft, xLeft, yLeft);
    pdf.setFont('calibri', 'normal');
    yLeft += params.lineHeight10 + params.space;
    pdf.text(lblLeftFrench, xLeft, yLeft);
    return yLeft + params.lineHeight10;
}

function printCertificateHeader(params: IPageParameter, pdf: jsPDF, header: any, frenchHeader: string) : number{
    let x = params.a6width + params.a6width / 2;
    let y = params.a6height + params.paddingTop + params.smallHeaderLineHeight;
    pdf.setFont('calibri', 'bold');
    pdf.setFontSize(params.smallHeaderFontSize);
    setTextColorTurkis(pdf);

    pdf.text(header, x, y, { align: 'center', maxWidth: params.a6width });
    y += params.smallHeaderLineHeight;
    frenchHeader = pdf.splitTextToSize(frenchHeader, params.a6width);
    pdf.text(frenchHeader, x, y, { align: 'center', maxWidth: params.a6width });
    setTextColorBlack(pdf);
    return y + frenchHeader.length;
}

function prepareFourthPageRecovery(pdf: jsPDF, eudgc: EUDGC | undefined, diseaseAgentsData: any, params: IPageParameter,
    pageMiddle: number, lblLength: number) {

    let recovery: RecoveryEntry = eudgc!.r![0];

    let x = params.a6width;
    let y = params.a6height + params.paddingTop + params.smallHeaderLineHeight;
    pdf.setFontSize(params.smallHeaderFontSize);
    let header = 'Certificate of recovery';
    let width = pdf.getTextWidth(header);
    x = params.a6width + (params.a6width - width) / 2;
    pdf.text(header, x, y);

    header = 'Certificat de rétablissement';
    width = pdf.getTextWidth(header);
    x = params.a6width + (params.a6width - width) / 2;
    y += params.headerLineHeight;
    pdf.text(header, x, y);

    //For the labels on the left side
    let xLeft = params.a6width + params.paddingLeft;
    let yLeft = y + params.lineHeight10 * 2;
    //For the text on the right side
    let xRight = params.a6width + pageMiddle;
    let yRight = y + params.lineHeight10 * 2;

    pdf.setFontSize(params.fontSize);

    let lblDisease: string = 'Disease or agent the citizen has recovered from';
    lblDisease = pdf.splitTextToSize(lblDisease, lblLength);
    pdf.text(lblDisease, xLeft, yLeft);
    yLeft += params.lineHeight10 * 2;
    lblDisease = "Maladie ou agent dont le citoyen s'est rétabli";
    lblDisease = pdf.splitTextToSize(lblDisease, lblLength);
    pdf.text(lblDisease, xLeft, yLeft);


    let txtDisplay: string = getValueSetDisplay(recovery.tg, diseaseAgentsData) || '';
    txtDisplay = pdf.splitTextToSize(txtDisplay, lblLength);
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight10 * 2 + params.space;
    yRight += params.lineHeight10 * 4 + params.space;

    let lblDate: string = 'Date of first positive test result';
    lblDate = pdf.splitTextToSize(lblDate, lblLength);
    pdf.text(lblDate, xLeft, yLeft);
    yLeft += params.lineHeight10 * 2;
    lblDate = "Date du premier résultat de test posifif";
    lblDate = pdf.splitTextToSize(lblDate, lblLength);
    pdf.text(lblDate, xLeft, yLeft);

    pdf.text(recovery.fr!, xRight, yRight);

    yLeft += params.lineHeight10 * 2 + params.space;
    yRight += params.lineHeight10 * 4 + params.space;

    pdf.text('Member State of test', xLeft, yLeft);
    yLeft += params.lineHeight10;
    pdf.text('État membre du test', xLeft, yLeft);

    pdf.text(recovery.co!, xRight, yRight);

    yLeft += params.lineHeight10 + params.space;
    yRight += params.lineHeight10 * 2 + params.space;

    pdf.text('Certificate issuer', xLeft, yLeft);
    yLeft += params.lineHeight10;
    pdf.text('Émetteur du certificat', xLeft, yLeft);

    pdf.text(recovery.is!, xRight, yRight);

    yLeft += params.lineHeight10 + params.space;
    yRight += params.lineHeight10 * 2 + params.space;

    pdf.text('Certificate valid from', xLeft, yLeft);
    yLeft += params.lineHeight10;
    pdf.text('Certificat valable à partir du', xLeft, yLeft);

    pdf.text(recovery.df!, xRight, yRight);

    yLeft += params.lineHeight10 + params.space;
    yRight += params.lineHeight10 * 2 + params.space;

    let lblValidTo: string = 'Certificate valid until (not more than 180 days after the date of first positive test result)';
    lblValidTo = pdf.splitTextToSize(lblValidTo, lblLength);
    pdf.text(lblValidTo, xLeft, yLeft);
    yLeft += params.lineHeight10 * 4;
    lblValidTo = "Certificat valable jusqu’au (180 jours au maximum après la date du premier résultat positif)";
    lblValidTo = pdf.splitTextToSize(lblValidTo, lblLength);
    pdf.text(lblValidTo, xLeft, yLeft);

    pdf.text(recovery.du!, xRight, yRight);
}

const setTextColorTurkis = (pdf: jsPDF) => {
    pdf.setTextColor(0, 122, 102);
}

const setTextColorBlack = (pdf: jsPDF) => {
    pdf.setTextColor(0, 0, 0);
}