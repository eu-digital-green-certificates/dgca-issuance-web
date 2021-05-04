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

const shortHashLen = 8;

const pattern = {
    processNo: '^[A-Fa-f0-9]{' + shortHashLen + '}$',
    zip: '^([0]{1}[1-9]{1}|[1-9]{1}[0-9]{1})[0-9]{3}$',
    tel: '^([+]{1}[1-9]{1,2}|[0]{1}[1-9]{1})[0-9]{5,}$',
    eMail: '^[\\w\\d\\.-]{1,}[@]{1}[\\w\\d\\.-]{1,}[\\.]{1}[\\w]{2,4}$',
    sequence: '^([1-9]{1,6})',
    tot: '^([1-9]{1,2})',
    standardisedName: '^[A-Z<]*$'
}

const processNoRegExp = new RegExp(pattern.processNo);
const zipRegExp = new RegExp(pattern.zip);
const telRegExp = new RegExp(pattern.tel);
const eMailRegExp = new RegExp(pattern.eMail);
const standardisedNameRegExp = new RegExp(pattern.standardisedName);

export default {
    shortHashLen: shortHashLen,
    pattern: pattern,
    shortHash: (uuIdHash: string) => uuIdHash.substring(0, shortHashLen),
    isProcessNoValid: (processNo: string) => processNoRegExp.test(processNo),
    isZipValid: (zip: string) => zipRegExp.test(zip),
    isTelValid: (tel: string) => telRegExp.test(tel),
    isEMailValid: (eMail: string) => eMailRegExp.test(eMail),
    isStandardisedNameValid: (value: string) => standardisedNameRegExp.test(value),
    pickerDateFormat:'yyyy-MM-dd',
    pickerDateTimeFormat:'yyyy-MM-dd / hh:mm a',
    momentDateFormat:'yyyy-MM-DD',
    momentDateTimeFormat:'yyyy-MM-DD / hh:mm A'
}