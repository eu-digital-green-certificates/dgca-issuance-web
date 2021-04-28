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
import { useHistory } from 'react-router-dom'
import useLocalStorage from './local-storage';

export interface IRoute {
    [key: string]: string;
}

export interface INavigation {
    routes: IRoute,
    calculatedRoutes: IRoute,
    toLanding: () => void,
    toRecordVac: () => void,
    toShowCert: () => void
}

export const useRoutes = () => {

    const basePath = '/:mandant'

    const result: IRoute = {
        root: basePath,
        landing: basePath,
        recordVac: basePath + '/record/vac',
        showCert: basePath + '/record/show'
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
            c.recordVac = routes.recordVac.replace(':mandant', mandant as string);
            c.showCert = routes.showCert.replace(':mandant', mandant as string);

            setCalculatedRoutes(c);
        }
    }, [routes])

    React.useEffect(() => {
        if (calculatedRoutes) {

            const n: INavigation = {
                routes: routes,
                calculatedRoutes: calculatedRoutes,

                toLanding: () => { history.push(calculatedRoutes.landing); },
                toRecordVac: () => { history.push(calculatedRoutes.recordVac); },
                toShowCert: () => { history.push(calculatedRoutes.showCert); }
            }

            setResult(n);
        }
    }, [calculatedRoutes])

    return result;

}

export default useNavigation;