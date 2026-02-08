import { da } from "date-fns/locale";
import { useState, useEffect } from "react";


const CommentsSection = () => {

    const [comments, setComments] = useState([]);

    useEffect(() => {
        // Example fetch call to get comments and replies (to be replaced with actual API endpoint)
        
        fetch('http://127.0.0.1:8000/api/posts/1/comments') // Fetch comments for the authenticated user
            .then(response => response.json())
            .then(data => {
                console.log(data); // Log the fetched data to verify its structure
                // Handle the fetched comments and replies data
                setComments(data); // Assuming the API returns an array of comments with their replies
                
            })
            .catch(error => console.error('Error fetching comments and replies:', error));
    }, []);
        


    return (
        <h1>YESSSS</h1>
    );
}

export default CommentsSection;