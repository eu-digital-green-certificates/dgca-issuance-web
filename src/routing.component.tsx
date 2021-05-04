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
import { Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'

import './i18n';
import { useTranslation } from 'react-i18next';

import {useRoutes} from './misc/navigation';

import Footer from './components/footer.component';
import Header from './components/header.component';
import LandingPage from './components/landing-page.component';

import PrivateRoute from './components/private-route.component';
import IError from './misc/error';
import ErrorPage from './components/error-page.component';
import NotificationPage from './components/notification-page.component';
import RecordVaccinationCertData from './components/record-vaccination-cert-data.component';
import ShowCertificate from './components/show-certificate.component';
import { EUDGC } from './generated-files/dgc-combined-schema';
import RecordTestCertData from './components/record-test-cert-data.component';
import RecordRecoveryCertData from './components/record-recovery-cert-data.component';

const Routing = (props: any) => {

    const routes = useRoutes();
    const { t } = useTranslation();
    const [eudgc, setEudgc] = React.useState<EUDGC>();
    const [error, setError] = React.useState<IError>();
    const [errorShow, setErrorShow] = React.useState(false);
    const [notificationShow, setNotificationShow] = React.useState(false);

    document.title = t('translation:title');

    React.useEffect(() => {
        if (error) {
            setErrorShow(true);
        }
    }, [error])

    React.useEffect(() => {
        if (!errorShow) {
            setError(undefined);
        }
    }, [errorShow])

    return (
        <>
            {/*
    header, every time shown. fit its children
    */}
            <Route path={routes.root}>
                {/* <Header /> */}
                <ErrorPage error={error} show={errorShow} onCancel={error?.onCancel} onHide={() => setErrorShow(false)} />
                <NotificationPage show={notificationShow} setNotificationShow={setNotificationShow} />
            </Route>

            {/*
    Content area. fit the rest of screen and children
    */}
            <Container id='qt-body'>

                {/* Landing */}
                <Route
                    exact
                    path={routes.landing}
                >
                    <LandingPage setNotificationShow={setNotificationShow} />
                </Route>

                <Route
                    exact
                    path={routes.recordVac}
                >
                    <RecordVaccinationCertData setEudgc={setEudgc} eudgc={eudgc} setError={setError} />
                </Route>
                
                <Route
                    exact
                    path={routes.recordTest}
                >
                    <RecordTestCertData setEudgc={setEudgc} eudgc={eudgc} setError={setError} />
                </Route>

                <Route
                    exact
                    path={routes.recordRecovery}
                >
                    <RecordRecoveryCertData setEudgc={setEudgc} eudgc={eudgc} setError={setError} />
                </Route>

                <Route
                    exact
                    path={routes.showCert}
                >
                    <ShowCertificate setEudgc={setEudgc} eudgc={eudgc} setError={setError} />
                </Route>

            </Container>

            {/*
    footer, every time shown. fit its children
    */}
            <Route path={routes.root}>
                <Footer />
            </Route>

        </>
    )
}

export default Routing;