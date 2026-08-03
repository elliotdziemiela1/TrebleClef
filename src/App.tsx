import { Nav, Navbar } from "react-bootstrap";
import './App.module.scss'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./home.tsx";
import EditorPage from "./EditorPage/EditorPage.tsx";
import { useAuthContext } from "./auth/AuthContext";
import AuthPage from "./auth/AuthPage";
import TestPage from "./testPage.tsx";
import styles from "./App.module.scss";
import HandleCreationPage from "./HandleCreationPage/HandleCreationPage.tsx";
import { useState } from "react";
import ScoreLibraryPage from "./ScoreLibraryPage/ScoreLibraryPage.tsx";

function App() {
  const authCtx = useAuthContext();
  const [ newScoreID, setNewScoreID ] = useState(window.crypto.randomUUID());
  return (
    <BrowserRouter>
      <div className={styles["app"]}>
        <div className={styles["navbar-container"]} >
          <Navbar expand="sm">
            <p className={styles["navbar-brand"]}>Treble Clef</p>
            <Nav>
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/myScores">My Scores</Nav.Link>
              <Nav.Link as={Link} to={"/editor/" + newScoreID} onClick={() => {setNewScoreID(window.crypto.randomUUID())}}>Editor</Nav.Link>
            </Nav>
            <div className={styles["profile-widget"]}>
              {authCtx.status === "authenticated" ? (
                <>
                  <p>{authCtx.profile?.Username}</p>
                  <button onClick={() => authCtx.signOut()}>Sign out</button>
                </>
              ) : (
                <>
                  <button onClick={() => window.location.href = "/auth"}>Sign in</button>
                  <button onClick={() => window.location.href = "/auth"}>Sign up</button>
                </>
              )}
            </div>
          </Navbar>
        </div>
        {(authCtx.status === "authenticated" && !authCtx.profile?.Username.length) ? 
          <HandleCreationPage/> 
          :
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/editor/:scoreID" element={<EditorPage/>}/>
            <Route path="/test" element={<TestPage/>}/>
            <Route path="/auth" element={<AuthPage/>}/>
            <Route path="/myScores" element={<ScoreLibraryPage/>}/>
          </Routes>
        }
      </div>
    </BrowserRouter>
  )
}

export default App
