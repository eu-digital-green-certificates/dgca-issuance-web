import React from "react";
import { Card, Row, Col } from "react-bootstrap";

import '../../i18n';
import { useTranslation } from 'react-i18next';

const CardHeader = (props: any) => {

    const { t } = useTranslation();

    return (!props ? <></> :
        <Card.Header id='data-header' className='p-3'>
            <Row>
                <Col md='6' className='px-0'>
                    <Card.Title className='m-md-0 tac-xs-tal-md jcc-xs-jcfs-md' as={'h3'} >{props.title}</Card.Title>
                </Col>
                <Col md='6' className='d-flex px-0 jcc-xs-jcfe-md'>
                    <Card.Text id='id-query-text'>{t('translation:query-id-card')}</Card.Text>
                </Col>
            </Row>
        </Card.Header>
    )

}

export default CardHeader;