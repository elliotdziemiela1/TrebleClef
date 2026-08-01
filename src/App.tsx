import { Nav, Navbar } from "react-bootstrap";
import './App.module.scss'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./home.tsx";
import EditorPage from "./EditorPage.tsx";
import { useAuthContext } from "./auth/AuthContext";
import AuthPage from "./auth/AuthPage";
import TestPage from "./testPage.tsx";

function App() {
  const { status, email, signOut } = useAuthContext();

  if (status === "loading") {
    return (<h1>Loading auth...</h1>)
  }

  if (status === "unauthenticated") {
    return <AuthPage />;
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar expand="sm" bg="light" >
          <Nav>
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/editor">Editor</Nav.Link>
            <Nav.Link as={Link} to="/test">Test Page</Nav.Link>
          </Nav>
          <p>{email}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </Navbar>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/editor" element={<EditorPage/>}/>
          <Route path="/test" element={<TestPage/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
