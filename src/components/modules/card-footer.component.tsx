import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";

import '../../i18n';
import { useTranslation } from 'react-i18next';

const CardFooter = (props: any) => {

    const { t } = useTranslation();

    return (!props ? <></> :
        <Card.Footer id='data-footer'>
            
            <hr className='pb-3' />
            <Row>
                <Col xs='6' md='3' className='pl-0 pr-2'>
                    <Button
                        variant='outline-primary'
                        block
                        onClick={props.handleCancel}
                    >
                        {t('translation:cancel')}
                    </Button>
                </Col>
                <Col xs='6' md='3' className='pr-0 pl-2'>
                    <Button
                        className=''
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
