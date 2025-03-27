const express = require("express");
const cors = require("cors");
const { SessionsClient } = require("@google-cloud/dialogflow");

const app = express();
app.use(cors());
app.use(express.json());

const projectId = "grade-9eyd";
const sessionClient = new SessionsClient({ keyFilename: "./service-account.json" });

app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  const sessionPath = sessionClient.sessionPath(projectId, sessionId);
  const request = {
    session: sessionPath,
    queryInput: {
      text: { text: message, languageCode: "en" },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.json({ reply: result.fulfillmentText });
  } catch (error) {
    console.error("Dialogflow Error:", error);
    res.status(500).json({ reply: "Error processing request" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
document.addEventListener("DOMContentLoaded", function () {
    const chatbotButton = document.getElementById("open-chatbot");
    const chatbotContainer = document.getElementById("chatbot-container");
    const closeChatbot = document.getElementById("close-chatbot");
    const sendMessage = document.getElementById("send-message");
    const chatbotInput = document.getElementById("chatbot-input");

    if (chatbotButton && chatbotContainer) {
        chatbotButton.addEventListener("click", function () {
            chatbotContainer.style.display = "block";
        });

        closeChatbot.addEventListener("click", function () {
            chatbotContainer.style.display = "none";
        });
    }

    sendMessage.addEventListener("click", async function () {
        const message = chatbotInput.value.trim();
        if (!message) return;

        addMessage("You", message);
        chatbotInput.value = "";

        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, sessionId: "12345" }),
        });

        const data = await response.json();
        addMessage("Bot", data.reply || "I didn't understand that.");
    });

    function addMessage(sender, text) {
        const chatBox = document.getElementById("chatbox");
        const messageDiv = document.createElement("div");
        messageDiv.textContent = `${sender}: ${text}`;
        chatBox.appendChild(messageDiv);
    }
});
