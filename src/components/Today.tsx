import React, { useEffect, useState, useCallback, useMemo } from "react";
import { subscribe, useSnapshot } from "valtio";
import Addform, { state } from "./Addform";
import { Formtype } from "../types/Formtype";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Today: React.FC = () => {
  const snapshot = useSnapshot(state);
  const [userid, setUserid] = useState<string>("");
  const [listData, setListData] = useState<Formtype[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showOption, setShowOption] = useState(false); // Added showOption state
  const [selectDate, setSelectDate] = useState(new Date());

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
      setListData(response.data.todos);
    } catch (error) {
      //   console.error("Error fetching todos:", error);
      console.error("NO fetching data");
    }
  };

  const handleTogglePinned = useCallback(
    async (id: any) => {
      try {
        const updatedPinnedStatus = !listData.find((task) => task._id === id)
          ?.pinned;
        await axios.patch(`${API_BASE_URL}updatePinned/${id}`, {
          pinned: updatedPinnedStatus,
        });

        setListData((prevListData) =>
          prevListData.map((task) =>
            task._id === id ? { ...task, pinned: updatedPinnedStatus } : task
          )
        );

        setShowOption(false);
      } catch (error) {
        console.error("Error toggling pinned status:", error);
      }
    },

    [listData]
  );

  const handleDelete = useCallback(
    async (taskId: string) => {
      try {
        await axios.delete(`${API_BASE_URL}deleteData/${taskId}`);
        setListData((prevListData) =>
          prevListData.filter((task) => task._id !== taskId)
        );
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },
    [listData]
  );

  const handleAdd = useCallback(() => {
    state.formToggle = true;
  }, []);

  const handleEdit = useCallback((task: Formtype) => {
    state.selectedData = task;
    state.formToggle = true;
  }, []);

  const formatTimeTo12Hour = useCallback((time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const amPM = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    const formattedMinute = minute.toString().padStart(2, "0");
    return `${formattedHour}:${formattedMinute} ${amPM}`;
  }, []);

  const handleChangeDate = useCallback(
    (view: number) => {
      const changeDate = new Date(selectDate);
      changeDate.setDate(changeDate.getDate() + view);
      setSelectDate(changeDate);
    },
    [selectDate]
  );

  const filteredData = useMemo(() => {
    return listData
      .filter(
        (task) =>
          new Date(task.date).toLocaleDateString() ===
          selectDate.toLocaleDateString()
      )
      .sort((a, b) => {
        if (a.pinned && !b.pinned) {
          return -1;
        } else if (!a.pinned && b.pinned) {
          return 1;
        } else {
          return 0;
        }
      });
  }, [listData, selectDate]);

  useEffect(() => {
    setUserid(snapshot.userId);
  }, [snapshot.userId]);

  useEffect(() => {
    const calenderSelectDate = subscribe(state, () => {
      setSelectDate(state.calenderDate || new Date());
    });
    return () => calenderSelectDate();
  }, []);

  useEffect(() => {
    const toggleEditBtn = subscribe(state, () => {
      setShowForm(state.formToggle || false);
    });
    return () => toggleEditBtn();
  }, []);

  return (
    <section className="w-full md:min-w-[calc(100vw-55vw)] pt-5 xl:p-14 text-[#47425b] md:order-2">
      <main className="flex min-w-max px-5 mb-12 relative">
        <header className="w-full">
          <h1 className="text-3xl leading-[60px] tracking-normal md:text-2xl lg:text-4xl">
            Today's schedule
          </h1>
          <aside className="flex items-center gap-4  mt-3">
            {/* show selected Date */}
            <h1 className="text-3xl leading-[50px] tracking-wide text-[#f5bd6c] md:text-2xl lg:text-4xl w-52 lg:w-64">
              {selectDate.toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
              })}
            </h1>
            <a
              className="material-symbols-outlined bg-[#edeff3] cursor-pointer select-none w-6 h-6 rounded-full text-lg font-semibold flex items-center justify-center md:text-base md:w-5 md:h-5 lg:w-6 lg:h-6 lg:text-lg"
              onClick={() => handleChangeDate(-1)}
            >
              arrow_back
            </a>
            <a
              className="material-symbols-outlined bg-[#edeff3] cursor-pointer select-none w-6 h-6 rounded-full text-lg font-semibold flex items-center justify-center md:text-base md:w-5 md:h-5 lg:w-6 lg:h-6 lg:text-lg"
              onClick={() => handleChangeDate(+1)}
            >
              arrow_forward
            </a>
          </aside>
        </header>
        <button
          className="w-14 h-14 logobox text-2xl font-extrabold flex items-center justify-center cursor-pointer select-none active:bg-[#fcc22f] bg-[#f7d57e] text-white md:w-10 md:h-10 md:text-xl lg:text-2xl lg:w-14 lg:h-14"
          onClick={handleAdd}
        >
          ＋
        </button>
        <div
          className={`${
            showForm
              ? "opacity-100 right-0 transition-all duration-1000"
              : "hidden right-[-100px] transition-all duration-1000"
          } absolute z-50 top-24 shadow-lg shadow-[#3454742a]`}
        >
          <Addform fetchTodos={fetchTodos} />
        </div>
      </main>
      <main className="h-[calc(100vh-24vh)] rounded-xl flex flex-col gap-3 overflow-y-scroll p-5 relative ">
        {filteredData.map((task) => (
          <div
            className={`flex items-center gap-4 relative w-full `}
            key={task._id}
            onClick={() => setShowOption(!showOption)} // Show options on double click
          >
            <div
              className={`flex items-center p-2 justify-center cursor-pointer shadowsAll ${
                task.pinned ? "bg-[#f1f1f1] text-[#f5bd6c]" : ""
              } w-6 h-6 rounded-full text-lg font-semibold md:w-5 md:h-5 lg:w-6 lg:h-6`}
            >
              <span
                className={`material-symbols-outlined  ${
                  task.pinned ? "text-[#f5bd6c]" : ""
                } text-lg`}
                onClick={() => handleTogglePinned(task._id)}
              >
                push_pin
              </span>
            </div>

            <div
              className={`flex-grow p-3 min-w-0 rounded-lg border overflow-x-scroll ${
                task.pinned ? "border-[#f5bd6c] shadow-lg" : "border-[#edeff3]"
              }`}
              onDoubleClick={() => setShowOption(!showOption)}
            >
              <div className="flex gap-4 w-full items-center  ">
                <picture className="min-w-[40px] h-10 text-xl rounded-xl flex items-center justify-center bg-[#ffffff] l">
                  {task.icon}
                </picture>

                <h1 className="font-medium w-max md:text-lg ">
                  {task.title?.slice(0, 20)}
                </h1>
                <span className="flex gap-3  md:gap-5 items-center justify-end w-full ">
                  {task.time && !task.startTime && !task.endTime && (
                    <p className=" text-sm w-max md:text-base lg:text-sm  duration-500">
                      {formatTimeTo12Hour(task.time)}
                    </p>
                  )}

                  {task.startTime && task.endTime && (
                    <span>
                      <p className="text-sm w-max md:text-base lg:text-sm ">
                        {" "}
                        {formatTimeTo12Hour(task.startTime)}
                      </p>
                      <p className="text-xs pl-1 2xl:pl-5 w-max  md:text-sm lg:text-xs 2xl:text-3xl">
                        {formatTimeTo12Hour(task.endTime)}
                      </p>
                    </span>
                  )}
                </span>

                <div
                  className={`flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-600  transition-colors ${
                    showOption ? "block" : "hidden"
                  }`}
                >
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
              </div>

              <div className="pl-[60px] text-xs">
                {task.details?.map(
                  (
                    detail:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<
                          any,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | null
                      | undefined,
                    index: number
                  ) => (
                    <li
                      className={
                        detail ? (index < 1 ? "list-none" : "list-disc") : ""
                      }
                      key={index}
                    >
                      {detail || ""}
                    </li>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </main>
    </section>
  );
};

export default Today;
