import Card from 'react-bootstrap/Card';
import '../../style/components/games/BottomDeckCard.css';

function FoodQuestionCard() {
  return (
    <div className="card-container">
      <Card className="bg-orange text-white card-custom">
        <Card.Body>
          <Card.Title className="card-title-custom">Q: Makanan</Card.Title>
          <Card.Text className="card-text-custom">
            Sayur Asem Adalah?
          </Card.Text>
        </Card.Body>
      </Card>

      <Card className="bg-orange text-white card-custom">
        <Card.Body>
          <Card.Title className="card-title-custom">Q: Minuman</Card.Title>
          <Card.Text className="card-text-custom">
            Es Teh Adalah?
          </Card.Text>
        </Card.Body>
      </Card>

      <Card className="bg-orange text-white card-custom">
        <Card.Body>
          <Card.Title className="card-title-custom">Q: Buah</Card.Title>
          <Card.Text className="card-text-custom">
            Apel Adalah?
          </Card.Text>
        </Card.Body>
      </Card>

      <Card className="bg-orange text-white card-custom">
        <Card.Body>
          <Card.Title className="card-title-custom">Q: Sayuran</Card.Title>
          <Card.Text className="card-text-custom">
            Bayam Adalah?
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
}

export default FoodQuestionCard;
