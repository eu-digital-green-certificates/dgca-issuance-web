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

export interface IRoute {
    [key: string]: string;
}

export interface INavigation {
    routes: IRoute,
    toLanding: () => void,
    toRecordVac: () => void,
    toRecordTest: () => void,
    toRecordRecovery: () => void,
    toShowCert: () => void
}

export const useRoutes = () => {

    const basePath = '/';
    const [result, setResult] = React.useState<IRoute>();

    React.useEffect(() => {
        setResult({
            root: basePath,
            landing: basePath,
            recordVac: basePath + 'record/vac',
            recordTest: basePath + 'record/test',
            recordRecovery: basePath + 'record/recovery',
            showCert: basePath + 'record/show'
        })
    }, [])

    return result;
}

export const useNavigation = () => {

    const history = useHistory();
    const _routes = useRoutes();
    const [result, setResult] = React.useState<INavigation>();

    // React.useEffect(() => {
    //     if (routes) {

    //         const c = routes;
    //         setCalculatedRoutes(c);
    //     }
    // }, [routes])

    React.useEffect(() => {

        if (_routes) {

            const n: INavigation = {
                routes: _routes,

                toLanding: () => { history.push(_routes.landing); },
                toRecordVac: () => { history.push(_routes.recordVac); },
                toRecordTest: () => { history.push(_routes.recordTest); },
                toRecordRecovery: () => { history.push(_routes.recordRecovery); },
                toShowCert: () => { history.push(_routes.showCert); }
            }

            setResult(n);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_routes])

    return result;

}

export default useNavigation;