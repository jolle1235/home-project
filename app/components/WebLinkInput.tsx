import { useRef } from "react";
import ActionBtn from "./smallComponent/actionBtn";

export function WebLinkInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  async function sendWebpage() {
    if (inputRef.current) {
      console.log("sending webpage:", inputRef.current.value);
    }
  }

  return (
    <div className="w-full flex flex-row border-b-2 border-lightgreyBackground p-2">
      <input
        ref={inputRef}
        className="w-10/12 p-2 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        id="web_scraber"
        type="text"
        placeholder="Indsæt Link"
      />
      <ActionBtn
        onClickF={sendWebpage}
        Itext="Send"
        color="bg-action"
        hover="bg-actionHover"
        extraCSS="flex-1 ml-2"
      />
    </div>
  );
}
