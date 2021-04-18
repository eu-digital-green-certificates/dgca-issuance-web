/*
 * Corona-Warn-App / cwa-quick-test-frontend
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

import { Image, Row } from 'react-bootstrap'

import '../i18n';
import { useTranslation } from 'react-i18next';

import DataProtectLogo from '../assets/images/data_protect.png'

const Footer = (props: any) => {
    const { t } = useTranslation();

    return (
        // simple footer with imprint and data privacy --> links tbd
        <Row id='qt-footer'>
            <span className="my-0 mx-5 footer-font">{t('translation:imprint')}</span>
            <Image className="my-auto" src={DataProtectLogo} />
            <span className="my-0 mx-2 footer-font">{t('translation:data-privacy')}</span>
        </Row>

    )
}

export default Footer;