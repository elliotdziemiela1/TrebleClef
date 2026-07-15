import { Nav, Navbar } from "react-bootstrap";
import './App.module.scss'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./home.tsx";
import EditorPage from "./EditorPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar expand="sm" bg="light" >
          <Nav>
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/editor">Editor</Nav.Link>
          </Nav>
        </Navbar>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/editor" element={<EditorPage/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
