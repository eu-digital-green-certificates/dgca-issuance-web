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

import logo from '../assets/images/EU_logo_big.png';

import { EUDGC, RecoveryEntry, TestEntry, VaccinationEntry } from '../generated-files/dgc-combined-schema';
import {
    useGetDiseaseAgents, useGetVaccineManufacturers, useGetVaccines,
    useGetVaccinMedicalData, useGetTestManufacturers, useGetTestResult
} from '../api';
import { getValueSetDisplay, convertDateToOutputFormat } from '../misc/ShowCertificateData';

import calibri from '../assets/SCSS/fonts/calibri.ttf';
import calibriI from '../assets/SCSS/fonts/calibrii.ttf';
import calibriB from '../assets/SCSS/fonts/calibrib.ttf';
import calibriBI from '../assets/SCSS/fonts/calibriz.ttf';

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
        headerLineHeight: 22,
        headerFontSize: 18,
        smallHeaderLineHeight: 15,
        smallHeaderFontSize: 12,
        space: 2
    }

    const lblLength = params.a6width / 2 - params.paddingLeft - params.paddingRight;
    const pageMiddle = params.a6width / 2;

    const [pdf, setPdf] = React.useState<jsPDF>();

    React.useEffect(() => {
        const _pdf = new jsPDF("p", "pt", "a4", true);

        const c = Buffer.from(calibri);
        const ci = Buffer.from(calibriI);
        const cb = Buffer.from(calibriB);
        const cbi = Buffer.from(calibriBI);

        _pdf.addFileToVFS("Calibri", c.toString());
        _pdf.addFileToVFS("Calibri-Italic", ci.toString());
        _pdf.addFileToVFS("Calibri-Bold", cb.toString());
        _pdf.addFileToVFS("Calibri-BoldItalic", cbi.toString());

        _pdf.addFont("Calibri", "calibri", "normal");
        _pdf.addFont("Calibri-Italic", "calibri", "italic");
        _pdf.addFont("Calibri-Bold", "calibri", "bold");
        _pdf.addFont("Calibri-BoldItalic", "calibri", "bolditalic");

        // _pdf.setFont('calibri', 'normal');
        // console.log(_pdf.getFont());

        // _pdf.text('Hello', 50, 50,);

        // _pdf.setFont('calibri', 'italic');
        // console.log(_pdf.getFont());
        // _pdf.text('world', 100, 50,);
        
        // _pdf.setFont('calibri', 'bold');
        // console.log(_pdf.getFont());

        // _pdf.text('Hello', 50, 100,);

        // _pdf.setFont('calibri', 'bolditalic');

        // _pdf.text('world', 100, 100,);


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
            prepareFourthPageTest(_pdf, eudgc, params, testResultValueSet, testManufacturersValueSet,
                diseaseAgentsData, pageMiddle, lblLength);
        } else if (eudgc!.v) {
            _ci = eudgc!.v![0].ci;
            prepareFourthPageVaccination(_pdf, eudgc, params, diseaseAgentsData, vaccines, vaccineManufacturers,
                vacMedsData, pageMiddle, lblLength);
        }

        // const calibri: string = pdf.loadFile('../assets/SCSS/fonts/calibri.ttf');
        // console.log("Font: " + calibri);
        // const calibrib: string = pdf.loadFile('../assets/SCSS/fonts/calibrib.ttf');
        // pdf.addFileToVFS('calibri.ttf', calibri);
        // pdf.addFileToVFS('calibrib.ttf', calibrib);
        // pdf.addFont('calibrib.ttf', 'calibrib', 'normal');
        // pdf.addFont('calibri.ttf', 'calibri', 'normal');
        // pdf.setFont('calibrib');
        // pdf.text('Hello World', 15, 15);
        // pdf.setFont('calibri');
        // pdf.text('Hello World', 15, 30);
        console.log(_pdf.getFont());

        prepareFirstPage(_pdf, params);

        prepareSecondPage(_pdf, params, eudgc, t, qrCodeCanvasElement, pageMiddle, lblLength, _ci);

        prepareThirdPage(_pdf, params);

        printDottedLine(_pdf, params);

        _pdf.save('edgcPdfTest');
    }, [qrCodeCanvasElement]);

}

export default usePdfGenerator;

const prepareSecondPage = (pdf: jsPDF, params: IPageParameter, eudgc: EUDGC | undefined,
    t: any, qrCodeCanvasElement: HTMLCanvasElement, pageMiddle: number, lblLength: number, _ci: string) => {

    var canvas: HTMLCanvasElement = qrCodeCanvasElement;
    var img = canvas!.toDataURL("image/png,base64");
    let canvasWidth = 192;
    let centerLeft = (params.a6width - canvasWidth) / 2;
    pdf.addImage(img, 'png', params.a6width + centerLeft, params.marginTop, canvasWidth, canvasWidth);

    //For the labels on the left side
    let xLeft = params.a6width + params.paddingLeft;
    let yLeft = params.marginTop + canvasWidth + params.lineHeight * 2;
    //For the variables on the right side
    let xRight = params.a6width + pageMiddle;
    let yRight = params.marginTop + canvasWidth + params.lineHeight * 2;

    pdf.setFontSize(params.fontSize);

    let lblSurname: string = t('translation:pdfSurname');
    lblSurname = pdf.splitTextToSize(lblSurname, lblLength);
    pdf.text(lblSurname, xLeft, yLeft);
    yLeft += params.lineHeight * 2;

    lblSurname = i18n!.getDataByLanguage('fr')!.translation.pdfSurname
    lblSurname = pdf.splitTextToSize(lblSurname, lblLength);
    pdf.text(lblSurname, xLeft, yLeft);

    let name = eudgc!.nam!.fnt + ' ' + eudgc!.nam!.gnt;
    name = pdf.splitTextToSize(name, lblLength);
    pdf.text(name, xRight, yRight);

    yLeft += params.lineHeight * 2 + params.space;
    pdf.text('Date of birth', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Date de naissance', xLeft, yLeft);

    yRight += params.lineHeight * 4 + params.space;
    pdf.text(eudgc!.dob, xRight, yRight);

    yLeft += params.lineHeight + params.space;
    let lblci = 'Unique certificate identifier';
    lblci = pdf.splitTextToSize(lblci, lblLength);
    pdf.text(lblci, xLeft, yLeft);
    yLeft += params.lineHeight;
    lblci = 'Identifiant unique du certificat';
    lblci = pdf.splitTextToSize(lblci, lblLength);
    pdf.text(lblci, xLeft, yLeft);

    yRight += params.lineHeight * 2 + params.space;
    _ci = pdf.splitTextToSize(_ci, lblLength);
    pdf.text(_ci, xRight, yRight);
}

const prepareFirstPage = (pdf: jsPDF, params: IPageParameter) => {
    let x = 0;
    let y = params.marginTop + params.headerLineHeight;
    pdf.setFontSize(params.headerFontSize);
    let header = 'DIGITAL GREEN CERTIFICATE';
    let width = pdf.getTextWidth(header);
    x = (params.a6width - width) / 2;
    pdf.text(header, x, y);

    header = 'CERTIFICAT VERT NUMÉRIQUE';
    width = pdf.getTextWidth(header);
    x = (params.a6width - width) / 2;
    y += params.headerLineHeight;
    pdf.text(header, x, y);

    let logoWidth = 132.75;
    let logoHeight = 88.5;
    x = (params.a6width - logoWidth) / 2;
    pdf.addImage(logo, 'png', x, params.a6width - params.marginBottom, logoWidth, logoHeight);
}

const printDottedLine = (pdf: jsPDF, params: IPageParameter) => {
    let curX = 0 + params.marginLeft;
    let curY = params.a6height;
    let xTo = params.a6width * 2 - params.marginRight;
    let deltaX = 3;
    let deltaY = 3;
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

const prepareFourthPageTest = (pdf: jsPDF, eudgc: EUDGC | undefined, params:IPageParameter, 
    testResultValueSet: any, testManufacturersValueSet: any,
    diseaseAgentsData: any, pageMiddle: number, lblLength: number) => {

    let test: TestEntry;

    if (eudgc!.t![0]) {
        test = eudgc!.t![0];
    }

    //Font for header is not smallHeaderFontSize, because it's not possible 
    //to put all the required text on the page.
    let x = params.a6width;
    let y = params.a6height + params.lineHeight;
    
    pdf.setFontSize(params.fontSize);

    let header = 'Test certificate';
    let width = pdf.getTextWidth(header);
    x = params.a6width + (params.a6width - width) / 2;
    pdf.text(header, x, y);

    header = 'Certificat de test';
    width = pdf.getTextWidth(header);
    x = params.a6width + (params.a6width - width) / 2;
    y += params.lineHeight;
    pdf.text(header, x, y);

    pdf.setFontSize(params.fontSize);

    let xLeft = params.a6width + params.paddingLeft;
    let yLeft = y + params.smallHeaderLineHeight;
    //For the text on the right side
    let xRight = params.a6width + pageMiddle;
    let yRight = y + params.smallHeaderLineHeight;

    pdf.setFontSize(params.fontSize);

    pdf.text('Disease or agent targeted', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Maladie ou agent ciblé', xLeft, yLeft);

    let txtDisplay: string = getValueSetDisplay(test!.tg!, diseaseAgentsData) || '';
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight;
    yRight += params.lineHeight * 2;

    pdf.text('Type of test', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Type de test', xLeft, yLeft);

    pdf.text(test!.tt!, xRight, yRight);

    yLeft += params.lineHeight;
    yRight += params.lineHeight * 2;

    let lblTestName: string = 'Test name (optional for NAAT';
    lblTestName = pdf.splitTextToSize(lblTestName, lblLength);
    pdf.text(lblTestName, xLeft, yLeft);
    yLeft += params.lineHeight * lblTestName.length;
    lblTestName = 'Nom du test (facultatif pour TAAN';
    lblTestName = pdf.splitTextToSize(lblTestName, lblLength);
    pdf.text(lblTestName, xLeft, yLeft);

    pdf.text(test!.nm!, xRight, yRight);

    yLeft += params.lineHeight * 2;
    yRight += params.lineHeight * 4;

    let lblManufacturer: string = 'Test manufacturer (optional for NAAT)';
    lblManufacturer = pdf.splitTextToSize(lblManufacturer, lblLength);
    pdf.text(lblManufacturer, xLeft, yLeft);
    yLeft += params.lineHeight * 2;
    lblManufacturer = 'Fabricant du test (facultatif pour un test TAAN) ';
    lblManufacturer = pdf.splitTextToSize(lblManufacturer, lblLength);
    pdf.text(lblManufacturer, xLeft, yLeft);

    txtDisplay = getValueSetDisplay(test!.ma!, testManufacturersValueSet) || '';
    txtDisplay = pdf.splitTextToSize(txtDisplay, lblLength);
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight * 2;
    yRight += params.lineHeight * 4;

    let lblSampleDate: string = 'Date and time of the test sample collection';
    lblSampleDate = pdf.splitTextToSize(lblSampleDate, lblLength);
    pdf.text(lblSampleDate, xLeft, yLeft);
    yLeft += params.lineHeight * 2;
    lblSampleDate = "Date et heure du prélèvement de l’échantillon";
    lblSampleDate = pdf.splitTextToSize(lblSampleDate, lblLength);
    pdf.text(lblSampleDate, xLeft, yLeft);

    pdf.text(convertDateToOutputFormat(test!.sc!), xRight, yRight);

    yLeft += params.lineHeight * 2;
    yRight += params.lineHeight * 4;

    let lblDateTestResult: string = 'Date and time of the test result production (optional for RAT)';
    lblDateTestResult = pdf.splitTextToSize(lblDateTestResult, lblLength);
    pdf.text(lblDateTestResult, xLeft, yLeft);
    yLeft += params.lineHeight * 3;
    lblDateTestResult = "Date et heure de la production des résultats du test  ";
    lblDateTestResult = pdf.splitTextToSize(lblDateTestResult, lblLength);
    pdf.text(lblDateTestResult, xLeft, yLeft);

    pdf.text(convertDateToOutputFormat(test!.dr!), xRight, yRight);

    yLeft += params.lineHeight * 3;
    yRight += params.lineHeight * 6;

    pdf.text('Result of the test', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Résultat du test', xLeft, yLeft);

    txtDisplay = getValueSetDisplay(test!.tr!, testResultValueSet) || '';
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight;
    yRight += params.lineHeight * 2;

    pdf.text('Testing centre or facility', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Centre ou installation de test', xLeft, yLeft);

    pdf.text(test!.tc!, xRight, yRight);

    yLeft += params.lineHeight;
    yRight += params.lineHeight * 2;

    pdf.text('Member State of vaccination', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('État membre de vaccination', xLeft, yLeft);

    pdf.text(test!.co!, xRight, yRight);

    yLeft += params.lineHeight;
    yRight += params.lineHeight * 2;

    pdf.text('Certificate issuer', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Émetteur du certificat', xLeft, yLeft);

    pdf.text(test!.is!, xRight, yRight);
}

const prepareFourthPageVaccination = (pdf: jsPDF, eudgc: EUDGC | undefined, params: IPageParameter,
    diseaseAgentsData: any, vaccines: any, vaccineManufacturers: any,
    vacMedsData: any, pageMiddle: number, lblLength: number) => {
    let vaccination: VaccinationEntry;
    if (eudgc!.v![0]) {
        vaccination = eudgc!.v![0];
    }

    let x = params.a6width;
    let y = params.a6height + params.paddingTop + params.smallHeaderLineHeight;
    pdf.setFontSize(params.smallHeaderFontSize);
    let header = 'Vaccination certificate';
    let width = pdf.getTextWidth(header);
    x = params.a6width + (params.a6width - width) / 2;
    pdf.text(header, x, y);

    header = 'Certificat de vaccination';
    width = pdf.getTextWidth(header);
    x = params.a6width + (params.a6width - width) / 2;
    y += params.headerLineHeight;
    pdf.text(header, x, y);

    //For the labels on the left side
    let xLeft = params.a6width + params.paddingLeft;
    let yLeft = y + params.lineHeight * 2;
    //For the text on the right side
    let xRight = params.a6width + pageMiddle;
    let yRight = y + params.lineHeight * 2;

    pdf.setFontSize(params.fontSize);

    pdf.text('Disease or agent targeted', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Maladie ou agent ciblé', xLeft, yLeft);

    let txtDisplay: string = getValueSetDisplay(vaccination!.tg!, diseaseAgentsData) || '';
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight + params.space;
    yRight += params.lineHeight * 2 + params.space;

    pdf.text('Vaccine/prophylaxis', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Vaccin/prophylaxie', xLeft, yLeft);

    txtDisplay = getValueSetDisplay(vaccination!.vp!, vaccines) || '';
    txtDisplay = pdf.splitTextToSize(txtDisplay, lblLength);
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight + params.space;
    yRight = yLeft;

    pdf.text('Vaccine medicinal product', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Médicament vaccinal', xLeft, yLeft);

    txtDisplay = getValueSetDisplay(vaccination!.mp!, vacMedsData) || '';
    txtDisplay = pdf.splitTextToSize(txtDisplay, lblLength);
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight + params.space;
    yRight += params.lineHeight * 2 + params.space;

    let lblManufacturer: string = 'Vaccine marketing authorisation holder or manufacturer';
    lblManufacturer = pdf.splitTextToSize(lblManufacturer, lblLength);
    pdf.text(lblManufacturer, xLeft, yLeft);
    yLeft += params.lineHeight * 3;
    lblManufacturer = "Fabricant ou titulaire de l’autorisation de mise sur le marché du vaccin";
    lblManufacturer = pdf.splitTextToSize(lblManufacturer, lblLength);
    pdf.text(lblManufacturer, xLeft, yLeft);

    txtDisplay = getValueSetDisplay(vaccination!.ma!, vaccineManufacturers) || '';
    txtDisplay = pdf.splitTextToSize(txtDisplay, lblLength);
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight * 3 + params.space;
    yRight += params.lineHeight * 6 + params.space;

    let lblNumberOfDoses: string = 'Number in a series of vaccinations/doses and the overall number of doses in the series';
    lblNumberOfDoses = pdf.splitTextToSize(lblNumberOfDoses, lblLength);
    pdf.text(lblNumberOfDoses, xLeft, yLeft);
    yLeft += params.lineHeight * 4;
    lblNumberOfDoses = "Nombre dans une série de vaccins/doses";
    lblNumberOfDoses = pdf.splitTextToSize(lblNumberOfDoses, lblLength);
    pdf.text(lblNumberOfDoses, xLeft, yLeft);

    pdf.text('' + vaccination!.dn!, xRight, yRight);

    yLeft += params.lineHeight * 2 + params.space;
    yRight += params.lineHeight * 6 + params.space;

    pdf.text('Date of vaccination', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Date de la vaccination', xLeft, yLeft);

    pdf.text(vaccination!.dt!, xRight, yRight);

    yLeft += params.lineHeight + params.space;
    yRight += params.lineHeight * 2 + params.space;

    pdf.text('Member State of vaccination', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('État membre de vaccination', xLeft, yLeft);

    pdf.text(vaccination!.co!, xRight, yRight);

    yLeft += params.lineHeight + params.space;
    yRight += params.lineHeight * 2 + params.space;

    pdf.text('Certificate issuer', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Émetteur du certificat', xLeft, yLeft);

    pdf.text(vaccination!.is!, xRight, yRight);
}

const prepareThirdPage = (pdf: jsPDF, params: IPageParameter) => {
    let rectWidth = params.a6width - params.marginLeft - params.paddingRight;
    let rectHeight = rectWidth * 0.75;
    let x = (params.a6width - rectWidth) / 2;
    let y = params.a6height + params.marginTop;
    pdf.rect(x, y, rectWidth, rectHeight);

    y += params.lineHeight + params.space;
    let lblInfoText = "Member state placeholder";
    let widthTxt = pdf.getTextWidth(lblInfoText);
    x = x + (rectWidth - widthTxt) / 2;
    pdf.text(lblInfoText, x, y);

    y += params.lineHeight * 2;
    lblInfoText = "(information on issuing entity, national COVID-19 information etc. – no additional personal data).";
    lblInfoText = pdf.splitTextToSize(lblInfoText, rectWidth - params.paddingLeft - params.paddingRight);
    x = (params.a6width - rectWidth) / 2 + params.paddingRight;
    pdf.text(lblInfoText, x, y);

    x = (params.a6width - rectWidth) / 2
    y = params.a6height + params.marginTop + rectHeight + params.lineHeight * 2;

    lblInfoText = "This certificate is not a travel document. The scientific evidence on COVID-19 vaccination, testing and recovery continues to evolve, also in view of new variants of concern of the virus. Before traveling, please check the applicable public health measures and related restrictions applied at the point of destination.";
    lblInfoText = pdf.splitTextToSize(lblInfoText, rectWidth);
    pdf.text(lblInfoText, x, y, { align: 'justify', maxWidth: rectWidth });

    y += params.lineHeight * 8;

    lblInfoText = "Relevant information can be found here:";
    pdf.text(lblInfoText, x, y);

    y += params.lineHeight;

    lblInfoText = "https://reopen.europa.eu/en";
    pdf.text(lblInfoText, x, y);
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
    let yLeft = y + params.lineHeight * 2;
    //For the text on the right side
    let xRight = params.a6width + pageMiddle;
    let yRight = y + params.lineHeight * 2;

    pdf.setFontSize(params.fontSize);

    let lblDisease: string = 'Disease or agent the citizen has recovered from';
    lblDisease = pdf.splitTextToSize(lblDisease, lblLength);
    pdf.text(lblDisease, xLeft, yLeft);
    yLeft += params.lineHeight * 2;
    lblDisease = "Maladie ou agent dont le citoyen s'est rétabli";
    lblDisease = pdf.splitTextToSize(lblDisease, lblLength);
    pdf.text(lblDisease, xLeft, yLeft);


    let txtDisplay: string = getValueSetDisplay(recovery.tg, diseaseAgentsData) || '';
    txtDisplay = pdf.splitTextToSize(txtDisplay, lblLength);
    pdf.text(txtDisplay, xRight, yRight);

    yLeft += params.lineHeight * 2 + params.space;
    yRight += params.lineHeight * 4 + params.space;

    let lblDate: string = 'Date of first positive test result';
    lblDate = pdf.splitTextToSize(lblDate, lblLength);
    pdf.text(lblDate, xLeft, yLeft);
    yLeft += params.lineHeight * 2;
    lblDate = "Date du premier résultat de test posifif";
    lblDate = pdf.splitTextToSize(lblDate, lblLength);
    pdf.text(lblDate, xLeft, yLeft);

    pdf.text(recovery.fr!, xRight, yRight);

    yLeft += params.lineHeight * 2 + params.space;
    yRight += params.lineHeight * 4 + params.space;

    pdf.text('Member State of test', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('État membre du test', xLeft, yLeft);

    pdf.text(recovery.co!, xRight, yRight);

    yLeft += params.lineHeight + params.space;
    yRight += params.lineHeight * 2 + params.space;

    pdf.text('Certificate issuer', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Émetteur du certificat', xLeft, yLeft);

    pdf.text(recovery.is!, xRight, yRight);

    yLeft += params.lineHeight + params.space;
    yRight += params.lineHeight * 2 + params.space;

    pdf.text('Certificate valid from', xLeft, yLeft);
    yLeft += params.lineHeight;
    pdf.text('Certificat valable à partir du', xLeft, yLeft);

    pdf.text(recovery.df!, xRight, yRight);

    yLeft += params.lineHeight + params.space;
    yRight += params.lineHeight * 2 + params.space;

    let lblValidTo: string = 'Certificate valid until (not more than 180 days after the date of first positive test result)';
    lblValidTo = pdf.splitTextToSize(lblValidTo, lblLength);
    pdf.text(lblValidTo, xLeft, yLeft);
    yLeft += params.lineHeight * 4;
    lblValidTo = "Certificat valable jusqu’au (180 jours au maximum après la date du premier résultat positif)";
    lblValidTo = pdf.splitTextToSize(lblValidTo, lblLength);
    pdf.text(lblValidTo, xLeft, yLeft);

    pdf.text(recovery.du!, xRight, yRight);
}