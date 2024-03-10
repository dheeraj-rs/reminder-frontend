import Weekly from "../components/Weekly"
import Today from "../components/Today";
import Profile from "../components/Profile"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { state } from "../components/Addform";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function Homepage() {
    const [cookies, , removeCookie] = useCookies<any>([]);
    const navigate = useNavigate();

    useEffect(() => {
        verifyUser();
    }, [cookies, navigate, removeCookie])

    const verifyUser = async () => {
        if (!cookies.jwt) {
            navigate("/login");
        }
        else {
            const response = await axios.post(
                `${API_BASE_URL}`,
                {},
                {
                    withCredentials: true,
                }
            );
            state.userId = response.data.user;
            if (!response.status) {
                removeCookie("TwtToken");
                navigate("/login");
            }
        }
    };
    return (
        <div className="w-screen xl:h-screen md:flex overflow-hidden">
            <Today />
            <Weekly />
            <Profile />
        </div>
    )
}

export default Homepage