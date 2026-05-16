import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/feedbackmanagement/studentinfo.css"; // Ensure this path is correct
import logo from "../components/Images/Ansar.png"; // Adjust the logo path if necessary

function StudentInfoPage()
{
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const navigate = useNavigate();

    // Effect to dynamically load the manifest file for feedback
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

    // Handle the 'Next' button click
    const handleNext = () =>
    {
        if (name && code)
        {
            // Navigate to feedback page and pass name and code as state
            navigate("/ansar/feedback-manage/list", { state: { name, code } });
        } else
        {
            alert("Please enter student details!");
        }
    };

    return (
        <div className="student_info">
            <div className="feedback-container">
            {/* Logo */}
            <img src={logo} alt="Logo" className="logo" />

            {/* Main Heading */}
            <h1 className="ansar-heading">ANSAR</h1>

            {/* Subheading */}
            <h2 className="student-feedback">Student Feedback</h2>

            {/* Form */}
            <form className="form">
                <div className="input-group">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Enter Student Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Enter Student Id"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                </div>

                {/* Next Button */}
                <button type="button" className="submit-btn" onClick={handleNext}>
                    Next →
                </button>
                </form>
            </div>
        </div>
    );
}

export default StudentInfoPage;
