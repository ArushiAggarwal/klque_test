import express from 'express';
import Chat from '../models/chat.js';
import { v4 as uuidv4 } from 'uuid';
import fetch from "node-fetch";


const router = express.Router();


// router.post("/", async (req, res) => {
//   const { prompt, response } = req.body;

//   try {

//     const newChat = new Chat({
//       chatId: uuidv4(),
//       prompt,
//       response,
//     });

router.post("/openai", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" }); // Validate input
  }

  try {
    // Call the Vercel serverless function
    const openaiResponse = await fetch("https://klque-test.vercel.app/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`Error ${openaiResponse.status}: ${errorData.error}`);
    }

    const aiResponse = await openaiResponse.json();

    // Save to MongoDB
    // console.log("Saving to MongoDB:", { prompt, response });

    // const newChat = new Chat({
    //   chatId: uuidv4(),
    //   prompt,
    //   response: aiResponse, // AI-generated response
    // });

    try {
      const newChat = new Chat({
        chatId: uuidv4(),
        prompt,
        response,
      });

      await newChat.save();
      res.status(201).json(newChat);
    } catch (error) {
      console.error("Error saving chat to MongoDB:", error);
      res.status(500).json({ message: "Failed to save chat", error: error.message });
    }

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(500).json({ message: "Failed to save chat", error: error.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ date: -1 });
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
});

export default router;
