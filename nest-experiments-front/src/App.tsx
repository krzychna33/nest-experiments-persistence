import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {CalendarView} from "./calendar-view/CalendarView";


const API_URL = 'http://localhost:3000'

const COGNITO_CLIENT_ID = 'tjdj8hlmd6gtvnqnskl8apjjb'

function App() {

  const searchParams = new URLSearchParams(document.location.search)

  const [loggedUserEmail, setLoggedUserEmail] = React.useState<string>('')
  const [loggedUserId, setLoggedUserId] = React.useState<string>('')

  const [emailInput, setEmailInput] = React.useState<string>('krzysztof.surazynski@netguru.com')
  const [passwordInput, setPasswordInput] = React.useState<string>('')

  useEffect(() => {
    const codeSearchParam = searchParams.get('code')
    const stateSearchParam = searchParams.get('state')

    if (codeSearchParam && stateSearchParam) {
      const savedState = localStorage.getItem('random_state')
      if (savedState === stateSearchParam) {
        callServerToExchangeCodeForAccessToken(codeSearchParam)
        window.history.pushState({}, document.title, window.location.pathname);
      }
    } else {
      getProfile()
    }
  }, [])

  const callServerToExchangeCodeForAccessToken = async (code: string) => {
    const response = await fetch(`${API_URL}/auth/token`, {
      method: 'POST', headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, body: JSON.stringify({code, redirectUri: 'http://localhost:3001', clientId: COGNITO_CLIENT_ID})
    })
    if (response.status === 201) {
      const data = await response.json()
      localStorage.setItem('access_token', data.accessToken)
      await getProfile()
    }
  }

  const loginWithEmailAndPassword = async () => {
    const response = await fetch(`${API_URL}/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email: emailInput, password: passwordInput})
    })

    if (response.status === 201) {
      const data = await response.json()
      localStorage.setItem('access_token', data.accessToken)
      await getProfile()
    }
  }

  const getProfile = async () => {
    const response = await fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }})

    if (response.status === 200) {
      const data = await response.json()
      setLoggedUserEmail(data.email)
      setLoggedUserId(data.id)
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setLoggedUserEmail('')
  }

  const redirectToCognito = () => {
    const randomState = (Math.random() + 1).toString(36).substring(7)
    localStorage.setItem('random_state', randomState)

    const queryParamsString = new URLSearchParams({
      response_type: "code",
      client_id: COGNITO_CLIENT_ID,
      redirect_uri: 'http://localhost:3001',
      scope: "openid email phone profile aws.cognito.signin.user.admin",
      state: randomState,
    }).toString()

    const authorizeUrl = `https://nest-experiments.auth.eu-central-1.amazoncognito.com/authorize?${queryParamsString}`
    window.location.assign(authorizeUrl)
  }


  return (
    <div className="App">
      {loggedUserEmail ?
        <div>
          <h3>Logged as {loggedUserEmail} ({loggedUserId})</h3>
          <CalendarView/>
          <button onClick={logout}>Logout</button>
        </div> : <div>
          <form onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}/>
            <input type="password" placeholder="Password" value={passwordInput}
                   onChange={(e) => setPasswordInput(e.target.value)}/>
            <button type="submit" onClick={loginWithEmailAndPassword}>Login
            </button>
          </form>
          <h3>or</h3>
          <button onClick={redirectToCognito}>Login with cognito</button>
        </div>
      }
    </div>
  );
}

export default App;
