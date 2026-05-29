export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__headline">
          <span>Welcome back</span>
          <h1>Sign in to your account</h1>
          <p>
            Enter your details to continue planning your next getaway and keep your
            itineraries in one beautiful place.
          </p>
        </div>

        <form className="auth-form" action="#">
          <label>
            Email address
            <input type="email" placeholder="you@example.com" required />
          </label>

          <label>
            Password
            <input type="password" placeholder="Enter your password" required />
          </label>

          <button type="submit" className="button button--primary auth-button">
            Login
          </button>
        </form>

        <p className="auth-footer">
          New around here? <a href="/signup">Create an account</a>.
        </p>
      </div>
    </main>
  );
}
