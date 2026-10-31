# zig~zag desktop
A desktop client for [zig~zag](https://www.zig-zag.fm) made with Electron.

> [!NOTE]
> This project is not affiliated with zig~zag.

## Status
As of now, the code is very messy and could use some refactoring. Here's a list of things I want to do before providing builds:
- Improve how code and assets end up in the build
  - Probably use one of Electron Forge's templates?
- Improve storage of app settings
- Clean up the code a bit
- Finish MPRIS integration
- Add media player support for other platforms
- Find a way to only include platform-specific code on the platform it's made for
- Explore non-Electron options

## Installation
There are no pre-made builds as of yet (see above), but if you really want to you can run the app from source.

## Building
1. Clone the code via your favorite method.
2. Use [`pnpm`](https://pnpm.io) to install dependencies (`pnpm i`).
3. Run the app using `pnpm run start`.
