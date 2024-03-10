import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerType } from "../types/Formtype";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export function Singnup() {
    const [cookies] = useCookies<any>(["cookie-name"]);
    const navigate = useNavigate();

    useEffect(() => {
        if (cookies.jwt) {
            navigate("/");
        }
    }, [cookies, navigate]);

    const [values, setValues] = useState<registerType>({ email: "", password: "", username: "" });

    const generateError = (error: string) =>
        toast.error(error, {
            position: "bottom-right",
        });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const { data } = await axios.post(
                `${API_BASE_URL}register`,
                {
                    ...values,
                },
                { withCredentials: true }
            );

            if (data) {
                if (data.errors) {
                    const { email, password } = data.errors;
                    if (email) generateError(email);
                    else if (password) generateError(password);
                } else {
                    navigate("/");
                }
            }
        } catch (ex) {
            console.log(ex);
        }
    };

    return (
        <section className="h-[calc(100vh-35vh)] w-[calc(100dvw-70dvw)] md:min-h-[200px] md:top-48 absolute top-[calc(100dvh-80dvh)] left-[calc(100dvw-65dvw)] flex justify-center items-center">

            <form onSubmit={(e) => handleSubmit(e)} className={`
    duration-1000 w-[calc(100dvh-60dvh)] h-max p-6 shadow-lg  flex flex-col gap-10 absolute md:w-full bg-white`}>
                <h1 className="text-3xl font-bold text-center">Sign Up</h1>
                <input className=" border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#fca223]"
                    type="text"
                    name="username"
                    autoComplete="off"
                    onChange={(e) =>
                        setValues({ ...values, [e.target.name]: e.target.value })
                    }
                    placeholder="Enter your username" />
                <input className=" border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#fca223]"
                    autoComplete="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    onChange={(e) =>
                        setValues({ ...values, [e.target.name]: e.target.value })
                    }
                />
                <input className=" border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#fca223]"
                    autoComplete="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    onChange={(e) =>
                        setValues({ ...values, [e.target.name]: e.target.value })
                    }
                />
                <p className="cursor-pointer">Forgot Password</p>
                <button className="bg-gradient-to-r from-[#fca223] via-[#fdbf24] to-[#f9da8b] text-white font-bold py-2 rounded-md" type="submit">Sign Up</button>
                <span>
                    Already have an account ?<Link to="/login"><span className="text-[#fca223]"> Login</span></Link>
                </span>
            </form>
        </section >

    )
}