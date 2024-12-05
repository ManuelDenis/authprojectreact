import React, { useState } from "react";
import { Container, Row, Col, Button, Card, Table, Alert } from "react-bootstrap";

const HomePage = () => {
  // Lista de candidați cu nume real și datele din turul 1
  const initialCandidates = [
    { id: 1, name: "Călin Georgescu", votes: 2120401, percentage: 22.94 },
    { id: 2, name: "Elena-Valerica Lasconi", votes: 1772500, percentage: 19.17 },
    { id: 3, name: "Ion-Marcel Ciolacu", votes: 1769760, percentage: 19.14 },
    { id: 4, name: "George-Nicolae Simion", votes: 1281325, percentage: 13.86 },
    { id: 5, name: "Nicolae-Ionel Ciucă", votes: 811952, percentage: 8.78 },
    { id: 6, name: "Mircea-Dan Geoană", votes: 583898, percentage: 6.31 },
    { id: 7, name: "Hunor Kelemen", votes: 416353, percentage: 4.50 },
    { id: 8, name: "Cristian Diaconescu", votes: 286842, percentage: 3.10 },
    { id: 9, name: "Cristian-Vasile Terheș", votes: 95782, percentage: 1.03 },
    { id: 10, name: "Ana Birchall", votes: 42853, percentage: 0.46 },
    { id: 11, name: "Ludovic Orban", votes: 20089, percentage: 0.21 },
    { id: 12, name: "Sebastian-Constantin Popescu", votes: 14683, percentage: 0.15 },
    { id: 13, name: "Alexandra-Beatrice Bertalan-Păcuraru", votes: 14502, percentage: 0.15 },
    { id: 14, name: "Silviu Predoiu", votes: 11246, percentage: 0.12 },
  ];

  const [candidates, setCandidates] = useState(initialCandidates);
  const [votesRecounted, setVotesRecounted] = useState(false);
  const [counting, setCounting] = useState(false);

  // Funcție pentru a retrage un candidat
  const handleWithdraw = (id) => {
    setCandidates((prev) => prev.filter((candidate) => candidate.id !== id));
  };

  // Renumărarea voturilor: sortează candidații după voturi
  const handleRecount = () => {
    setCounting(true);
    setTimeout(() => {
      const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
      setCandidates(sortedCandidates);
      setVotesRecounted(true);
      setCounting(false);
    }, 3000); // Simulează o întârziere de 3 secunde pentru a arăta "counting..."
  };

  return (
    <Container className="mt-5">
      {/* Secțiunea cu primele 5 locuri */}
      <Row>
        <Col lg={6}>
              <Card.Title>Primele 5 locuri</Card.Title>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Loc</th>
                    <th>Candidat</th>
                    <th>Voturi</th>
                    <th>Procentaj</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.slice(0, 5).map((candidate, index) => (
                    <tr key={candidate.id}>
                      <td>{index + 1}</td>
                      <td>{candidate.name}</td>
                      <td>{candidate.votes}</td>
                      <td>{candidate.percentage}%</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleWithdraw(candidate.id)}
                        >
                          Retragere
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {candidates.length === 0 && (
                <Alert variant="warning">Toți candidații s-au retras.</Alert>
              )}
        </Col>
      </Row>
      <Row>
        <Col>
          <p>
            Simulare Alegeri Prezidențiale 2024
          </p>
          <hr />
        </Col>
      </Row>

      <Row className="mt-4">
        {/* Secțiunea de renumărare */}
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Pasul 1: Renumărarea voturilor</Card.Title>
              <Button
                variant={votesRecounted || counting ? "secondary" : "primary"}
                onClick={handleRecount}
                disabled={votesRecounted || counting}
              >
                {counting ? "Counting..." : votesRecounted ? "Renumărarea completată" : "Începe renumărarea"}
              </Button>
              {counting && (
                <Alert variant="info" className="mt-3">
                  Renumărarea este în curs. Vă rugăm să așteptați...
                </Alert>
              )}
              {votesRecounted && !counting && (
                <Alert variant="info" className="mt-3">
                  Renumărarea a fost completată. Clasamentul a fost actualizat.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <footer className="text-center mt-4">
        <p>
          Aceasta este o simulare interactivă pentru a înțelege scenariile posibile în cazul
          alegerilor prezidențiale. Deciziile reale depind de procesul electoral și de hotărârile
          CCR.
        </p>
      </footer>
    </Container>
  );
};

export default HomePage;
