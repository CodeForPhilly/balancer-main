import "./App.css";
import Header from "./components/Header";
import Summary from "./components/Summary";

const App = () => {
  return (
    <>
      <main>
        <div className="main">
          <div className="gradient" />
        </div>
        <div className="app">
          <Header />
          <Summary />
        </div>
      </main>
    </>
  );
};

export default App;
