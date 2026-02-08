
import { useContext, useState, useEffect } from 'react'
import './App.css'
import NavbarImmobilier from './components/static/navbar'
import { AppContext } from './context/AppContext'
import { ThemeProvider } from './context/themeProvider'
// import RealEstateCard from './components/common/card'
// import { ThemeProvider } from './context/themeProvider'
// import { ModeToggle } from './components/common/themeButton'
// import NavbarImmobilier from './components/static/navbar'
// import AuthComponent from './pages/auth/register'
// import PropertyForm from './pages/admin/addBien'
// import PropertyList from './pages/admin/showProperties'


function App() {

    const {name} = useContext(AppContext);

    const [comments, setComments] = useState([]);
    const [addComment, setAddComment] = useState('');

    useEffect(() => {
            // Example fetch call to get comments and replies (to be replaced with actual API endpoint)
            
            fetch('http://127.0.0.1:8000/api/posts/1/comments') // Fetch comments for the authenticated user
                .then(response => response.json())
                .then(data => {
                    console.log(data); // Log the fetched data to verify its structure
                    // Handle the fetched comments and replies data
                    // Check if data is an array or if the array is nested in the response
                    const commentsArray = Array.isArray(data) ? data : (data.data || []);
                    setComments(commentsArray); // Set comments with proper array
                    
                })
                .catch(error => console.error('Error fetching comments and replies:', error));
        }, []);
  

  return (

    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      < NavbarImmobilier />
      <div className='bloc mb-10 mt-10 flex justify-center'>
        <h1 className='text-3xl'>Bienvenue {name}</h1>


        <div>
            {comments.map(comment => (
                <div key={comment.id} className="comment">
                    <p><strong>{comment.user.name}</strong>: {comment.content}</p>
                    <div className="replies ml-4">
                        {comment.replies.map(reply => (
                            <div key={reply.id} className="reply">
                                <p><strong>{reply.user.name}</strong>: {reply.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>



      </div>
    </ThemeProvider>

  )
}

export default App
