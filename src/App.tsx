import { Nav, Navbar } from "react-bootstrap";
import './App.module.scss'

function App() {
  return (
    <div className="App">
      <p>Hello World!</p>
      <Navbar>
        <Nav>
          <Nav.Link href="#home">Home</Nav.Link>
          <Nav.Link href="#about">About</Nav.Link>
          <Nav.Link href="#contact">Contact</Nav.Link>
        </Nav>
      </Navbar>
    </div>
  )
}

export default App
