import { Nav, Navbar } from "react-bootstrap";
import './App.module.scss'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./home.tsx";
import EditorPage from "./EditorPage.tsx";
import { useAuth } from "react-oidc-context";
import { useEffect } from "react";



function App() {
  function signOutRedirect(){
    const clientId = "7gbukkp3rjdvv6sp9vd6u52nt9";
    const logoutUri = "http://localhost:5173/";
    const cognitoDomain = "https://us-east-19a1uyy7qv.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    // Remove auth details from auth object
    auth.removeUser();
  }

  const auth = useAuth();
  
  useEffect(() => {
    if (auth.isAuthenticated) {
      console.log("User is authenticated");

      console.log("User profile:", auth.user?.profile);
    }
  }, [auth.isAuthenticated]);

  if (auth.isLoading){
    return (<h1>Loading auth...</h1>)
  }

  if (auth.error){
    return (<h1>Authentication Error</h1>)
  }

  if (auth.isAuthenticated){
    return  (
      <BrowserRouter>
        <div className="App">
          <Navbar expand="sm" bg="light" >
            <Nav>
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/editor">Editor</Nav.Link>
            </Nav>
            <p>{auth.user?.profile?.email}</p>
            <button onClick={() => signOutRedirect()}>Sign out</button>
          </Navbar>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/editor" element={<EditorPage/>}/>
          </Routes>
        </div>
      </BrowserRouter>
    )
  }

  return (
    <div>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={() => {signOutRedirect()}}>Sign out</button>
    </div>
  )
}

export default App
