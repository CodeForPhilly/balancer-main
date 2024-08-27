//import Welcome from "../../components/Welcome/Welcome.tsx";
import Layout from "../Layout/Layout";
import { Link } from "react-router-dom";

function AdminPortal() {
  return (
    <Layout>
      <div className="font_body mt-48 flex w-full flex-col items-center justify-center rounded-md border bg-white p-4 px-8 ring-1 hover:ring-slate-300 md:max-w-6xl">
        <div className="flex flex-col items-center space-y-4 p-8">
          <Link to="/UploadFile">
            <button className="px-18 mt-1 w-80 rounded-xl bg-blue-500 py-2  text-xl text-white hover:bg-blue-600">
              Upload File
            </button>
          </Link>
          <Link to="/listoffiles">
            <button className="px-18 mt-1 w-80 rounded-xl bg-blue-500 py-2  text-xl text-white hover:bg-blue-600">
              List of Files
            </button>
          </Link>
          <button className="px-18 mt-1 w-80 rounded-xl bg-blue-500 py-2  text-xl text-white hover:bg-blue-600">
            Create process
          </button>
        </div>
        {/* <div className="mt-8 text-sm text-gray-600">
          <p>API status | Help & support</p>
        </div> */}
      </div>
    </Layout>
  );
}

export default AdminPortal;
