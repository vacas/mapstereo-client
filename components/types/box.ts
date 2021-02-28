type Box = {
  id: number;
  left: number;
  top: number;
  title: string;
  blobUrl?: string;
  type: "box" | "card" | "list";
  isListItem?: boolean;
  cards?: Array<number>;
}

export default Box;