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

import { Col, Container, Image, Row } from 'react-bootstrap'

import '../i18n';
import { useTranslation } from 'react-i18next';

import DataProtectLogo from '../assets/images/data_protect.png'

const Footer = (props: any) => {
    const { t } = useTranslation();

    return (
        // simple footer with imprint and data privacy --> links tbd
        <Container className='d-flex px-0 bg-primary'>
            <Row id='qt-footer'>
                <Col xs='6' className='pr-3'>
                    <span className='footer-font' >{t('translation:title')}</span>
                </Col>
                <Col xs='6' className='pr-3 d-flex justify-content-end'>
                <span className="footer-font pr-3">{t('translation:data-privacy')}</span>
                <span className="footer-font pl-3">{t('translation:imprint')}</span>
                </Col>
            </Row>
        </Container>
    )
}

export default Footer;