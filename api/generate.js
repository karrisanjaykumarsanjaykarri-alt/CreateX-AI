import { Client } from "@gradio/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt, duration = 2 } = req.body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter a video prompt."
      });
    }

    const seconds = Number(duration);

    if (!Number.isFinite(seconds) || seconds < 0.3 || seconds > 8.5) {
      return res.status(400).json({
        error: "Duration must be between 0.3 and 8.5 seconds."
      });
    }

    const client = await Client.connect(
      "Lightricks/ltx-video-distilled"
    );

    const result = await client.predict("/text_to_video", {
      prompt: prompt.trim(),
      negative_prompt: "blurry, distorted, low quality",
      input_image_filepath: null,
      input_video_filepath: null,
      height_ui: 512,
      width_ui: 704,
      mode: "text-to-video",
      duration_ui: seconds,
      ui_frames_to_use: 9,
      seed_ui: 42,
      randomize_seed: true,
      ui_guidance_scale: 1,
      improve_texture_flag: true
    });

    return res.status(200).json({
      success: true,
      video: result.data[0],
      seed: result.data[1]
    });

  } catch (error) {
    console.error("CreateX AI error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Video generation failed."
    });
  }
}