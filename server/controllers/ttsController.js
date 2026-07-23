const ttsController = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: "Text field is required" });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"; // Default Bella (Female)

    if (!apiKey) {
      console.error("TTS: ELEVENLABS_API_KEY is not set in environment variables");
      return res.status(500).json({
        success: false,
        error: "ElevenLabs API Key is not configured on the server."
      });
    }

    // Truncate very long text to avoid ElevenLabs timeouts (max ~5000 chars)
    const truncatedText = text.length > 5000 ? text.slice(0, 5000) + "..." : text;

    console.log("TTS: Using voice ID:", voiceId);

    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text: truncatedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs TTS error:", response.status, "Voice ID:", voiceId, errText);
      return res.status(502).json({
        success: false,
        error: `ElevenLabs TTS failed (${response.status}): ${errText}`
      });
    }

    // Return the audio buffer to the client
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "no-cache");
    res.send(buffer);
  } catch (error) {
    console.error("TTS Controller exception:", error.message || error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate text-to-speech"
    });
  }
};

export default ttsController;
