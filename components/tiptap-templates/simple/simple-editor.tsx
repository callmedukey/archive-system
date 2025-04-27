"use client";

import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import * as React from "react";
import { ChangeEvent, useCallback } from "react";

// --- Custom Extensions ---
import { Link } from "@tiptap/extension-link";

// --- Icons ---
import {
  Bold,
  Italic,
  Strikethrough as StrikeIcon,
  Code,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Palette as PaletteIcon,
  PaintBucket,
  Table as TableIcon,
  PlusSquare,
  MinusSquare,
  Merge,
  Split,
  Trash2,
  List,
  ListOrdered,
  Link as LinkIcon,
} from "lucide-react";

const fontSizes = ["12", "14", "16", "18", "20", "24", "30"];

// Simple placeholder components for Toolbar structure
const ToolbarGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-1">{children}</div>
);
const ToolbarSeparator = () => (
  <div className="h-6 w-px bg-gray-300 mx-1"></div>
);

// Extended TextStyle for Font Size
const ExtendedTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize?.replace(/px$/, ""),
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}px`,
          };
        },
      },
    };
  },
});

// Extend TableCell to include backgroundColor attribute
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
    };
  },
});

export function SimpleEditor({
  content,
  setContent,
  disabled,
}: {
  content: string;
  setContent: (content: string) => void;
  disabled?: boolean;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: "m-5 focus:outline-none min-h-[300px]",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
    },
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-6 my-2",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-6 my-2",
          },
        },
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline underline-offset-4 cursor-pointer",
        },
      }),
      ExtendedTextStyle,
      Color,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-400 my-4",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2 bg-gray-100 font-bold",
        },
      }),
      CustomTableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2",
        },
      }),
    ],
    content: content || "",
  });

  // Handlers moved inside SimpleEditor or defined inline
  const handleFontSizeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (!editor) return;
      const size = e.target.value;
      if (size) {
        editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
      } else {
        // Assuming you want to unset the mark if default is selected
        editor.chain().focus().unsetMark("textStyle").run();
        // Explicitly remove the font size style if the 'textStyle' mark holds other attributes
        editor.chain().focus().setMark("textStyle", { fontSize: null }).run();
      }
    },
    [editor]
  );

  const handleColorChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!editor) return;
      editor.chain().focus().setColor(event.target.value).run();
    },
    [editor]
  );

  // Handler for cell background color change
  const handleCellBackgroundColorChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .setCellAttribute("backgroundColor", event.target.value)
        .run();
    },
    [editor]
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null; // Return null if editor is not yet initialized

  const currentCellBackgroundColor =
    editor.getAttributes("tableCell").backgroundColor || "#ffffff"; // Default to white if no color set

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-gray-50 mt-6 justify-start">
        <ToolbarGroup>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              !editor.can().undo() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!editor.can().undo()}
            title="Undo"
            tabIndex={-1}
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              !editor.can().redo() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!editor.can().redo()}
            title="Redo"
            tabIndex={-1}
          >
            <Redo className="h-4 w-4" />
          </button>
        </ToolbarGroup>
        <ToolbarSeparator />

        <ToolbarGroup>
          <select
            onChange={handleFontSizeChange}
            value={editor.getAttributes("textStyle").fontSize || ""}
            className="p-1 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-9 w-20 text-center"
            title="Font Size"
            tabIndex={-1}
          >
            <option value="">Default</option>
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              editor.isActive("bulletList") ? "bg-gray-200 text-blue-600" : ""
            }`}
            title="Bullet List"
            tabIndex={-1}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              editor.isActive("orderedList") ? "bg-gray-200 text-blue-600" : ""
            }`}
            title="Ordered List"
            tabIndex={-1}
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              editor.isActive("bold") ? "bg-gray-200 text-blue-600" : ""
            }`}
            title="Bold"
            tabIndex={-1}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              editor.isActive("italic") ? "bg-gray-200 text-blue-600" : ""
            }`}
            title="Italic"
            tabIndex={-1}
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              editor.isActive("strike") ? "bg-gray-200 text-blue-600" : ""
            }`}
            title="Strike"
            tabIndex={-1}
          >
            <StrikeIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              editor.isActive("code") ? "bg-gray-200 text-blue-600" : ""
            }`}
            title="Code"
            tabIndex={-1}
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              editor.isActive("underline") ? "bg-gray-200 text-blue-600" : ""
            }`}
            title="Underline"
            tabIndex={-1}
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            onClick={setLink}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              editor.isActive("link") ? "bg-gray-200 text-blue-600" : ""
            }`}
            type="button"
            title="Set Link"
            tabIndex={-1}
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <div className="relative inline-block">
            <input
              type="color"
              onInput={handleColorChange}
              value={editor.getAttributes("textStyle").color || "#000000"}
              className="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0"
              title="Text Color"
              id="simpleEditorColorPicker"
              tabIndex={-1}
            />
            <button
              type="button"
              className={`p-2 rounded hover:bg-gray-100 transition-colors justify-center flex items-center gap-1`}
              onClick={() =>
                document.getElementById("simpleEditorColorPicker")?.click()
              }
              title="Text Color"
              tabIndex={-1}
            >
              <PaletteIcon className="h-4 w-4" />
              <span
                className="inline-block w-3 h-3 rounded-full border border-gray-400"
                style={{
                  backgroundColor:
                    editor.getAttributes("textStyle").color || "#000000",
                }}
              ></span>
            </button>
          </div>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              editor.isActive({ textAlign: "left" })
                ? "bg-gray-200 text-blue-600"
                : ""
            }`}
            title="Align Left"
            tabIndex={-1}
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              editor.isActive({ textAlign: "center" })
                ? "bg-gray-200 text-blue-600"
                : ""
            }`}
            title="Align Center"
            tabIndex={-1}
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              editor.isActive({ textAlign: "right" })
                ? "bg-gray-200 text-blue-600"
                : ""
            }`}
            title="Align Right"
            tabIndex={-1}
          >
            <AlignRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              editor.isActive({ textAlign: "justify" })
                ? "bg-gray-200 text-blue-600"
                : ""
            }`}
            title="Align Justify"
            tabIndex={-1}
          >
            <AlignJustify className="h-4 w-4" />
          </button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            className="p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center"
            title="Insert Table"
            tabIndex={-1}
          >
            <TableIcon className="h-4 w-4" />
          </button>
          <div className="relative inline-block">
            <input
              type="color"
              onInput={handleCellBackgroundColorChange}
              value={currentCellBackgroundColor}
              className="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0"
              title="Cell Background Color"
              id="cellBackgroundColorPicker"
              tabIndex={-1}
              disabled={
                !editor.can().setCellAttribute("backgroundColor", "#ffffff")
              }
            />
            <button
              type="button"
              className={`p-2 rounded hover:bg-gray-100 transition-colors justify-center flex items-center gap-1 ${
                !editor.can().setCellAttribute("backgroundColor", "#ffffff")
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() =>
                document.getElementById("cellBackgroundColorPicker")?.click()
              }
              disabled={
                !editor.can().setCellAttribute("backgroundColor", "#ffffff")
              }
              title="Cell Background Color"
              tabIndex={-1}
            >
              <PaintBucket className="h-4 w-4" />
              <span
                className="inline-block w-3 h-3 rounded-full border border-gray-400"
                style={{ backgroundColor: currentCellBackgroundColor }}
              ></span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              !editor.can().addColumnAfter()
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            title="Add Column After"
            tabIndex={-1}
          >
            <PlusSquare className="h-4 w-4" />{" "}
            <span className="text-xs ml-1">열</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              !editor.can().addRowAfter() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Add Row After"
            tabIndex={-1}
          >
            <PlusSquare className="h-4 w-4" />{" "}
            <span className="text-xs ml-1">행</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              !editor.can().deleteColumn()
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            title="Delete Column"
            tabIndex={-1}
          >
            <MinusSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              !editor.can().deleteRow() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Delete Row"
            tabIndex={-1}
          >
            <MinusSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().mergeCells().run()}
            disabled={!editor.can().mergeCells()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              !editor.can().mergeCells() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Merge Cells"
            tabIndex={-1}
          >
            <Merge className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().splitCell().run()}
            disabled={!editor.can().splitCell()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              !editor.can().splitCell() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Split Cell"
            tabIndex={-1}
          >
            <Split className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center ${
              !editor.can().deleteTable() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Delete Table"
            tabIndex={-1}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </ToolbarGroup>
      </div>

      <div className="p-4 border rounded-lg mt-6 shadow-md">
        <EditorContent editor={editor} disabled={disabled} />
      </div>
    </>
  );
}
