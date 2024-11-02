# **iron.cs-csc.online**  

A unique, interactive meme streaming platform inspired by 财神猫猫's iron pole-dropping stream. This project allows users to command the playback of meme sounds, interrupt the stream with a "drop" command, and enjoy a colorful, real-time experience powered by a song-request-like system.

## Key Features

- **Interactive Meme Playback**: Clients can request meme sounds by entering commands, turning the platform into a customizable meme "jukebox."
- **Interrupt Command**: Users can interrupt the current sound with the `drop` command, triggering an iron pole drop sound.
- **Real-Time Chat and Reactions**: Built with WebSocket for live message updates and React animations, creating an engaging and dynamic experience.

## How to use

In `/front/src/App.js`, edit the line with your own url:`const ws = new WebSocket('ws://your_api_url:8000/ws');`

In `/back/main.py`, configure your bucket according to official document(https://cloud.tencent.com/document/product/436/10976).

## Technical Overview

- **Backend**: A FastAPI WebSocket server connects the frontend with Tencent COS, broadcasting client messages and translating commands into URLs to retrieve sounds.
- **Frontend**: The UI, developed in React.js, displays messages, plays sounds, and animates client interactions with intuitive transitions.
- **Storage**: Sound files are stored securely in a Tencent COS bucket, with simple domain integration and configurable access.

## Project Structure

- **Frontend**: Contains the React.js code responsible for the UI, WebSocket communication, and user interactions.
- **Backend**: Contains the FastAPI WebSocket server code and configuration for connecting to Tencent COS.
