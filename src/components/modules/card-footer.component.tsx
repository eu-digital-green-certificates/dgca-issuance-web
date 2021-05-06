import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";

import '../../i18n';
import { useTranslation } from 'react-i18next';

const CardFooter = (props: any) => {

    const { t } = useTranslation();

    return (!props ? <></> :
        <Card.Footer id='data-footer'>
            <Row>
                <Col xs='6' md='3'>
                    <Button
                        className='my-1 my-md-0 p-0'
                        block
                        onClick={props.handleCancel}
                    >
                        {t('translation:cancel')}
                    </Button>
                </Col>
                <Col xs='6' md='3' className='pr-md-0'>
                    <Button
                        className='my-1 my-md-0 p-0'
                        block
                        type='submit'
                    >
                        {t('translation:next')}
                    </Button>
                </Col>
            </Row>
        </Card.Footer>
    )

}

export default CardFooter;
