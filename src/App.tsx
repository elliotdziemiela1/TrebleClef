import { Nav, Navbar } from "react-bootstrap";
import './App.module.scss'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./home.tsx";
import EditorPage from "./EditorPage.tsx";
import { useAuthContext } from "./auth/AuthContext";
import AuthPage from "./auth/AuthPage";
import TestPage from "./testPage.tsx";
import styles from "./App.module.scss";

function App() {
  const authCtx = useAuthContext();

  // if (authCtx.status === "loading") {
  //   return (<h1>Loading auth...</h1>)
  // }

  // if (authCtx.status === "unauthenticated") {
  //   return <AuthPage />;
  // }

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar expand="sm" bg="light" >
          <Nav>
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/editor">Editor</Nav.Link>
          </Nav>
          <div className={styles.profileWidget}>
            {authCtx.status === "authenticated" ? (
              <div>
                <p>{authCtx.profile?.Username}</p>
                <button onClick={() => authCtx.signOut()}>Sign out</button>
              </div>
            ) : (
              <div>
                <button onClick={() => window.location.href = "/auth"}>Sign in</button>
                <button onClick={() => window.location.href = "/auth"}>Sign up</button>
              </div>
            )}
          </div>
        </Navbar>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/editor" element={<EditorPage/>}/>
          <Route path="/test" element={<TestPage/>}/>
          <Route path="/auth" element={<AuthPage/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
