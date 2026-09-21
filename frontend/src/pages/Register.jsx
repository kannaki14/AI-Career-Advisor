function Register() {
  return (
    <section>
      <h1>Create Your Account</h1>
      <form>
        <div>
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" type="text" name="fullName" placeholder="Enter your full name" />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" placeholder="Enter your email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" name="password" placeholder="Enter your password" />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="#">Login</a>
      </p>
    </section>
  );
}

export default Register;
