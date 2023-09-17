import Welcome from "../../components/Welcome/Welcome.tsx";
import Layout from "../Layout/Layout";

function About() {
  return (
    <Layout>
      <div className="mt-20 flex w-full max-w-6xl flex-col items-center justify-center md:mt-28">
        {/* Top section */}
        <div className="mt-10 top-section flex w-full max-w-6xl flex-row items-center justify-center md:mt-28">
          <div className="flex flex-col items-center justify-center">
            <div className="text-5xl">[Placeholder] We are helping bipolar patients to manage their medication.</div>
            <div className="text-lg mt-5 text-gray-500">[Placeholder] paragrah of what we do</div>
          </div>
          <div>
            [Placeholder]image here
          </div>
        </div>

        {/* Mission section */}
        <div className="mt-10 mission-section flex w-full max-w-6xl flex-col items-start justify-center md:mt-28">
          <div className="text-3xl">Our mission</div>
          <div className="flex flex-row justify-between w-full">
            <div className="text-lg mt-5 text-gray-500">
              [Placeholder] paragrah of our mission
            </div>
            <div className="text-lg mt-5 text-gray-500">
              [Placeholder]some stats
            </div>
          </div>
        </div>

        {/* Team section */}
        <div className="mt-10 team-section flex w-full max-w-6xl flex-col items-start md:mt-28">
          <div className="text-3xl">Our team</div>
          <div className="people-section-container flex flex-row mt-5 w-full justify-between">
            <div>
              <div>Picture</div>
              <div>Name</div>
              <div>Role</div>
            </div>
            <div>
              <div>Picture</div>
              <div>Name</div>
              <div>Role</div>
            </div>
            <div>
              <div>Picture</div>
              <div>Name</div>
              <div>Role</div>
            </div>
            <div>
              <div>Picture</div>
              <div>Name</div>
              <div>Role</div>
            </div>
            <div>
              <div>Picture</div>
              <div>Name</div>
              <div>Role</div>
            </div>
            <div>
              <div>Picture</div>
              <div>Name</div>
              <div>Role</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default About;
