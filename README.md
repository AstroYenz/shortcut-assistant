# Shortcut Assistant

![GitHub Release](https://img.shields.io/github/v/release/JensAstrup/shortcut-assistant?style=for-the-badge)
[![Codecov](https://img.shields.io/codecov/c/github/JensAstrup/shortcut-assistant?style=for-the-badge&link=https%3A%2F%2Fapp.codecov.io%2Fgh%2FJensAstrup%2Fshortcut-assistant)](https://app.codecov.io/gh/JensAstrup/shortcut-assistant)

[![Status Page](https://img.shields.io/website?style=for-the-badge&url=https%3A%2F%2Fstatus.jensastrup.io%2F&label=Status%20Page)](https://status.jensastrup.io/)
![](https://api.checklyhq.com/v1/badges/checks/e8b42215-cec2-4553-9318-dc7ec168005a?style=for-the-badge&theme=dark&responseTime=true)

[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/kmdlofehocppnlkpokdbiaalcelhedef?style=for-the-badge&)](https://chromewebstore.google.com/detail/shortcut-assistant/kmdlofehocppnlkpokdbiaalcelhedef?hl=en&authuser=0)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/kmdlofehocppnlkpokdbiaalcelhedef?style=for-the-badge&)](https://chromewebstore.google.com/detail/shortcut-assistant/kmdlofehocppnlkpokdbiaalcelhedef?hl=en&authuser=0)

Shortcut Assistant is a Chrome extension that adds various additional features to Shortcut.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
If you're looking to install the extension, visit the [Chrome Web Store](https://chromewebstore.google.com/detail/shortcut-assistant/kmdlofehocppnlkpokdbiaalcelhedef).
### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Google Chrome or Arc Browser

### Installing

1. **Clone the Repository**

2. **Install Dependencies**

   ```bash
   npm install
   ```
   or
    ```bash
    yarn install
    ```

3. **Set up Environment Variables**

   ```bash
    cp .env.example .env
    ```
4. Install Doppler CLI  
   ```bash
   brew install doppler/tap/doppler-cli  
   ```

5. Authenticate and set project/config  
   ```bash
   doppler login  
   doppler setup --project shortcut-assistant --config dev  
   ```


### Running the Extension Locally

1. Open Google Chrome and navigate to `chrome://extensions/`.

2. Enable 'Developer mode' in the top right corner.

3. Run `npm run dev` to build the extension.

4. Click on 'Load unpacked' and select the `build` folder within your project directory.

5. The extension should now be visible in the extensions list and active in the Chrome browser.

## Development Workflow

- Run `npm run dev`.
- Make changes to the source files.
- Reload the extension from `chrome://extensions/` by clicking the 'Reload' button under the extension.
- Changes to service worker files and the manifest tend to require a full reload of the extension.

## Packaging the Extension for Distribution

1. **Build the Project**
   ```bash
   npm run build
   ```
2. Generate a ZIP file of the `build` folder. `npm run dist` will do this for you.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/JensAstrup/shortcut-assistant/tags).

Standard: `MAJOR.MINOR.PATCH`

**Major**: Breaking changes or significant feature changes

**Minor**: New features

**Patch**: Bug fixes or internal changes not affecting the user experience

### Updating the Version

To update the version of the extension, use Yarn's standard version command:

```bash
# For a patch version bump (e.g., 1.0.0 -> 1.0.1)
yarn version --patch

# For a minor version bump (e.g., 1.0.0 -> 1.1.0)
yarn version --minor

# For a major version bump (e.g., 1.0.0 -> 2.0.0)
yarn version --major
```

This will:
1. Update the version in `package.json`
2. Update or create `.env` with the new version
3. Run the build process
4. Output instructions for committing, tagging, and pushing the changes

## Authors

- **Jens Astrup** - [JensAstrup](https://github.com/JensAstrup)

## License

This project is licensed under [CC BY-NC 4.0 Deed | Attribution-NonCommercial 4.0 International Creative Commons](https://creativecommons.org/licenses/by-nc/4.0/deed.en)

## Acknowledgments

- ChatGPT
