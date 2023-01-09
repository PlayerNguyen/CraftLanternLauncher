import "./Button.css";
export function Button({ className, children }) {
  return (
    <button className={`btn btn-primary btn-borderless ${className}`}>
      {children}
    </button>
  );
}
