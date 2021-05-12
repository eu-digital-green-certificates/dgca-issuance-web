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

import { propTypes } from 'qrcode.react';
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

    const paddingLeft = mm2point(2);
    const paddingRight = mm2point(2);
    // let lblLength = canvasWidth/2 - 3;

    const lineHeight = 14;
    const fontSize = 11;
    const headerLineHeight = 22;
    const headerFontSize = 18;
    const lblLength = a6width / 2 - paddingLeft - paddingRight;
    const pageMiddle = a6width / 2;
    const space = 2;

    React.useEffect(() => {
        if (!qrCodeCanvasElement && !eudgc) {
            return;
        }

        let _ci: string = '';
        if (eudgc!.r) {
            _ci = eudgc!.r![0].ci;
        } else if (eudgc!.t) {
            _ci = eudgc!.t![0].ci;
        } else if (eudgc!.v) {
            _ci = eudgc!.v![0].ci;
        }

        const pdf = new jsPDF("p", "pt", "a4", true);

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

        pdf.text("vierte Seite", a6width, a6height + 12);
        //pdf.text("erste Seite", 0, 0 + 12);
        //pdf.text("zweite Seite", a6width, 0 + 12);
        pdf.text("dritte Seite", 0, a6height + 12);

        // First page
        prepareFirstPage(marginTop, headerLineHeight, pdf, headerFontSize, a6width, marginBottom);
        // End of first page

        // Second page
        prepareSecondPage(qrCodeCanvasElement, a6width, pdf, marginTop, lineHeight, pageMiddle, lblLength, eudgc, space, _ci);
        // End of second page

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
    lineHeight: number, pageMiddle: number, lblLength: number,
    eudgc: EUDGC | undefined, space: number, _ci: string) => {

    var canvas: HTMLCanvasElement = qrCodeCanvasElement;
    var img = canvas!.toDataURL("image/png,base64");
    let canvasWidth = 192;
    let centerLeft = (a6width - canvasWidth) / 2;
    pdf.addImage(img, 'png', a6width + centerLeft, marginTop, canvasWidth, canvasWidth);

    //For the labels on the left side
    let xLeft = a6width;
    let yLeft = marginTop + canvasWidth + lineHeight * 2;
    //For the variables on the right side
    let xRight = a6width + pageMiddle;
    let yRight = marginTop + canvasWidth + lineHeight * 2;

    pdf.setFontSize(11);

    let lblSurname: string = 'Surname(s) and forename(s)';
    lblSurname = pdf.splitTextToSize(lblSurname, lblLength);
    pdf.text(lblSurname, xLeft, yLeft);
    yLeft += lineHeight * 2;
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

    yRight += lineHeight * 4 + space;
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

