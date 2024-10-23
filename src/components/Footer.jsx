import { Row, Col } from "react-bootstrap";

function Footer({textColor}) {
   return (
      <Row>
         <Col md={12} className="text-center d-flex justify-content-center align-items-center mt-3" >
            <p style={{color: textColor}}>&copy; 2024 System Information Division of UPJ. All rights reserved.
            </p>
         </Col>
      </Row>
   )
}

export default Footer