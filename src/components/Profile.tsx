/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { useSnapshot } from "valtio";
import ReactAudioPlayer from "react-audio-player";
import useradd from "../assets/user.png";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { state } from "./Addform";
import song2 from "../assets/Unstoppable_I90KY3HNm0Y_140.mp3";
import song1 from "../assets/Darkside_CXU7Xlf8wTI_140.mp3";
const songs = [
  { song: song1, title: "Darkside" },
  { song: song2, title: "Unstoppable" },
];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const snapshot = useSnapshot(state);
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState("");
  const [isAM, setIsAM] = useState(true);

  const [cookies, , removeCookie] = useCookies(["jwt"]);

  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userData, setUserData] = useState<any>({});
  const [userId, setUserid] = useState<string>("");

  useEffect(() => {
    setUserid(snapshot.userId);
  }, [snapshot.userId]);

  const fetchData = useCallback(async () => {
    try {
      if (!userId) return;
      const { data } = await axios.get(`${API_BASE_URL}userData/${userId}`);
      if (data) {
        setUserData(data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [userId]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        setSelectedFile(event.target.files[0]);
      }
    },
    []
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      console.log("Please select an image to upload.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      await axios
        .post(`${API_BASE_URL}profileImage/${userId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          setShowUserDetails(false), setSelectedFile(null);
        });
      console.log("Image uploaded successfully.");
    } catch (error) {
      console.error("Error uploading image:", error);
      console.log("Image upload failed.");
    }
  }, [selectedFile, userId]);

  const logout = useCallback(() => {
    if (!cookies) return;
    removeCookie("jwt");
    navigate("/login");
  }, [cookies, navigate]);

  useEffect(() => {
    setUserid(snapshot.userId);
  }, [snapshot.userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours() % 12 || 12;
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
      setIsAM(now.getHours() < 12);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const nextSongHandler = useCallback(() => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    setIsPlaying(true);
  }, []);

  const prevSongHandler = useCallback(() => {
    setCurrentSongIndex(
      (prevIndex) => (prevIndex - 1 + songs.length) % songs.length
    );
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <section className=" max-w-full p-5 xl:p-14 text-[#47425b] md:min-w-[calc(100vw-75vw)] md:order-3 ">
      <div className="flex gap-3 items-center justify-between relative">
        <div>
          <p className="font-semibold text-2xl tracking-wide md:text-base lg:text-2xl pointer-events-none">
            {userData.username}
          </p>
          <p
            className="text-lg font-bold text-[#f5bd6c] md:text-xs lg:text-base cursor-pointer select-none"
            onClick={() => setShowUserDetails(!showUserDetails)}
          >
            My settings
          </p>

          {showUserDetails && (
            <ul className="user-details bg-[#e7f0fa] absolute top-20 left-0 min-w-full px-10 h-60 rounded-md p-3 z-50 shadow-md">
              <li className="flex flex-col items-center mb-4">
                <div className="relative w-16 h-16 rounded-full">
                  <img
                    src={
                      userData.userimage === "" ? useradd : userData.userimage
                    }
                    alt="img"
                    className="w-full h-full rounded-full"
                  />
                  <span className="w-full h-full absolute top-3 left-0 text-center text-4xl opacity-40">
                    +
                  </span>
                  <input
                    type="file"
                    autoComplete="off"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="opacity-0 w-full h-full absolute top-0 left-0 cursor-pointer"
                  />
                </div>
                <label
                  htmlFor="image-upload"
                  className="mt-2 cursor-pointer text-blue-500"
                  onClick={handleUpload}
                >
                  {selectedFile === null ? "Edit" : "Apply"}
                </label>
              </li>
              <li className="text-center text-xl font-semibold mb-2">
                {userData.username}
              </li>
              <li className="text-center text-sm text-gray-600 mb-2">
                {userData.email}
              </li>
              <li className="text-center">
                <button
                  className="text-blue-500 cursor-pointer hover:underline"
                  onClick={() => logout()}
                >
                  Logout
                </button>
                <button
                  className="text-red-500 ml-2 cursor-pointer hover:underline"
                  onClick={() => setShowUserDetails(false)}
                >
                  Close
                </button>
              </li>
            </ul>
          )}
        </div>
        <span className="w-14 h-14 logobox overflow-hidden md:w-10 md:h-10 lg:w-16 lg:h-16 shadow-lg bg-[#f7d57e]">
          <img
            src={userData.userimage === "" ? useradd : userData.userimage}
            alt="img"
            className="w-full h-full"
          />
        </span>
      </div>

      <div className="w-full shadowsAll rounded-xl mt-5 2xl:mt-28 p-5 bg-[#f9fbfd] flex flex-col items-center order-3 sm:order-3  ">
        <div className="text-end w-full">
          <span className="material-symbols-outlined text-[#e2e4e8] text-lg ">
            menu
          </span>
        </div>
        <span className="w-full flex items-center justify-center gap-4 pb-5 pl-3 md:gap-2 lg:gap-5">
          <div className="w-full flex items-center gap-3 overflow-x-scroll">
            <img
              src="https://i.scdn.co/image/ab67616d0000b27399fed8fbd66365974c7fdfb3"
              alt=""
              className="w-8 h-8 rounded-lg object-cover md:w-8 md:h-8 lg:w-12 lg:h-12  "
            />
            <span className="flex gap-1">
              <button onClick={prevSongHandler}>
                <span className="material-symbols-outlined text-gray-600 hover:text-gray-800">
                  fast_rewind
                </span>
              </button>
              <h1 className="text-xl w-20 overflow-y-auto font-bold md:text-base ">
                {songs[currentSongIndex].title}
              </h1>
              <button onClick={nextSongHandler}>
                <span className="material-symbols-outlined text-gray-600 hover:text-gray-800">
                  fast_forward
                </span>
              </button>
            </span>
          </div>
        </span>

        <ReactAudioPlayer
          src={songs[currentSongIndex].song}
          autoPlay={isPlaying}
          controls
          className="w-full bg-[#F0F3F4] rounded-lg z-0 md:h-10 lg:h-14 2xl:h-20"
        />
      </div>

      <div className="rounded-xl mt-5 p-5 bg-[#f9fbfd] shadowsAll">
        <div className="text-end w-full">
          <span className="material-symbols-outlined text-[#e2e4e8] text-lg ">
            menu
          </span>
        </div>
        <h1 className="text-3xl tracking-wider md:text-xl lg:text-3xl ">
          {currentTime} {isAM ? "AM" : "PM"}
        </h1>

        <span className="flex items-center ">
          <picture className="w-6 h-6 text-xl md:text-sm lg:text-lg ">
            🌤️
          </picture>
          <p className="text-sm text-[#888596] md:text-[8px] lg:text-xs  ">
            Now is almost Sunny
          </p>
        </span>
      </div>

      <div className="rounded-xl h-max mt-5 p-5 pb-0 bg-[#f9fbfd] shadowsAll">
        <div className="text-end w-full">
          <span className="material-symbols-outlined text-[#e2e4e8] text-lg ">
            close
          </span>
        </div>
        <div className="">
          <h1 className="font-semibold text-lg leading-6 ">
            Unleash the freelance super power
          </h1>
          <p className="pt-5 text-xs ">
            unlimited task, premium feature and much more
          </p>
        </div>
        <div className="flex items-end gap-5 mt-3 md:gap-0 lg:gap-5 ">
          <img
            src={useradd}
            alt=""
            className="sm:w-28 h-24 md:w-20 mix-blend-darken"
          />
          <div className="bg-[#f5bd6c] w-10 h-10 rounded-xl flex items-center justify-center mb-5  ">
            <span className="material-symbols-outlined rounded-full text-lg md:text-sm ">
              arrow_forward
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
