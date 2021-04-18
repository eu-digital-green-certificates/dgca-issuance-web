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

import React from 'react';
import { useHistory } from 'react-router-dom'
import useLocalStorage from './local-storage';

export interface IRoute {
    [key: string]: string;
}

export interface INavigation {
    routes: IRoute,
    calculatedRoutes: IRoute,
    toLanding: () => void,
    toRecordPatient: () => void,
    toShowRecordPatient: () => void,
    toRecordTestResult: () => void,
    toQRScan: () => void,
    toStatistics: () => void,
    toFailedReport: () => void,
}

export const useRoutes = () => {

    const basePath = '/:mandant'

    const result: IRoute = {
        root: basePath,
        landing: basePath,
        recordPatient: basePath + '/record',
        showPatientRecord: basePath + '/record/show',
        recordTestResult: basePath + '/record/result',
        qrScan: basePath + '/qr/scan',
        statistics: basePath + '/statistics',
        failedReport: basePath + '/failedreport'
    }

    return result;
}

export const useNavigation = () => {

    const history = useHistory();
    const routes = useRoutes();
    const [mandant, setMandant] = useLocalStorage('mandant', '');
    const [calculatedRoutes, setCalculatedRoutes] = React.useState(routes);
    const [result, setResult] = React.useState<INavigation>();

    React.useEffect(() => {
        if (routes) {

            const c = calculatedRoutes;

            c.root = routes.root.replace(':mandant', mandant as string);
            c.landing = routes.landing.replace(':mandant', mandant as string);
            c.recordPatient = routes.recordPatient.replace(':mandant', mandant as string);
            c.showPatientRecord = routes.showPatientRecord.replace(':mandant', mandant as string);
            c.recordTestResult = routes.recordTestResult.replace(':mandant', mandant as string);
            c.qrScan = routes.qrScan.replace(':mandant', mandant as string);
            c.statistics = routes.statistics.replace(':mandant', mandant as string);
            c.failedReport = routes.failedReport.replace(':mandant', mandant as string);

            setCalculatedRoutes(c);
        }
    }, [routes])

    React.useEffect(() => {
        if (calculatedRoutes) {

            const n: INavigation = {
                routes: routes,
                calculatedRoutes: calculatedRoutes,

                toLanding: () => { history.push(calculatedRoutes.landing); },
                toRecordPatient: () => { history.push(calculatedRoutes.recordPatient); },
                toShowRecordPatient: () => { history.push(calculatedRoutes.showPatientRecord); },
                toRecordTestResult: () => { history.push(calculatedRoutes.recordTestResult); },
                toQRScan: () => { history.push(calculatedRoutes.qrScan); },
                toStatistics: () => { history.push(calculatedRoutes.statistics); },
                toFailedReport: () => { history.push(calculatedRoutes.failedReport); },
            }

            setResult(n);
        }
    }, [calculatedRoutes])

    return result;

}

export default useNavigation;