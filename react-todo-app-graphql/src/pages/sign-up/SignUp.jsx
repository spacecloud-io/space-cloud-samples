import React, { useState } from 'react'
import './sign-up.css'
import logo from '../../images/logo-black.svg'
import { withRouter } from 'react-router-dom'
import { Link } from "react-router-dom";
import client from '../../client';

const Wrapper = withRouter(({ history }) => (
  <SignUp history={history} />
))

function SignUp(props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const signUp = () => {
    client.signUp(email, username, pass).then(() => {
      props.history.push('/todo');
    }).catch(ex => alert("Error signup: " + ex.toString()))
  }

  return (
    <div className="sign-up">
      <div className="content">
        <img className="logo" src={logo} alt="" />
        <div className="sign-up-form">
          <p className="heading">SIGN UP</p>
          <input type="text" name="Username" value={username} placeholder="Username" onChange={(e) => setUsername(e.target.value)} /><br />
          <input type="text" name="Email Address" value={email} placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} /><br />
          <input type="text" name="Password" value={pass} placeholder="Password" onChange={(e) => setPass(e.target.value)} /><br />
          <div className="already-have-account">
            <div className="">Already have an account? </div>
            <Link to="/">
              <div id="orange">Sign in here</div>
            </Link>
          </div>
          <button className="sign-up-button" onClick={signUp}>Sign Up</button>
        </div>
      </div>
    </div>
  )
}

export default Wrapper
