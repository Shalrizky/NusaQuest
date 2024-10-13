import Card from 'react-bootstrap/Card';
import '../../style/components/games/BottomDeckCard.css';

function FoodQuestionCard() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card className="bg-orange text-white" style={{ width: '151px', height: '198px', borderRadius: '10px', padding: '0.5rem', border: '2px solid white' }}>
        <Card.Body>
          <Card.Title style={{ fontSize: '1rem' }}>Q: Makanan</Card.Title>
          <Card.Text style={{ fontSize: '0.875rem' }}>
            Sayur Asem Adalah?
          </Card.Text>
        </Card.Body>
      </Card>
      <Card className="bg-orange text-white" style={{ width: '151px', height: '198px', borderRadius: '10px', padding: '0.5rem', border: '2px solid white' }}>
        <Card.Body>
          <Card.Title style={{ fontSize: '1rem' }}>Q: Minuman</Card.Title>
          <Card.Text style={{ fontSize: '0.875rem' }}>
            Es Teh Adalah?
          </Card.Text>
        </Card.Body>
      </Card>
      <Card className="bg-orange text-white" style={{ width: '151px', height: '198px', borderRadius: '10px', padding: '0.5rem', border: '2px solid white' }}>
        <Card.Body>
          <Card.Title style={{ fontSize: '1rem' }}>Q: Buah</Card.Title>
          <Card.Text style={{ fontSize: '0.875rem' }}>
            Apel Adalah?
          </Card.Text>
        </Card.Body>
      </Card>
      <Card className="bg-orange text-white" style={{ width: '151px', height: '198px', borderRadius: '10px', padding: '0.5rem', border: '2px solid white' }}>
        <Card.Body>
          <Card.Title style={{ fontSize: '1rem' }}>Q: Sayuran</Card.Title>
          <Card.Text style={{ fontSize: '0.875rem' }}>
            Bayam Adalah?
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
}

export default FoodQuestionCard;