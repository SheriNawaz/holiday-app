export default function SignupPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__headline">
          <span>Start your journey</span>
          <h1>Create your Holiday Planner account</h1>
          <p>
            Set up your account to save destinations, build itineraries, and organize every
            trip with clarity and ease.
          </p>
        </div>

        <form className="auth-form" action="#">
          <label>
            Full name
            <input type="text" placeholder="Your full name" required />
          </label>

          <label>
            Email address
            <input type="email" placeholder="you@example.com" required />
          </label>

          <label>
            Password
            <input type="password" placeholder="Create a strong password" required />
          </label>

          <button type="submit" className="button button--primary auth-button">
            Create account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <a href="/login">Login instead</a>.
        </p>
      </div>
    </main>
  );
}
