import React, { useEffect, useState, useCallback } from "react";
import { useSnapshot } from "valtio";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Addform, { state } from "./Addform";
import { Formtype } from "../types/Formtype";
import { subscribe } from "valtio";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Weekly: React.FC = () => {
  const snapshot = useSnapshot(state);
  const [userid, setUserid] = useState<string>(snapshot.userId);
  const [pinnesTask, setPinnedTask] = useState<Formtype[]>([]);
  const [allTask, setAllTask] = useState<Formtype[]>([]);
  const [calenderDate, setCalenderDate] = useState<Date | undefined>();
  const [showOption, setShowOption] = useState<boolean>(false);
  const [calenderShow, setCalenderShow] = useState<boolean>(false);
  const [viewType, setViewType] = useState<boolean>(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (userid) {
      fetchTodos();
    }
  }, [userid]);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}listData`, {
        params: {
          userid: userid,
        },
      });
      setAllTask(response.data.todos);
      setPinnedTask(
        response.data.todos.filter((task: { pinned: boolean }) => task.pinned)
      );
    } catch (error) {
      // console.error('Error fetching todos:', error);
      console.error("NO fetching data");
    }
  };

  useEffect(() => {
    setUserid(snapshot.userId);
  }, [snapshot.userId]);

  const handleTogglePinned = useCallback(
    async (id: string) => {
      const updatedPinnedStatus = !pinnesTask.find((task) => task._id === id)
        ?.pinned;
      try {
        await axios.patch(`${API_BASE_URL}updatePinned/${id}`, {
          pinned: updatedPinnedStatus,
        });
      } catch (error) {
        console.error("Error toggling pinned status:", error);
      }
    },
    [pinnesTask]
  );

  const handleDelete = useCallback(async (taskId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}deleteData/${taskId}`);
      setPinnedTask((prevListData) =>
        prevListData.filter((task) => task._id !== taskId)
      );
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }, []);

  const handleEdit = useCallback((task: Formtype) => {
    state.formToggle = true;
    state.selectedData = task;
  }, []);

  const handleCalendarChange = useCallback((date: any) => {
    setCalenderDate(date);
    state.calenderDate = date;
  }, []);

  const formatTimeTo12Hour = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const amPM = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    const formattedMinute = minute.toString().padStart(2, "0");
    return `${formattedHour}:${formattedMinute} ${amPM}`;
  };

  useEffect(() => {
    const toggleEditBtn = subscribe(state, () => {
      setShowForm(state.formToggle || false);
    });
    return () => toggleEditBtn();
  }, []);

  return (
    <section className="w-full md:min-w-[calc(100vw-70vw)] max-h-full p-5 xl:p-14 bg-[#e7f0fa] text-[#47425b] md:order-1 duration-1000 relative">
      <header className="flex gap-4 items-center 2xl:gap-10">
        <span className="w-10 h-10 logobox text-lg font-extrabold flex items-center justify-center bg-[#f7d57e] text-white md:w-8 md:h-8 md:text-base lg:w-10 lg:h-10 lg:text-lg ">
          ＋
        </span>
        <h1 className="font-semibold text-xl md:text-base lg:text-xl css-1t1abw3 animate-charcter">
          reminder
        </h1>
      </header>

      <div className="py-5 mt-8 flex ">
        <h2 className="text-xl font-light md:text-base lg:text-xl ">
          {viewType ? "Weekly Pinned" : "All Tasks"}
        </h2>
        <span className="flex-1"></span>
        <a
          className="text-xs font-bold flex items-end select-none text-[#f5bd6c] md:text-xs lg:text-sm "
          onClick={() => setViewType(!viewType)}
        >
          {viewType ? "View all" : "Pinned"}
        </a>

        <div
          className={`${
            showForm
              ? "opacity-100 right-0 transition-all duration-1000"
              : "hidden right-[-100px] transition-all duration-1000"
          } lg:hidden absolute z-50 top-24 shadow-lg shadow-[#3454742a]`}
        >
          <Addform />
        </div>
      </div>
      <main
        className={`flex flex-col gap-5 ${
          viewType ? "h-80" : "min-h-[calc(100%-15%)]"
        }  overflow-y-auto lg:h-[calc(100vh-64vh)] rounded-lg relative shadowsAll shadows3 p-1.5`}
      >
        {(viewType ? pinnesTask : allTask).map((task, index) => (
          <div
            key={`task_${task.id}_${index}`}
            className={` shadowsAll p-3  rounded-lg  bg-[#ffffff] border border-[#e2e4e8] shadow-lg  relative  `}
            onClick={() => setShowOption(!showOption)}
          >
            <div
              className={`${
                showOption ? "" : "hidden"
              } flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-600  transition-colors absolute  top-0.5 right-2`}
            >
              <span
                className={`material-symbols-outlined text-xl 
                                ${task.pinned ? "text-[#f5bd6c]" : ""}`}
                onClick={() => handleTogglePinned(task._id)}
              >
                push_pin
              </span>
              <span
                className={`material-symbols-outlined `}
                onClick={() => handleEdit(task)}
              >
                edit_note
              </span>

              <span
                className={`material-symbols-outlined `}
                onClick={() => handleDelete(task._id)}
              >
                close
              </span>
            </div>

            <div className="flex gap-5 md:gap-2 lg:gap-5 h-max">
              <picture className="min-w-[40px] h-10 rounded-xl flex items-center justify-center text-xl bg-[#f7d57e] md:min-w-[24px] md:h-6 md:rounded-lg lg:w-10 lg:h-10 lg:rounded-xl md:text-xs lg:text-xl">
                {task.icon}
              </picture>
              <span>
                <div className={`flex items-center `}>
                  <h1 className="font-semibold text-base md:text-sm lg:text-lg lg:max-w-[100px] overflow-x-scroll">
                    {task.title?.slice(0, 9)}{" "}
                  </h1>
                  <h2
                    className={`${
                      task.personal && task.details ? "hidden" : ""
                    } pl-8 text-xs pt-3 text-[#515151e3] md:text-xs`}
                  >
                    {new Date(task.date).toLocaleDateString()}
                  </h2>
                </div>
                <div
                  className={`${
                    task.personal && task.details ? "" : "hidden"
                  } text-xs text-[#515151e3] flex md:text-sm`}
                >
                  <h2>{new Date(task.date).toLocaleDateString() || ""}</h2> -{" "}
                  <h2>{task.time ? formatTimeTo12Hour(task.time) : ""}</h2>
                </div>
              </span>
            </div>

            <div className="pl-[60px] md:pl-8 lg:pl-[60px]">
              {task.personal && (
                <button className="px-3 py-1 my-5 text-xs font-bold rounded-xl bg-[#f5b760] text-white">
                  Personal
                </button>
              )}
              {task.details && task.details.length > 0 && (
                <ul className="list-disc list-inside text-xs">
                  {task.details.map((detail, index) => (
                    <li key={index} className="w-full overflow-hidden">
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </main>
      <div
        className={`${calenderShow ? "lg:hidden" : "block"} ${
          viewType ? "block" : "lg:hidden"
        } rounded-xl flex items-center gap-5 shadow-sm mt-4 p-4 bg-[#ffffff] md:gap-1 lg:gap-5 2xl:mt-10`}
        onClick={() => setViewType(!viewType)}
      >
        <div className="w-10 h-10 rounded-xl text-lg font-extrabold flex items-center justify-center text-white bg-[#f7d57e] md:rounded-lg lg:rounded-xl md:w-8 md:h-8 md:text-sm lg:w-10 lg:h-10 lg:text-lg ">
          ＋
        </div>
        <a className=" md:text-xs lg:text-lg ">Add new weekly pin</a>
      </div>
      <div
        className={`flex items-center gap-5 shadow-sm shadows2 mt-8  lg:mt-5`}
        onMouseEnter={() => setCalenderShow(true)}
        onMouseLeave={() => setCalenderShow(false)}
        // style={{
        //     maxHeight: calenderShow ? '100%' : '170px',
        //     transition: 'max-height 0.5s',
        // }}
      >
        <Calendar
          className={`react-calendar border-none  ${
            calenderShow ? "md:h-full" : "md:max-h-[170px]"
          } ${viewType ? "block" : "hidden"} overflow-y-scroll rounded-xl px-5`}
          value={calenderDate}
          onChange={handleCalendarChange}
        />
      </div>
    </section>
  );
};

export default Weekly;
