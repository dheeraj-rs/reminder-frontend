import React, { useEffect, useState } from 'react';
import { Formtype, valtioDataType } from '../types/Formtype';
import { proxy, useSnapshot } from 'valtio';
import axios from 'axios';
import { toast } from 'react-toastify';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const icons = ['🦋', '😍', '😎'];

export const state = proxy<valtioDataType>({
    userId: '',
    taskData: [],
    calenderDate: null,
    formToggle: false,
    selectedData: null,
});

const Addform: React.FC = (props) => {
    const snapshot = useSnapshot(state);
    const [editedTask, setEditedTask] = useState<Boolean>(false);
    const [formState, setFormState] = useState<Formtype>({
        date: '',
        title: '',
        time: '',
        startTime: '',
        endTime: '',
        icon: '',
        color: '#FFFFFF',
        details: [],
        pinned: false,
        personal: false,
        userid: '',
    });

    useEffect(() => {
        if (snapshot.selectedData) {
            setFormState(snapshot.selectedData);
            const isoDate = new Date(snapshot.selectedData.date).toISOString().split('T')[0];
            setFormState(prevState => ({ ...prevState, date: isoDate }));
            setEditedTask(true)
        }
    }, [snapshot.selectedData]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axios.post(`${API_BASE_URL}`, {}, { withCredentials: true });
                setUserid(data.user);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    const setUserid = (userid: string) => {
        setFormState(prevState => ({ ...prevState, userid }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.date || !formState.title || !formState.time) {
            toast.warning(
                <span>
                    Please fill{' '}
                    <span style={{ color: !formState.date ? 'red' : '' }}>
                        {formState.date ? '' : 'Date'}
                    </span>{' '}
                    <span style={{ color: !formState.title ? 'red' : '' }}>
                        {formState.title ? '' : 'Title'}
                    </span>{' '}
                    <span style={{ color: !formState.time ? 'red' : '' }}>
                        {formState.time ? '' : 'Time'}
                    </span>{' '}
                    should be filled anyway
                </span>
            );
            return;
        }

        const newTask: Formtype = {
            ...formState,
            date: Date.parse(formState.date),
            userid: formState.userid,
        };
        state.taskData = [newTask, ...snapshot.taskData];
        axios.post(`${API_BASE_URL}addData`, { newTask }).then(() => {
            props.fetchTodos();
          })

        state.formToggle = false;
        resetFormFields();
    };

    const handleSave = async () => {
        if (!formState) return;

        const updatedTask = {
            ...formState,
            date: Date.parse(formState.date),
        };

        const updatedTodos = snapshot.taskData.map((task) =>
            task.id === formState.id ? updatedTask : task
        ) as Formtype[];


        try {
            await axios.put(`${API_BASE_URL}updateData/${formState._id}`, { updatedTask });

        } catch (error) {
            console.error('Error updating task:', error);
        }

        state.taskData = updatedTodos;
        state.selectedData = null;
        state.formToggle = false;
        resetFormFields();
    };

    const resetFormFields = () => {
        setEditedTask(false);
        setFormState({
            date: '',
            title: '',
            time: '',
            startTime: '',
            endTime: '',
            icon: '',
            color: '#FFFFFF',
            details: [],
            pinned: false,
            personal: false,
            userid: formState.userid,
        });
    };

    const handleCancel = () => {
        state.formToggle = false;
        state.selectedData = null;
        resetFormFields();
    };

    const buttonClasses = "bg-[#f5bd6c] text-white px-4 py-2 mt-4 rounded hover:bg-[#f0a742]";

    return (
        <div className="bg-[#f9fbfd] p-5 z-50">
            <span className="w-6 h-6 bg-[#f9fbfd] absolute -top-3 right-1.5 shadow-sm shadow-[#f9fbfd] rotate-45 z-40" >
            </span>
            <div >
                <table className="w-full">
                    <tbody>
                        <tr>
                            <td className="py-2">Date:</td>
                            <td className='relative'>
                                <input
                                    type="date"
                                    value={formState.date}
                                    onChange={(e) => setFormState(prevState => ({ ...prevState, date: e.target.value }))}
                                    className="w-[calc(100%-25%)] px-2 py-1 rounded border border-gray-300 cursor-pointer "
                                />
                                <span
                                    className={`material-symbols-outlined absolute top-2.5 right-2  text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer`}
                                    onClick={() => setFormState(prevState => ({ ...prevState, date: '' }))}>
                                    clear_all
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2">Title:</td>
                            <td className='relative'>
                                <input
                                    type="text"
                                    value={formState.title}
                                    onChange={(e) => setFormState(prevState => ({ ...prevState, title: e.target.value }))}
                                    className="w-[calc(100%-25%)] px-2 py-1 rounded border border-gray-300"
                                    placeholder='Type title...'
                                />
                                <span
                                    className={`material-symbols-outlined absolute top-2.5 right-2  text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer`}
                                    onClick={() => setFormState(prevState => ({ ...prevState, title: '' }))}>
                                    clear_all
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2">Time:</td>
                            <td className='relative'>
                                <input
                                    type="time"

                                    value={formState.time}
                                    onChange={(e) => setFormState(prevState => ({ ...prevState, time: e.target.value }))}
                                    className="w-[calc(100%-25%)] px-2 py-1 rounded border border-gray-300 cursor-pointer"
                                />
                                <span
                                    className={`material-symbols-outlined absolute top-2.5 right-2  text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer`}
                                    onClick={() => setFormState(prevState => ({ ...prevState, time: '' }))}>
                                    clear_all
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2">StartTime:</td>
                            <td className='relative'>
                                <input
                                    type="time"
                                    value={formState.startTime}
                                    onChange={(e) => setFormState(prevState => ({ ...prevState, startTime: e.target.value }))}
                                    className="w-[calc(100%-25%)] px-2 py-1 rounded border border-gray-300 cursor-pointer"
                                />
                                <span
                                    className={`material-symbols-outlined absolute top-2.5 right-2  text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer`}
                                    onClick={() => setFormState(prevState => ({ ...prevState, startTime: '' }))}>
                                    clear_all
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2">EndTime:</td>
                            <td className='relative'>
                                <input
                                    type="time"
                                    value={formState.endTime}
                                    onChange={(e) => setFormState(prevState => ({ ...prevState, endTime: e.target.value }))}
                                    className="w-[calc(100%-25%)] px-2 py-1 rounded border border-gray-300 cursor-pointer"
                                />
                                <span
                                    className={`material-symbols-outlined absolute top-2.5 right-2  text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer`}
                                    onClick={() => setFormState(prevState => ({ ...prevState, endTime: '' }))}>
                                    clear_all
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2">icon:</td>
                            <td className='relative'>
                                <select
                                    value={formState.icon}
                                    onChange={(e) => setFormState(prevState => ({ ...prevState, icon: e.target.value }))}
                                    className="w-[calc(100%-25%)] px-2 py-1 rounded border border-gray-300 bg-[#f9fbfd] text-gray-700 shadow-sm focus:outline-none cursor-pointer "
                                >
                                    <option value="" disabled>Select an icon</option>
                                    {icons.map(icon => (
                                        <option
                                            key={icon}
                                            value={icon}
                                            className={`bg-[#f9fbfd] text-gray-900 p-2 rounded hover:bg-[#f5bd6c]  `}
                                        >
                                            {icon}
                                        </option>
                                    ))}
                                </select>
                                <span
                                    className={`material-symbols-outlined absolute top-2.5 right-2  text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer`}
                                    onClick={() => setFormState(prevState => ({ ...prevState, icon: '' }))}
                                >
                                    clear_all
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2">Color:</td>
                            <td className='relative'>
                                <input
                                    type="color"
                                    value={formState.color}
                                    onChange={(e) => setFormState(prevState => ({ ...prevState, color: e.target.value }))}
                                    className="w-[calc(100%-25%)] px-2 py-1 rounded border border-gray-300 cursor-pointer"
                                />
                                <span
                                    className={`material-symbols-outlined absolute top-2.5 right-2  text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer`}
                                    onClick={() => setFormState(prevState => ({ ...prevState, color: '#FFFFFF' }))}>
                                    clear_all
                                </span>
                            </td>

                        </tr>
                        <tr>
                            <td className="">Details:</td>
                            <td className="relative overflow-x-visible">
                                <textarea
                                    value={formState.details.join('\n')}
                                    onChange={(e) => setFormState(prevState => ({ ...prevState, details: e.target.value.split('\n') }))}
                                    className="w-full px-2  py-1 rounded border border-gray-300 "
                                    placeholder='Type details...'
                                ></textarea>
                                {formState.details.length > 0 && (
                                    <span
                                        className={`material-symbols-outlined absolute bottom-1 right-2  text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer`}
                                        onClick={() => setFormState(prevState => ({ ...prevState, details: [] }))}
                                    >
                                        clear_all
                                    </span>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2">Type:</td>
                            <td className="py-2 flex items-center gap-5">
                                <div className="flex items-center">
                                    <label >Pinned: </label>
                                    <input
                                        type="checkbox" checked={formState.pinned}
                                        onChange={(e) => setFormState((prevState) => ({ ...prevState, pinned: e.target.checked, }))}
                                        className="rounded-full cursor-pointer"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label>Personal: </label>
                                    <input
                                        type="checkbox" checked={formState.personal}
                                        onChange={(e) => setFormState((prevState) => ({ ...prevState, personal: e.target.checked, }))}
                                        className="rounded cursor-pointer"
                                    />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {editedTask ? (
                    <span className="flex gap-5">
                        <button className={buttonClasses} onClick={handleSave}>
                            Save
                        </button>
                        <button className={buttonClasses} onClick={handleCancel}>
                            Cancel
                        </button>
                    </span>)
                    : (
                        <span className="flex gap-5">
                            <button
                                onClick={handleSubmit}
                                className={buttonClasses}
                            > Add Task </button>
                            <button className={buttonClasses} onClick={handleCancel}>
                                Cancel
                            </button>
                        </span>
                    )}
            </div>

        </div>
    );
};

export default Addform;


