# CodeAlpha Music Player

A polished browser-based music player built with HTML, CSS, and vanilla JavaScript for the CodeAlpha Frontend Development Internship.

The project presents a complete audio playback experience with a responsive interface, playlist controls, shuffle and repeat modes, volume persistence, dynamic track artwork, and a vinyl-inspired visual theme.

## Live Demo

https://fazal305.github.io/CodeAlpha_MusicPlayer/

## Preview

![CodeAlpha Music Player preview](image.png)

## Features

- Play, pause, next, and previous track controls
- Interactive progress bar with live current time and duration
- Click or drag seeking support
- Volume slider with mute and unmute controls
- Saved volume preference using local storage
- Playlist panel with active track highlighting
- Shuffle, repeat all, and repeat one playback modes
- Automatic next-track playback
- Dynamic cover art and accent color per song
- Animated vinyl record and equalizer states
- Responsive layout for desktop, tablet, and mobile screens

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- HTML5 Audio API
- Local Storage

## Project Structure

```text
CodeAlpha_MusicPlayer/
|-- index.html
|-- player-styles.css
|-- player-script.js
|-- README.md
|-- LICENSE
|-- image.png
|-- assets/
|   |-- audio/
|   |   |-- track-01.mp3
|   |   |-- track-02.mp3
|   |   |-- track-03.mp3
|   |   |-- track-04.mp3
|   |   `-- track-05.mp3
|   `-- covers/
|       |-- cover-01.jpg
|       |-- cover-02.jpg
|       |-- cover-03.jpg
|       |-- cover-04.jpg
|       `-- cover-05.jpg
```

## What I Practiced

- Managing audio state with JavaScript
- Building reusable UI update functions
- Syncing playback state with visual feedback
- Using browser storage for user preferences
- Designing a responsive and accessible media interface
- Handling edge cases such as missing cover artwork and track endings

## Run Locally

1. Clone the repository.
2. Keep the audio files in `assets/audio`.
3. Keep the cover images in `assets/covers`.
4. Open `index.html` in a browser.

No build step or external framework is required.

## Author

Fazal Abbas

- GitHub: https://github.com/fazal305
- LinkedIn: https://www.linkedin.com/in/fazal-abbas-4653dg86

## License

This project is licensed under the MIT License.
