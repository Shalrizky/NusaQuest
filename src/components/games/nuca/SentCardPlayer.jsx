import { Card } from 'react-bootstrap';
import '../../../style/components/games/nuca/SentCard.css'; 

function SentCard({ cardData }) {
    return (
        <Card className="sent-card"> 
            <Card.Body className="d-flex justify-content-center align-items-center">
                <Card.Text>{cardData.question_text}</Card.Text>
            </Card.Body>
        </Card>
    );
}

export default SentCard;