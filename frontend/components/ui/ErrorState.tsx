interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-panel" role="alert">
      <span className="state-icon" aria-hidden="true">!</span>
      <h3>We couldn’t load the stories.</h3>
      <p>{message}</p>
      <button className="button-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
