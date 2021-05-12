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

import '../i18n';
import { useTranslation } from 'react-i18next';

import { jsPDF, TextOptionsLight } from "jspdf";

import logo from '../assets/images/EU_logo_big.png';

import { EUDGC, RecoveryEntry } from '../generated-files/dgc-combined-schema';

const usePdfGenerator = (qrCodeCanvasElement: any, eudgc: EUDGC | undefined) => {

    //A4 210 x 297 mm or 2480 x 3508 pixels or 595 × 842 points
    //A6 105 x 74 mm or 1240 x 1748 pixels or 298 × 420 points

    const a6width = 298;
    const a6height = 420;

    const marginTop = mm2point(15);
    const marginBottom = mm2point(15);
    const marginLeft = mm2point(15);
    const marginRight = mm2point(15);

    const paddingLeft = mm2point(1);
    const paddingRight = mm2point(1);
    const paddingTop = mm2point(1);
    // let lblLength = canvasWidth/2 - 3;

    const lineHeight = 14;
    const fontSize = 11;
    const headerLineHeight = 22;
    const headerFontSize = 18;
    const smallHeaderLineHeight = 15;
    const smallHeaderFontSize = 12;
    const lblLength = a6width / 2 - paddingLeft - paddingRight;
    const pageMiddle = a6width / 2;
    const space = 2;

    React.useEffect(() => {
        if (!qrCodeCanvasElement && !eudgc) {
            return;
        }

        const pdf = new jsPDF("p", "pt", "a4", true);

        let _ci: string = '';
        if (eudgc!.r) {
            _ci = eudgc!.r![0].ci;
            prepareFourthPageRecovery(eudgc, a6width, a6height, paddingTop, smallHeaderLineHeight,
                pdf, smallHeaderFontSize, headerLineHeight, paddingLeft, lineHeight, pageMiddle,
                fontSize, lblLength, space);
        } else if (eudgc!.t) {
            _ci = eudgc!.t![0].ci;
        } else if (eudgc!.v) {
            _ci = eudgc!.v![0].ci;
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
        // console.log(pdf.getFont());

        //pdf.text("vierte Seite", a6width, a6height + 12);
        //pdf.text("erste Seite", 0, 0 + 12);
        //pdf.text("zweite Seite", a6width, 0 + 12);
        pdf.text("dritte Seite", 0, a6height + 12);

        prepareFirstPage(marginTop, headerLineHeight, pdf, headerFontSize, a6width, marginBottom);

        prepareSecondPage(qrCodeCanvasElement, a6width, pdf, marginTop, lineHeight, pageMiddle,
            lblLength, fontSize, paddingLeft, eudgc, space, _ci);

        pdf.save('edgcPdfTest');
    }, [qrCodeCanvasElement]);

}

const point2mm = (point: number): number => {
    return point * 0.352778;
}

const mm2point = (mm: number): number => {
    return mm * 2.83465;
}

const pixel2point = (pixel: number): number => {
    return pixel * 0.75;
}

export default usePdfGenerator;

const prepareSecondPage = (qrCodeCanvasElement: any, a6width: number, pdf: jsPDF, marginTop: number,
    lineHeight: number, pageMiddle: number, lblLength: number, fontSize: number, paddingLeft: number,
    eudgc: EUDGC | undefined, space: number, _ci: string) => {

    var canvas: HTMLCanvasElement = qrCodeCanvasElement;
    var img = canvas!.toDataURL("image/png,base64");
    let canvasWidth = 192;
    let centerLeft = (a6width - canvasWidth) / 2;
    pdf.addImage(img, 'png', a6width + centerLeft, marginTop, canvasWidth, canvasWidth);

    //For the labels on the left side
    let xLeft = a6width + paddingLeft;
    let yLeft = marginTop + canvasWidth + lineHeight * 2;
    //For the variables on the right side
    let xRight = a6width + pageMiddle;
    let yRight = marginTop + canvasWidth + lineHeight * 2;

    pdf.setFontSize(fontSize);

    let lblSurname: string = 'Surname(s) and forename(s)';
    lblSurname = pdf.splitTextToSize(lblSurname, lblLength);
    pdf.text(lblSurname, xLeft, yLeft);
    yLeft += lineHeight;
    lblSurname = 'Nom(s) de famille et prénom(s)';
    lblSurname = pdf.splitTextToSize(lblSurname, lblLength);
    pdf.text(lblSurname, xLeft, yLeft);

    let name = eudgc!.nam!.fnt + ' ' + eudgc!.nam!.gnt;
    name = pdf.splitTextToSize(name, lblLength);
    pdf.text(name, xRight, yRight);

    yLeft += lineHeight * 2 + space;
    pdf.text('Date of birth', xLeft, yLeft);
    yLeft += lineHeight;
    pdf.text('Date de naissance', xLeft, yLeft);

    yRight += lineHeight * 3 + space;
    pdf.text(eudgc!.dob, xRight, yRight);

    yLeft += lineHeight + space;
    let lblci = 'Unique certificate identifier';
    lblci = pdf.splitTextToSize(lblci, lblLength);
    pdf.text(lblci, xLeft, yLeft);
    yLeft += lineHeight;
    lblci = 'Identifiant unique du certificat';
    lblci = pdf.splitTextToSize(lblci, lblLength);
    pdf.text(lblci, xLeft, yLeft);

    yRight += lineHeight * 2 + space;
    _ci = pdf.splitTextToSize(_ci, lblLength);
    pdf.text(_ci, xRight, yRight);
}
const prepareFirstPage = (marginTop: number, headerLineHeight: number, pdf: jsPDF, headerFontSize: number,
    a6width: number, marginBottom: number) => {
    let x = 0;
    let y = marginTop + headerLineHeight;
    pdf.setFontSize(headerFontSize);
    let header = 'DIGITAL GREEN CERTIFICATE';
    let width = pdf.getTextWidth(header);
    x = (a6width - width) / 2;
    pdf.text(header, x, y);

    header = 'CERTIFICAT VERT NUMÉRIQUE';
    width = pdf.getTextWidth(header);
    x = (a6width - width) / 2;
    y += headerLineHeight;
    pdf.text(header, x, y);

    let logoWidth = 132.75;
    let logoHeight = 88.5;
    x = (a6width - logoWidth) / 2;
    pdf.addImage(logo, 'png', x, a6width - marginBottom, logoWidth, logoHeight);
}

function prepareFourthPageRecovery(eudgc: EUDGC | undefined, a6width: number, a6height: number, paddingTop: number, smallHeaderLineHeight: number, pdf: jsPDF, smallHeaderFontSize: number, headerLineHeight: number, paddingLeft: number, lineHeight: number, pageMiddle: number, fontSize: number, lblLength: number, space: number) {
    let recovery: RecoveryEntry = eudgc!.r![0];

    let x = a6width;
    let y = a6height + paddingTop + smallHeaderLineHeight;
    pdf.setFontSize(smallHeaderFontSize);
    let header = 'Certificate of recovery';
    let width = pdf.getTextWidth(header);
    x = a6width + (a6width - width) / 2;
    pdf.text(header, x, y);

    header = 'Certificat de rétablissement';
    width = pdf.getTextWidth(header);
    x = a6width + (a6width - width) / 2;
    y += headerLineHeight;
    pdf.text(header, x, y);

    //For the labels on the left side
    let xLeft = a6width + paddingLeft;
    let yLeft = y + lineHeight * 2;
    //For the text on the right side
    let xRight = a6width + pageMiddle;
    let yRight = y + lineHeight * 2;

    pdf.setFontSize(fontSize);

    let lblDisease: string = 'Disease or agent the citizen has recovered from';
    lblDisease = pdf.splitTextToSize(lblDisease, lblLength);
    pdf.text(lblDisease, xLeft, yLeft);
    yLeft += lineHeight * 2;
    lblDisease = "Maladie ou agent dont le citoyen s'est rétabli";
    lblDisease = pdf.splitTextToSize(lblDisease, lblLength);
    pdf.text(lblDisease, xLeft, yLeft);

    let disease = recovery.tg;
    disease = pdf.splitTextToSize(disease, lblLength);
    pdf.text(disease, xRight, yRight);

    yLeft += lineHeight * 2 + space;
    yRight += lineHeight * 4 + space;

    let lblDate: string = 'Date of first positive test result';
    lblDate = pdf.splitTextToSize(lblDate, lblLength);
    pdf.text(lblDate, xLeft, yLeft);
    yLeft += lineHeight * 2;
    lblDate = "Date du premier résultat de test posifif";
    lblDate = pdf.splitTextToSize(lblDate, lblLength);
    pdf.text(lblDate, xLeft, yLeft);

    pdf.text(recovery.fr!, xRight, yRight);

    yLeft += lineHeight * 2 + space;
    yRight += lineHeight * 4 + space;

    pdf.text('Member State of test', xLeft, yLeft);
    yLeft += lineHeight;
    pdf.text('État membre du test', xLeft, yLeft);

    pdf.text(recovery.co!, xRight, yRight);

    yLeft += lineHeight + space;
    yRight += lineHeight * 2 + space;

    pdf.text('Certificate issuer', xLeft, yLeft);
    yLeft += lineHeight;
    pdf.text('Émetteur du certificat', xLeft, yLeft);

    pdf.text(recovery.is!, xRight, yRight);

    yLeft += lineHeight + space;
    yRight += lineHeight * 2 + space;

    pdf.text('Certificate valid from', xLeft, yLeft);
    yLeft += lineHeight;
    pdf.text('Certificat valable à partir du', xLeft, yLeft);

    pdf.text(recovery.df!, xRight, yRight);

    yLeft += lineHeight + space;
    yRight += lineHeight * 2 + space;

    let lblValidTo: string = 'Certificate valid until (not more than 180 days after the date of first positive test result)';
    lblValidTo = pdf.splitTextToSize(lblValidTo, lblLength);
    pdf.text(lblValidTo, xLeft, yLeft);
    yLeft += lineHeight * 4;
    lblValidTo = "Certificat valable jusqu’au (180 jours au maximum après la date du premier résultat positif)";
    lblValidTo = pdf.splitTextToSize(lblValidTo, lblLength);
    pdf.text(lblValidTo, xLeft, yLeft);

    pdf.text(recovery.du!, xRight, yRight);
}

