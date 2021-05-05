import React from "react";
import { Card, Row, Col } from "react-bootstrap";

import '../../i18n';
import { useTranslation } from 'react-i18next';

const CardHeader = (props: any) => {

    const { t } = useTranslation();

    const [title, setTitle] = React.useState<string>();

    React.useEffect(() => {
        if (props) {
            setTitle(props.title);
        }
    }, [])

    return (
        <Card.Header id='data-header' className='pb-0'>
            <Row>
                <Col md='6'>
                    <Card.Title className='m-md-0 tac-xs-tal-md jcc-xs-jcfs-md' as={'h2'} >{title}</Card.Title>
                </Col>
                <Col md='6' className='d-flex justify-content-center'>
                    <Card.Text id='id-query-text'>{t('translation:query-id-card')}</Card.Text>
                </Col>
            </Row>
            <hr />
        </Card.Header>
    )


}

export default CardHeader;