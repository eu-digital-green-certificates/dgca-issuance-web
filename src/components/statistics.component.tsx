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
import { Button, Card, Col, Container, Row } from 'react-bootstrap'

import '../i18n';
import { useTranslation } from 'react-i18next';

import useNavigation from '../misc/navigation';
import CwaSpinner from './spinner/spinner.component';
import { useStatistics } from '../api';
import StatisticData from '../misc/statistic-data'

const Statistics = (props: any) => {

    const navigation = useNavigation();
    const { t } = useTranslation();

    const handleError = (error: any) => {
        let msg = '';

        if (error) {


            msg = error.message
        }
        props.setError({ error: error, message: msg, onCancel: navigation!.toLanding });
    }

    const statisticData = useStatistics(undefined, handleError);
    const [isInit, setIsInit] = React.useState(false)

    React.useEffect(() => {
        if (navigation && statisticData)
            setIsInit(true);
    }, [navigation, statisticData])

    return (
        !isInit ? <CwaSpinner /> :
            <>
                <Card id='data-card'>
                    <Card.Header id='data-header' className='pb-0'>
                        <Row>
                            <Col md='6'>
                                <Card.Title className='m-0 jcc-xs-jcfs-md' as={'h2'} >{t('translation:statistics')}</Card.Title>
                            </Col>
                        </Row>
                        <hr />
                    </Card.Header>
                    {/*
    content area with patient inputs and check box
    */}
                    <Card.Body id='data-header'>
                        <Row>
                            <Col md='6'>
                                <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{t('translation:totalTestCount')}</Card.Text>
                            </Col>
                            <Col md='6'>
                                {statisticData!.totalTestCount}
                            </Col>
                        </Row>
                        <Row>
                            <Col md='6'>
                                <Card.Text className='input-label jcc-xs-jcfs-sm mb-0' >{t('translation:positiveTestCount')}</Card.Text>
                            </Col>
                            <Col md='3'>
                                {statisticData!.positiveTestCount}
                            </Col>
                            <Col md='3'>
                                {statisticData!.totalTestCount > 0 ? (100 * statisticData!.positiveTestCount / statisticData!.totalTestCount).toFixed(2) : undefined} %
                            </Col>
                        </Row>
                    </Card.Body>

                    {/*
    footer with correction and finish button
    */}
                    <Card.Footer id='data-footer'>
                        <Row>
                            <Col sm='6' md='3' className='pr-md-0'>
                                <Button
                                    className='my-1 my-md-0 p-0'
                                    block
                                    onClick={navigation!.toLanding}
                                >
                                    {t('translation:cancel')}
                                </Button>
                            </Col>
                        </Row>
                    </Card.Footer>
                </Card>
            </>

    )
}

export default Statistics;