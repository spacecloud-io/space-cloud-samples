import React, { useState } from 'react'
import './sign-in.css'
import logo from '../../images/logo-black.svg'
import { withRouter } from 'react-router-dom'
import { Link } from "react-router-dom";
import client from '../../client';

const Wrapper = withRouter(({ history }) => (
  <SignIn history={history} />
))

function SignIn(props) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const signIn = () => {
    client.login(email, pass).then(() => {
      props.history.push('/todo');
    }).catch(ex => alert("Error login: " + ex.toString()))
  }

  return (
    <div className="sign-in">
      <div className="content">
        <img className="logo" src={logo} alt="" />
        <div className="sign-in-form">
          <p className="heading">SIGN IN</p>
          <input type="text" name="Email Address" value={email} placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} /><br />
          <input type="text" name="Password" value={pass} placeholder="Password" onChange={(e) => setPass(e.target.value)} /><br />
          <div className="dont-have-account">
            <div className="">Don't have an account? </div>
            <Link to="/sign-up">
              <div id="orange">Sign up here</div>
            </Link>
          </div>
          <button className="sign-in-button" onClick={signIn}>Sign in</button>
        </div>
      </div>
    </div>
  )
}

export default Wrapper;
