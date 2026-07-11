import "./Loader.css";

interface LoaderProps {
  label?: string;
}

export default function Loader({ label = "Loading" }: LoaderProps) {
  return (
    <div className="loader-container">
      <div className="wallet-loader">
        <div className="wallet-back"></div>
        <div className="bill bill-1"></div>
        <div className="bill bill-2"></div>
        <div className="bill bill-3"></div>
        <div className="wallet-front">
          <div className="text">
            {label}
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
