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
import { Modal, Row, Col, Card, Button } from 'react-bootstrap'

import '../i18n';
import { useTranslation } from 'react-i18next';


const ImprintPage = (props: any) => {

    const { t } = useTranslation();
    const [show, setShow] = React.useState(false);

    React.useEffect(() => {
        if (props)
            setShow(props.show);

            // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.show])

    const handleClose = () => {
        props.setShow(false)
    }

    return (
        <>
            <Modal
                // dialogClassName='modal-90w'
                size='lg'
                scrollable
                show={show}
                aria-labelledby="example-custom-modal-styling-title"
                centered
                onHide={handleClose}
            >
                <Modal.Header id='modal-header' closeButton className='pb-0' >
                    <Row>
                        <Col >
                            <Card.Title className='m-0 jcc-xs-jcfs-md' as={'h3'} >{t('translation:imprint')}</Card.Title>
                        </Col>
                    </Row>
                </Modal.Header>
                <hr className='mx-3 mb-0' />
                <Modal.Body className='px-3'>

                    <h5 className='text-justify'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ornare rhoncus enim, sed tincidunt erat lobortis nec. Etiam ac erat vel sem mattis consequat. Pellentesque aliquam consequat tellus, eu sagittis neque laoreet vitae. 
                    </h5>

                    
                </Modal.Body>
                <hr className='mx-3 mt-0' />
                {/*
    footer with ok button
    */}
                <Modal.Footer id='data-footer'>
                    <Button
                        className=''
                        onClick={handleClose}
                    >
                        {t('translation:cancel')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ImprintPage;


// Verantwortlich: 

// T-Systems International GmbH 

// Katharyn White 

// Senior Vice President und CMO 

// Friedrich-Ebert-Allee-140 

// D – 53113 Bonn 


// Kontakt aufnehmen 

