//import Welcome from "../../components/Welcome/Welcome.tsx";
import {Link} from "react-router-dom";
import pencilSVG from "../../assets/pencil.svg";
import uploadSVG from "../../assets/upload.svg";
import Layout_V2_Main from "../Layout/Layout_V2_Main";
import React from "react";

const AdminPortal = () => {
    return (
        <>
            <Layout_V2_Main>
                <div className="flex h-full w-full justify-center">
                    <div className="mt-10 flex flex-col w-3/4 md:w-2/3 max-w-3xl">
                        <div className="mb-8 items-center justify-center">
                            <div className="text-lg text-gray-500">
                                Let's take a look inside Balancer's brain. You can manage the
                                brain from this portal.
                            </div>
                        </div>
                        {/* <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2"> */}
                        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4 ">

                            <Link to={`/listoffiles`} className="w-full">
                                <AdminDashboardItemWrapper>
                                    <div className="min-w-0">
                                        <span className="text-md mb-0.5 block font-semibold">
                                            Manage Files
                                        </span>
                                        <span className="text-textGray block text-sm truncate">
                                            Manage the files stored in the Balancer's brain
                                        </span>
                                    </div>
                                    <img
                                        src={pencilSVG}
                                        alt="Description of SVG"
                                        className="mr-2 h-5 w-5"
                                    ></img>
                                </AdminDashboardItemWrapper>
                            </Link>

                            <Link to={`/UploadFile`} className="w-full">
                                <AdminDashboardItemWrapper>
                                    <div className="min-w-0">
                                       <span className="text-md mb-0.5 block font-semibold">
                                           Upload PDF
                                       </span>
                                        <span className="text-textGray block text-sm truncate">
                                           Add to Balancer's brain
                                       </span>
                                    </div>
                                    <img
                                        src={uploadSVG}
                                        alt="Description of SVG"
                                        className="mr-2 h-5 w-5"
                                    ></img>

                                </AdminDashboardItemWrapper>
                            </Link>
                            <Link to={`/drugSummary`} className="w-full">
                                <AdminDashboardItemWrapper>
                                    <div className="min-w-0">
                                       <span className="text-md mb-0.5 block font-semibold">
                                           Ask General Questions
                                       </span>
                                        <span className="text-textGray block text-sm truncate">
                                           Get answers from Balancer's brain
                                       </span>
                                    </div>
                                    <img
                                        src={uploadSVG}
                                        alt="Description of SVG"
                                        className="mr-2 h-5 w-5"
                                    ></img>
                                </AdminDashboardItemWrapper>
                            </Link>
                            <Link to={`/rulesmanager`} className="w-full">
                                <AdminDashboardItemWrapper>
                                    <div className="min-w-0">
                                       <span className="text-md mb-0.5 block font-semibold">
                                           Rules Manager
                                       </span>
                                        <span
                                            className="text-textGray block text-sm truncate">
                                           Manage and view the rules for the Medication Suggester
                                       </span>
                                    </div>
                                    <img
                                        src={uploadSVG}
                                        alt="Description of SVG"
                                        className="mr-2 h-5 w-5"
                                    ></img>
                                </AdminDashboardItemWrapper>
                            </Link>
                            <Link to={`/ManageMeds`} className="w-full">
                                <AdminDashboardItemWrapper>
                                    <div className="min-w-0">
                                       <span className="text-md mb-0.5 block font-semibold">
                                           Medications Database
                                       </span>
                                        <span className="text-textGray block text-sm truncate ">
                                           Manage the Medications store currently inside Balancer's
                                           brain
                                       </span>
                                    </div>
                                    <img
                                        src={uploadSVG}
                                        alt="Description of SVG"
                                        className="mr-2 h-5 w-5"
                                    ></img>
                                </AdminDashboardItemWrapper>

                            </Link>
                        </div>
                    </div>
                </div>
            </Layout_V2_Main>
        </>
    );
};

export default AdminPortal;


const AdminDashboardItemWrapper = ({children}: { children: React.ReactNode }) => {
    return (
        <div
            className="flex-basis-0 transition-border border-border3 shadow-feint flex h-[5.75rem] flex-grow cursor-pointer flex-row items-start justify-between rounded-xl border p-4 px-4 duration-150 ease-in hover:scale-[1.015] hover:bg-gray-100 max-w-[26rem]">
            {children}
        </div>
    )
}