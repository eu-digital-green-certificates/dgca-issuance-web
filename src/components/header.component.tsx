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
import { Image, Container } from 'react-bootstrap'

import '../i18n';
import { useTranslation } from 'react-i18next';

import EULogo from '../assets/images/Flag+EU.png'

const Header = (props: any) => {

    const { t } = useTranslation();

    const [isInit] = React.useState(true);

    return (!isInit ? <></> :
        <>
            <Container className='d-flex bg-white px-0 position-relative'>
                {/* simple header with logo */}
                <Image src={EULogo} className='m-3' />
                <span className='environment-font my-auto mx-1'>
                    {'\nenvironmentName' }
                </span>
            </Container>
            <Container className='d-flex bg-gray-1 px-0 position-relative'>
                <span className='header-title'>{t('translation:title')}</span>
            </Container>
        </>
    )
}

export default Header;