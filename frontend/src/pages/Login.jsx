function Login() {
  return (
    <section>
      <h1>Login to AI Career Advisor</h1>
      <form>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" placeholder="Enter your email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" name="password" placeholder="Enter your password" />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="#">Register</a>
      </p>
    </section>
  );
}

export default Login;
