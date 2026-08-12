import React, {
  useContext,
  useEffect,
  useRef,
  useState, 
} from "react";  

import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";

import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";      
  
function Home() {
  const { 
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse,
  } = useContext(userDataContext);

  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);

  // ==========================================
  // REFS
  // ==========================================

  const recognitionRef = useRef(null);

  const isSpeakingRef = useRef(false);

  const isRecognizingRef = useRef(false);

  const isProcessingRef = useRef(false);

  const isMountedRef = useRef(false);

  const userDataRef = useRef(userData);

  const getGeminiResponseRef =
    useRef(getGeminiResponse);

  const restartTimeoutRef =
    useRef(null);

  const synth =
    typeof window !== "undefined"
      ? window.speechSynthesis
      : null;

  // ==========================================
  // KEEP LATEST USER DATA
  // ==========================================

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  // ==========================================
  // KEEP LATEST GEMINI FUNCTION
  // ==========================================

  useEffect(() => {
    getGeminiResponseRef.current =
      getGeminiResponse;
  }, [getGeminiResponse]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogOut = async () => {
    try {
      await axios.get(
        `${serverUrl}/api/auth/logout`,
        {
          withCredentials: true,
        }
      );

      setUserData(null);

      navigate("/signin");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setUserData(null);

      navigate("/signin");
    }
  };

  // ==========================================
  // SPEAK
  // ==========================================

  const speak = (text) => {
    if (!text || !synth) {
      return;
    }

    try {
      synth.cancel();

      const utterance =
        new SpeechSynthesisUtterance(
          text
        );

      utterance.lang = "en-US";

      const voices =
        synth.getVoices();

      const preferredVoice =
        voices.find(
          (voice) =>
            voice.lang === "en-IN"
        ) ||
        voices.find(
          (voice) =>
            voice.lang === "en-US"
        ) ||
        voices.find(
          (voice) =>
            voice.lang.startsWith(
              "en"
            )
        );

      if (preferredVoice) {
        utterance.voice =
          preferredVoice;
      }

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      isSpeakingRef.current = true;

      utterance.onend = () => {
        isSpeakingRef.current = false;

        if (
          isMountedRef.current &&
          !isProcessingRef.current
        ) {
          restartRecognition();
        }
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;

        if (
          isMountedRef.current &&
          !isProcessingRef.current
        ) {
          restartRecognition();
        }
      };

      synth.speak(utterance);
    } catch (error) {
      console.error(
        "Speech error:",
        error
      );

      isSpeakingRef.current = false;
    }
  };

  // ==========================================
  // RESTART RECOGNITION
  // ==========================================

  const restartRecognition = () => {
    if (
      !isMountedRef.current ||
      isSpeakingRef.current ||
      isProcessingRef.current ||
      isRecognizingRef.current
    ) {
      return;
    }

    if (restartTimeoutRef.current) {
      clearTimeout(
        restartTimeoutRef.current
      );
    }

    restartTimeoutRef.current =
      setTimeout(() => {
        if (
          !isMountedRef.current ||
          isSpeakingRef.current ||
          isProcessingRef.current ||
          isRecognizingRef.current
        ) {
          return;
        }

        try {
          recognitionRef.current?.start();

          console.log(
            "Recognition requested to start"
          );
        } catch (error) {
          if (
            error?.name !==
            "InvalidStateError"
          ) {
            console.error(
              "Recognition start error:",
              error
            );
          }
        }
      }, 700);
  };

  // ==========================================
  // NORMALIZE COMMAND
  // ==========================================

  const cleanCommand = (text) => {
    let command =
      text?.trim() || "";

    const currentUser =
      userDataRef.current;

    const assistantName =
      currentUser?.assistantName
        ?.trim() || "jarvis";

    const escapedName =
      assistantName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    command = command.replace(
      new RegExp(
        `^${escapedName}[,\\s]*`,
        "i"
      ),
      ""
    );

    return command.trim();
  };

  // ==========================================
  // OPEN WEBSITE
  // ==========================================

  const openWebsite = (
    url,
    message
  ) => {
    console.log(
      "Opening:",
      url
    );

    // ======================================
    // TRY NEW TAB
    // ======================================

    let newWindow = null;

    try {
      newWindow = window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.warn(
        "window.open failed:",
        error
      );
    }

    // ======================================
    // POPUP BLOCKED
    // ======================================

    if (!newWindow) {
      console.warn(
        "Popup was blocked by browser."
      );

      // We don't want the command to fail
      // completely. Navigate current tab
      // as a reliable fallback.

      try {
        window.location.href = url;

        return true;
      } catch (error) {
        console.error(
          "Navigation failed:",
          error
        );

        setAiText(
          "Please allow popups for this website."
        );

        if (message) {
          speak(message);
        }

        return false;
      }
    }

    return true;
  };

  // ==========================================
  // LOCAL COMMAND PROCESSOR
  // ==========================================
  //
  // IMPORTANT:
  // These commands NEVER call Gemini.
  //
  // This saves Gemini quota.
  //
  // ==========================================

  const handleLocalCommand = (
    command
  ) => {
    const originalCommand =
      command.trim();

    const lowerCommand =
      originalCommand.toLowerCase();

    console.log(
      "Checking local command:",
      originalCommand
    );

    // ======================================
    // YOUTUBE OPEN
    // ======================================

    if (
      /\b(open|launch|start|go to|visit)\s+(youtube)\b/i.test(
        lowerCommand
      )
    ) {
      const response =
        "Opening YouTube.";

      setAiText(response);

      openWebsite(
        "https://www.youtube.com/",
        response
      );

      return {
        handled: true,
        type: "youtube-open",
        response,
      };
    }

    // ======================================
    // GOOGLE OPEN
    // ======================================

    if (
      /\b(open|launch|start|go to|visit)\s+(google)\b/i.test(
        lowerCommand
      )
    ) {
      const response =
        "Opening Google.";

      setAiText(response);

      openWebsite(
        "https://www.google.com/",
        response
      );

      return {
        handled: true,
        type: "google-open",
        response,
      };
    }

    // ======================================
    // INSTAGRAM
    // ======================================

    if (
      /\b(open|launch|start|go to|visit)\s+(instagram)\b/i.test(
        lowerCommand
      )
    ) {
      const response =
        "Opening Instagram.";

      setAiText(response);

      openWebsite(
        "https://www.instagram.com/",
        response
      );

      return {
        handled: true,
        type: "instagram-open",
        response,
      };
    }

    // ======================================
    // FACEBOOK
    // ======================================

    if (
      /\b(open|launch|start|go to|visit)\s+(facebook)\b/i.test(
        lowerCommand
      )
    ) {
      const response =
        "Opening Facebook.";

      setAiText(response);

      openWebsite(
        "https://www.facebook.com/",
        response
      );

      return {
        handled: true,
        type: "facebook-open",
        response,
      };
    }

    // ======================================
    // WHATSAPP
    // ======================================

    if (
      /\b(open|launch|start|go to|visit)\s+(whatsapp)\b/i.test(
        lowerCommand
      )
    ) {
      const response =
        "Opening WhatsApp.";

      setAiText(response);

      openWebsite(
        "https://web.whatsapp.com/",
        response
      );

      return {
        handled: true,
        type: "whatsapp-open",
        response,
      };
    }

    // ======================================
    // GMAIL
    // ======================================

    if (
      /\b(open|launch|start|go to|visit)\s+(gmail|email|mail)\b/i.test(
        lowerCommand
      )
    ) {
      const response =
        "Opening Gmail.";

      setAiText(response);

      openWebsite(
        "https://mail.google.com/",
        response
      );

      return {
        handled: true,
        type: "gmail-open",
        response,
      };
    }

    // ======================================
    // LINKEDIN
    // ======================================

    if (
      /\b(open|launch|start|go to|visit)\s+(linkedin)\b/i.test(
        lowerCommand
      )
    ) {
      const response =
        "Opening LinkedIn.";

      setAiText(response);

      openWebsite(
        "https://www.linkedin.com/",
        response
      );

      return {
        handled: true,
        type: "linkedin-open",
        response,
      };
    }

    // ======================================
    // SPOTIFY
    // ======================================

    if (
      /\b(open|launch|start|go to|visit)\s+(spotify)\b/i.test(
        lowerCommand
      )
    ) {
      const response =
        "Opening Spotify.";

      setAiText(response);

      openWebsite(
        "https://open.spotify.com/",
        response
      );

      return {
        handled: true,
        type: "spotify-open",
        response,
      };
    }

    // ======================================
    // CALCULATOR
    // ======================================

    if (
      /\b(open|launch|start|show)\s+(calculator|calc)\b/i.test(
        lowerCommand
      )
    ) {
      const response =
        "Opening calculator.";

      setAiText(response);

      openWebsite(
        "https://www.google.com/search?q=calculator",
        response
      );

      return {
        handled: true,
        type: "calculator-open",
        response,
      };
    }

    // ======================================
    // WEATHER
    // ======================================

    if (
      /\b(open|show|check|tell me)\b.*\bweather\b/i.test(
        lowerCommand
      ) ||
      /\bweather\b.*\btoday\b/i.test(
        lowerCommand
      )
    ) {
      const response =
        "Checking the weather.";

      setAiText(response);

      const query =
        encodeURIComponent(
          originalCommand
            .replace(
              /\b(weather|today|show|check|tell me|what is|what's)\b/gi,
              ""
            )
            .trim() ||
            "weather"
        );

      openWebsite(
        `https://www.google.com/search?q=${query}+weather`,
        response
      );

      return {
        handled: true,
        type: "weather-show",
        response,
      };
    }

    // ======================================
    // YOUTUBE SEARCH
    // ======================================

    const youtubeSearchMatch =
      lowerCommand.match(
        /^(search|find|look for)\s+(.+?)(?:\s+on\s+youtube)?$/i
      );

    if (
      youtubeSearchMatch &&
      /\byoutube\b/i.test(
        originalCommand
      )
    ) {
      let query =
        youtubeSearchMatch[2]
          .replace(
            /\s+on\s+youtube$/i,
            ""
          )
          .trim();

      const response =
        `Searching YouTube for ${query}.`;

      setAiText(response);

      openWebsite(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          query
        )}`,
        response
      );

      return {
        handled: true,
        type: "youtube-search",
        response,
      };
    }

    // ======================================
    // GOOGLE SEARCH
    // ======================================

    const googleSearchMatch =
      lowerCommand.match(
        /^(search|find|look for)\s+(.+?)(?:\s+on\s+google)?$/i
      );

    if (
      googleSearchMatch &&
      /\bgoogle\b/i.test(
        originalCommand
      )
    ) {
      let query =
        googleSearchMatch[2]
          .replace(
            /\s+on\s+google$/i,
            ""
          )
          .trim();

      const response =
        `Searching Google for ${query}.`;

      setAiText(response);

      openWebsite(
        `https://www.google.com/search?q=${encodeURIComponent(
          query
        )}`,
        response
      );

      return {
        handled: true,
        type: "google-search",
        response,
      };
    }

    // ======================================
    // NOTHING MATCHED
    // ======================================

    return {
      handled: false,
    };
  };

  // ==========================================
  // HANDLE GEMINI COMMAND
  // ==========================================

  const handleGeminiCommand = (
    data
  ) => {
    if (!data) {
      const response =
        "Sorry, I couldn't understand that.";

      setAiText(response);

      speak(response);

      return;
    }

    console.log(
      "Gemini command:",
      data
    );

    const {
      type = "general",
      userInput = "",
      response = "",
    } = data;

    // ======================================
    // WEBSITE COMMANDS FROM GEMINI
    // ======================================

    if (
      type === "youtube-open"
    ) {
      openWebsite(
        "https://www.youtube.com/",
        response
      );
    }

    else if (
      type === "youtube-search"
    ) {
      const query =
        encodeURIComponent(
          userInput
        );

      openWebsite(
        `https://www.youtube.com/results?search_query=${query}`,
        response
      );
    }

    else if (
      type === "youtube-play"
    ) {
      const query =
        encodeURIComponent(
          userInput
        );

      openWebsite(
        `https://www.youtube.com/results?search_query=${query}`,
        response
      );
    }

    else if (
      type === "google-open"
    ) {
      openWebsite(
        "https://www.google.com/",
        response
      );
    }

    else if (
      type === "google-search"
    ) {
      const query =
        encodeURIComponent(
          userInput
        );

      openWebsite(
        `https://www.google.com/search?q=${query}`,
        response
      );
    }

    else if (
      type === "instagram-open"
    ) {
      openWebsite(
        "https://www.instagram.com/",
        response
      );
    }

    else if (
      type === "facebook-open"
    ) {
      openWebsite(
        "https://www.facebook.com/",
        response
      );
    }

    else if (
      type === "whatsapp-open"
    ) {
      openWebsite(
        "https://web.whatsapp.com/",
        response
      );
    }

    else if (
      type === "gmail-open"
    ) {
      openWebsite(
        "https://mail.google.com/",
        response
      );
    }

    else if (
      type === "linkedin-open"
    ) {
      openWebsite(
        "https://www.linkedin.com/",
        response
      );
    }

    else if (
      type === "spotify-open"
    ) {
      openWebsite(
        "https://open.spotify.com/",
        response
      );
    }

    else if (
      type === "calculator-open"
    ) {
      openWebsite(
        "https://www.google.com/search?q=calculator",
        response
      );
    }

    else if (
      type === "weather-show"
    ) {
      openWebsite(
        "https://www.google.com/search?q=weather",
        response
      );
    }

    // ======================================
    // SHOW RESPONSE
    // ======================================

    if (response) {
      setAiText(response);

      speak(response);
    }
  };

  // ==========================================
  // RECOGNITION SETUP
  // ==========================================

  useEffect(() => {
    isMountedRef.current = true;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error(
        "Speech Recognition is not supported by this browser."
      );

      setAiText(
        "Speech recognition is not supported in this browser."
      );

      return () => {
        isMountedRef.current = false;
      };
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;

    recognition.lang = "en-US";

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognitionRef.current =
      recognition;

    // ======================================
    // ON START
    // ======================================

    recognition.onstart = () => {
      if (!isMountedRef.current) {
        return;
      }

      isRecognizingRef.current = true;

      setListening(true);

      console.log(
        "Recognition started"
      );
    };

    // ======================================
    // ON END
    // ======================================

    recognition.onend = () => {
      if (!isMountedRef.current) {
        return;
      }

      isRecognizingRef.current = false;

      setListening(false);

      console.log(
        "Recognition ended"
      );

      if (
        !isSpeakingRef.current &&
        !isProcessingRef.current
      ) {
        restartRecognition();
      }
    };

    // ======================================
    // ON ERROR
    // ======================================

    recognition.onerror = (
      event
    ) => {
      if (!isMountedRef.current) {
        return;
      }

      console.warn(
        "Recognition error:",
        event.error
      );

      isRecognizingRef.current = false;

      setListening(false);

      // no-speech is normal when nothing
      // was spoken.
      if (
        event.error ===
          "no-speech" ||
        event.error ===
          "aborted"
      ) {
        if (
          !isSpeakingRef.current &&
          !isProcessingRef.current
        ) {
          restartRecognition();
        }

        return;
      }

      if (
        !isSpeakingRef.current &&
        !isProcessingRef.current
      ) {
        restartRecognition();
      }
    };

    // ======================================
    // ON RESULT
    // ======================================

    recognition.onresult =
      async (event) => {
        if (
          !isMountedRef.current
        ) {
          return;
        }

        if (
          isProcessingRef.current
        ) {
          return;
        }

        try {
          const result =
            event.results[
              event.results.length - 1
            ];

          if (!result) {
            return;
          }

          const transcript =
            result[0]
              ?.transcript
              ?.trim();

          if (!transcript) {
            return;
          }

          console.log(
            "User said:",
            transcript
          );

          // ==================================
          // CHECK ASSISTANT NAME
          // ==================================

          const currentUser =
            userDataRef.current;

          const assistantName =
            currentUser?.assistantName
              ?.trim()
              ?.toLowerCase();

          if (!assistantName) {
            console.warn(
              "Assistant name not found."
            );

            return;
          }

          if (
            !transcript
              .toLowerCase()
              .includes(
                assistantName
              )
          ) {
            console.log(
              "Assistant name not detected."
            );

            return;
          }

          // ==================================
          // PROCESSING
          // ==================================

          isProcessingRef.current =
            true;

          setUserText(
            transcript
          );

          setAiText("");

          // ==================================
          // STOP RECOGNITION
          // ==================================

          try {
            recognition.stop();
          } catch (error) {
            console.warn(
              "Recognition stop error:",
              error
            );
          }

          isRecognizingRef.current =
            false;

          setListening(false);

          // ==================================
          // REMOVE "JARVIS"
          // ==================================

          const command =
            cleanCommand(
              transcript
            );

          console.log(
            "Clean command:",
            command
          );

          // ==================================
          // LOCAL COMMAND FIRST
          // ==================================

          const localResult =
            handleLocalCommand(
              command
            );

          // ==================================
          // LOCAL COMMAND FOUND
          // ==================================

          if (
            localResult.handled
          ) {
            console.log(
              "Handled locally:",
              localResult
            );

            setUserText("");

            isProcessingRef.current =
              false;

            return;
          }

          // ==================================
          // GEMINI ONLY FOR UNKNOWN COMMANDS
          // ==================================

          console.log(
            "No local command matched."
          );

          console.log(
            "Sending command to Gemini:",
            command
          );

          try {
            const data =
              await getGeminiResponseRef.current(
                command
              );

            console.log(
              "Assistant data:",
              data
            );

            handleGeminiCommand(
              data
            );
          } catch (error) {
            console.error(
              "Gemini command error:",
              error
            );

            const errorMessage =
              "I'm unable to connect to my AI service right now.";

            setAiText(
              errorMessage
            );

            speak(
              errorMessage
            );
          }

          setUserText("");

          isProcessingRef.current =
            false;

        } catch (error) {
          console.error(
            "Command processing error:",
            error
          );

          setAiText(
            "Sorry, something went wrong."
          );

          speak(
            "Sorry, something went wrong."
          );

          setUserText("");

          isProcessingRef.current =
            false;
        }
      };

    // ======================================
    // INITIAL GREETING
    // ======================================

    const greetingTimeout =
      setTimeout(() => {
        if (
          !isMountedRef.current
        ) {
          return;
        }

        const currentUser =
          userDataRef.current;

        const name =
          currentUser?.name ||
          "there";

        const greetingText =
          `Hello ${name}, what can I help you with?`;

        setAiText(
          greetingText
        );

        speak(
          greetingText
        );
      }, 800);

    // ======================================
    // CLEANUP
    // ======================================

    return () => {
      isMountedRef.current =
        false;

      isProcessingRef.current =
        false;

      isRecognizingRef.current =
        false;

      if (
        restartTimeoutRef.current
      ) {
        clearTimeout(
          restartTimeoutRef.current
        );
      }

      clearTimeout(
        greetingTimeout
      );

      try {
        recognition.stop();
      } catch (error) {
        // Ignore stop errors during cleanup
      }

      if (synth) {
        synth.cancel();
      }

      recognitionRef.current =
        null;
    };
  }, []);

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative flex flex-col justify-center items-center">

      {/* =====================================
          MOBILE MENU BUTTON
      ====================================== */}

      <CgMenuRight
        className="
          lg:hidden
          text-white
          absolute
          top-[20px]
          right-[20px]
          w-[28px]
          h-[28px]
          cursor-pointer
          z-50
        "
        onClick={() =>
          setHam(true)
        }
      />

      {/* =====================================
          MOBILE MENU
      ====================================== */}

      <div
        className={`
          absolute
          lg:hidden
          top-0
          right-0
          w-full
          h-full
          bg-[#00000053]
          backdrop-blur-lg
          p-[20px]
          flex
          flex-col
          gap-[20px]
          items-start
          z-40
          transition-transform
          duration-300
          ${
            ham
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        <RxCross1
          className="
            text-white
            absolute
            top-[20px]
            right-[20px]
            w-[25px]
            h-[25px]
            cursor-pointer
          "
          onClick={() =>
            setHam(false)
          }
        />

        <button
          className="
            min-w-[150px]
            h-[60px]
            mt-[70px]
            text-black
            font-semibold
            bg-white
            rounded-full
            cursor-pointer
            text-[19px]
            px-[20px]
            py-[10px]
          "
          onClick={() =>
            navigate("/customize")
          }
        >
          Customize your Assistant
        </button>

        <button
          className="
            min-w-[150px]
            h-[60px]
            text-black
            font-semibold
            bg-white
            rounded-full
            cursor-pointer
            text-[19px]
            px-[20px]
            py-[10px]
          "
          onClick={handleLogOut}
        >
          Log Out
        </button>
      </div>

      {/* =====================================
          DESKTOP LOGOUT
      ====================================== */}

      <button
        className="
          min-w-[150px]
          h-[60px]
          text-black
          font-semibold
          absolute
          hidden
          lg:block
          top-[20px]
          right-[20px]
          bg-white
          rounded-full
          cursor-pointer
          text-[19px]
          px-[20px]
          py-[10px]
          z-20
        "
        onClick={handleLogOut}
      >
        Log Out
      </button>

      {/* =====================================
          DESKTOP CUSTOMIZE
      ====================================== */}

      <button
        className="
          min-w-[150px]
          h-[60px]
          text-black
          font-semibold
          absolute
          top-[100px]
          right-[20px]
          rounded-full
          cursor-pointer
          text-[19px]
          px-[20px]
          py-[10px]
          hidden
          lg:block
          bg-white
          z-20
        "
        onClick={() =>
          navigate("/customize")
        }
      >
        Customize your Assistant
      </button>

      {/* =====================================
          ASSISTANT IMAGE
      ====================================== */}

      <div
        className="
          w-[300px]
          h-[400px]
          flex
          justify-center
          items-center
          overflow-hidden
          rounded-4xl
          shadow-lg
        "
      >
        <img
          src={
            userData?.assistantImage
              ? userData.assistantImage
              : aiImg
          }
          alt="AI Assistant"
          className="
            w-full
            h-full
            object-cover
          "
        />
      </div>

      {/* =====================================
          LISTENING STATUS
      ====================================== */}

      <div
        className="
          mt-[20px]
          flex
          items-center
          gap-[10px]
        "
      >
        <div
          className={`
            w-[12px]
            h-[12px]
            rounded-full
            ${
              listening
                ? "bg-green-400 shadow-[0_0_15px_#4ade80]"
                : "bg-red-500"
            }
          `}
        />

        <span
          className="
            text-white
            text-[14px]
            opacity-80
          "
        >
          {listening
            ? "Listening..."
            : "Waiting..."}
        </span>
      </div>

      {/* =====================================
          TEXT
      ====================================== */}

      <div
        className="
          mt-[20px]
          min-h-[60px]
          max-w-[90%]
          flex
          justify-center
          items-center
          text-center
          px-[20px]
        "
      >
        <h1
          className="
            text-white
            text-[18px]
            md:text-[22px]
            font-semibold
            leading-relaxed
          "
        >
          {userText ||
            aiText ||
            ""}
        </h1>
      </div>
    </div>
  );
}

export default Home;