import Welcome from "../../components/Welcome/Welcome.tsx";
import Layout from "../Layout/Layout";

function About() {
  return (
    <Layout>
      <div className="mt-20 flex w-full max-w-6xl flex-col items-center justify-center md:mt-28">
        <div className="mt-10">This is layout for about page</div>
      </div>
    </Layout>
  );
}

export default About;
