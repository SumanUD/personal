import { VscJson, VscMarkdown, VscFolder, VscFolderOpened } from "react-icons/vsc";
import { SiTypescript, SiReact } from "react-icons/si";
import type { IdeFile } from "./files";

export const FileIcon = ({ file }: { file: Pick<IdeFile, "lang"> }) => {
  switch (file.lang) {
    case "markdown":
      return <VscMarkdown className="fi fi-md" />;
    case "typescript":
      return <SiTypescript className="fi fi-ts" />;
    case "json":
      return <VscJson className="fi fi-json" />;
    case "tsx":
      return <SiReact className="fi fi-tsx" />;
    default:
      return <span className="fi fi-logo">SB</span>;
  }
};

export const FolderIcon = ({ open }: { open: boolean }) =>
  open ? <VscFolderOpened className="fi fi-folder" /> : <VscFolder className="fi fi-folder" />;
