const { Plugin: ObsidianPlugin, Notice, MarkdownView } = require('obsidian');
import type { Editor } from 'obsidian';

module.exports = class CopyImageToClipboardPlugin extends ObsidianPlugin {
  async onload() {
    console.log("CopyImageToClipboardPlugin loaded!");
    this.addCommand({
      id: 'copy-image-to-clipboard',
      name: 'Copy PNG Image to Clipboard',
      editorCallback: async (editor: Editor, ctx: any) => {
        // Ensure the context is a MarkdownView
        if (!(ctx instanceof MarkdownView)) {
          new Notice('This command only works in Markdown files.');
          return;
        }

        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);

        console.log("Cursor position:", cursor);
        console.log("Current line content:", line);

        // Regex to match Obsidian-style links like [[file.png]]
        const regex = /\[\[(.*?\.png)\]\]/g;
        let match: RegExpExecArray | null;
        let foundMatch = false;

        while ((match = regex.exec(line)) !== null) {
          const link = match[1];
          const start = match.index;
          const end = start + match[0].length;

          console.log("Match found:", match, "Start:", start, "End:", end);

          if (cursor.ch >= start && cursor.ch <= end) {
            console.log("Link under cursor:", link);
            foundMatch = true;

            // Resolve the file path
            const filePath = ctx.file?.path;
            if (!filePath) {
              new Notice('No file path found.');
              return;
            }

            const imagePath = (this as any).app.metadataCache.getFirstLinkpathDest(link, filePath);
            if (imagePath) {
              try {
                const fileData = await (this as any).app.vault.readBinary(imagePath);
                const buffer = Buffer.from(fileData);

                // Use Electron clipboard API to copy the image
                const { clipboard, nativeImage } = require('electron');
                const image = nativeImage.createFromBuffer(buffer);
                clipboard.writeImage(image);

                new Notice('Image copied to clipboard!');
              } catch (error) {
                console.error("Error copying image to clipboard:", error);
                new Notice('Failed to read or copy image.');
              }
            } else {
              new Notice('Image file not found.');
            }

            return;
          }
        }

        if (!foundMatch) {
          console.log("No PNG link found under the cursor.");
          new Notice('No PNG link found under the cursor.');
        }
      },
    });
  }

  onunload() {
    console.log("CopyImageToClipboardPlugin unloaded!");
  }
};
