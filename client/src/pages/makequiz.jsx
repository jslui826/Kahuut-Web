import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/makequiz.css"; 

const MakeQuiz = () => {
    const [quizTitle, setQuizTitle] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [mp3File, setMp3File] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const navigate = useNavigate();

    const handleFileUpload = async () => {
        if (!pdfFile || !quizTitle.trim()) {
            alert("Please enter a title and upload a PDF file for the quiz.");
            return;
        }

        setIsUploading(true);
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("title", quizTitle);
        formData.append("pdf", pdfFile);
        if (imageFile) formData.append("image", imageFile);
        if (mp3File) formData.append("mp3", mp3File);
        console.log("📤 FormData before sending:");
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
    }

        try {
            const response = await fetch("http://localhost:4000/quizzes/upload", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();
            console.log("Server Response:", result);

            if (response.ok) {
                alert("Quiz uploaded successfully!");
                navigate("/quizzes"); // Redirect to quizzes page
            } else {
                alert("Failed to upload quiz.");
            }
        } catch (error) {
            console.error("Error uploading quiz:", error);
            alert("Error uploading quiz.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="makequiz-fullscreen">
            <div className="makequiz-container">
                <h2>Create a New Quiz</h2>
                
                <label>Quiz Title (Required):</label>
                <input 
                    type="text" 
                    value={quizTitle} 
                    onChange={(e) => setQuizTitle(e.target.value)} 
                />

                <label>Upload PDF (Required):</label>
                <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} />

                <label>Upload Image (Optional):</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />

                <label>Upload MP3 (Optional):</label>
                <input type="file" accept="audio/mp3" onChange={(e) => setMp3File(e.target.files[0])} />

                <button onClick={handleFileUpload} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Submit Quiz"}
                </button>
                <button className="back-btn" onClick={() => navigate("/quizzes")}>Go Back</button>
            </div>
        </div>
    );
};

export default MakeQuiz;
