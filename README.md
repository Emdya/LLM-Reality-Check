# Reality Check Chrome Extension (React Version)

A Chrome extension built with React that fact-checks AI-generated content on ChatGPT and Claude using an AI-powered verification system.

## Features

- **React-powered UI**: Modern, component-based popup interface
- **Real-time Fact Checking**: Analyzes AI responses for accuracy
- **Visual Highlighting**: Marks potentially false information in red
- **Auto-correction**: Sends correction prompts back to the AI
- **Dark Mode UI**: Sleek, modern interface with yellow-orange gradient theme

## Development Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Build the extension:
   \`\`\`bash
   npm run build
   \`\`\`

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

## Build Scripts

- `npm run build` - Production build
- `npm run dev` - Development build with watch mode
- `npm run build:popup` - Build only the popup component

## File Structure

- `src/popup/` - React popup component and styles
- `src/content/` - Content script for web page interaction
- `src/background/` - Background service worker
- `dist/` - Built extension files (generated)
- `manifest.json` - Extension configuration

## Development

1. Make changes to the source files in `src/`
2. Run `npm run build` to compile
3. Reload the extension in Chrome
4. Test on ChatGPT or Claude

## API Integration

Replace the `simulateFactCheckAPI` function in `src/background/background.ts` with your actual fact-checking API endpoint.

## Technologies Used

- React 18 with TypeScript
- Lucide React for icons
- Webpack for bundling
- Chrome Extensions Manifest V3
\`\`\`

Perfect! I've converted the Chrome extension to use React with TypeScript. Here's what's included:

## Key Features:
1. **Full React Integration** - The popup is now a proper React component with hooks
2. **TypeScript Support** - Type safety throughout the codebase
3. **Modern Build Process** - Webpack configuration for bundling React components
4. **Lucide React Icons** - Professional icons that match the design
5. **Yellow-Orange Theme** - Updated to match your preferred color scheme
6. **Component Architecture** - Clean, maintainable React components

## To use this:

1. **Install dependencies**: `npm install`
2. **Build the extension**: `npm run build`
3. **Load in Chrome**: Point to the project directory (not the dist folder)

The extension will now use React for the popup interface while maintaining all the original functionality. The build process compiles everything into the `dist/` folder that Chrome can understand.
