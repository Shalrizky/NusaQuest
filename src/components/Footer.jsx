import { Row, Col } from "react-bootstrap";

function Footer({textColor}) {
   return (
      <Row>
         <Col md={12} className="d-flex justify-content-center align-items-center pt-3" >
            <p style={{color: textColor}}>All Right Reserved SIF UPJ 2024</p>
         </Col>
      </Row>
   )
}

export default Footer