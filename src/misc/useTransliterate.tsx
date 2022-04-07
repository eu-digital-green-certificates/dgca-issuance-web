/*
 * Corona-Warn-App / cwa-quick-test-frontend
 *
 * (C) 2022, T-Systems International GmbH
 *
 * Deutsche Telekom AG and all other contributors /
 * copyright owners license this file to you under the Apache
 * License, Version 2.0 (the 'License'); you may not use this
 * file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 * 
 * Used character transliteration from 
 * https://www.icao.int/publications/Documents/9303_p3_cons_en.pdf
 */

import icaoJson from '../assets/JSON/icao.json';
import React from 'react';
import { IIcao, normalize, parsePattern, transliterate } from 'icao-transliteration';

// encapsulate loading tranliterations from json
const useGetIcao = () => {
    const [result, setResult] = React.useState<IIcao>();

    React.useEffect(() => {
        setResult(icaoJson);
    }, [])

    return result;
}

const useTransliterate = (onError?: (msg: string) => void) => {
    const icao = useGetIcao();
    const [result, setResult] = React.useState('');

    const update = (input: string) => {
        let output = '';

        try {
            // some validation
            if (!input && input !== '') throw new Error('input string is not valid!');
            if (!icao) throw new Error('transliterations are not valid!');

            // normalize input string for mrz transliteration
            const normalizedInput = normalize(input, icao);

            // transliterate normalized input with transliterations from json
            output = transliterate(normalizedInput, icao);

            // in the end transliterated output should pass regEx
            if (!parsePattern(icao.pattern.mrz).test(output)) new Error('Could not transliterate some characters: ' + output + '.');
        }
        catch (error: any) {
            if (onError) {
                onError(error.message)
            }

            console.log(error.message);
            output = '';
        }

        setResult(output);
    }

    const clear = () => {
        setResult('');
    }

    return [result, update, clear] as const;
}

export default useTransliterate;
