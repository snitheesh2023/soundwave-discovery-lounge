# Soundwave Discovery Lounge

Build a polished, original Spotify-inspired music discovery and listening web app called Soundwave. Do not copy Spotify branding, logo, exact interface, or proprietary assets. Product goal: connect users to Spotify through the official OAuth flow to show their own library/playlists when configured, and use only official Spotify API capabilities. Also let users search for YouTube videos and play via the official YouTube IFrame Player/API, respecting YouTube ads, playback restrictions, and terms; never download, proxy, strip ads from, or otherwise bypass ads/DRM/restrictions. If Spotify/YouTube credentials are not configured, provide a beautiful usable demo with clearly labeled sample data and disabled/placeholder connect states, not fake successful auth. Implement a full responsive dark music dashboard: left sidebar for Home/Search/Your Library and playlists; center personalized greeting, featured mixes, recently played, and trending tracks; right now-playing/queue panel; persistent bottom player bar with controls, progress, volume, shuffle/repeat, responsive mobile nav. Original visual design: deep charcoal/navy, vivid lime/cyan accents, album artwork tiles, clear typography, refined interactions. Search interface should support Spotify catalog and YouTube search where API configuration permits; show provider/source badge and launch official embed player for YouTube. Add explicit Spotify connect and YouTube connection/configuration affordances and safe error/empty states. Use accessible controls, responsive layout, realistic demo artwork (use remote images or gradients; no copyrighted audio files). Deliver a working front-end with well-organized components and configuration guidance; avoid claiming ad-free playback.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://soundwave-discovery-lounge.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9d5c9a24-ec2e-4841-9906-58573ff834fb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
