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

import { jsPDF } from "jspdf";

import logo from '../assets/images/dgca_issuance_web.png';

const usePdfGenerator = (qrCodeCanvasElement: any) => {

    //A4 210 x 297 mm or 2480 x 3508 pixels
    //A6 105 x 74 mm or 1240 x 1748 pixels

    const a6width = 105;
    const a6height = 148;

    React.useEffect(() => {
        if (!qrCodeCanvasElement) {
            return;
        }

        const pdf = new jsPDF("p", "mm", "a4", true);

        pdf.text("vierte Seite", a6width, a6height + 12);
        pdf!.text("erste Seite", 0, 0 + 12);
        pdf.text("zweite Seite", a6width, 0 + 12);
        pdf.text("dritte Seite", 0, a6height + 12);

        var canvas: HTMLCanvasElement = qrCodeCanvasElement;
        // var img = canvas!.toDataURL("image/jpeg,1.0");
        var img = canvas!.toDataURL("image/png,base64");
        pdf.addImage(img, 'png', a6width, 0, 68, 68)

        pdf.addImage(logo, 'png', 0, 0, 16, 16);

        pdf.save('edgcPdfTest');
    }, [qrCodeCanvasElement]);

}

export default usePdfGenerator;