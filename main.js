"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { Plugin: ObsidianPlugin, Notice, MarkdownView } = require('obsidian');
module.exports = class CopyImageToClipboardPlugin extends ObsidianPlugin {
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CopyImageToClipboardPlugin loaded!");
            this.addCommand({
                id: 'copy-image-to-clipboard',
                name: 'Copy PNG Image to Clipboard',
                editorCallback: (editor, ctx) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
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
                    let match;
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
                            const filePath = (_a = ctx.file) === null || _a === void 0 ? void 0 : _a.path;
                            if (!filePath) {
                                new Notice('No file path found.');
                                return;
                            }
                            const imagePath = this.app.metadataCache.getFirstLinkpathDest(link, filePath);
                            if (imagePath) {
                                try {
                                    const fileData = yield this.app.vault.readBinary(imagePath);
                                    const buffer = Buffer.from(fileData);
                                    // Use Electron clipboard API to copy the image
                                    const { clipboard, nativeImage } = require('electron');
                                    const image = nativeImage.createFromBuffer(buffer);
                                    clipboard.writeImage(image);
                                    new Notice('Image copied to clipboard!');
                                }
                                catch (error) {
                                    console.error("Error copying image to clipboard:", error);
                                    new Notice('Failed to read or copy image.');
                                }
                            }
                            else {
                                new Notice('Image file not found.');
                            }
                            return;
                        }
                    }
                    if (!foundMatch) {
                        console.log("No PNG link found under the cursor.");
                        new Notice('No PNG link found under the cursor.');
                    }
                }),
            });
        });
    }
    onunload() {
        console.log("CopyImageToClipboardPlugin unloaded!");
    }
};
