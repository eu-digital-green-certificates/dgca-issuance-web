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
import { Button, Card, Col, Modal, Row } from 'react-bootstrap'

import '../i18n';
import { useTranslation } from 'react-i18next';

const ErrorPage = (props: any) => {

    const { t } = useTranslation();
    const [show, setShow] = React.useState(true);

    React.useEffect(() => {
        if (props)
            setShow(props.show);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.show])

    const handleClick = () => {
        props.onCancel();
        props.onHide();
    }

    return (
        <>
            <Modal
                contentClassName='data-modal'
                show={show}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header id='modal-header' className='pb-0' >
                    <Row>
                        <Col >
                            <Card.Title className='m-0 jcc-xs-jcfs-md' as={'h2'} >{t('translation:error-message')}</Card.Title>
                        </Col>
                    </Row>
                </Modal.Header>

                {/*
    content area with process number input and radios
    */}
                <Modal.Body className='py-0'>
                    <hr />
                    <p className='text-center'>
                        <span className='font-weight-bold'>{t('translation:serverError')}</span>
                        <span>{props?.error?.message}</span>
                    </p>

                    <hr />
                </Modal.Body>

                {/*
    footer with cancel and submit button
    */}
                <Modal.Footer id='data-footer'>
                    <Button
                        className='py-0'
                        onClick={handleClick}
                    >
                        {t('translation:cancel')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ErrorPage;