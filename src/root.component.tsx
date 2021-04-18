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
import { useParams } from 'react-router';

import { ReactKeycloakProvider } from '@react-keycloak/web';
import Keycloak from 'keycloak-js'

import LoginInterceptor from './login-interceptor.component';
import Routing from './routing.component';

import useLocalStorage from './misc/local-storage';
import { useGetKeycloakConfig } from './api';

interface UrlMandant {
  mandant: string;
}

const Root = (props: any) => {

  const { mandant } = useParams<UrlMandant>();

  const keycloakConfig = useGetKeycloakConfig();

  const [storedMandant, setStoredMandant] = useLocalStorage('mandant', '');

  const [keycloak, setKeycloak] = React.useState<Keycloak.KeycloakInstance>();


  React.useEffect(() => {

    if (mandant && mandant !== storedMandant && !mandant.includes('&')) {
      setStoredMandant(mandant);
    }

    updateKeycloakConfig();

  }, [mandant, keycloakConfig]);


  const updateKeycloakConfig = () => {

    if (keycloakConfig && storedMandant) {

      keycloakConfig.realm = storedMandant;

      setKeycloak(Keycloak(keycloakConfig));

    }

  }

  return (!keycloak ? <></> :
    <ReactKeycloakProvider
      authClient={keycloak}
    >
      <LoginInterceptor>
        <Routing />
      </LoginInterceptor>
    </ReactKeycloakProvider>
  );
}

export default Root;
