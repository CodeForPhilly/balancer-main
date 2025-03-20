import spinner from "../../assets/spinner.svg"
import "./LoadingSpinner.css"

export default function Spinner() {
  return (
    <div className="spinnerDiv">
      <img
        src={spinner}
        alt="Loading gif"
      />
    </div>
  )
}