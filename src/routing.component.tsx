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

import useNavigation from './misc/navigation';

import Footer from './components/footer.component';
// import Header from './components/header.component';
import LandingPage from './components/landing-page.component';

// import PrivateRoute from './components/private-route.component';
import IError from './misc/error';
import ErrorPage from './components/error-page.component';
import RecordVaccinationCertData from './components/record-vaccination-cert-data.component';
import ShowCertificate from './components/show-certificate.component';
import { EUDCC } from './generated-files/dgc-combined-schema';
import RecordTestCertData from './components/record-test-cert-data.component';
import RecordRecoveryCertData from './components/record-recovery-cert-data.component';
import Header from './components/header.component';
import DataprivacyPage from './components/dataprivacy.component';
import ImprintPage from './components/imprint.component';

const Routing = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();
    const [eudgc, setEudgc] = React.useState<EUDCC>();
    const [error, setError] = React.useState<IError>();
    const [errorShow, setErrorShow] = React.useState(false);
    const [dataPrivacyShow, setDataPrivacyShow] = React.useState(false);
    const [imprintShow, setImprintShow] = React.useState(false);

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

    return (!navigation ? <></> :
        <>
            {/*
    header, every time shown. fit its children
    */}
            <Route path={navigation.routes.root}>
                <Header />
                <ErrorPage error={error} show={errorShow} onCancel={error?.onCancel} onHide={() => setErrorShow(false)} />
                <DataprivacyPage show={dataPrivacyShow} setShow={setDataPrivacyShow} />
                <ImprintPage show={imprintShow} setShow={setImprintShow} />
            </Route>

            {/*
    Content area. fit the rest of screen and children
    */}
            <Container id='qt-body'>

                {/* Landing */}
                <Route
                    exact
                    path={navigation.routes.landing}
                >
                    <LandingPage />
                </Route>

                <Route
                    exact
                    path={navigation.routes.recordVac}
                >
                    <RecordVaccinationCertData setEudgc={setEudgc} eudgc={eudgc} setError={setError} />
                </Route>

                <Route
                    exact
                    path={navigation.routes.recordTest}
                >
                    <RecordTestCertData setEudgc={setEudgc} eudgc={eudgc} setError={setError} />
                </Route>

                <Route
                    exact
                    path={navigation.routes.recordRecovery}
                >
                    <RecordRecoveryCertData setEudgc={setEudgc} eudgc={eudgc} setError={setError} />
                </Route>

                <Route
                    exact
                    path={navigation.routes.showCert}
                >
                    <ShowCertificate setEudgc={setEudgc} eudgc={eudgc} setError={setError} />
                </Route>

            </Container>

            {/*
    footer, every time shown. fit its children
    */}
            <Route path={navigation.routes.root}>
                <Footer setDataPrivacyShow={setDataPrivacyShow} setImprintShow={setImprintShow} />
            </Route>

        </>
    )
}

export default Routing;