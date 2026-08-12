// import axios from 'axios'
// import React, { createContext, useEffect, useState } from 'react'
// export const userDataContext=createContext()
// function UserContext({children}) {
//     const serverUrl="http://localhost:8000"
//     const [userData,setUserData]=useState(null)
//     const [frontendImage,setFrontendImage]=useState(null)
//      const [backendImage,setBackendImage]=useState(null)
//      const [selectedImage,setSelectedImage]=useState(null)
//     const handleCurrentUser=async ()=>{
//         try {
//             const result=await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
//             setUserData(result.data)
//             console.log(result.data)
//         } catch (error) {
//             console.log(error)
//         }
//     }

//     const getGeminiResponse=async (command)=>{
// try {
//   const result=await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
//   return result.data
// } catch (error) {
//   console.log(error)
// }
//     }

//     useEffect(()=>{
// handleCurrentUser()
//     },[])
//     const value={
// serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage,getGeminiResponse
//     }
//   return (
//     <div>
//     <userDataContext.Provider value={value}>
//       {children}
//       </userDataContext.Provider>
//     </div>
//   )
// }

// export default UserContext




import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const serverUrl = "http://localhost:8000";

  const [userData, setUserData] = useState(null);

  const [backendImage, setBackendImage] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);

  // ============================================
  // GET CURRENT USER
  // ============================================
  const getCurrentUser = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/user/current`,
        {
          withCredentials: true,
        }
      );

      setUserData(result.data);

      console.log("Current user:", result.data);

      return result.data;
    } catch (error) {
      console.error(
        "Get current user error:",
        error.response?.data || error.message
      );

      setUserData(null);

      return null;
    }
  };

  // ============================================
  // GEMINI / ASSISTANT REQUEST
  // ============================================
  const getGeminiResponse = async (command) => {
    try {
      if (!command || !command.trim()) {
        return {
          type: "general",
          userInput: "",
          response: "Please tell me what you want me to do.",
        };
      }

      console.log("Sending command to assistant:", command);

      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        {
          command: command.trim(),
        },
        {
          withCredentials: true,
          timeout: 30000,
        }
      );

      console.log("Assistant response:", result.data);

      // Backend should return an object.
      if (!result.data) {
        return {
          type: "general",
          userInput: command,
          response: "Sorry, I did not receive a response.",
        };
      }

      return {
        type: result.data.type || "general",
        userInput: result.data.userInput || command,
        response:
          result.data.response ||
          "Sorry, I could not understand that.",
      };
    } catch (error) {
      console.error(
        "Assistant API error:",
        error.response?.data || error.message
      );

      // IMPORTANT:
      // Never return undefined.
      // Home.jsx can safely destructure this object.
      return {
        type: "general",
        userInput: command || "",
        response:
          error.response?.data?.response ||
          "Sorry, I am having trouble connecting to my AI service.",
      };
    }
  };

  // ============================================
  // UPDATE ASSISTANT
  // ============================================
  const updateAssistant = async (assistantName, imageFile) => {
    try {
      const formData = new FormData();

      formData.append("assistantName", assistantName);

      if (imageFile) {
        formData.append("assistantImage", imageFile);
      }

      const result = await axios.put(
        `${serverUrl}/api/user/update`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Updated assistant:", result.data);

      setUserData(result.data);

      return result.data;
    } catch (error) {
      console.error(
        "Update assistant error:",
        error.response?.data || error.message
      );

      return null;
    }
  };

  // ============================================
  // GET USER ON APP LOAD
  // ============================================
  useEffect(() => {
    getCurrentUser();
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    serverUrl,

    userData,
    setUserData,

    backendImage,
    setBackendImage,

    frontendImage,
    setFrontendImage,

    selectedImage,
    setSelectedImage,

    getCurrentUser,
    getGeminiResponse,
    updateAssistant,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;

// ============================================
// CUSTOM HOOK
// ============================================
export const useUserData = () => {
  return useContext(userDataContext);
};

