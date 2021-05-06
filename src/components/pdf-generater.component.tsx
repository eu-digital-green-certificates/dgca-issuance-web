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

import logo from '../assets/images/c-19_logo.png';
import successIcon from '../assets/images/icon_success.svg';


const PdfGenerator = (props: any) => {

    const [pdf, setPdf] = React.useState<jsPDF>();
    const [qrImage, setQrImage] = React.useState<HTMLCanvasElement>();
    //A4 210 x 297 mm
    //A7 105 x 74 mm

    const a7width = 105;
    const a7height = 148;

    React.useEffect(() => {
        const tmpPdf = new jsPDF("p", "mm", "a4", true);
        setPdf(tmpPdf);
        
        //setQrImage(props.svg);
        console.log(props.svg);
    
        //setPdf(tmpPdf);
    }, [props])

    React.useEffect(() => {
        if(!pdf || qrImage) {
            return;
        }

        pdf!.text("vierte Seite", a7width, a7height + 12);
        pdf!.text("erste Seite", 0 , 0 + 12);
        pdf!.text("zweite Seite", a7width, 0 + 12);
        pdf!.text("dritte Seite", 0, a7height + 12);

        // pdf.addSvgAsImage(successIcon, 0, 0, 32, 32);
        // Adding as svg throws an error
        //pdf!.addSvgAsImage(qrImage, 0, 0, 68, 68);
        var canvas: HTMLCanvasElement = props.svg;
        var img = canvas!.toDataURL("image/jpeg,1.0");
        pdf.addImage(img, 'jpeg', a7width, 0, 68, 68)
        
        
        pdf!.addImage(logo, 'png', 0, 0, 16, 16);
        // pdf!.addImage(logo, 'png', a7width, 0, 16, 16, undefined, 'FAST');
    
        pdf!.save('edgcPdfTest');
    }, [pdf])

 

    const { t } = useTranslation();

    return (
        <>
           
        </>
    )
}

export default PdfGenerator;