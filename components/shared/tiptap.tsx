"use client";

import BulletList from "@tiptap/extension-bullet-list";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  TableIcon,
  Palette,
  Trash2,
  PlusSquare,
  MinusSquare,
  Split,
  Merge,
} from "lucide-react";
import { ChangeEvent } from "react";

import { cn } from "@/lib/utils";

const toolbarButtonClass =
  "p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center";
const activeButtonClass = "bg-gray-200 text-blue-600";

const fontSizes = ["12", "14", "16", "18", "20", "24", "30"];

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

const Tiptap = ({
  content,
  setContent,
  disabled,
}: {
  content: string;
  setContent: (content: string) => void;
  disabled?: boolean;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc ml-2",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal ml-2",
        },
      }),
      ListItem,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline underline-offset-4",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-400",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2 bg-gray-100 font-bold",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2",
        },
      }),
      ExtendedTextStyle,
      Color,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "m-5 focus:outline-none min-h-[300px] max-w-[calc(100vw-16rem)] mx-auto",
      },
    },
  });

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="border rounded-lg mt-6 shadow-md">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-gray-50">
        <select
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            const size = e.target.value;
            if (size) {
              editor
                .chain()
                .focus()
                .setMark("textStyle", { fontSize: size })
                .run();
            } else {
              editor
                .chain()
                .focus()
                .setMark("textStyle", { fontSize: null })
                .run();
            }
          }}
          value={editor.getAttributes("textStyle").fontSize || ""}
          className="p-1 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-9 w-20 text-center"
          title="Font Size"
        >
          <option value="">Default</option>
          {fontSizes.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`${toolbarButtonClass} ${
            editor.isActive("heading", { level: 2 }) ? activeButtonClass : ""
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`${toolbarButtonClass} ${
            editor.isActive("heading", { level: 3 }) ? activeButtonClass : ""
          }`}
          title="Heading 2"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${toolbarButtonClass} ${
            editor.isActive("bold") ? activeButtonClass : ""
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${toolbarButtonClass} ${
            editor.isActive("italic") ? activeButtonClass : ""
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`${toolbarButtonClass} ${
            editor.isActive({ textAlign: "left" }) ? activeButtonClass : ""
          }`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`${toolbarButtonClass} ${
            editor.isActive({ textAlign: "center" }) ? activeButtonClass : ""
          }`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`${toolbarButtonClass} ${
            editor.isActive({ textAlign: "right" }) ? activeButtonClass : ""
          }`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => {
            const url = window.prompt("URL");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`${toolbarButtonClass} ${
            editor.isActive("link") ? activeButtonClass : ""
          }`}
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${toolbarButtonClass} ${
            editor.isActive("bulletList") ? activeButtonClass : ""
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${toolbarButtonClass} ${
            editor.isActive("orderedList") ? activeButtonClass : ""
          }`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className={toolbarButtonClass}
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </button>

        {/* Divider for Table Controls */}
        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Table Manipulation Buttons */}
        <button
          type="button"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.can().addColumnAfter()}
          className={toolbarButtonClass}
          title="Add Column After"
        >
          <span className="flex items-center gap-1 text-xs">
            <PlusSquare className="h-4 w-4" /> 열
          </span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter()}
          className={toolbarButtonClass}
          title="Add Row After"
        >
          <span className="flex items-center gap-1 text-xs">
            <PlusSquare className="h-4 w-4" /> 행
          </span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editor.can().deleteColumn()}
          className={toolbarButtonClass}
          title="Delete Column"
        >
          <span className="flex items-center gap-1 text-xs">
            <MinusSquare className="h-4 w-4" /> 열
          </span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editor.can().deleteRow()}
          className={toolbarButtonClass}
          title="Delete Row"
        >
          <span className="flex items-center gap-1 text-xs">
            <MinusSquare className="h-4 w-4" /> 행
          </span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().mergeCells().run()}
          disabled={!editor.can().mergeCells()}
          className={toolbarButtonClass}
          title="Merge Cells"
        >
          <Merge className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().splitCell().run()}
          disabled={!editor.can().splitCell()}
          className={toolbarButtonClass}
          title="Split Cell"
        >
          <Split className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable()}
          className={toolbarButtonClass}
          title="Delete Table"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Font Size Dropdown */}

        {/* Color Picker */}
        <div className="relative inline-block">
          <input
            type="color"
            onInput={(event) =>
              editor
                .chain()
                .focus()
                .setColor((event.target as HTMLInputElement).value)
                .run()
            }
            value={editor.getAttributes("textStyle").color || "#000000"}
            className="absolute opacity-0 w-full h-full cursor-pointer" // Hide input, use button below
            title="Text Color"
            id="colorPicker"
          />
          <button
            type="button"
            className={`${toolbarButtonClass} flex items-center gap-1`}
            onClick={() => document.getElementById("colorPicker")?.click()}
          >
            <Palette className="h-4 w-4" />
            <span
              className="inline-block w-3 h-3 rounded-full border border-gray-400"
              style={{
                backgroundColor:
                  editor.getAttributes("textStyle").color || "#000000",
              }}
            ></span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={toolbarButtonClass}
          title="Undo"
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={toolbarButtonClass}
          title="Redo"
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent
          editor={editor}
          style={{
            whiteSpace: "pre-line",
          }}
          className={cn(
            "border border-gray-300 rounded p-2 ",
            disabled && "opacity-50"
          )}
          contentEditable={!disabled}
        />
      </div>
    </div>
  );
};

export default Tiptap;
