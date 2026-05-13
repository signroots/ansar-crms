import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FeedbackPage.css"; // Import the CSS file for styling

function FeedbackList()
{
    const location = useLocation();
    const navigate = useNavigate();
    const { name, code } = location.state || {};  // Get the state passed from StudentInfoPage

    const questions = [
        "Cleanliness Standard in FOB & Subway",
        "Cleanliness Standard Of Platform & Circulating area",
    ];

    const options = [
        { emoji: "😍", label: "Very Good", color: "green" },
        { emoji: "😊", label: "Good", color: "blue" },
        { emoji: "😐", label: "Medium", color: "yellow" },
        { emoji: "😟", label: "Bad", color: "red" },
        { emoji: "😭", label: "Very Bad", color: "dark" },
    ];

    const [responses, setResponses] = useState({});
    const [showModal, setShowModal] = useState(false);

    useEffect(() =>
    {
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = '/manifest-feedback.json';  // Use your new manifest for feedback
        document.head.appendChild(link);

        return () =>
        {
            // Clean up: Remove the link tag when this page is unmounted
            document.head.removeChild(link);
        };
    }, []);

    const handleSelect = (questionIndex, optionLabel) =>
    {
        setResponses((prev) => ({ ...prev, [questionIndex]: optionLabel }));
    };

    const handleSubmit = () =>
    {
        if (Object.keys(responses).length < questions.length)
        {
            alert("Please answer all the questions before submitting.");
            return;
        }
        setShowModal(true);
    };

    const handleModalClose = () =>
    {
        setShowModal(false);
        navigate("/"); // Redirect to home or another route after submission
    };

    return (
        <div className="feedback-page d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="feedbackcontainer p-4 bg-white rounded shadow">
                <h2 className="text-center mb-3">Feedback Form</h2>
                <p className="text-center fw-bold mb-5">
                    Student: {name} | Code: {code}
                </p>

                {questions.map((question, index) => (
                    <div key={index} className="mb-5">
                        <p className="mb-2">
                            {index + 1}. {question}
                        </p>
                        <div className="d-flex gap-2 flex-wrap">
                            {options.map((option, idx) =>
                            {
                                const isActive = responses[index] === option.label;
                                const btnClass = isActive ? `${ option.color } active` : option.color;

                                return (
                                    <label
                                        key={idx}
                                        className={`btn ${ btnClass }`}
                                        onClick={() => handleSelect(index, option.label)}
                                    >
                                        <input
                                            type="radio"
                                            name={`q${ index }`}
                                            value={option.label}
                                            checked={isActive}
                                            onChange={() => handleSelect(index, option.label)}
                                            className="me-1"
                                        />
                                        {option.emoji} {option.label}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="feedSubmit">
                    <button className="feedbtn" onClick={handleSubmit}>
                        Submit
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="modal d-block" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Success</h5>
                            </div>
                            <div className="modal-body">
                                <p>Feedback Successfully Submitted!</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-footer" onClick={handleModalClose}>
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FeedbackList;  // Corrected export statement
