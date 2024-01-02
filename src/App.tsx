import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  insertList,
} from "@lexical/list";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import { $createHeadingNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { Button, Typography } from "@mui/material";

import React, { useEffect } from "react";

import { $setBlocksType } from "@lexical/selection";
import {
  $INTERNAL_isPointSelection,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  TextFormatType,
} from "lexical";
import "./App.css";

const EDITOR_NODES = [
  CodeNode,
  HeadingNode,
  LinkNode,
  ListNode,
  ListItemNode,
  QuoteNode,
];

const initialMarkdown = `
# Heading 1

Hello, World!`;

const InitialReceivePlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      $convertFromMarkdownString(initialMarkdown, TRANSFORMERS);
    });
  }, [editor]);

  return <></>;
};

const HeadingPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const onClick = (type: "paragraph" | "heading") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($INTERNAL_isPointSelection(selection)) {
        if (type === "paragraph") {
          $setBlocksType(selection, () => $createParagraphNode());
        } else if (type === "heading") {
          $setBlocksType(selection, () => $createHeadingNode("h3"));
        }
      }
    });
  };

  const formatText = (type: TextFormatType) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!selection) return;
      if ($isRangeSelection(selection)) {
        selection.formatText(type);
      }
    });
  };

  useEffect(() => {
    console.log(editor);
  }, [editor]);

  return (
    <>
      <Button onClick={() => formatText("bold")}>Bold</Button>
      <Button onClick={() => formatText("italic")}>Italic</Button>
      <Button onClick={() => onClick("paragraph")}>Paragraph</Button>
      <Button onClick={() => onClick("heading")}>Heading</Button>
    </>
  );
};

const ListPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const onClick = (tag: "ol" | "ul") => {
    if (tag === "ol") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  useEffect(() => {
    editor.registerCommand(
      INSERT_UNORDERED_LIST_COMMAND,
      () => {
        insertList(editor, "bullet");
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
    editor.registerCommand(
      INSERT_ORDERED_LIST_COMMAND,
      () => {
        insertList(editor, "number");
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return (
    <>
      <Button onClick={() => onClick("ol")}>Insert OL</Button>
      <Button onClick={() => onClick("ul")}>Insert UL</Button>
    </>
  );
};

const App: React.FC = () => {
  const initialConfig = {
    namespace: "MyEditor",
    theme: {
      root: "editor-root",
    },
    nodes: EDITOR_NODES,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (e: any) => console.log(e),
  };

  return (
    <section style={{ padding: "8px" }}>
      <Typography component="span">
        <LexicalComposer initialConfig={initialConfig}>
          <HeadingPlugin />
          <ListPlugin />
          <RichTextPlugin
            contentEditable={<ContentEditable />}
            ErrorBoundary={LexicalErrorBoundary}
            placeholder={null}
          />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <HistoryPlugin />
          <OnChangePlugin
            onChange={(editor) => {
              editor.read(() => {
                const markdown = $convertToMarkdownString(TRANSFORMERS);
                console.log(markdown);
              });
            }}
          />
          <InitialReceivePlugin />
        </LexicalComposer>
      </Typography>
    </section>
  );
};

export default App;
